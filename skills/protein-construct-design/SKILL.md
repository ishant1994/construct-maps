---
name: protein-construct-design
description: Investigate protein sequence-function relationships and develop engineering hypotheses through literature, functional sequence mapping, homolog and partner analysis, computation, and experimental evidence. Renders aligned construct diagrams with traceable evidence. Use for interpreting regions or residues, proposing edits or alternative architectures, and planning informative comparisons.
---

# Protein construct design

Connect biological objectives to specific sequence designs and informative experiments. Use annotation to generate and discriminate hypotheses.

## Establish the objective and reference

Define the desired behavior, biological context, competing objectives, and measurements of success. Establish the parent sequence, accessions, sequence versions, boundaries, junctions, tags, delivery and expression background, and numbering. Respect requested evidence cutoffs. Preserve unresolved ambiguities while continuing independent work; label assumed reference sequences explicitly.

Treat the starting sequence as one implementation of the desired function. Do not assume that native domain boundaries define the units that must be preserved or that shortening is itself an objective.

## Build an evidence-backed functional sequence map

Before selecting designs, produce a coordinate-based map at the resolution relevant to the engineering decision: domains, functional segments, and individual residues where necessary. For each relevant element, record:

- Its contribution to the desired behavior or a competing behavior.
- Interaction partners, recognition requirements, structural or physical properties, and dependence on neighboring sequence or placement.
- Supporting evidence, experimental background, and uncertainty: measured in this construct, established elsewhere, predicted, or unknown.

Include sequence outside obvious motifs when spacing, folding, accessibility, composition, localization, assembly, or regulation could matter. Allow overlapping functions. Do not treat unannotated sequence as nonfunctional or label every residue with an invented role. Distinguish native biological requirements from those of the engineered system.

Search primary literature and supplements for successful, failed, and context-dependent designs. Recover exact edits, backgrounds, comparators, assays, and measured effects. Use homologs, paralogs, interaction partners, and mutant evidence to explain alternatives and constraints; retain taxonomy and alignment uncertainty. Conservation does not establish necessity, and a motif match does not establish function.

Before selecting designs, run a separate search for recent primary research on
the protein, its interaction partners, and the mechanisms being engineered; do not
stop after finding a foundational paper or a successful precedent. Follow forward
citations from the central studies and check the latest relevant results against
the proposed mechanisms. A familiar annotation or an existing example does not
establish that the literature search is current. That search is a prerequisite, and its result
has to be in hand when the candidates are chosen. Record it -- what was covered, and whether it returned before the designs were
selected -- or record why it could not be completed and treat the candidates as provisional. A
design that has already been published is indistinguishable from a new one in a record that never
looked. Revise the functional map when it reveals an additional role for an edited
region, state-dependent site accessibility, or separable assembly steps. Record the
resulting design consequence; listing the newer citation alone does not incorporate it.
Before finalizing, reconcile each proposed mechanism with that evidence, including
findings that complicate it; record unresolved conflicts as caveats.

Choose a consistent functional nomenclature for explanations and diagrams. Define each region once using its accepted name and role; map differing names or boundaries across papers explicitly. Keep exact coordinates in sequence records and inspection details rather than using residue ranges as the primary names. Use residue identities when a residue-specific mechanism or edit is the question.

Record source coverage honestly: full text, selected sections, abstract, or supplement inspected, including inaccessible material. Do not present excerpts as a complete paper review. Read the relevant results, methods, figures and supplements before relying on a paper's exact construct or mechanism; if access is incomplete, retain that uncertainty and make provisional designs explicit.

## Generate hypotheses from the map

Explain plausible causes of the current limitation and evidence that would distinguish them. Translate required behaviors into molecular interactions and physical processes, then identify alternative sequence implementations.

Consider local changes and, where biologically justified, removing, replacing, recombining, repositioning, or sharing functional elements. Examine sequence composition, spacing, order, accessibility, membrane proximity, multivalency, and structural coupling as relevant.

Search the engineering objective, required interactions, and underlying physical mechanisms as well as the named protein. Draw possible mechanisms from both related and unrelated proteins. For each transfer, explain what evidence supports the mechanism, what changes in the new context, and what would make it fail.

