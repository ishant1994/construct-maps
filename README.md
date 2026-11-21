# Construct Maps

Design protein and peptide constructs, compare alternatives, and inspect the evidence behind each change.

Start with a protein, a biological goal, and any constraints. Construct Maps uses sequence–function evidence to propose a focused library with matched controls and experiments that could distinguish the proposed mechanisms.

You can also provide existing constructs. Construct Maps compares their sequences and architectures in an interactive document or a static figure.

See worked examples, with their interactive maps, on the [demo site](https://ishant1994.github.io/construct-maps-demo/).

## What you get

### A focused design library

Each design includes its sequence or chemical specification, the change being tested, evidence, expected tradeoffs, and main uncertainty. Each control tests a specific question about the proposed mechanism.

The opening library usually contains five to ten constructs, including the reference and controls.

### An interactive construct comparison

You can compare constructs on a shared residue scale and inspect functional regions, sequence changes, residue-level findings, and peptide modifications. Zoom from the whole library to individual residues, follow supporting evidence, and highlight corresponding regions across constructs.

The comparison is available as a standalone HTML document and a static SVG figure. You can also export one GenPept file for the library, with a record per chain and named, colored features, and one protein FASTA per construct. Export writes no coding sequence and stops if any chain carries chemistry, including the reference.

### Traceable evidence

Construct Maps links functional annotations and design decisions to sources and labels evidence as measured in the relevant construct, transferred from another context, or predicted.

It lists which parts of each source were inspected and where evidence remains unavailable or inconclusive. Citation checks compare source titles with Europe PMC records for their identifiers; they do not check that a paper supports the claim attached to it.

### Explicit peptide chemistry

Ordinary sequence letters cannot fully describe many peptides. Construct Maps records modifications explicitly, including:

- D-amino acids and non-natural residues
- N-methylation
- Terminal caps and amino-alcohol termini
- Disulfide, lactam, and backbone cyclization
- Supported lipid and spacer attachments

Construct Maps derives a structure when the chemical record describes the whole molecule. It flags unsupported chemistry as a gap and blocks plain-sequence export when the letters would omit chemistry and describe a different molecule.

### Conservation across evolutionary relatives

Construct Maps compares your protein with orthologs from its UniRef50 cluster by default, or a Pfam family on request. Orthologs describe conservation in this protein; the family describes conservation across related proteins with different functions. Specificity residues can vary across the family.

Scores run from 0 to 1, with 1 most constrained within that comparison set. Near-identical sequences are down-weighted so an over-sampled genus has less influence. Alongside each value, you can inspect the alignment method, how many sequences cover the position, and the set's effective count of independent sequences. With MAFFT, positions that too few sequences cover stay unscored.

If a cluster is too small or network access fails, Construct Maps records the reason. It does not build a comparison set by hand. A construct assembled from several native parts is scored part by part, each against its own orthologs. Variation among designed constructs measures design differences, so it is never used as evolutionary conservation.

## Install

**Claude (claude.ai and Cowork).** On this repository's GitHub page, choose Code, then Download ZIP. In Claude, go to Customize > Plugins > Add > Upload plugin and select the ZIP.

**Claude Code.** Clone the repository and start Claude Code with the plugin loaded. This loads it for that session.

```
git clone https://github.com/ishant1994/construct-maps
claude --plugin-dir ./construct-maps
```

**ChatGPT.** Download [construct-maps-openai.zip](https://github.com/ishant1994/construct-maps/releases/latest/download/construct-maps-openai.zip), then upload it in the Plugins tab.

## Using it

- **Claude:** type `/` and select `protein-construct-design`. In Claude Code the full name is `/construct-maps:protein-construct-design`, and `/protein-construct-design` also works.
- **ChatGPT:** type `@` and select `Construct Maps`.

## Recommended settings

Use GPT 6.2 Sol with high reasoning in ChatGPT, or Claude Sonnet 5.5 with high reasoning in Claude. Claude Opus 5.5 often declines questions like these, so Sonnet is the better choice there.

## How long does it take?

A design prompt typically takes 10–20 minutes to complete, so be a little patient!

## Execution and external services

The bundled scripts run in the hosting AI application's environment, which may be cloud-hosted or local, depending on the application and session.

The plugin has no author-operated backend, account system, or analytics. Its author does not receive session files through a plugin-operated service.

The bundled scripts may contact these services during the corresponding workflow step:

| Step | Service | Information sent |
|---|---|---|
| Retrieve homologs | UniProt | A UniProt accession, UniRef cluster identifier, or Pfam identifier |
| Check citation metadata | Europe PMC | DOI, PubMed, or PMC identifiers |
| Install Python dependencies | The configured package index and download hosts | Package requests for RDKit, pyfamsa, and their dependencies |

The bundled database lookup scripts do not send the sequence being designed. Lookups can run as part of your task without a separate request for each step.

Literature research can also use search, browsing, or other tools from the hosting AI application. These make their own external requests under that application's settings and policies.

See `PRIVACY.md` for details.

## Network access in Claude

By default, Claude's code environment can reach only a short list of websites. That blocks the UniProt lookups behind conservation scores and the Europe PMC citation checks. To allow them, open your profile menu (bottom left), go to Settings, then Capabilities, and set Allowed websites to any website. On Team and Enterprise plans, an organization owner controls this setting.

Without it, designs, sequence checks, chemistry, and figures still work. Conservation and citation checks are reported as not completed.

## Requirements

The renderer needs Node.js 20 or later. Structure assembly, homolog retrieval, and conservation scoring use Python 3.

Chemical structure assembly uses RDKit. Without it, a fallback assembler writes the same molecule in a form many drawing tools refuse, and the document says which form you have.

Alignment uses MAFFT when it is installed. Without it, the plugin installs pyfamsa (FAMSA), and as a last resort it uses a built-in aligner that needs nothing. Each analysis names the aligner it used. The built-in aligner scores every position, including regions the relatives lack, so check the coverage beside each value.

## License

GPL-3.0-or-later. See `LICENSE`.

The monomer table under `skills/protein-construct-design/data/monomers/` derives from an MIT-licensed library. Its notice is retained in the accompanying license file.

## Support

Report problems and ask questions through the repository’s issue tracker.
