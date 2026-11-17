#!/usr/bin/env python3
"""Fetch a reference sequence and a comparison set for any UniProt accession.

Everything comes from the UniProt REST API over HTTPS: no account, no key,
no local database, no BLAST install. The only data that leaves the machine is the
accession, a UniRef cluster id or a Pfam id; the sequence being designed is never
sent. UniProt is the only host this script contacts: the BLOSUM62 table ships with
the skill (data/matrices/) and is copied into the output folder, not downloaded.

TWO LEVELS, BECAUSE THEY ANSWER DIFFERENT QUESTIONS

  --level orthologs (default)
      The UniRef50 cluster containing the reference: the same protein from
      other species. Conservation over this set answers "what does THIS
      protein need in order to work" -- a residue identical across every
      vertebrate copy of it is probably load-bearing. These sequences are
      full-length and mutually alignable, so the whole protein gets scored,
      and the set is small enough to fetch and align in about a second.

  --level family
      Every UniProt entry carrying the reference's Pfam domain: a superfamily,
      related by duplications old enough that the members are different
      proteins with different jobs. Conservation over this set answers "what
      does this STYLE of protein need", which is largely the structural core.

      Read the result carefully. A residue that gives THIS protein its
      particular specificity is SUPPOSED to differ between the family's
      members, so it scores as variable here. Low family-level conservation
      therefore does not mean a position is unconstrained in the reference; it
      can mean the opposite, and it is the reading that would send someone to
      mutate the very residues that distinguish one member from another.

Neither level is the "real" one. Which is available depends on the protein: a
well-sampled vertebrate receptor has hundreds of orthologs, while a bacterial
protein may have almost none and the family may be all there is. The level
used is recorded in provenance.json and must travel with any score.

What is written is deliberately static. A changed comparison set changes every
conservation score downstream, so the sequences are files you commit and diff
rather than something re-fetched at build time.

    python3 scripts/fetch_homologs.py ACCESSION data/example
    python3 scripts/fetch_homologs.py ACCESSION data/example --level family

Writes <out>/reference.fasta, <out>/homologs.fasta, <out>/BLOSUM62 (a copy of the
bundled table) and <out>/provenance.json.

Nothing is written until every request has succeeded, so a refused or failed run
leaves <out> exactly as it found it.
"""
from __future__ import annotations

import argparse
import hashlib
import http.client
import json
import re
import sys
import textwrap
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

UNIPROT = "https://rest.uniprot.org"
# The substitution table ships with the skill, so no request is made for it. It is pinned by
# hash: a different table would change every score the built-in aligner produces. The
# origin is kept for the provenance record, and data/matrices/NOTICE.md says where it came from.
MATRIX_FILE = Path(__file__).resolve().parent.parent / "data" / "matrices" / "BLOSUM62"
MATRIX_SHA256 = "85510d3846ee6d5f4778e425cf8daf6e0dbb889b306f2d13434e1254780efb40"
MATRIX_ORIGIN = "https://ftp.ncbi.nlm.nih.gov/blast/matrices/BLOSUM62"
TIMEOUT = 120
# The only host this script talks to. Every URL is checked against it,
# including the "next page" link a UniProt response hands back.
ALLOWED_HOSTS = frozenset({"rest.uniprot.org"})
# One response is never larger than this. A page of 500 FASTA entries and the
# largest entry record are both far below it.
MAX_RESPONSE_BYTES = 64 * 1024 * 1024

# UniProt's published accession format, without an isoform suffix.
ACCESSION_PATTERN = re.compile(
    r"(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9](?:[A-Z][A-Z0-9]{2}[0-9]){1,2})"
)
PFAM_PATTERN = re.compile(r"PF[0-9]{5}")


def check_url(url: str) -> str:
    """Return the URL when it is HTTPS to an allowed host, else refuse it."""
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != "https" or parts.hostname not in ALLOWED_HOSTS:
        raise ValueError(f"refusing to fetch {url!r}: only https to {sorted(ALLOWED_HOSTS)}")
    return url