Develop a manageable set of mechanistically distinct hypotheses before ranking candidates. Separate established adaptations from new recombinations and exploratory mechanisms. Do not restrict proposals to published improvements, force novelty where unnecessary, or fill a quota of edit types. Make explicit how the functional map informed the candidate set.

Keep each hypothesis traceable through source and figure or section, measured observation and experimental context, inference or transfer assumption, proposed edit, and discriminating comparison. Allow different papers to motivate competing hypotheses; preserve contradictory or context-dependent evidence rather than merging it into a consensus claim. Label unsourced proposals as exploratory. A paper supporting a mechanism does not validate the proposed sequence.

When a mechanism calls for chemistry beyond the twenty amino-acid letters -- a D-residue, N-methylation, a capped terminus, a ring, a disulfide or lactam bridge, a fatty acid or spacer side chain -- the hypothesis is only half of the work. Follow "Designing a modified peptide" below for how to look the monomer up and record it, so the molecule is described by the record and not only by the rationale.

## Use computation to resolve design decisions

Identify uncertainties that could change a design choice, then execute the analyses that address them.

Compute residue conservation for every new reference sequence. This is a required step of the main workflow. Run `scripts/fetch_homologs.py` and then `scripts/compute_conservation.py` for the reference, and report either the resulting profile, with its comparison set, the number of homologs and how much independent evidence they carry, or the specific reason a meaningful one could not be produced: no network, no MAFFT, too few homologs in the cluster, or a family too divergent to align over the region in question. A report states a result, such as "48 orthologs aligned, 210 of 210 positions scored" or "the cluster held 9 sequences, too few to say anything". A conservation track from another record describes that record's protein only and never stands in for the profile of the protein under discussion.

The three scripts chain through files:

```
python3 scripts/fetch_homologs.py ACCESSION WORKDIR
python3 scripts/compute_conservation.py WORKDIR/reference.fasta WORKDIR/homologs.fasta WORKDIR/BLOSUM62 TRACK.json --track-id ID --source "WHERE THE HOMOLOGS CAME FROM"
node scripts/import_track.mjs RECORD.json TRACK.json VARIANT_ID
```

`fetch_homologs.py` writes `reference.fasta`, `homologs.fasta`, `BLOSUM62` and `provenance.json` into WORKDIR, and `compute_conservation.py` reads the `provenance.json` beside the homologs to label the comparison level. `import_track.mjs` attaches the track to a variant after checking the sequence hash, and takes `--chain CHAIN_ID` for a construct with several chains. Each script prints its options with `--help`.

For a construct assembled from several native components -- a chimera,
a fusion, any multi-donor design -- there is no single comparison set,
and one alignment over the whole molecule describes none of it. Analyse each
native component against its own ortholog set, then map the supported scores
onto the construct at the positions that component occupies. Record, for each
component, the homolog selection, the alignment, the scoring method and the
coverage, and leave every position the analysis does not support unscored
rather than interpolated.

If `fetch_homologs.py` refuses -- a cluster below the floor, no Pfam to fall back on -- that refusal is the result. Record it and move on. Leave the comparison set to the fetcher, because the label saying what the number is a conservation OF comes from the fetcher's provenance, and a hand-written set is the one part a reader cannot check. Every required target carries either a track, with its method and coverage, or an `attempted_analyses` entry naming the target and the specific reason nothing usable came back: no network, too few homologs in the cluster, no alignment over the region. An empty `tracks` array says only that nothing is there, and a reader cannot tell that from an analysis nobody ran. The figure prints those entries under "Not measured", naming the construct and the specific reason, so a figure always says why a measure is missing.

A missing MAFFT does not justify recording a failed analysis. Where no system package can be installed -- a plugin sandbox, most of them -- run `pip install pyfamsa` and then `--aligner famsa`. That is a real multiple alignment from a wheel, with no compiler and no root. `--aligner builtin` needs nothing at all and is the last resort. Say in the response which aligner ran.

