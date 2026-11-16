# Construct Maps

Design protein and peptide constructs, compare alternatives, and inspect the evidence behind each change.

Start with a protein, a biological goal, and any constraints. Construct Maps investigates the sequence–function relationships relevant to that goal, proposes a focused library with matched controls, and identifies experiments that could distinguish the proposed mechanisms.

You can also provide constructs you already have. Construct Maps compares their sequences and architectures and presents them in an interactive document or a static figure.

## What you get

### A focused design library

Each design includes its sequence or chemical specification, the change being tested, supporting evidence, expected tradeoffs, and the main uncertainty. Controls answer specific questions about the proposed mechanism.

The opening library usually contains five to ten constructs, including the reference and controls.

### An interactive construct comparison

Constructs line up on a shared residue scale. The document shows functional regions, sequence changes, residue-level findings, and peptide modifications. You can zoom from the whole library to individual residues, inspect supporting evidence, and highlight corresponding regions across constructs.

The comparison is available as a standalone HTML document and a static SVG figure.

### Traceable evidence

Functional annotations and design decisions link to their sources. The record distinguishes findings measured in the relevant construct from evidence transferred from another context and from predictions.

It also records what was inspected in each source and where important evidence remains unavailable or inconclusive. Citation checks compare paper identifiers with bibliographic records.

### Explicit peptide chemistry

Ordinary sequence letters cannot fully describe many peptides. Construct Maps records supported modifications explicitly, including:

- D-amino acids and non-natural residues
- N-methylation
- Terminal caps and amino-alcohol termini
- Disulfide, lactam, and backbone cyclization
- Supported lipid and spacer attachments

A structure is derived from the chemical record when the molecule can be fully represented. Unsupported chemistry is identified as a gap. Plain-sequence export is blocked when it would omit recorded chemistry and describe a different molecule.

### Conservation with its supporting context

Conservation analysis uses a documented homolog set. Results include the alignment method, per-position coverage, and effective sequence count, so a large collection of closely related sequences is not mistaken for equally strong independent evidence.

If a meaningful profile cannot be produced, the record states why.

## Using it

Install the plugin and describe:

- The protein or peptide, using a sequence or a public identifier
- The biological behavior you want to change
- Any constraints, such as delivery, expression system, construct count, or publication cutoff

To compare existing designs, provide their complete sequences and describe the differences you want to understand.

The skill is named `protein-construct-design`. You can name it directly or describe a relevant task.

## How the designs and figures stay connected

The sequence records, annotations, chemical specifications, evidence, and figures come from one structured design record.

Declared sequence edits are checked against their parent sequences before rendering. Chemistry is recorded separately because changes such as a D-substitution or a disulfide can alter the molecule without changing its sequence letters.

These checks establish consistency within the record. They do not establish biological activity.

## Execution and external services

The bundled scripts run in the environment provided by the hosting AI application. That environment may be cloud-hosted or local, depending on the application and session.

The plugin has no author-operated backend, account system, or analytics. Its author does not receive session files through a plugin-operated service.

The bundled scripts may contact the following services when the corresponding workflow step runs:

| Step | Service | Information sent |
|---|---|---|
| Retrieve homologs | UniProt | A UniProt accession, UniRef cluster identifier, or Pfam identifier |
| Download a substitution matrix | NCBI | A request for a public matrix file |
| Check citation metadata | Europe PMC | DOI, PubMed, or PMC identifiers |
| Install Python dependencies | The configured package index and download hosts | Package requests for RDKit, pyfamsa, and their dependencies |

The bundled database lookup scripts do not submit the sequence being designed. Lookups may be initiated as part of completing your task; they do not require a separate request for each step.

Literature research may also use search, browsing, or other tools supplied by the hosting AI application. Those tools make their own external requests and follow that application’s settings and policies.

See `PRIVACY.md` for details.

## Requirements

The renderer uses Node.js. Structure assembly, homolog retrieval, and conservation scoring use Python.

Chemical structure assembly uses RDKit. Multiple-sequence alignment uses MAFFT when available, with FAMSA through pyfamsa as an alternative. The analysis record identifies the method used.

## Limits

Construct Maps proposes engineering hypotheses and informative comparisons. It does not establish that a design will improve binding, activity, expression, stability, or any other biological property.

Conservation describes variation across a comparison set; it does not establish that a substitution is tolerated. A receptor-bound structure or a published result in another construct may support a hypothesis without validating the proposed design.

Derived chemical structures describe the intended molecules, not synthesis routes. Unsupported modifications and unresolved chemical specifications remain explicit.

## License

GPL-3.0-or-later. See `LICENSE`.

The monomer table under `skills/protein-construct-design/data/monomers/` derives from an MIT-licensed library. Its notice is retained in the accompanying license file.

## Support

Report problems and ask questions through the repository’s issue tracker.