class CheckedRedirects(urllib.request.HTTPRedirectHandler):
    """Follow a redirect only to a URL that passes the same check as the first request."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: N803
        check_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


OPENER = urllib.request.build_opener(CheckedRedirects)


class FetchError(Exception):
    """A request that did not complete. It carries the host and what was being fetched, so the
    message says which lookup failed and why; a bare network error says neither."""

    def __init__(self, url: str, what: str, cause: str, status: int | None = None):
        self.host = urllib.parse.urlsplit(url).hostname or url
        self.status = status
        super().__init__(f"{self.host} ({what}): {cause}" if what else f"{self.host}: {cause}")

    @property
    def may_be_blocked(self) -> bool:
        """True when the failure could be an environment withholding access: no answer at all, or
        a refusal. A 404 or a 500 is the server answering, so it says nothing about access."""
        return self.status in (None, 403, 407)


class MatrixError(Exception):
    """The substitution table that ships with the skill is missing or is not the pinned file."""


def get(url: str, what: str = "") -> tuple[bytes, dict[str, str]]:
    request = urllib.request.Request(check_url(url), headers={"User-Agent": "construct-maps/0.1"})
    try:
        with OPENER.open(request, timeout=TIMEOUT) as response:
            body = response.read(MAX_RESPONSE_BYTES + 1)
            if len(body) > MAX_RESPONSE_BYTES:
                raise ValueError(f"response from {url!r} exceeds {MAX_RESPONSE_BYTES} bytes")
            return body, {k.lower(): v for k, v in response.headers.items()}
    except urllib.error.HTTPError as error:
        raise FetchError(url, what, f"HTTP {error.code} {error.reason}", error.code) from error
    except (urllib.error.URLError, OSError, http.client.HTTPException) as error:
        # OSError covers a timeout, a reset, or a proxy refusing the tunnel; HTTPException covers
        # a server that closes the connection before it answers, which urllib does not wrap.
        raise FetchError(url, what, str(getattr(error, "reason", error))) from error


def bundled_matrix() -> bytes:
    """The BLOSUM62 table that ships with the skill, refused unless it is the pinned file."""
    try:
        data = MATRIX_FILE.read_bytes()
    except OSError as error:
        raise MatrixError(f"the BLOSUM62 table that ships with this skill could not be read "
                          f"({MATRIX_FILE}): {error}") from error
    found = hashlib.sha256(data).hexdigest()
    if found != MATRIX_SHA256:
        raise MatrixError(f"the BLOSUM62 table at {MATRIX_FILE} is not the file this skill was built "
                          f"with (SHA-256 {found}, expected {MATRIX_SHA256}); restore it from the plugin")
    return data


def accession_argument(value: str) -> str:
    # fullmatch, because `$` would also accept a trailing newline.
    if not ACCESSION_PATTERN.fullmatch(value):
        raise argparse.ArgumentTypeError(f"{value!r} is not a UniProt accession (for example P12345)")
    return value


def pfam_argument(value: str) -> str:
    if not PFAM_PATTERN.fullmatch(value):
        raise argparse.ArgumentTypeError(
            f"{value!r} is not a single Pfam id of the form PF00000; one family is chosen per run"
        )
    return value


def explain(*paragraphs: str) -> None:
    """Print each paragraph to stderr as wrapped prose, indented under the run's output."""
    for paragraph in paragraphs:
        print(textwrap.fill(paragraph, width=78, initial_indent="  ", subsequent_indent="  "),
              file=sys.stderr)