The three aligners behave differently. MAFFT leaves a column unscored where the family has no counterpart for it, so an absent value is itself a result. FAMSA is a true multiple alignment that also scores some positions MAFFT leaves unscored, so read the coverage of those positions before relying on them. The built-in aligner (`--aligner builtin`, a pairwise alignment of every homolog to the reference) scores every position of the reference, including regions the family does not have, so scores outside the conserved core are unverified. There is no automatic substitution between aligners.

Read coverage with the score. The figure prints coverage beside the value when a residue is inspected, and `method.alignment` names the aligner under "About this measure". A position with a value and little behind it needs care, and the prose matches what the record says about how well each scored position is supported.

Run `node scripts/render.js validate --final INPUT.json` and `node scripts/verify_citations.mjs INPUT.json` before delivering. Plain `validate` checks that the record is well formed. `--final` additionally fails when a required analysis is neither computed nor recorded as attempted, and when a record proposes candidates without a `precedent_search`. A passing `validate` says the record is well formed and says nothing about whether the analyses were done, so the two are checked separately.

Distinguish sequence-integrity checks from functional predictions. Assembly, length, charge, and motif counts verify implementation but do not by themselves establish a preferred mechanism or design. Where possible, check whether a prediction distinguishes relevant known functional and nonfunctional examples before using it to rank proposals.

Record inputs, methods, parameters, coordinates, and provenance. Report inconclusive results and unavailable analyses. Do not infer biological validation from a plausible structure, favorable score, or attractive rationale.

## Select designs and informative experiments

Organise the library as objective, then hypotheses, then constructs: one biological objective, a few mechanistically distinct hypotheses under it, one initial candidate for each hypothesis, and the controls that isolate it. Record that structure rather than implying it -- state the objective, give each hypothesis its question, its proposed mechanism and the measurement that would support or reject it, and have every candidate and control name the hypothesis it belongs to.

Keep an opening library to between five and ten constructs in total, counting the reference and the controls. The first response is a comparison someone has to be able to interpret, and interpretability falls off fast with size: a reader who cannot say what distinguishes two constructs cannot learn anything from running both.

Vary one thing per hypothesis, so a result can be attributed, and do not combine several exploratory mechanisms into one construct: a construct carrying three changes at once, or a length series standing in for a mechanism, produces results that cannot be attributed. Settle one before varying it further, and generate further variants within a hypothesis when they are asked for in a later turn.

A systematic single-position scan answers a different question from a comparison of distinct designs: it identifies which residues in a region contribute to a function rather than testing a proposed mechanism for it, so that constraint does not decide whether to run one. Where residue-level evidence already names candidate positions, testing those and scanning across them are different experiments. Record a scan as a series that groups its member constructs, with its intended coverage and any positions omitted; `references/design-review.md` gives the fields.

For each selected design provide the exact sequence or unambiguous edits, parent and comparator, mechanism, evidence and transfer assumptions, expected benefits and tradeoffs, principal uncertainty, and measurements that would support or reject the hypothesis.

Use matched controls, ablations, or factorial comparisons to separate competing explanations. Evaluate the actual engineering objectives alongside proxy readouts. Separate production, stability, localization, binding, and functional output. Account for expression differences when interpreting activity.

State the distinct question answered by each control. Use a direct removal or omission comparison when testing whether an added region contributes; explain any length, geometry or assembly confound. Add a point mutant when residue-specific evidence or a distinct mechanistic question justifies it. Distinguish improvement candidates from controls; do not assume a binding-defective mutant is inert across partners or preserves other functions.

Verify sequence assembly, edits, and coordinates computationally. When measurements arrive, revise the map, hypotheses, and next designs while retaining failed and inconclusive results.

## Designing a modified peptide

Follow this whenever a design needs something the twenty amino-acid letters cannot say, such as a D-amino acid, a non-natural residue, N-methylation, an acetylated or amidated terminus, a head-to-tail ring, a disulfide or lactam bridge, or a fatty acid or PEG-like side chain, and whenever the user names a peptide and asks to improve it. Letters carry none of these. A record that holds them only in prose describes a different molecule from the one designed, and a FASTA made from it carries the unmodified letters.

Do these in order. Write the record after step 2, because a monomer name that was not looked up may not exist.

