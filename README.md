# Construct Maps

Design and compare protein constructs, with the reasoning kept beside the sequences.

Construct Maps is a skill for planning protein engineering work. Given a protein sequence and a
goal, it builds an evidence-backed map of the protein's functional regions, proposes a small
library of designs with matched controls, and renders the comparison as an interactive document or
a static figure. Every edit is checked against the sequences it describes, so a figure cannot
disagree with its record.

## What it does

- Maps functional regions and individual residues, with the evidence for each and where that
  evidence came from.
- Computes per-residue conservation from a homolog set, and reports how much independent evidence
  is behind each score.
- Records peptide chemistry that a one-letter sequence cannot carry: D residues, N-methylation,
  terminal caps, disulfides, lactams, and lipid or spacer side chains. A structure is derived from
  the record, and export as plain letters is refused when the letters would describe a different
  molecule.
- Renders a comparison of constructs as an interactive HTML document or an SVG.
- Checks that each cited paper's identifiers match its bibliographic record.

## Using it

Install the plugin and describe the task: a protein, a goal, and any constraints. The skill is
called `protein-construct-design`, and it can be named directly or invoked by describing the work.

## What it runs and what it contacts

Everything runs inside the session. Nothing leaves it unless one of the steps below is used.

| Step | Contacts | What is sent |
|---|---|---|
| Fetch homologs for conservation | `rest.uniprot.org` | A UniProt accession, a UniRef cluster id or a Pfam id. The sequence being designed is not sent. |
| Download a substitution matrix | `ftp.ncbi.nlm.nih.gov` | A request for one public file. |
| Verify citations | `www.ebi.ac.uk` (Europe PMC) | The DOIs, PubMed ids or PMC ids of the papers a record cites. |
| Install helper packages | `pypi.org` | `pip install rdkit` and `pip install pyfamsa`, when the skill asks for them. |

The renderer is Node.js, shipped as three files: `dist/cli.mjs`, `dist/viewer.js` and the launcher
`scripts/render.js`. Structure assembly, homolog fetching and conservation scoring are Python
scripts, shipped as plain source. Conservation scoring aligns homologs with MAFFT, which has to be
on `PATH`, or with `pip install pyfamsa` and the `--aligner famsa` option. The plugin has no
account, no server and no analytics, and keeps nothing beyond the files it writes to the session's
working folder. See `PRIVACY.md`.

## Limits

A design record describes what was proposed. Nothing here predicts activity, binding or
stability, and a structure derived from a record describes the intended molecule without being a
synthesis route. Where the vocabulary cannot express a modification, the record declares the gap
and no structure is derived.

## License

GPL-3.0-or-later. See `LICENSE`. The monomer table under `skills/protein-construct-design/data/monomers/`
derives from an MIT-licensed library, and its notice is kept in the `LICENSE` file beside it.

## Support

Report problems or ask questions through the repository's issue tracker.