def write_outputs(out: Path, files: dict[str, bytes]) -> None:
    """Write a finished set of files into `out`.

    Called only once every request has succeeded, so a refused or failed run leaves the
    directory as it found it. provenance.json is the record that says what the other
    files are, so it is removed first and written last: an interruption part-way leaves
    sequences with no record, which the scorer refuses, and never new sequences beside
    the previous run's record. Each file is written whole under a temporary name and then
    renamed into place."""
    out.mkdir(parents=True, exist_ok=True)
    (out / "provenance.json").unlink(missing_ok=True)

    def put(name: str, data: bytes) -> None:
        temporary = out / f".{name}.tmp"
        temporary.write_bytes(data)
        temporary.replace(out / name)

    for name, data in files.items():
        if name != "provenance.json":
            put(name, data)
    put("provenance.json", files["provenance.json"])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                      formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("accession", type=accession_argument,
                        help="UniProt accession of the reference protein")
    parser.add_argument("out", type=Path, help="directory to write into")
    parser.add_argument("--limit", type=int, default=0,
                        help="cap the number of family members; 0 (default) takes the whole family")
    parser.add_argument("--family", default="", type=lambda v: pfam_argument(v) if v else "",
                        help="a single Pfam id (PF00000) to use instead of the entry's own; "
                             "implies --level family")
    parser.add_argument("--level", choices=["orthologs", "family"], default="orthologs",
                        help="orthologs (default) takes the reference's UniRef50 cluster -- the "
                             "same protein in other species. family takes everything carrying "
                             "its Pfam domain, which is a superfamily of different proteins. "
                             "See the module docstring: they answer different questions.")
    parser.add_argument("--min-sequences", type=int, default=30,
                        help="refuse an ortholog set smaller than this rather than score a "
                             "protein against a handful of relatives (default 30)")
    args = parser.parse_args()
    outputs: dict[str, bytes] = {}
    matrix = bundled_matrix()

    entry_url = f"{UNIPROT}/uniprotkb/{args.accession}.json"
    entry = json.loads(get(entry_url, f"the entry for {args.accession}")[0])
    sequence = entry["sequence"]["value"]
    name = entry.get("proteinDescription", {}).get("recommendedName", {}) \
        .get("fullName", {}).get("value") or args.accession
    organism = entry.get("organism", {}).get("scientificName", "")
    print(f"{args.accession}: {name} [{organism}], {len(sequence)} aa")
    print(f"  entry type: {entry.get('entryType')}")

    outputs["reference.fasta"] = get(f"{UNIPROT}/uniprotkb/{args.accession}.fasta",
                                     "the reference sequence")[0]

    level = "family" if args.family else args.level

    def total_for(query: str) -> int:
        url = f"{UNIPROT}/uniprotkb/search?query={urllib.parse.quote(query)}" \
              "&format=tsv&fields=accession&size=1"
        return int(get(url, "the size of the comparison set")[1].get("x-total-results", "0"))

    def paged_fasta(query: str, wanted: int) -> str:
        """Page through a UniProt result set. A page caps at 500 and the cursor
        comes back in the Link header; taking only the first page would take
        whatever order the server happened to return, which is not a sample of
        anything in particular."""
        encoded = urllib.parse.quote(query)
        url = f"{UNIPROT}/uniprotkb/search?query={encoded}&format=fasta" \
              f"&size={min(500, wanted)}"
        pages: list[str] = []
        seen = 0
        while url and seen < wanted:
            body, headers = get(url, "the comparison sequences")
            text = body.decode()
            pages.append(text)
            seen += text.count(">")
            match = re.search(r'<([^>]+)>;\s*rel="next"', headers.get("link", ""))
            url = match.group(1) if match else ""
            if url:
                print(f"    {seen}/{wanted} ...")
        return "".join(pages)

    # Pfam membership is needed either way: at family level it IS the set, and
    # at ortholog level it names the alternative when the cluster is too thin to
    # score.
    families = [args.family] if args.family else [
        x["id"] for x in entry.get("uniProtKBCrossReferences", []) if x.get("database") == "Pfam"
    ]

    family = ""
    total = 0
    cluster = ""
    selection = ""

    if level == "orthologs":
        # The UniRef50 cluster is resolved by querying UniProt. A cluster is
        # named for one of its members, which need not be the accession that was
        # asked about, so a cluster id cannot be derived from the accession.
        url = f"{UNIPROT}/uniref/search?query={urllib.parse.quote(f'uniprot_id:{args.accession}')}" \
              "&format=tsv&fields=id,count&size=25"
        rows = [r.split("\t") for r in get(url, "the UniRef50 cluster")[0].decode().splitlines()[1:]
                if r.strip()]
        fifty = [r for r in rows if r[0].startswith("UniRef50_")]
        if not fifty:
            explain(f"No UniRef50 cluster was found for {args.accession}.",
                    "Pass --level family to compare against the Pfam domain family instead.")
            return 2
        cluster = fifty[0][0]
        in_cluster = int(fifty[0][1]) if len(fifty[0]) > 1 and fifty[0][1].isdigit() else 0
        query = f"uniref_cluster_50:{cluster}"
        total = total_for(query)
        print(f"  {cluster}: {in_cluster} cluster members, {total} of them UniProtKB entries")

        if total < args.min_sequences:
            explain(f"Only {total} UniProtKB sequences are in {cluster}, below the floor of "
                    f"{args.min_sequences}. Conservation over a handful of close relatives "
                    "discriminates nothing, because every position looks conserved when the "
                    "sequences are nearly the same sequence.")
            if families:
                size = total_for(f"xref:pfam-{families[0]}")
                explain(f"This protein carries Pfam {families[0]} ({size} members). Pass "
                        "--level family to compare against the domain family instead, and read "
                        "the result as fold-level conservation and not as a statement about "
                        "this protein.")
            else:
                explain("This entry carries no Pfam family either, so there is no comparison "
                        "set to fall back on. Lower --min-sequences only if the count is "
                        "reported beside the score.")
            return 2

        wanted = args.limit if args.limit > 0 else total
        homologs = paged_fasta(query, wanted)
        selection = (
            f"UniProtKB members of {cluster}, the UniRef50 cluster containing {args.accession}: "
            f"the same protein in other species, clustered by UniProt at 50% identity with an "
            f"80% length-overlap requirement. ORTHOLOG level: scores answer what this protein "
            f"needs."
        )
    else:
        if not families:
            explain("This entry carries no Pfam family. Pass --family to choose one.")
            return 2

        # A multidomain entry carries one Pfam family per domain, and each family
        # is homologous to its own stretch of the reference and to nothing else.
        # Taking the first silently would score the whole protein against one
        # domain's family and label the result as if it covered the protein, so
        # the choice is the caller's to make and to record.
        if len(families) > 1 and not args.family:
            explain(f"{args.accession} carries {len(families)} Pfam families: "
                    f"{', '.join(families)}. Each one is homologous to a different part of the "
                    "sequence, so no single family describes the whole protein. Pass --family "
                    "to pick the domain meant, and expect the residues outside it to come back "
                    "unscored.")
            return 2
        family = families[0]
        query = f"xref:pfam-{family}"
        total = total_for(query)
        print(f"  family {family}: {total} members, "
              f"retrieving {args.limit if args.limit > 0 else total}")
        wanted = args.limit if args.limit > 0 else total
        homologs = paged_fasta(query, wanted)
        selection = (
            f"UniProt entries carrying Pfam {family}, a superfamily whose members are "
            f"different proteins related by ancient duplication. FAMILY level: a low score "
            f"here means a position varies across the superfamily, which is also what a "
            f"specificity-determining residue does, so low conservation here is consistent "
            f"with a position that is constrained in this protein."
        )

    outputs["homologs.fasta"] = homologs.encode()
    count = homologs.count(">")

    outputs["BLOSUM62"] = matrix

    provenance = {
        "accession": args.accession,
        "protein": name,
        "organism": organism,
        "entry_type": entry.get("entryType"),
        "sequence_length": len(sequence),
        "sequence_version": entry.get("entryAudit", {}).get("sequenceVersion"),
        "level": level,
        "selection": selection,
        "uniref_cluster": cluster or None,
        "family": family or None,
        "pfam_families_on_entry": families or None,
        "candidates_in_release": total,
        "homologs_retrieved": count,
        "sampling": (
            f"the complete set: all {count} of {total}"
            if count >= total
            else f"first {count} of {total} returned by UniProt's default ordering; "
            "NOT a random or taxonomically balanced sample"
        ),
        "matrix": MATRIX_ORIGIN,
        "matrix_delivery": "bundled with the skill, unchanged (data/matrices/NOTICE.md)",
        "matrix_sha256": MATRIX_SHA256,
        "retrieved_on": date.today().isoformat(),
    }
    outputs["provenance.json"] = (json.dumps(provenance, indent=2) + "\n").encode()
    try:
        write_outputs(args.out, outputs)
    except OSError as error:
        explain(f"Could not write the results into {args.out}: {error}")
        return 1

    print(f"  wrote {args.out}/reference.fasta ({len(sequence)} aa)")
    print(f"  wrote {args.out}/homologs.fasta ({count} sequences, {level} level)")
    print(f"  wrote {args.out}/BLOSUM62 and provenance.json")
    if count < 50:
        print(f"  WARNING: only {count} sequences. Conservation from a set this small is weak;")
        print("           report the count alongside any score computed from it.")
    return 0


def run() -> int:
    try:
        return main()
    except MatrixError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    except FetchError as error:
        print(f"request failed: {error}", file=sys.stderr)
        if error.may_be_blocked:
            # Said as a possibility: the same symptom is a refusal, a timeout and a dead
            # connection, and nothing here can tell which.
            explain(f"If this environment limits outbound access, {error.host} may need to be "
                    "allowed. Without it the comparison set cannot be fetched.")
    except (urllib.error.URLError, OSError, http.client.HTTPException, ValueError) as error:
        print(f"request failed: {getattr(error, 'reason', error)}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(run())