1. **Make each modification a design decision with a hypothesis.** For every construct list each modification as position, what it is, and the hypothesis it tests. Change one thing per hypothesis, as elsewhere here. State the property it should improve (half-life, permeability, affinity) as the measurement the construct exists to make, and leave it out of any claimed result.

2. **Look each monomer up; never invent a name.** Run `node scripts/render.js monomers QUERY`, for example `monomers D-alanine`, `monomers methyl` or `monomers --kind cap`. It prints the exact, case-sensitive name to write, the letter that belongs in the sequence, and the attachments the monomer offers; with no argument it prints the naming patterns.

   **A search that finds nothing says only that those words did not match.** The table mixes two naming conventions -- some rows are named `mercapto`, others `sulfanyl` for the same group -- so a miss means those words did not match. Search by the **attachment atom** instead, which no spelling can hide: `monomers --element S` lists every monomer offering a sulfur, and it composes with `--kind`, so `monomers --kind cap --element S` is the whole question "a terminal cap bearing a thiol". Only once an element search is also empty is "this chemistry is not available" safe to say -- then go to step 8.

3. **Write each one in the record**, with `schema_version: 6` and `chains` (the single-chain `sequence` shorthand is refused when chemistry is present). Residues and caps go on the chain; bonds and conjugates go on the variant. Chemistry written anywhere else is refused, with a message saying where it belongs.
   Every entry in `bonds` needs a `bond_id`, and every entry in `conjugates` a `conjugate_id`; both are refused without one. Where the construct has more than one chain, every bond end and every anchor also needs its `chain_id`, and where a chain has `copies`, a `copy` number says which instance. Attachments are numbered 1 for the N-terminal side, 2 for the C-terminal side and 3 for the side chain, and `monomers` prints the attachments each monomer offers.
   - A **D-residue**: the chain's `chemistry.residues` gets `{"position": 8, "monomer": "dL"}`. The sequence keeps the ordinary L letter at that position.
   - A **non-natural residue**: `{"position": N, "monomer": "Aib"}`. For **N-methylation** the same shape with `{"position": N, "monomer": "meV"}`. The sequence letter is the one the lookup shows; where it shows `X`, write `X` (a bare `X` with no entry is refused).
   - A **terminal cap**: the chain's `chemistry.caps` gets `{"terminus": "N", "monomer": "ac"}` or `{"terminus": "C", "monomer": "am"}`. A cap occupies no position and needs a free end on the residue it caps.
   - A **head-to-tail ring**: the variant's `chemistry.bonds` gets `{"bond_id": "ring", "kind": "backbone", "a": {"position": 1, "attachment": 1}, "b": {"position": LAST, "attachment": 2}}`. Leave both termini uncapped.
   - A **disulfide**: `{"bond_id": "ss", "kind": "disulfide", "a": {"position": 1, "attachment": 3}, "b": {"position": 6, "attachment": 3}}`, between two cysteines (or `Pen`, `Hcy`).
   - A **lactam**: the same shape with `"kind": "amide"` and `"attachment": 3` on an Asp or Glu and on a Lys, `Orn` or `Dab`.
   - A **fatty acid or spacer side chain**: the variant's `chemistry.conjugates` gets a `conjugate_id`, an `anchor` (the lysine, `"attachment": 3`) and `units` from the anchor outward, each with `in` and `out` (omit `out` on the last). An illustrative lipidated-lysine side chain: `{"conjugate_id": "lipid", "anchor": {"position": 12, "attachment": 3, "expected": "K"}, "units": [{"monomer": "AEEA", "in": 2, "out": 1}, {"monomer": "gGlu", "in": 2, "out": 1}, {"monomer": "C18diacid", "in": 2}]}`.

     Two details decide which molecule a conjugate describes, and both validate either way. The unit order decides it, since the same units glutamate-first and glutamate-last are different compounds. The socket each unit bonds through decides it as well, since a glutamate joined by its alpha carboxyl and one joined by its gamma carboxyl are different compounds, and the socket number says which. Write `gGlu` when the link is gamma, and take the order and the attachment points from the structure being designed.

   `fixtures/peptide-chemistry.json` is a worked example of a D-residue, a non-canonical residue, a C-terminal cap, a disulfide and a head-to-tail closure, and `references/design-review.md` (section "Chemistry a sequence letter cannot carry") is the field-by-field reference, conjugates and lactams included. When the design starts from a named peptide, take its exact residues, stereochemistry and unit order from a public database record or the user's own structure file rather than from memory, and check the card against that source.

