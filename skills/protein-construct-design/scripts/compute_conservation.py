#!/usr/bin/env python3
"""Compute per-residue evolutionary conservation for a reference sequence.

The numbers this produces are only as good as the homolog set behind them, so
every parameter that shapes them is recorded in the output: where the homologs
came from, how many survived filtering, how they were aligned, how they were
weighted, and how many actually cover each column. A column backed by eight
sequences is not the same claim as one backed by three hundred, and the viewer
is expected to show that difference rather than average it away.

Method
  1. The family is aligned by MAFFT (FFT-NS-2), then projected onto reference
     coordinates by dropping the columns where the reference is gapped, leaving
     exactly one column per reference residue. A column covered by too few
     homologs reports no value, which is how a region the family has no
     counterpart for comes back unscored instead of guessed at.

     Two alternatives exist for a machine that cannot install a system
     package. They differ from MAFFT and from each other: MAFFT leaves columns
     without enough support unscored, FAMSA scores some of those columns
     weakly, and the built-in aligner scores every position.

     --aligner famsa is a true multiple alignment, through pyfamsa, which
     installs as a Python wheel with no compiler. Raising the coverage gate
     does not make its scores track MAFFT's, because the columns MAFFT declines
     are not systematically less covered than the rest. Read the per-position
     coverage.

     --aligner builtin is a centre-star last resort needing nothing at all. It
     anchors each homolog to the reference by global Needleman-Wunsch
     independently, which keeps the coordinates trivial but forces an
     alignment over the reference's full length whether or not the homolog has
     anything to put there, including regions the family does not have.
  2. Near-identical homologs are down-weighted by Henikoff position-based
     weights, so a database crowded with one over-sequenced genus does not read
     as conservation.
  3. Conservation per column is the Jensen-Shannon divergence between the
     observed weighted amino-acid distribution and a background distribution,
     reported on 0-1 where 1 is most constrained.

Deliberately NOT done here: conservation across the engineered variants in a
design record. That measures how much someone edited, not what evolution
constrains, and the two must never share a scale or a legend.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import textwrap
import math
import operator
from collections import defaultdict
from datetime import date
from pathlib import Path

GAP_OPEN = -11
GAP_EXTEND = -1
AMINO_ACIDS = "ACDEFGHIKLMNPQRSTVWY"

# Robinson & Robinson background amino-acid frequencies, as used by the
# Capra & Singh (2007) Jensen-Shannon conservation score. The published table
# is rounded to four places and sums to 1.0054, so it is renormalised below:
# Jensen-Shannon divergence is only defined between probability distributions,
# and feeding it an unnormalised one biases every score.
_BACKGROUND_PUBLISHED = {
    "A": 0.0780, "R": 0.0512, "N": 0.0448, "D": 0.0536, "C": 0.0193,
    "Q": 0.0408, "E": 0.0620, "G": 0.0737, "H": 0.0217, "I": 0.0591,
    "L": 0.0896, "K": 0.0598, "M": 0.0238, "F": 0.0401, "P": 0.0476,
    "S": 0.0712, "T": 0.0558, "W": 0.0137, "Y": 0.0324, "V": 0.0672,
}
_BACKGROUND_TOTAL = sum(_BACKGROUND_PUBLISHED.values())
BACKGROUND = {a: f / _BACKGROUND_TOTAL for a, f in _BACKGROUND_PUBLISHED.items()}


def read_fasta(path: Path) -> dict[str, str]:
    sequences: dict[str, str] = {}
    name = None
    for line in path.read_text().splitlines():
        if line.startswith(">"):
            name = line[1:].split()[0]
            sequences[name] = ""
        elif name is not None:
            sequences[name] += line.strip().upper()
    return {k: v for k, v in sequences.items() if v}


def read_matrix(path: Path) -> dict[tuple[str, str], int]:
    lines = [l for l in path.read_text().splitlines() if not l.startswith("#") and l.strip()]
    columns = lines[0].split()
    matrix: dict[tuple[str, str], int] = {}
    for line in lines[1:]:
        parts = line.split()
        row = parts[0]
        for column, value in zip(columns, parts[1:]):
            matrix[(row, column)] = int(value)
    return matrix


def align_to_reference(reference: str, query: str, matrix) -> list[str | None]:
    """Global affine-gap alignment; returns the query residue facing each
    reference position, or None where the query has a gap there."""
    n, m = len(reference), len(query)
    neg = float("-inf")
    # M: aligned, X: gap in query, Y: gap in reference
    previous_m = [neg] * (m + 1)
    previous_x = [neg] * (m + 1)
    previous_y = [neg] * (m + 1)
    previous_m[0] = 0.0
    for j in range(1, m + 1):
        previous_y[j] = GAP_OPEN + (j - 1) * GAP_EXTEND
    pointers: list[bytearray] = []

    for i in range(1, n + 1):
        current_m = [neg] * (m + 1)
        current_x = [neg] * (m + 1)
        current_y = [neg] * (m + 1)
        current_x[0] = GAP_OPEN + (i - 1) * GAP_EXTEND
        row = bytearray(m + 1)
        a = reference[i - 1]
        for j in range(1, m + 1):
            b = query[j - 1]
            score = matrix.get((a, b), -4)
            best_prev = previous_m[j - 1]
            state = 0
            if previous_x[j - 1] > best_prev:
                best_prev, state = previous_x[j - 1], 1
            if previous_y[j - 1] > best_prev:
                best_prev, state = previous_y[j - 1], 2
            current_m[j] = best_prev + score
            open_x = previous_m[j] + GAP_OPEN
            extend_x = previous_x[j] + GAP_EXTEND
            current_x[j] = open_x if open_x >= extend_x else extend_x
            open_y = current_m[j - 1] + GAP_OPEN
            extend_y = current_y[j - 1] + GAP_EXTEND
            current_y[j] = open_y if open_y >= extend_y else extend_y
            row[j] = state | (0 if open_x >= extend_x else 4) | (0 if open_y >= extend_y else 8)
        pointers.append(row)
        previous_m, previous_x, previous_y = current_m, current_x, current_y

    # Traceback.
    i, j = n, m
    ends = {0: previous_m[m], 1: previous_x[m], 2: previous_y[m]}
    state = max(ends, key=lambda k: ends[k])
    facing: list[str | None] = [None] * n
    while i > 0 and j > 0:
        row = pointers[i - 1]
        if state == 0:
            facing[i - 1] = query[j - 1]
            state = row[j] & 3
            i -= 1
            j -= 1
        elif state == 1:
            state = 1 if (row[j] & 4) else 0
            i -= 1
        else:
            state = 2 if (row[j] & 8) else 0
            j -= 1
    return facing


# FFT-NS-2 is pinned instead of --auto.
#
# --auto chooses by input size, so a small family can get an iterative
# refinement while a large one silently falls back to PartTree. Two tracks
# computed by different strategies must not be read on one scale, and nothing
# in the output would show which strategy ran. FFT-NS-2 -- progressive, two
# guide trees, no iterative refinement -- scales to tens of thousands of
# sequences. Pinning it makes the method a property of the tool.
MAFFT_STRATEGY = ["--retree", "2", "--maxiterate", "0"]

# This runs inside a plugin, where a scientist or an agent is waiting on the
# answer, so the default homolog count is a LATENCY budget with no implication
# about statistical adequacy. A family of tens of thousands of sequences takes
# MAFFT many minutes, which is too slow to run inline, while a few thousand
# take seconds. Henikoff weighting keeps the trade cheap: a large family is
# mostly near-duplicates that are down-weighted to nearly nothing anyway, so
# the sequences dropped are largely the ones that contributed least. Pass
# --sample 0 to align everything when the run is offline and the extra
# evidence is worth the wait.
DEFAULT_SAMPLE = 2000
MAFFT_STRATEGY_NAME = "FFT-NS-2 (progressive, 2 guide trees, no iterative refinement)"


def famsa_columns(reference: str, homologs: dict[str, str]) -> list[list[str]]:
    """Align with FAMSA through pyfamsa, projected onto REFERENCE coordinates.

    A true multiple alignment, like MAFFT's, so homologs inform each other
    rather than each being compared only to the reference. Unlike MAFFT it
    installs as a Python wheel with no compiler, no root and no system package,
    which is the whole reason it is here: a plugin sandbox can pip-install it
    and cannot apt-get anything. The module docstring says how its scores
    relate to MAFFT's.
    """
    try:
        from pyfamsa import Aligner, Sequence  # type: ignore[import-not-found]
    except ImportError:
        raise SystemExit(
            "--aligner famsa needs pyfamsa, which is not installed.\n"
            "  pip install pyfamsa   (a wheel; no compiler, no system package)"
        )
    names = list(homologs)
    sequences = [Sequence(b"__reference__", reference.encode())] + [
        Sequence(name.encode(), homologs[name].encode()) for name in names
    ]
    aligned = {s.id.decode(): s.sequence.decode() for s in Aligner(threads=0).align(sequences)}
    reference_row = aligned["__reference__"]
    if reference_row.replace("-", "") != reference:
        raise SystemExit(
            "FAMSA returned a reference row that does not match the input sequence; refusing to "
            "project columns onto coordinates that may not be the reference's."
        )
    keep = [index for index, residue in enumerate(reference_row) if residue != "-"]
    return [[aligned[name][index] for name in names] for index in keep]


def famsa_version() -> str:
    try:
        import pyfamsa  # type: ignore[import-not-found]
    except ImportError:
        return "pyfamsa (version unknown)"
    return f"FAMSA via pyfamsa {pyfamsa.__version__}"


def mafft_columns(
    reference: str,
    homologs: dict[str, str],
    threads: int,
    extra: list[str],
) -> list[list[str]]:
    """Align with MAFFT and project the result onto REFERENCE coordinates.

    MAFFT produces a true multiple alignment, in which the reference row
    carries gaps wherever some homolog has an insertion. A per-residue track
    must have exactly one value per reference residue, so the columns where the
    reference is gapped are dropped and the rest map one-to-one onto it. Skip
    that projection and every value past the first insertion is attributed to
    the wrong residue.

    This is a better alignment than the built-in centre-star: homologs are
    aligned to each other rather than each independently to the reference,
    which matters in divergent families. It is also the only way a family of
    tens of thousands finishes in reasonable time.
    """
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "input.fasta"
        with path.open("w") as handle:
            handle.write(f">__reference__\n{reference}\n")
            for name, sequence in homologs.items():
                handle.write(f">{name}\n{sequence}\n")
        command = [
            "mafft",
            *extra,
            "--quiet",
            "--anysymbol",
            "--thread",
            str(threads),
            str(path),
        ]
        result = subprocess.run(command, capture_output=True, text=True, check=True)

    rows: dict[str, str] = {}
    name = None
    for line in result.stdout.splitlines():
        if line.startswith(">"):
            name = line[1:].split()[0]
            rows[name] = ""
        elif name is not None:
            rows[name] += line.strip().upper()

    aligned_reference = rows.pop("__reference__", "")
    if aligned_reference.replace("-", "") != reference:
        raise RuntimeError(
            "MAFFT returned a reference row that does not match the input sequence; refusing to "
            "attribute values to residues on that basis"
        )
    keep = [index for index, residue in enumerate(aligned_reference) if residue != "-"]
    others = list(rows.values())
    return [[row[index] if index < len(row) else "-" for row in others] for index in keep]


def mafft_version() -> str:
    try:
        result = subprocess.run(["mafft", "--version"], capture_output=True, text=True)
        return (result.stderr or result.stdout).strip().splitlines()[0]
    except Exception:
        return "unknown"


def henikoff_weights(columns: list[list[str]], count: int) -> list[float]:
    """Position-based weights: a residue shared by many sequences contributes
    less, so an over-represented clade cannot manufacture conservation.

    Invariant columns are skipped. They contribute an identical increment to
    every sequence, which shifts the weights without distinguishing anything,
    but it is a deviation from the published scheme and is recorded as such in
    the output rather than described as standard Henikoff weighting.
    """
    weights = [0.0] * count
    used = 0
    for column in columns:
        observed = defaultdict(int)
        for residue in column:
            if residue in BACKGROUND:
                observed[residue] += 1
        distinct = len(observed)
        if distinct <= 1:
            continue
        used += 1
        for index, residue in enumerate(column):
            if residue in BACKGROUND:
                weights[index] += 1.0 / (distinct * observed[residue])
    if used == 0:
        return [1.0] * count
    total = sum(weights) or 1.0
    return [w * count / total for w in weights]


def effective_sequences(
    columns: list[list[str]],
    count: int,
    threshold: float,
    min_overlap: float = 0.5,
) -> tuple[float, int]:
    """Neff: the number of EFFECTIVE sequences, as sum(1/n_i) where n_i counts
    the sequences at least `threshold` identical to sequence i, itself included.

    This is NOT the sum of the Henikoff weights. henikoff_weights() rescales
    its output to sum to `count` by construction, so that sum is the row count
    wearing a different name: a hundred identical sequences and a hundred
    distinct ones both come to a hundred. Neff separates them -- a hundred
    identical sequences plus one outlier comes to 2.

    Identity is measured over the projected columns, counting only positions
    where BOTH sequences have a residue. A pair overlapping on less than
    `min_overlap` of the reference is treated as too little to establish
    similarity, which keeps a short fragment from reading as a near-duplicate
    of everything it touches.

    Returns (neff, pairs_compared). Cost is O(count^2 x columns): negligible
    for an ortholog set of a few dozen, and growing quadratically with the
    number of rows, so a whole-family run pays for it.
    """
    if count == 0:
        return 0.0, 0
    # Transpose to one bytes object per sequence: bytes compare far faster
    # than per-character work on str, and the alphabet is ASCII.
    rows = [
        "".join(column[i] for column in columns).upper().encode("ascii", "replace")
        for i in range(count)
    ]
    length = len(columns)
    need = max(1, int(min_overlap * length))
    gap = ord("-")

    # The pair loop runs count^2/2 times, so the body has to stay out of the
    # interpreter. Two identities make that possible:
    #   sum(map(eq, a, b)) counts equal bytes at C speed, and the only way two
    #   non-residues compare equal is gap==gap, so subtracting the gap/gap
    #   overlap leaves the residue matches;
    #   the overlap counts come from integer bitmasks via int.bit_count().
    gap_bits = [
        int("".join("1" if byte == gap else "0" for byte in row), 2) if length else 0
        for row in rows
    ]
    res_bits = [
        int("".join("0" if byte == gap else "1" for byte in row), 2) if length else 0
        for row in rows
    ]

    similar = [1] * count  # every sequence is similar to itself
    pairs = 0
    for i in range(count):
        a = rows[i]
        a_gap = gap_bits[i]
        a_res = res_bits[i]
        for j in range(i + 1, count):
            pairs += 1
            compared = (a_res & res_bits[j]).bit_count()
            if compared < need:
                continue
            matches = sum(map(operator.eq, a, rows[j])) - (a_gap & gap_bits[j]).bit_count()
            if matches >= threshold * compared:
                similar[i] += 1
                similar[j] += 1
    return sum(1.0 / n for n in similar), pairs


def jensen_shannon(distribution: dict[str, float]) -> float:
    mixture = {a: 0.5 * distribution.get(a, 0.0) + 0.5 * BACKGROUND[a] for a in BACKGROUND}
    total = 0.0
    for a in BACKGROUND:
        p, q, r = distribution.get(a, 0.0), BACKGROUND[a], mixture[a]
        if p > 0:
            total += 0.5 * p * math.log(p / r, 2)
        if q > 0:
            total += 0.5 * q * math.log(q / r, 2)
    return max(0.0, min(1.0, total))


COMPARISON_LEVELS = ("orthologs", "family")


def read_comparison_set(homologs: Path) -> tuple[dict[str, object], str | None]:
    """
    The comparison set fetch_homologs.py recorded beside the homologs, or why there is none.

    A score whose comparison population is unknown cannot be read: the same number
    means something different over orthologs and over a domain family, and they share
    no scale. So the answer is needed, and the three ways of not having it are told
    apart: a file that is missing, one that cannot be read as JSON, and one that
    names a level this script cannot label.
    """
    side = homologs.parent / "provenance.json"
    if not side.exists():
        return {}, f"no provenance.json beside the homologs ({side})"
    try:
        written = json.loads(side.read_text())
    except OSError as error:
        return {}, f"{side} could not be read ({error})"
    except json.JSONDecodeError as error:
        return {}, f"{side} is not valid JSON ({error})"
    level = written.get("level") if isinstance(written, dict) else None
    if level not in COMPARISON_LEVELS:
        named = "no comparison level" if level is None else f"the comparison level {json.dumps(level)}"
        return {}, f"{side} names {named}, which is not orthologs or family"
    recorded: dict[str, object] = {
        "comparison_level": level,
        "comparison_set": written.get("selection"),
    }
    if written.get("uniref_cluster"):
        recorded["uniref_cluster"] = written["uniref_cluster"]
    if written.get("family"):
        recorded["pfam_family"] = written["family"]
    print(f"  comparison level: {level} (from {side})")
    return recorded, None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reference", type=Path, help="FASTA with one reference sequence")
    parser.add_argument("homologs", type=Path, help="FASTA of homologs")
    parser.add_argument("matrix", type=Path, help="BLOSUM62 in NCBI format")
    parser.add_argument("output", type=Path)
    parser.add_argument("--track-id", required=True,
                        help="identifier for the emitted track, e.g. conservation-family")
    parser.add_argument("--source", required=True,
                        help="where the homologs came from; recorded as provenance and required, "
                             "because a track whose origin is unstated cannot be interpreted")
    parser.add_argument("--min-ratio", type=float, default=0.5)
    parser.add_argument("--max-ratio", type=float, default=2.5)
    parser.add_argument("--gap-threshold", type=float, default=0.5,
                        help="columns with less coverage than this report no value")
    parser.add_argument("--aligner", choices=["mafft", "famsa", "builtin"], default="mafft",
                        help="mafft (default) is the best alignment and needs a system package. "
                             "famsa is a true multiple alignment that installs as a Python wheel, "
                             "for an environment that cannot apt-get anything; it scores some "
                             "positions mafft declines, all of them weakly. builtin is the "
                             "centre-star last resort and needs nothing at all. There is no "
                             "automatic substitution: the three produce different numbers, and "
                             "swapping one in silently would change every score without changing "
                             "anything visible.")
    parser.add_argument("--threads", type=int, default=-1, help="threads for MAFFT; -1 is all cores")
    parser.add_argument("--mafft-args", default="",
                        help=f"override the MAFFT strategy; the default is {' '.join(MAFFT_STRATEGY)} "
                             "(FFT-NS-2). Whatever is used is recorded in the track.")
    parser.add_argument("--neff-threshold", type=float, default=0.8,
                        help="identity above which two sequences count as the same evidence "
                             "when computing Neff (default 0.8, the usual choice)")
    parser.add_argument("--sample", type=int, default=DEFAULT_SAMPLE,
                        help=f"use at most this many homologs, taken evenly across the file "
                             f"rather than from the front; the default {DEFAULT_SAMPLE} is a "
                             f"latency budget for running inside a plugin. Pass 0 to align the "
                             f"whole family, which on a family of tens of thousands is minutes "
                             f"to tens of minutes.")
    args = parser.parse_args()

    # Before the sequences are read or anything is aligned: the alignment is the slow
    # step, and its result cannot be labelled without this.
    #
    # If fetch_homologs.py refused, that refusal is the result. Record it in the design
    # record's `attempted_analyses` and move on; do not assemble a comparison set by hand
    # to get a number out of this script, because a hand-written label places the one
    # field that makes the number interpretable outside the reach of the fetcher that
    # produced the sequences.
    fetch_provenance, problem = read_comparison_set(args.homologs)
    if problem is not None:
        print(f"  {problem}, so the score cannot be labelled.", file=sys.stderr)
        print("  compute_conservation.py reads the comparison set from the provenance "
              "fetch_homologs.py writes;", file=sys.stderr)
        print("  without it there is no way to say what the number is a conservation OF.",
              file=sys.stderr)
        print("  If the fetcher refused, that IS the result: record it in "
              "attempted_analyses.", file=sys.stderr)
        return 2

    reference_sequences = read_fasta(args.reference)
    reference_id, reference = next(iter(reference_sequences.items()))
    matrix = read_matrix(args.matrix)

    homologs = read_fasta(args.homologs)
    homologs.pop(reference_id, None)
    kept = {
        name: seq
        for name, seq in homologs.items()
        if args.min_ratio * len(reference) <= len(seq) <= args.max_ratio * len(reference)
        and set(seq) <= set(AMINO_ACIDS + "BXZJUO*")
    }
    print(f"{len(homologs)} homologs, {len(kept)} kept after length and alphabet filtering")

    # Take every k-th sequence rather than the first N. Neither is a
    # taxonomically balanced sample, but an even stride across the file at
    # least does not concentrate on whatever the source happened to return
    # first, and the stride is recorded. The file arrives in UniProt's own
    # order, which is roughly by accession and so correlates with how long a
    # clade has been in the database; the front of it is not a random draw.
    sampling = f"all {len(kept)} sequences that passed filtering"
    if 0 < args.sample < len(kept):
        stride = len(kept) / args.sample
        names = list(kept)
        picked = {names[int(i * stride)] for i in range(args.sample)}
        dropped = len(kept) - len(picked)
        kept = {name: seq for name, seq in kept.items() if name in picked}
        sampling = (
            f"evenly spaced sample of {len(kept)} taken across all {len(names)} that passed "
            f"filtering (every ~{stride:.1f}th), not the first {len(kept)}"
        )
        why = "the default latency cap" if args.sample == DEFAULT_SAMPLE \
            else "the requested --sample"
        sampling += f"; cap applied by {why}"
        print(f"  sampled {len(kept)} evenly across the family, capped by {why}")
        print(f"  {dropped} of {len(names)} sequences were not aligned; "
              f"pass --sample 0 to use all of them")

    use_mafft = args.aligner == "mafft"
    if use_mafft and not shutil.which("mafft"):
        print("mafft is not on PATH, and there is no automatic fallback.", file=sys.stderr)
        print("  Install it (apt-get install mafft, brew install mafft, or conda install -c "
              "bioconda mafft),", file=sys.stderr)
        print("  or, where no system package can be installed at all:", file=sys.stderr)
        print("    pip install pyfamsa && --aligner famsa   a real multiple alignment, from a "
              "wheel", file=sys.stderr)
        print("    --aligner builtin                        the centre-star last resort",
              file=sys.stderr)
        return 2

    if args.aligner == "famsa":
        version = famsa_version()
        print(f"  aligning {len(kept)} sequences with {version}")
        columns = famsa_columns(reference, kept)
        alignment_note = (
            f"multiple alignment by {version}, projected onto reference coordinates by dropping "
            "columns where the reference is gapped. It can score positions that MAFFT leaves "
            "unscored, with weak support, so read per-position coverage alongside the score"
        )
        strategy_name = "FAMSA default"
        used = len(columns[0]) if columns else 0
    elif use_mafft:
        version = mafft_version()
        print(f"  aligning {len(kept)} sequences with {version}")
        strategy = args.mafft_args.split() if args.mafft_args else MAFFT_STRATEGY
        strategy_name = args.mafft_args if args.mafft_args else MAFFT_STRATEGY_NAME
        columns = mafft_columns(reference, kept, args.threads, strategy)
        alignment_note = (
            f"multiple alignment by MAFFT {version}, {strategy_name}, projected onto reference "
            "coordinates by dropping columns where the reference is gapped"
        )
        used = len(columns[0]) if columns else 0
    else:
        print("  WARNING: the built-in centre-star aligner is in use.", file=sys.stderr)
        print(textwrap.fill(
            "Global Needleman-Wunsch aligns the full length of every homolog, so it cannot "
            "decline to score a region the family has no counterpart for. It returns a value "
            "for every position, including regions the family does not possess, so scores "
            "outside the conserved core are unverified.",
            width=78, initial_indent="  ", subsequent_indent="  "), file=sys.stderr)
        rows: list[list[str | None]] = []
        for index, (name, sequence) in enumerate(kept.items(), start=1):
            rows.append(align_to_reference(reference, sequence, matrix))
            if index % 50 == 0:
                print(f"  aligned {index}/{len(kept)}")
        columns = [[row[position] or "-" for row in rows] for position in range(len(reference))]
        alignment_note = (
            "pairwise global Needleman-Wunsch to the reference, affine gaps (open -11, extend -1), "
            "BLOSUM62; centre-star, not a full MSA"
        )
        used = len(rows)

    if len(columns) != len(reference):
        raise RuntimeError(
            f"the alignment produced {len(columns)} columns for a {len(reference)}-residue "
            "reference; values would be attributed to the wrong residues"
        )
    weights = henikoff_weights(columns, used)

    scores: list[float | None] = []
    coverage: list[int] = []
    for position, column in enumerate(columns):
        observed = defaultdict(float)
        total_weight = 0.0
        present = 0
        for index, residue in enumerate(column):
            if residue in BACKGROUND:
                observed[residue] += weights[index]
                total_weight += weights[index]
                present += 1
        coverage.append(present)
        if used == 0 or present / used < args.gap_threshold or total_weight <= 0:
            scores.append(None)
            continue
        distribution = {a: w / total_weight for a, w in observed.items()}
        # A column that is mostly gaps is not conserved; scale by occupancy,
        # which is the standard Capra & Singh gap correction.
        occupancy = present / used
        scores.append(round(jensen_shannon(distribution) * occupancy, 4))

    neff, neff_pairs = effective_sequences(columns, used, args.neff_threshold)
    print(f"  effective sequences (Neff, {args.neff_threshold:.0%} identity): {neff:.2f} "
          f"of {used} rows, from {neff_pairs} pairs")
    if used > 0 and neff < 10:
        print(f"  WARNING: Neff {neff:.2f} is very low -- these {used} sequences carry little "
              f"independent", file=sys.stderr)
        print("           evidence, and every score below rests on it. Report it with any "
              "score.", file=sys.stderr)

    # The displayed label names the comparison population, because the number
    # means something different for each one and they share no scale.
    if fetch_provenance["comparison_level"] == "orthologs":
        track_label = "Conservation across orthologs"
    else:
        fam = fetch_provenance.get("pfam_family")
        track_label = (f"Conservation across the {fam} family" if fam
                       else "Conservation across the domain family")

    track = {
        "track_id": args.track_id,
        "kind": "conservation",
        "label": track_label,
        # NOT a ResidueTrack: that needs `applies_to` naming a variant_id in a
        # design record. This names the FASTA sequence the scores were computed
        # against, and an importer must check that sequence against the target
        # variant residue by residue before rewriting the field.
        "computed_against_sequence": reference_id,
        "computed_against_length": len(reference),
        # The importer compares this against the target variant's sequence.
        # Identifiers and lengths can coincide; the residues cannot.
        "computed_against_sha256": hashlib.sha256(reference.encode()).hexdigest(),
        # The legend states the OBSERVATION. "More constrained" is an inference
        # about biology that depends on the comparison set being the right one.
        # In a region that varies because variation is its function, a low score
        # reflects that mechanism and says nothing about absence of constraint,
        # so a legend reading "more constrained" would assert the wrong thing
        # there. The legend says what was counted.
        "scale": {
            "min": 0,
            "max": 1,
            "higher_means": "more conserved across this comparison set",
        },
        "method": {
            "homolog_source": args.source,
            # The level is what the score MEANS -- ortholog-level conservation
            # and family-level conservation answer different questions and share
            # no scale. It is read from the fetcher's provenance rather than
            # retyped, and its absence is recorded as an absence rather than
            # guessed at, because a track whose level is unknown cannot be
            # interpreted and must not be presented as if it could.
            **fetch_provenance,
            "homologs_retrieved": len(homologs),
            "homologs_used": used,
            "length_filter": f"{args.min_ratio}-{args.max_ratio} x reference length",
            "sampling": sampling,
            "alignment": alignment_note,
            "weighting": "Henikoff position-based sequence weights, computed over variable columns only",
            "effective_sequences": round(neff, 2),
            "effective_sequences_per_residue": round(neff / len(reference), 4),
            "effective_sequences_definition": (
                f"Neff = sum(1/n_i), n_i counting sequences at least "
                f"{args.neff_threshold:.0%} identical to sequence i over positions where both "
                f"have a residue (itself included); pairs overlapping less than 50% of the "
                f"reference are not counted as similar. Reported unnormalised and divided by "
                f"reference length; normalisation is not standardised in the literature, so "
                f"compare only against values computed the same way. This is NOT the sum of "
                f"the Henikoff weights, which is rescaled to the sequence count by construction "
                f"and therefore always equals it."
            ),
            "score": "Jensen-Shannon divergence against Robinson & Robinson background, "
                     "scaled by column occupancy (Capra & Singh 2007)",
            "gap_threshold": args.gap_threshold,
            "computed_on": date.today().isoformat(),
        },
        "values": scores,
        "coverage": coverage,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(track, indent=2) + "\n")

    reported = [s for s in scores if s is not None]
    print(f"\nwrote {args.output}")
    print(f"  {len(reported)}/{len(scores)} positions scored; "
          f"{len(scores) - len(reported)} below the coverage threshold")
    if reported:
        ordered = sorted(reported)
        print(f"  score range {ordered[0]:.3f}-{ordered[-1]:.3f}, median {ordered[len(ordered)//2]:.3f}")
    print(f"  coverage range {min(coverage)}-{max(coverage)} of {used} homologs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