4. **Validate.** Run `node scripts/render.js validate RECORD.json` and fix every problem it names; the messages say where a misplaced field belongs and which attachment a monomer lacks. Validation checks form and leaves synthesis feasibility open.

5. **Install RDKit if it is not there.** `pip install rdkit` -- a wheel, no compiler and no root, the same call the conservation step makes for `pyfamsa`. With it, the structure is built as a molecule and comes out as ordinary SMILES that a drawing tool will open. Without it the renderer falls back to an assembler that writes the same molecule as fragments tied by ring closures across dots, which is valid and refused by many sketchers, so a reader has to be told which one they have. The card says which, and a structure from the fallback is reported as the fallback form.

6. **Render and read the card.** Each construct's Chemistry section states its modifications in words and shows the structure as a SMILES with a copy button. Check them against what was intended, because the record is what describes the molecule and the prose around it does not. The card reports two kinds of ambiguity, and both belong in the reply if they appear: an **unspecified stereocentre** (the structure does not say which enantiomer) and an **open double bond** (it does not say which geometric isomer). Where the card says "No structure derived", it gives the reason, and that reason is what to report.

7. **Declare a chemistry-only child honestly.** A child that differs from its parent only in chemistry -- a D-substitution, a cap, a bridge -- has identical letters, and a chemistry change has no edit form. Give it `"derivation": "unverified"`. `"unchanged"` asserts the same molecule and is refused when the chemistry differs. The figure shows the change, and `rationale.edit` says what it is.

8. **Declare what cannot be recorded, in the record.** A limit written only in prose changes nothing. A design whose modification has no monomer records no chemistry, and a record with no chemistry exports a clean FASTA of the **unmodified** peptide. Put the limit in the variant's `unexpressed_chemistry`, one entry per gap, each with `what` the molecule needs in chemical terms and `why` the vocabulary cannot name it, plus the `position` where it has one and the `chain_id` when the construct has more than one chain:

   `{"position": 1, "what": "a 3-mercaptopropionyl whose sulfur closes a ring to Cys6", "why": "the only mercaptopropionyl monomers are caps, and a bond end must name a residue position"}`

   Declaring it makes `export` refuse and makes the figure say so (under **Not encoded**), the same as a recorded D-residue, because the letters would describe a different molecule. It also stops that chain's structure being derived, so the card says "No structure derived" and names the position, because a record that cannot describe the molecule cannot be assembled into it. Without the declaration, a missing ring assembles as the open chain, which is a different compound. There is no SMILES to deliver for that construct, so state the gap in the reply as well.

   Where the gap is a **residue** the lookup does not list, write `X` at that position and declare the gap there. An `X` normally needs a monomer named under `chemistry.residues`, and a declared gap at that position is the one thing that takes its place, because there is no monomer to name.

   The vocabulary cannot express a bond anchored on a terminal cap (an N-terminal mercaptopropionyl ring), a true thioether (a sulfur on an sp3 carbon a bond can reach -- the schema has `thioester` only), any monomer the lookup does not list, or a chemistry change expressed as an edit. Substituting a different monomer for the one the design needs changes the molecule, and describing the unsupported part in prose leaves it out of the record, so declare it under `unexpressed_chemistry`.

   A conjugate unit may be any monomer the lookup lists, including an ordinary residue used as a spacer. `monomers --kind linker` lists the spacer and acyl units (`AEEA`, `C18diacid`, `C16acid`), and `monomers NAME` prints each monomer's attachments, from which `in` and `out` are chosen. A derived structure shows the molecule the record states, so check that it matches the intended compound. Where a chain has `copies`, the structure on the card is **one copy's**: a bond between two different copies is recorded and drawn but is not in that string, so say so when presenting it.

9. **Deliver the structure and a per-position list.** `export` refuses a chain that carries chemistry, because its letters describe a different molecule. Give the user, for each construct, the SMILES from the card and a per-position list (position, monomer, what it is), plus the caps, each bond with both its positions and attachments, and each conjugate's units in order, because a position list alone does not carry them. Say the SMILES was derived from the record and that a derived structure describes no synthesis route. Where no structure was derived, or where it covers one copy of a repeated chain, say that.

## Make the reasoning inspectable

Lead with biological findings and engineering decisions. Provide the functional map and concise analysis records as supporting evidence.

Write the response for the person asking. Everything in it should be something they can act on or need to weigh, such as the findings, the designs, the evidence, and the scientific limits of that evidence (what was not measured, which comparison set or aligner a conservation score rests on, what the literature leaves open). Keep the machinery out of it. Do not report that the record validated or which commands ran, that the edits reproduce the sequences, how large the embed was, which tool or runtime was missing and how it was worked around, or how the viewer's own controls behave in a particular host. Those checks still have to run and pass, because they are what make the record trustworthy, and passing them is not news. A line such as "the record validates, which does not mean the biology is right" answers a question nobody asked and invites doubt about the one part they can rely on. If a check fails and cannot be fixed, that is a limit on the work, so say what it means for the result, in the result's terms.

End each construct-library proposal with a short **Caveats and potential failure modes** section, followed only by the file links described under delivery. Identify the most relevant risks the proposed edits introduce -- aggregation, solubility, folding, denaturation, stability, unintended proteolysis, and the like -- and connect each caveat to a specific construct feature, so a reader can tell which construct carries which risk and why. Keep it specific and concise, and highlight the biggest risks; the reader can always dig in deeper. These are risks to the protein and the experiment, which differ from the tooling notes excluded above, and they restate nothing from each construct's own principal uncertainty.

Render the aligned comparison as part of any response that proposes or compares constructs. Where a request is genuinely ambiguous about whether designs are wanted, answer it and close with one line saying a construct library and figure can follow, as an offer after an answer. Treat the figure as a deliverable, because a design library described only in prose makes the reader reconstruct the architecture from coordinates in their head, which is the work the figure exists to do. Build it from the same verified coordinates used for sequence assembly, show functional elements, overlaps, edits and lengths at a shared residue scale, and distinguish evidence status from proposed function. Avoid decorative diagrams that imply unmeasured interactions. When a browser is available, open the result and look at it before delivering it. An explicit instruction from the user not to render takes precedence over this paragraph. Build the design record either way, since it is the verified artifact the figure is drawn from, and it can be rendered later.

Render comparisons with the bundled renderer:

```
node scripts/render.js validate INPUT.json              check without rendering
node scripts/render.js validate --final INPUT.json      also require the analyses
node scripts/render.js render INPUT.json OUTPUT.svg     static figure
node scripts/render.js render INPUT.json OUTPUT.html    interactive document
node scripts/render.js render INPUT.json OUTPUT.html --fragment    embeddable fragment
node scripts/render.js export INPUT.json OUTDIR/        one GenPept file, one FASTA per construct
```

Render both formats from the same record. If the host can embed HTML inline (a chat surface with an HTML or visualization embed), render the interactive workspace with `--fragment`, follow the host's own embedding instructions, and emit that fragment through its inline display. Keep the full workspace: aligned constructs, right-hand hypothesis groups, per-construct evidence and residue inspection. A static SVG or PNG, an HTML code block, or a download link is not an embedded interactive workspace. If the host cannot embed HTML, deliver the standalone document alone.

Where the host can serve files, make the complete interactive document (the output of `render INPUT.json OUTPUT.html`) available on its own, independently of any archive, and link that document rather than the inline fragment. Any other file that leaves the response gets a bold line naming what it is, then the link, so the reader knows which files matter. The files the shipped commands produce are the design record, the rendered HTML and SVG, and the `export` output.

> **Download the design record here:** [link]. The JSON record every figure and export is drawn from.

> **Download the GenPept and FASTA files here:** [link]. One GenPept file for the library and one FASTA per construct.

The functional map, each hypothesis with its discriminating measurement, any comparison table, and what was not measured belong in the reply text. No shipped command writes them.

Close a response that compares constructs with the following, after the Caveats section and any other file links, so that this link is the last thing the reader sees:

> **Open the full-screen interactive HTML here:** [link]. You can also use this if the inline visualization doesn't render.

The standalone document is also the fallback. An inline embed can fail without producing any visible error, so the link accompanies every response that compares constructs. Leave out a PNG or SVG preview by default, and when the embed fails, link the standalone HTML and say the inline view may not have rendered. Static exports stay available for inspection and for anyone who asks for one.

`render --fragment` measures the fragment it writes and refuses, with exit status 1, a fragment over `--max-bytes`. The default is 1,000,000 UTF-8 bytes, the CLI's overridable ceiling for hosts that drop larger embeds without any error. Pass the host's own limit as `--max-bytes N`, or `0` for a document nobody is embedding. If a fragment is over the ceiling, reduce the library (fewer constructs, shorter free text) and render again, keeping the evidence, the controls and the sequences. The user does not need the number: if an embed cannot be made to fit, say only that the inline view may not have rendered and point to the full-screen link.

Use the renderer's own layout and startup behaviour rather than rebuilding or
patching it. `references/design-review.md` holds the presentation contract: the
label vocabulary, the width behaviour, what the overview omits, and how display
modes and zoom interact. Do not claim a browser check that did not run.

Keep experiments and comparisons in the design record, and describe the assay,
comparator and expected result in scientific terms. Open the figure on its
functional regions; a measure is something the reader turns on. Never substitute
charge, or variation among the designed constructs, for homolog conservation.
Reuse a precomputed track only after verifying the exact sequence and method,
retain its provenance, and say it was reused rather than newly computed.

Do not describe a figure you did not render, report a conservation score you
did not compute, or present a record as validated when `validate` never ran:
an unavailable analysis is a result, and a fabricated one is worse than
nothing. These limit what may be claimed; they do not ask for it to be announced.
Run `validate`, and say nothing about it unless it failed.

Runtimes. The renderer needs **Node** 20 or later. `scripts/fetch_homologs.py` needs **Python 3 and network access** to UniProt and NCBI. `scripts/compute_conservation.py` needs Python 3, and MAFFT on PATH for its default aligner; without MAFFT, `pip install pyfamsa` and `--aligner famsa` is the right call. `scripts/verify_citations.mjs` needs network access to Europe PMC, and its UNRESOLVED and ERROR results leave a citation unchecked. The peptide structure step uses Python with RDKit. When something is missing, work around it and say what it cost the RESULT (which aligner a score rests on), leaving the missing tool unmentioned. A failing command is a prompt to try the workaround and the render, and the output says what is missing. A record is still worth writing without any of them, because it is the verified artifact the figure is drawn from, and it can be rendered later wherever Node is available.

Read `references/design-review.md` for the record schema, the traceability
fields and the presentation rules. Keep diagrams, sequences, lengths and
rationales in the same verified design record.

State edits explicitly. Give each candidate a `parent_id` and an `edits` list in
the parent's coordinates (on each chain, for a multi-chain construct); the renderer applies them and requires the result to
equal the declared sequence, so a diagram can never show an edit the sequence
does not contain. Where edits are omitted the correspondence is derived from the
sequences instead and labelled as derived, and a change whose position the
sequences do not determine is labelled ambiguous.

Give each construct a short `headline` that names the edit as a noun phrase, such as "Reduced linker charge". A headline holds no predicted outcome, because an outcome written there reads as a property of the construct. The renderer generates the plain-English edit from the verified edit list, so residue numbers written into prose can only disagree with it. Use `rationale.edit` for what the list cannot say. That is one sentence on why the change is made, with no coordinates ("Retains the receptor-binding motif while shortening the loop"), plus any chemistry the edit list cannot carry, such as a D residue, a terminal group or a bond. The card shows it beside the generated sentence. Write each construct's evidence so a reader can tell what changes or stays, why, and what was demonstrated, without opening the citation. The finding states what the source measured. The `context` states where, as organism, construct and assay. A limit on how far the finding transfers goes in the construct's `uncertainty`, written once with its specific consequence. Attach an observation only to the constructs whose edit it speaks to. Keep notes specific to the construct; "candidate, proposed, untested" repeats the role field and tells the reader nothing.

Label regions functionally and give every region a stable `region_id`, shared
across constructs and across repeated copies, so selecting one highlights the
rest. Keep coordinates in inspection details rather than using residue ranges as
display names. Add a membrane region only from verified annotation; the bilayer
motif is drawn only where a record annotates one. Render a small informative
comparison before a large library. When a browser is available, inspect the result in it before
delivery.

Record residue-level findings as `sites` and per-residue measures as `tracks`, both
described in `references/design-review.md`. A site carries its own observations, so a
binding-critical residue measured in one construct and a face you inferred from a helical
wheel stay separable. State each residue's position in the coordinates of the variant the
site is attached to, and carry the letter the source itself reports so a numbering-frame
mismatch fails rather than marking the wrong residue. Reserve `measured` for the construct
the annotation is attached to; an observation transferred from a truncation or another
organism is `established_elsewhere`.

For site annotations, lead with the residue's biological role, then briefly explain its
relevance to the proposed change. Distinguish observations from predictions. Keep numbering
conversions, experimental details and source coverage in supporting details. Avoid generic
labels and repeated cautions when a specific biological explanation is possible.

Run a per-residue computation before recording it, keep its inputs, and record the method
and support alongside the values. Omit an analysis you did not run; leave an individual
position null where it is unavailable. A track measured on one construct reaches another
only where the residue is unchanged from it.

The renderer validates supplied records. It does not annotate sequences, retrieve evidence, predict function, or expose private model reasoning. A record that validates is well formed and may still be wrong. Provide a concise evidence-to-design explanation written for the user. The rationale disclosure is that explanation and holds no reasoning transcript. No server and no network access is required, and the exported figure and document fetch nothing.

## Deliver the complete construct

Give the whole encoded sequence of every design, N-terminus to C-terminus: every repeat written out, and every linker, tag, signal peptide, protease site and purification handle in the order it is translated. A sequence holding only the domain under discussion leaves out the residues where expression, folding and assembly usually fail. Write a tandem array as its copies, because a "3x" multiplier hides whether the junctions between copies are identical.

Place each of those elements as a feature as well, so the figure contains what the sequence contains. Give every copy of a repeated element its own feature sharing the one `region_id`, which groups the array for highlighting and lets the viewer name a copy within it. A region the record defines and no construct places is refused, because it would be an element named in the vocabulary and present in neither the sequence nor the diagram.

For a design of several polypeptides, give each chain its own `chains` entry with its own sequence, and state how many of that chain assemble with `copies`. A homodimer is one chain with `copies: 2`. A complex of two copies of chain A and two copies of chain B is two chains, each with `copies: 2`. `copies` is a count of instances in the assembled molecule, so omitting it claims one, and the renderer reports it: the copy count rides the per-chain row readout, each chain is named beside its own diagram, and the sequence section states the assembled total of all copies.

For a peptide that carries chemistry, deliver the structure and a per-position list as "Designing a modified peptide" describes. `export` refuses a chain whose letters would misdescribe the molecule.

`export` writes the library as files for downstream tools. ONE GenPept file holds every construct, a record per chain within it, with every region, repeat copy, linker and tag as a named feature and the figure's own colour on each. It is written in SnapGene's documented interchange format, because the documentation says colour is read only from a file that carries that format's markers (pass `--plain` for standards-only GenPept). One file holds the library because the library is what gets imported. Beside it, one protein FASTA PER CONSTRUCT, because a single construct is the unit most sequence tools take as input. Offer it when the designs are ones the user may build. It is protein only and writes no coding sequence. A back-translation is a design decision this skill leaves to the user, since host codon usage, internal sites and diversifying the codons between tandem repeats all enter it, and the response says the files are protein only. Stoichiometry has no field in the format, so it is carried in words in every chain's record, and the design record remains the authoritative artifact. `export` stops without writing any file when any chain in the record carries chemistry, the reference included.

Then read the figure as the reader will. It has to show the full construct, with tags and linkers occupying their real length, every repeat present, and every chain named and counted. The figure is drawn from the record, so a figure showing only a component means a record holding only a component, and the record is what to fix.

Never imply that a computation or experiment was performed when it was not.
