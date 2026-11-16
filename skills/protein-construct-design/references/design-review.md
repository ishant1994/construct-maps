# Design record schema and presentation rules

One JSON record drives sequence assembly, the architecture diagram, the
rationales and both exports. Do not generate coordinates or citations from
display labels.

All coordinates are **1-based inclusive within the construct that carries
them** — never automatically within that construct's parent. Sequence length is
derived from the sequence string and is never a separate field.

## Minimal record

```json
{
  "schema_version": 2,
  "title": "Recruitment designs",
  "sources": [],
  "regions": [{ "region_id": "bind", "name": "Binding region", "kind": "binding" }],
  "variants": [{
    "variant_id": "parent",
    "name": "Reference",
    "sequence": "ACDEFGHIKLMNPQ",
    "construct_role": "reference",
    "features": [{
      "instance_id": "bind@1", "region_id": "bind",
      "start": 3, "end": 9, "evidence": "established_elsewhere"
    }]
  }]
}
```

Render with `node scripts/render.js render INPUT.json OUTPUT.html` (interactive) or
`OUTPUT.svg` (static figure). `validate` checks a record without rendering.

## Records

| Record | Fields | Meaning |
|---|---|---|
| Source | `id`, `title`, `url`, `coverage`, `identifier`, `published` | Source identity, https link, and the scope actually inspected. `identifier` is `{doi, pmid, pmcid}`; `published` is `YYYY`, `YYYY-MM` or `YYYY-MM-DD` |
| Region | `region_id`, `name`, `kind`, `description`, `aliases` | A functional region defined once and referenced everywhere. `kind` is one of `binding`, `linker`, `assembly`, `regulatory`, `catalytic`, `composition`, `module`, `membrane`, `edit`, `other` — anything else is rejected, and there is deliberately no `domain`. `aliases` is a list of **objects**, each with a `name` |
| Hypothesis | `hypothesis_id`, `question`, `mechanism`, `measurement`, `note` | One mechanistically distinct question the library tests |
| Series | `series_id`, `hypothesis_id`, `parent_id`, `chain_id`, `scheme`, `to`, `target_positions`, `omitted`, `coverage` | A systematic single-position perturbation series: one experiment, N member constructs. `scheme` is `substitution` (which also needs `to`, one residue letter) or `deletion` |
| Variant | `variant_id`, `name`, `headline`, `hypothesis_id`, `series_id`, `note`, `construct_role`, `parent_id`, `features`, `rationale`, `chemistry`, `unexpressed_chemistry`, and EITHER `sequence` (+ `edits`, `reference_id`, `assembly`) OR `chains` | One displayed construct |
| Chain | `chain_id`, `name`, `sequence`, `copies`, `reference_id`, `derivation`, `edits`, `assembly`, `chemistry`, `note` | One polypeptide of a construct |
| Donor | `donor_id`, `name`, `sequence`, `accession`, `source_ids`, `note` | A native sequence an assembled construct is built from, stored in full. `accession` is `{database, accession, version}`, with `version` optional |
| Assembly | `segments`, `note` | How a variant or chain is assembled. Each segment has `segment_id`, `kind` (`donor` or `literal`), `start`, `end`, `label`, `note`, and either `donor_id`, `donor_start`, `donor_end` or `sequence` |
| Feature | `instance_id`, `region_id`, `chain_id`, `start`, `end`, `label`, `evidence`, `note` | One occurrence of a region inside one chain of one variant |
| Edit | `op` + coordinates **in the parent** | How this variant, or this chain, is derived from its parent |
| Observation | `source_id`, `finding`, `locator`, `context`, `quote` | A source-specific observation, its experimental background, and the source's own wording |
| Site | `site_id`, `label`, `role`, `applies_to`, `residues`, `evidence`, `observations`, `note` | A residue-level functional annotation. `role` is one of `interaction`, `structural`, `catalytic`, `modification`, `stability`, `other` |
| ResidueClaim | `chain_id`, `position`, `expected`, `source_frame`, `source_position`, `target_residue` | One residue of a site, and the letter the source says is there. The last three mark a TRANSFERRED claim |
| Track | `track_id`, `kind`, `label`, `applies_to`, `target_kind`, `chain_id`, `scale`, `method`, `values`, `coverage` | A per-residue numeric measure, such as conservation. `kind` is one of `conservation`, `disorder`, `hydrophobicity`, `charge`, `other`. `target_kind` is `variant` (default) or `donor` |
| AttemptedAnalysis | `kind`, `target`, `target_kind`, `chain_id`, `reason`, `attempted` | An analysis that ran and produced nothing usable, and why. `kind` is `conservation` |
| PrecedentSearch | `scope`, `completed`, `reason`, `found` | The search for prior work on the proposed constructs, and whether its answer was in hand when they were chosen |
| Rationale | `hypothesis`, `observations`, `comparison`, `uncertainty`, `open`, `edit`, `inference` | The authored justification. `hypothesis`, `observations`, `comparison` and `uncertainty` are required. `edit` and `inference` are accepted and optional |

The record itself holds `schema_version`, `title`, `sources`, `regions` and `variants`, and optionally `objective`, `hypotheses`, `series`, `sites`, `tracks`, `attempted_analyses`, `precedent_search`, `donors`, `root_id` and `coordinate_note`.

`construct_role` is `reference`, `candidate` or `control`. Keep controls
distinct from improvement candidates: each answers a different question.

### Objective, hypotheses and constructs

A library is organised in three levels: the record's `objective`, the
`hypotheses` it tests, and the constructs under each hypothesis. Each candidate
and control names its hypothesis with `hypothesis_id`; a reference names none,
because the reference is what the hypotheses are measured against.

```json
{
  "schema_version": 5,
  "title": "Recruitment designs",
  "objective": "Recruit more client molecules per scaffold, without shortening it.",
  "sources": [],
  "regions": [{ "region_id": "bind", "name": "Binding region", "kind": "binding" }],
  "hypotheses": [{
    "hypothesis_id": "capacity",
    "question": "Does the number of accessible binding regions set how many clients one molecule can hold?",
    "mechanism": "Each accessible region binds a client independently, so a second copy raises capacity.",
    "measurement": "Client:scaffold ratio at matched scaffold density, against the reference and the omission control.",
    "note": "Independent binding by the added copy is an assumption, not an observation."
  }],
  "variants": [
    {
      "variant_id": "parent",
      "name": "Reference",
      "sequence": "ACDEFGHIKLMNPQ",
      "construct_role": "reference",
      "features": [{
        "instance_id": "bind@1", "region_id": "bind",
        "start": 3, "end": 9, "evidence": "established_elsewhere"
      }]
    },
    {
      "variant_id": "second-copy",
      "name": "Second binding region",
      "headline": "Second binding region",
      "hypothesis_id": "capacity",
      "construct_role": "candidate",
      "parent_id": "parent",
      "sequence": "DEFGHIKACDEFGHIKLMNPQ",
      "edits": [{ "op": "insert", "at": 1, "sequence": "DEFGHIK" }],
      "features": [
        {
          "instance_id": "bind@1", "region_id": "bind",
          "start": 1, "end": 7, "evidence": "predicted"
        },
        {
          "instance_id": "bind@2", "region_id": "bind",
          "start": 10, "end": 16, "evidence": "established_elsewhere"
        }
      ]
    }
  ]
}
```

Rules the validator enforces:

- Every `hypothesis_id` is unique, and two hypotheses may not ask the same
  `question`: two names for one question make the library look broader than it
  is.
- A candidate or control in a record that declares hypotheses must name one. An
  ungrouped construct is one whose question nobody stated.
- A reference must not name one.
- A declared hypothesis with no construct under it is refused, because it is a
  question the library does not actually ask.
- The same rule one level down: a `region` that no construct places as a
  feature is refused. Regions are referenced from features and from nothing
  else, so an unplaced one would be an element the record names and the figure
  never draws.

A library of more than ten constructs, and a hypothesis carrying more than one
candidate, are reported as review prompts and the record still validates. An opening
comparison stays interpretable at five to ten constructs including the
reference and controls, and at one candidate per hypothesis; a later round that
varies one hypothesis legitimately exceeds both.

`headline` names what a construct changes, as a short noun phrase such as
"Reduced linker charge". A headline that names a predicted outcome states a
result as though it were a property of the construct.

The renderer generates the plain-English sentence from the verified `edits`
list — "Delete residues 84–101 from Linker (18 residues). Retains Domain A and Domain B." — so
residue numbers written into prose can only drift out of agreement with the
residues. `rationale.edit` is optional and has two jobs the generated sentence
cannot do.

- **The purpose of the change, in one sentence with no coordinates.** "Retains
  the receptor-binding motif while shortening the surrounding loop." The
  generated sentence says what changed, and this one says why.
- **Chemistry the edit list cannot express**: a D residue, a terminal group, a
  bond. These change the molecule without changing a letter, so no generated
  sentence mentions them.

It is also the only account for constructs with no edit list to generate from,
such as an assembly, or one whose correspondence was inferred from the
sequences. Where a record supplies both, both are shown, the generated sentence
first.

### Writing the evidence

A reader should be able to tell what changes or stays, why, and what was
demonstrated, without opening the citation.

- **Role, method and setting are three different things.** The role (receptor
  binding) belongs in the site's `label` and `role`. The method and the setting
  (organism, construct, assay) belong in the observation's `context`. How much of
  the paper was read belongs in the source's `coverage`. A `context` that also
  carries a warning about interpretation has two jobs.
- **A limit on transfer goes in `uncertainty`, once, with its consequence.** The
  card shows it as **Caveats:**. "Changing a residue's stereochemistry alters the
  geometry around it, so retained side-chain identity does not establish retained
  activity" says what matters. "Conserved letters do not make the two
  equivalent" says nothing a reader can act on. Put it on the constructs where
  stereochemistry affects the decision, not on every annotation.
- **A retained functional annotation is evidence for keeping a region.** It
  describes a feature and does not explain an edit, so say what it supports:
  "supports preserving this region while the loop shortens". An unchanged site
  is not a proposed modification.
- **Each observation supports the claim beside it.** A structure showing
  receptor contacts supports a binding explanation and says nothing about
  half-life. Evidence about a whole scaffold does not stand in for each
  modification inside it, so a matched control cites what isolates its own
  variable and not the scaffold's headline result.
- **Keep bookkeeping out of the explanation.** Numbering correspondence ("native
  7–10 maps to analogue 3–6") goes in the site's `note`. Which parts of a paper
  were inspected goes in `coverage`. Both matter, and neither belongs in the
  sentence that says why the design makes sense.

`rationale.hypothesis` is the construct's OWN statement of what it tests, and it
differs from its hypothesis's `question`. For a control it is the thing
the control isolates, and it is what the viewer shows on that construct.

### Required analyses

Conservation is required for every reference sequence, and for every native
component of an assembled construct -- each component has its own ortholog
set, and one alignment across a multi-donor molecule describes none of it.
Map each component's supported scores onto the construct and leave
unsupported positions unscored.

Every required target carries either a track or an `attempted_analyses`
entry:

```json
{
  "kind": "conservation",
  "target": "donor-b",
  "target_kind": "donor",
  "reason": "UniRef50 cluster held 7 sequences, too few for a usable profile.",
  "attempted": "UniRef50_EXAMPLE1, 7 members, MAFFT L-INS-i"
}
```

`target` is a `variant_id` or a `donor_id` and must name something the record
defines. `reason` names what stopped the analysis, specifically enough to be
checked, such as "the cluster held 7 sequences, below the floor of 30".

### A per-donor result, and what a track is addressed to

An assembled construct's required analysis is per donor, and its result is in
that donor's coordinates. Say so with `target_kind`:

```json
{
  "track_id": "conservation-donor-a-orthologs",
  "kind": "conservation",
  "target_kind": "donor",
  "applies_to": "donor-a",
  "label": "Conservation across the donor's ortholog set",
  "scale": { "min": 0, "max": 1, "higher_means": "more conserved across this comparison set" },
  "method": { "comparison_level": "orthologs" },
  "values": [0.31, 0.58, 0.9]
}
```

`values` is one entry per residue of the DONOR (three entries are shown to keep
the example short), and a donor-targeted track must not name a `chain_id`,
because its coordinates are the donor's and belong to no chain of the assembled
construct. It satisfies that donor's requirement and is excluded from painting,
because the renderer does not project donor values onto the assembled
construct.

`attempted_analyses` takes the same `target_kind`, and a `chain_id` for a target
with more than one chain. A conservation requirement is **per chain**: a
heterodimer's two chains are two proteins with two comparison sets, so a result
naming only the variant stands for its single chain and never for one of
several.

### A residue a source reported somewhere else

`expected` is the letter the SOURCE reports, and validation compares it against
this construct -- which is the point, because a mismatch means the numbering
frames disagree. For a claim transferred from another molecule or construct the
two letters differ by design, so say which frame the source used:

```json
{
  "position": 12,
  "expected": "R",
  "source_frame": "parent peptide numbering",
  "source_position": 10,
  "target_residue": "Q"
}
```

`target_residue` is then **required** and checked strictly: the author must
still be right about the residue being annotated here. `expected` is not
compared, because it describes a different molecule. `target_residue` or
`source_position` without `source_frame` is an error, so their presence can
never selectively switch the check off.

### Citations

`validate` establishes that a title is text and a URL is safe https. It cannot
establish that the title belongs to the work the identifier names, and a title
written from memory produces a citation that looks checkable and is not. Declare
`identifier` and run:

```
node scripts/verify_citations.mjs RECORD.json
```

It reports MATCHED, SHORTENED, PARTIAL, MISMATCH, AMBIGUOUS, UNRESOLVED,
OUT-OF-SCOPE or ERROR. UNRESOLVED and ERROR leave the citation unchecked, and the command needs network access to Europe PMC. Where one
identifier returns two records with the same title -- an article and its
one-page companion -- it reports AMBIGUOUS, because no title metric can separate
them.

### A perturbation series

A scan asks which of a set of residues carries a function. A comparison of
distinct designs asks a different question. Record a scan as a series whose
members are ordinary constructs:

```json
{
  "series_id": "cterm-scan",
  "hypothesis_id": "which-residue",
  "parent_id": "native",
  "scheme": "substitution",
  "to": "A",
  "target_positions": [14, 15, 16, 17, 18, 19, 20],
  "omitted": [
    { "position": 16, "reason": "the peptide would not dissolve", "outcome": "made_unusable" }
  ],
  "coverage": "The C-terminal anchor, annotated as a region and unresolved at residue level."
}
```

`scheme` is `substitution`, which also needs `to` (one residue letter), or
`deletion`, where each member deletes one position.

Each member is a construct like any other -- its own `parent_id`, its own
single edit, its own declared sequence, verified the same way -- carrying
`series_id`. The series groups and audits them; it does not replace them.

`target_positions` is the **full intended** coverage, and the positions made are
these minus `omitted`. Listing only what was made would
leave a dropped position absent from both lists, so nothing could tell a
deliberate exclusion from a gap. `outcome` separates the two things an absence
can mean: `not_made` is a gap, `made_unusable` is a **result** about that
position.

Validation requires **exactly one member per included position and none
elsewhere**, one edit per member matching the scheme, and one series per
hypothesis. Without the expansion check, `coverage` is a sentence and
`target_positions` is a wish.

Two review prompts, not errors: a series scanning a position that already
carries cited residue-level evidence on its parent, because testing a named
residue and scanning across it answer different questions; and the library
size, which is reported as both the number of comparisons to read and the
number of molecular constructs to build, so a series reads as one experiment
without concealing how many molecules it takes.

The rule it satisfies is one proposed change **or** one prespecified series per
hypothesis.

### The precedent search

A record that proposes candidates accounts for the search for prior work on
them, in the same way it accounts for an analysis:

```json
{
  "scope": "Europe PMC and bioRxiv, consensus design and directed evolution on this enzyme, to 2026-01",
  "completed": true,
  "found": ["source-a", "source-b"]
}
```

`completed` is the decisive field. `false` is a legitimate state to deliver in
and says the candidates were chosen before the answer arrived, which makes them
provisional. `false` requires a `reason` specific enough to check, and `found`
lists `source_id`s declared in `sources`.

`validate --final` fails when a record proposes candidates and carries no
`precedent_search` at all. A search dispatched before the designs were selected
differs from one whose result was in hand when they were chosen, and only the
record can say which happened.

`node scripts/render.js validate --final` fails when a required analysis is
neither computed nor recorded as attempted. Plain `validate` reports it and
succeeds, because a record under construction legitimately has work
outstanding. Record validation on its own never establishes that the analyses
were performed.

### Identity

`region_id` is the link between constructs. Selecting a region highlights every
feature sharing that id, so two regions that are the same function must share
one id and two that are not must not. A repeated region uses the **same**
`region_id` for each copy and a **distinct** `instance_id` per copy, so a
duplicated module can be highlighted as a group while each copy stays
individually addressable.

Where papers use different names or boundaries for the same region, record them
in `aliases` rather than renaming the region per source. Each alias is an
object with a required `name`:

```json
{
  "region_id": "tad1",
  "name": "Transactivation domain 1",
  "kind": "regulatory",
  "aliases": [{ "name": "activation domain 1" }, { "name": "TAD-I" }]
}
```

### Chains

A construct may be several polypeptides. A heterodimer is two; most proteins
are one. Declare `chains` **or** a bare `sequence`, and only one of them,
because two authorities for the same residues can disagree and the
disagreement would be silent.

`schema_version` takes the values 2 to 6, and a record declares the highest
version whose feature it uses: 3 for `donors` and assembly segments, 4 for
`chains`, 5 for `objective` and `hypotheses`, 6 for chemistry. The versions are
cumulative, so one record may use `chains` and `hypotheses` together and declare
5. Only the chemistry rule is enforced: a record carrying chemistry under a
lower version is refused.

```json
{
  "variant_id": "pair",
  "name": "Heterodimer",
  "construct_role": "reference",
  "features": [
    { "instance_id": "ra@1", "chain_id": "chain-a", "region_id": "ra", "start": 1, "end": 98 },
    { "instance_id": "rb@1", "chain_id": "chain-b", "region_id": "rb", "start": 1, "end": 60 }
  ],
  "chains": [
    { "chain_id": "chain-a", "name": "Chain A", "sequence": "...", "reference_id": "EXAMPLE-A", "copies": 2 },
    { "chain_id": "chain-b", "name": "Chain B", "sequence": "...", "reference_id": "EXAMPLE-B" }
  ]
}
```

The `sequence` values are elided in this example. Each is the chain's full
sequence.

**A chain is identified by `chain_id`, never by its place in the array.** A
child's chain corresponds to its parent's chain of the same id; reordering
`chains` changes nothing; renaming an id is a removal plus an addition.

**Residue numbers mean nothing until the chain is named.** Once a construct has
more than one chain, `chain_id` is **required** on every feature, every
`ResidueClaim` and every track. Without it one chain's span would be checked
against another chain's residues and would pass whenever the lengths allowed —
and the expected-residue check cannot catch that, because two chains may hold
the same letter at the same position. With exactly one chain the field may be
omitted and means that chain.

A site's chain is per **residue**, not per site: a stapled interface is one
site with residues on each side of it. A site that needs a chain the construct
does not have is reported incomplete, however intact its surviving half is.

`copies` is a count: how many of this chain the molecule holds. Features,
sites and tracks address the chain as a whole, so no annotation distinguishes
copy 1 from copy 2, and the figure draws one row per chain either way. A bond
end or a conjugate anchor on a chain with more than one copy is the exception
and carries `copy` (see the chemistry section).

The count is drawn. The per-chain row readout carries it (`120 aa × 2`), each
chain is named beside its own diagram in the workspace, and the Sequence
section reports the **assembled** molecule (`2 chains, 120 × 2 + 80 = 320 aa
assembled`) in place of the sum of the distinct sequences. Omitting `copies`
claims one instance, so a chain held twice and left without it is published as
a one-of-each assembly.

Chains of different ids have **independent coordinate spaces**. The figure
draws no rule across them and the axis says so. Residue 50 of `chain-a` and
residue 50 of `chain-b` are unrelated numbers on unrelated molecules. Within
one chain, parent and child rows *are* aligned.

#### Chain derivation

A chain whose `chain_id` also exists in the parent must say how it relates,
because an omitted value cannot tell "verified unchanged" from "changed
but unexplained":

| `derivation` | Meaning | Checked |
|---|---|---|
| `unchanged` | identical to the parent's chain | sequence and chemistry must match the parent's chain exactly |
| `edited` | `edits` reproduce it from the parent's chain | edits must be present, non-empty, and verified |
| `unverified` | differs, and the change is not accounted for | sequence or chemistry must actually differ; correspondence is inferred and the figure says so |

An omitted `derivation` on an inherited chain is an error. `edits: []` with
`derivation: "edited"` is an error, because an empty list has no meaning of its
own. A chain the parent does not have is new: it may declare an `assembly` or
nothing, and declares no `edits`, since there are no parent coordinates to frame
them in. An assembled chain takes no parent correspondence even when the id
matches, or a coincidental sequence match would carry the parent's annotations
into it.

A chain's `edits` and `assembly` live on the chain. They are errors alongside
`chains` at the variant level, as is `reference_id` — a single accession cannot
describe a heterodimer.

### Edits

`edits` are stated in the **parent's** coordinates and applied simultaneously.
The renderer applies them and requires the result to
equal the variant's declared `sequence`; a mismatch is a hard failure, because a
diagram drawn from unverified edits can show an edit the sequence does not
contain.

```json
[
  { "op": "insert", "at": 1, "sequence": "GSGS" },
  { "op": "delete", "start": 84, "end": 101 },
  { "op": "replace", "start": 10, "end": 20, "sequence": "KLM" },
  { "op": "substitute", "position": 72, "from": "Y", "to": "F" }
]
```

`insert` places `sequence` immediately before parent position `at`, and `at`
equal to the parent's length plus one appends at the C-terminus. `delete` and
`replace` take an inclusive `start` and `end`. `substitute` names the parent
residue it expects in `from`, which is checked against the parent, and `from`
and `to` must differ. A chemistry change belongs in the chain's chemistry.

Omitting `edits` is allowed. The correspondence is then **derived** from the two
sequences and labelled as derived, and where the sequences do not determine the
change's position (an inserted copy of an adjacent region is the common case)
it is labelled **ambiguous**. Declare the edits to resolve
it. Insertion and deletion locations come from the declared edits and the
sequences, and colours or labels play no part.

Annotations are **remapped** into each variant with that variant's own
coordinates. The renderer compares each region against the same
region in the parent and reports coordinates that merely repeat the parent's
numbers.

### Assembled constructs

A construct built from native components records its provenance in `donors` and
an `assembly`, and a variant that carries an `assembly` takes no `parent_id` or
`edits`. A record that uses them declares `schema_version` 3 or higher.

- A **donor** stores a native sequence in full: `donor_id`, `name`, `sequence`,
  and optionally `accession` (`{database, accession, version}`), `source_ids`
  and `note`. A donor is a snapshot with its own id, and two donors with the same
  residues stay two donors.
- An **assembly** lists `segments` that tile the construct in order, with no gap
  and no overlap. Each segment has a `segment_id`, a `start` and `end` in the
  construct, and a `kind`. A `donor` segment names `donor_id`, `donor_start` and
  `donor_end`, and its residues must equal that donor range exactly. A `literal`
  segment carries its own `sequence`, for a junction, linker or tag, and asserts
  only that no donor is referenced.
- A variant that uses the `sequence` shorthand puts `assembly` on the variant. A
  variant that declares `chains` puts it on each assembled chain.

```json
{
  "schema_version": 3,
  "title": "Assembled example",
  "sources": [],
  "regions": [
    { "region_id": "part-a", "name": "Module A", "kind": "binding" },
    { "region_id": "join", "name": "Linker", "kind": "linker" },
    { "region_id": "part-b", "name": "Module B", "kind": "regulatory" }
  ],
  "donors": [
    {
      "donor_id": "donor-a", "name": "Donor A",
      "sequence": "MKTAYIAKQRQISFVKSHFSRQLE",
      "accession": { "database": "example", "accession": "EX-A1" }
    },
    { "donor_id": "donor-b", "name": "Donor B", "sequence": "GSDEPKLWNVTHYQRAFCEDMNIK" }
  ],
  "variants": [{
    "variant_id": "assembled",
    "name": "Assembled construct",
    "construct_role": "reference",
    "sequence": "MKTAYIAKQRQISFVKSHFSGGGGSDEPKLWNVTHYQ",
    "assembly": {
      "segments": [
        { "segment_id": "s1", "kind": "donor", "start": 1, "end": 20,
          "donor_id": "donor-a", "donor_start": 1, "donor_end": 20, "label": "Module A" },
        { "segment_id": "s2", "kind": "literal", "start": 21, "end": 25,
          "sequence": "GGGGS", "label": "Linker" },
        { "segment_id": "s3", "kind": "donor", "start": 26, "end": 37,
          "donor_id": "donor-b", "donor_start": 3, "donor_end": 14, "label": "Module B" }
      ]
    },
    "features": [
      { "instance_id": "part-a@1", "region_id": "part-a", "start": 1, "end": 20, "evidence": "established_elsewhere" },
      { "instance_id": "join@1", "region_id": "join", "start": 21, "end": 25 },
      { "instance_id": "part-b@1", "region_id": "part-b", "start": 26, "end": 37, "evidence": "established_elsewhere" }
    ]
  }]
}
```

Each donor is a native component with its own ortholog set, so conservation is
required per donor (see Required analyses), and a per-donor track or attempted
analysis uses `target_kind: "donor"`.

### Evidence

`measured`, `established_elsewhere`, `predicted`, `unknown`. An omitted status is
treated as `unknown`, and `unknown` is rendered visibly rather than hidden.
Evidence is drawn on two channels — fill weight and border style — so it
survives greyscale and colour blindness, and it never competes with region
identity.

### Rationales and citations

Attach each observation to its own source; do not rely on a bibliography shared
by every proposal. For an exploratory proposal supply an empty `observations`
array. The renderer prints that no direct supporting observation was
supplied, and `rationale.uncertainty` states what the proposal rests on instead. **Never invent a source to pass
validation.** State coverage honestly per source — full text, selected sections,
abstract only, or supplement unavailable. A real citation attached to a
plausible hypothesis does not establish that the hypothesis was measured.

The rationale is a user-facing evidence-to-design explanation and holds no
transcript of model reasoning.

## Residue-level annotations

A site marks individual residues rather than a span: a binding-critical position,
a catalytic triad, a phosphosite, a set of residues forming one face.

```json
{
  "site_id": "partner-binding-i17",
  "label": "I17 \u2014 binding-critical",
  "role": "interaction",
  "applies_to": "native-protein",
  "residues": [{ "position": 17, "expected": "I" }],
  "evidence": "established_elsewhere",
  "observations": [{
    "source_id": "example2020",
    "finding": "A point mutation at this position severely compromises binding to the partner protein.",
    "locator": "Abstract",
    "context": "Solution NMR on a truncation that does not self-assemble.",
    "quote": "a point mutation at position I17 severely compromises binding"
  }],
  "note": "Measured in the truncation, transferred to the full-length scaffold."
}
```

**Coordinates.** `applies_to` names the variant whose numbering `position` uses. A
source may report a position in mature-chain numbering, in a truncated construct, or
in another species. Convert it, and say in `note` what you converted from.

**`expected` is the letter the SOURCE reports.** Validation compares it with the
target sequence, so copying the target's letter into the field defeats the only
check there is. If the check fails, the numbering frames
disagree: record the original reported position and explain the mapping. **Never
"fix" a failure by changing `expected` to whatever the target contains.**

The check is a consistency test, not proof of a frame. An offset can land on a residue
of the same letter, which is common in repetitive or compositionally biased sequence.
Passing means "not obviously wrong" and stops short of "verified."

**Evidence status means what it says.** `measured` is measured in the construct the
site is attached to. An observation from a truncation, another organism, or a related
construct is `established_elsewhere` even when the sequence is unchanged. A site
asserting either must carry at least one observation naming its source; an annotation
nothing supports is `predicted` or `unknown`, and an inference you drew yourself is
`predicted` with an empty `observations` array and a note saying so.

**Keep claims separate.** "A point mutation here destroys binding" and "these residues
share a helical face" are different claims with different support. Give them separate
sites rather than one highlight carrying the strongest word.

## Chemistry a sequence letter cannot carry

A `sequence` is canonical amino-acid letters, and that is the limit of what a
letter says. `A` is alanine; nothing in it distinguishes the L form from the D
form, says a backbone nitrogen is methylated, says a terminus is capped, or says
two residues are bonded to each other.

Record any of those and they are checked, drawn, and turned into a structure.
Leave them out and the record describes a different molecule from the one you
designed, and `export` writes a FASTA of the plain letters.

```json
{
  "variant_id": "dala",
  "name": "D-alanine at position 8",
  "construct_role": "candidate",
  "chains": [{
    "chain_id": "p",
    "name": "Peptide",
    "sequence": "CGSGSCPAG",
    "chemistry": {
      "caps": [{ "terminus": "C", "monomer": "am" }],
      "residues": [{ "position": 8, "monomer": "dA" }]
    }
  }],
  "chemistry": {
    "bonds": [{
      "bond_id": "ss",
      "kind": "disulfide",
      "a": { "position": 1, "attachment": 3, "expected": "C" },
      "b": { "position": 6, "attachment": 3, "expected": "C" }
    }]
  }
}
```

**The sequence still holds one letter per position.** The letter is the monomer's
natural analogue — `A` for D-alanine, because D-alanine stands in for alanine —
or `X` where the monomer has none. Every coordinate, edit, alignment column,
track and site keeps working unchanged. The chemistry layer names the real
monomer wherever the letter understates it.

**A position whose letter is `X` carries a chemistry entry naming its monomer.** The ambiguity codes `B`, `Z` and `J` may
carry none: they stand for one of several residues, so there is nothing to name.

**Monomer names come from the vocabulary built into the renderer**, derived from a
published monomer dictionary whose licence ships in `data/monomers/LICENSE`, and are
case-sensitive. Look them up with `node scripts/render.js monomers QUERY` rather than
recalling them: `dA` is D-alanine and `DA` is nothing. A misspelt one is refused
rather than becoming a molecule nobody can build. Two rows of that dictionary
are refused by name because they would quietly produce a molecule other than
the one they claim; the message says which and why.

**One naming trap: `Thr_ol` and `D_Thr_ol`.** The names follow the CIP descriptor, and
reducing threonine's carboxyl flips that descriptor, so
`D_Thr_ol` is the reduction product of **L**-threonine. A residue meant to be
"L-threoninol" is `D_Thr_ol`.

**Chemistry needs `schema_version: 6`.** A renderer built before the chemistry layer
would read a version 5 record, ignore the fields it does not know, and show and
export a D-peptide as its plain letters. Declaring 6 makes that renderer refuse the
record, and this renderer refuses chemistry under any lower version.

**Chemistry in the wrong place is an error.** A bond written on a chain, a
residue written on the variant, or a misspelt field inside any chemistry object is
refused, with a pointer to where it belongs. Everywhere else in the schema an unknown
field is ignored, and an ignored chemistry field would never reach the molecule,
the figure or the export guard.

**Where each part goes.** `residues` and `caps` are positional in one chain's own
frame, so they sit on the chain and cannot name the wrong one. `bonds` sit on the
variant, because a disulfide can have one end in each chain.

**A bond joins two residues.** `a` and `b` name them, and nothing is said
about what lies between them. Each end states its `attachment` (1 the N-terminal
side, 2 the C-terminal side, 3 the side chain), and `monomers NAME` prints the
attachments each monomer offers. The attachment is always stated, because a
disulfide joins two side chains, a cyclization joins two termini, and the
residue letter carries neither fact.

**Bond kinds are `disulfide`, `amide`, `thioester`, `backbone` and `other`.** There is no `thioether` kind. Every carbon attachment a bond can reach is an acyl carbon, so a sulfur bonded to a reachable carbon is a thioester, and the record is refused if it says thioether. A true thioether needs an attachment on an sp3 carbon a bond can reach, which the vocabulary does not offer, so a thioether-bridged design cannot be recorded. Every kind, `other` included, must join elements that can bond: an amine and a carboxyl, two thiols, or a thiol and a carboxyl. Kind `other` also requires a `note` saying what the bond is.

**Chemistry the vocabulary cannot express is declared in the record.** A design may need a modification no monomer can name, such as a bond anchored on a terminal cap, a thioether, or a linker that is not in the table. Nothing can be recorded for it, and a record carrying no chemistry exports a clean FASTA of the unmodified peptide, so a limit left in prose reaches nobody. The variant's `unexpressed_chemistry` is the field for it: a list, each entry carrying `what` the molecule needs in chemical terms, `why` the vocabulary cannot name it, the `position` where it has one, and the `chain_id` once the construct has more than one chain. Both strings must be a real sentence (the validator refuses an entry under eight characters), because a vague entry would refuse an export with nothing to name. An entry makes `export` refuse and the figure print it under **Not encoded**, the same as a recorded D-residue, because the letters would describe a different molecule. The card also says "No structure derived" for that chain and names the position. A monomer that exists belongs in `chemistry.residues`, and an entry with a `monomer` field is refused here. Where the gap is a residue the vocabulary does not have, the sequence carries `X` at that position and the declaration stands in for the monomer entry a bare `X` would otherwise require.

**A cap needs somewhere to go.** An N cap bonds to the first residue's N-terminal side
and a C cap to the last residue's C-terminal side, so a residue with a reduced or
ring-closed end cannot take one. That is checked, and refused.

**Do not restate a default.** A position that is the plain L residue needs no entry, and
an entry naming the letter's own monomer (`L` on a letter `L`) is refused: absence is the
assertion, and spelling it out as well makes two descriptions of one molecule that
anything comparing them reads as a change.

There is no `cyclic` flag. A head-to-tail closure is a `backbone` bond from
position 1's attachment 1 to the last position's attachment 2, so "a capped
terminus cannot also be cyclized" follows from the bookkeeping rather than
needing a rule of its own.

**`copies` is capped at 1000.** It counts the instances of one chain in one designed
molecule, and the figure and the chemistry checks are done per instance.

**A bond or conjugate on a repeated chain addresses the copy.** `copies` is a count,
so each bond end and each conjugate anchor on a chain with more than one copy
carries `copy` (1-based).

**What is checked.** That the monomer exists and is the right kind; that the letter
is its natural analogue; that each end's attachment exists on the monomer there,
which is what makes substituting a bridged cysteine to serine break the bond
rather than silently redefine it; that the bond's kind matches the atoms at its
ends, so a `disulfide` declared between a lysine and an aspartate is refused
instead of assembling an amide; and that every bondable atom carries one bond.

What is not checked: whether the bond forms, whether the peptide folds, or
whether anyone can make it. Two surviving cysteines establish that the sequence
**permits** a disulfide and does not establish that one forms.

**A side chain made of units that are not residues is a conjugate.** A fatty acid on a
lysine, a PEG-like spacer, a glutamate used as a linker: several units in a fixed
order off one atom, none of them occupying a sequence position. Nothing else can say
that -- `residues` maps a position to one monomer and a bond joins two positions.

```json
{
  "variant_id": "lipidated",
  "name": "Lipidated peptide",
  "construct_role": "candidate",
  "chains": [{ "chain_id": "p", "name": "Peptide", "sequence": "AGKLS" }],
  "chemistry": {
    "conjugates": [{
      "conjugate_id": "lipid",
      "anchor": { "position": 3, "attachment": 3, "expected": "K" },
      "units": [
        { "monomer": "AEEA", "in": 2, "out": 1 },
        { "monomer": "gGlu", "in": 2, "out": 1 },
        { "monomer": "C18diacid", "in": 2 }
      ]
    }]
  }
}
```

This is an illustrative lipidated-lysine side chain and asserts nothing about any
particular compound.

The `anchor` is a bond end: a residue and the attachment that carries the conjugate.
`units` run outward from it. Each unit states `in`, the attachment of THAT unit that
bonds to what comes before it, and `out`, the attachment that bonds to the next one,
omitted on the last. Neither is inferred. Off an amine the units chain acid-first,
each one's carboxyl joining the one before and its amine passed on; off a carboxyl,
the other way. And a unit can offer two carboxyls or two amines, so naming the wrong
one is a different molecule that is just as valid.

**The order of the units matters and is easy to get wrong from memory.** Written
glutamate-first, the molecule above is valid, parses, has the same formula, and
is a different compound. Take the order and the attachment points from the
structure being designed.

Check each link is a bond that can exist: an amide takes an amine and a carboxyl, a
disulfide two thiols. Two spacers joined amine to amine are refused, naming both ends.
A conjugate on a repeated chain is addressed to one instance with `copy`.

**Conjugate units.** Attachments are numbered 1 (the N-terminal side), 2 (the
C-terminal side) and 3 (the side chain), and `monomers NAME` prints the
attachments each monomer offers. `monomers --kind linker` lists the spacer and
acyl units: `AEEA` (a spacer), `C18diacid` (octadecanedioic acid, acylating
through one carboxyl) and `C16acid` (hexadecanoic acid, a monoacid). A conjugate
unit may also be an ordinary residue or any other monomer the lookup lists. A
unit the lookup does not list is declared under `unexpressed_chemistry`, and the
record states the gap in place of approximating it with a different acyl group.

**Derivation is about the molecule.** `"unchanged"` requires the chemistry to match
the parent's as well as the sequence, because a D-substitution leaves every
letter identical. A chemistry change has no edit form, so a child that
differs only in chemistry declares `"unverified"`, since nothing
accounts for the change.

**An unspecified stereocentre is reported.** Fourteen of the vocabulary's
monomers leave one open, some deliberately (the `xi` names mean "either"), and
`monomers` flags each of them. A record using one still assembles, and the card
says the structure does not state which molecule is meant. The card likewise
reports an open double bond, which leaves the geometric isomer unstated.

**What comes out.** The figure marks each modified residue with its monomer,
draws within-chain bonds as arcs, caps at the terminus they cap and a conjugate as a
branch mark at its anchor with its units in order, and the
construct's Chemistry section states all of it in words with the derived SMILES.
`export` refuses any chain carrying chemistry, naming the positions, because a
flat file carries one letter per residue and writing the letters would describe
a different molecule.

`fixtures/peptide-chemistry.json` is a worked example of a D-residue, a
non-canonical residue, a C-terminal cap, a disulfide and a head-to-tail closure.

## Per-residue tracks

A track carries one number per residue, such as conservation, disorder, hydrophobicity or charge.

```json
{
  "track_id": "conservation-family",
  "kind": "conservation",
  "label": "Evolutionary conservation",
  "applies_to": "native-protein",
  "scale": { "min": 0, "max": 1, "higher_means": "more conserved across this comparison set" },
  "method": {
    "comparison_level": "family",
    "homolog_source": "UniProtKB entries carrying one Pfam family; the complete family",
    "alignment": "multiple alignment by MAFFT v7.505, FFT-NS-2, projected onto reference coordinates",
    "weighting": "Henikoff position-based sequence weights, variable columns only",
    "score": "Jensen-Shannon divergence against a renormalised Robinson & Robinson background",
    "computed_on": "2026-01-15"
  },
  "values": [0.21, 0.44, null],
  "coverage": [485, 484, 364]
}
```

`values` and `coverage` show three entries to keep the example short. A real
track holds one entry per residue of the target chain, with the number of
homologs behind each column in `coverage`.

### Which aligner produced it

`method.alignment` says. The three are not interchangeable and the record is
where that is settled:

| Aligner | `method.alignment` begins | How to read it |
|---|---|---|
| MAFFT (default) | `multiple alignment by MAFFT` | A column the family has no counterpart for is left unscored, so an absent value is itself a result |
| `--aligner famsa` | `multiple alignment by FAMSA` | A true multiple alignment that installs with `pip install pyfamsa`. It also scores some positions MAFFT leaves unscored, so read their coverage before relying on them |
| `--aligner builtin` | `pairwise global Needleman-Wunsch` | Aligns every homolog over the reference's full length, so it scores EVERY position, including regions the family does not have |

`--aligner builtin` is the last resort for an environment that can install
neither MAFFT nor pyfamsa. It returns a value at every position, including a
disordered stretch or a tail the family does not possess, so scores outside the
conserved core are unverified and prose that cites them says which aligner it is
citing. There is no automatic substitution between aligners. The viewer
surfaces the whole of `method` under "About this measure", so a figure and a
sentence that disagree about this are visibly in disagreement.

### What the number is a conservation OF

Two comparison sets answer different questions and share no scale. The fetcher
takes `--level`, and the level it used travels in the track as
`method.comparison_level`:

| level | the set | the question |
|---|---|---|
| `orthologs` (default) | the reference's UniRef50 cluster -- the same protein in other species | what does **this protein** need? |
| `family` | every entry carrying its Pfam domain -- a superfamily of *different* proteins | what does this **style** of protein need? |

For a member of a large receptor superfamily, the family can hold tens of
thousands of entries of which only a few percent are the protein in question;
the rest are its relatives. A family-level score therefore measures what the
superfamily shares -- largely the structural core -- and a residue giving
*this* receptor its specificity is **supposed** to differ from its relatives',
so it scores low. Low at family level is not evidence that a position
is unconstrained in the reference.

Which level is available depends on the protein. A small protein's UniRef50
cluster may hold few sequences, so the fetcher refuses the ortholog level below
a floor of 30 (`--min-sequences`) and names the family level as the alternative.
Label the track with its level.

**A low value means the position VARIES across that set.** It leaves open whether change
is tolerated. Where the set's members are supposed to differ at a position,
variation is the mechanism. A region that members of the set are selected to
vary in, such as a recognition loop, scores low by construction and holds most
of the lowest-scoring positions of its protein. A pale region is not a safe one.

**Report how much independent evidence is behind it.** A row count differs from
the amount of independent evidence. The generator records `effective_sequences`
(Neff), and an ortholog set of 60 rows can carry the independent evidence of a
handful of sequences, because close relatives are near-duplicates.

**`method` is required and must say where the numbers came from.** A conservation score
without its homolog set and scoring method cannot be interpreted, and two tracks computed
differently must not be read on one scale. Run the computation, keep its inputs, and
record them. **Never write a plausible-looking profile to complete a picture.**

**A track belongs to ONE chain.** On a multi-chain construct `chain_id` is
required, and `values` is one entry per residue of **that chain**. A sequence
hash cannot settle which chain a track is for -- two chains may have identical
sequences -- so name it. Import with
`node scripts/import_track.mjs record.json track.json VARIANT --chain CHAIN`.

**`values` is one entry per residue of the target chain**, and `null` means unavailable.
Unavailable renders as unavailable and stays distinct from zero. If an analysis could not be run at
all, omit the track rather than filling it.

**A value only exists where the alignment supports one.** A true multiple
alignment leaves gaps wherever homologs cannot be placed, and those positions
must report `null` rather than a number. Forcing every homolog into alignment
with the reference everywhere manufactures coverage, and therefore manufactures
scores, in exactly the regions where alignment is least trustworthy -- a
disordered linker being the usual case.

**Verify the sequence before importing.** A scoring script emits values against a FASTA
sequence; matching lengths or identifiers does not establish that it is the same
sequence as the target variant. Compare residue by residue.

**Conservation across engineered variants is not evolutionary conservation.** Scoring
the variants in a design record measures how much someone edited. If both ever appear,
they need different labels, different legends, and different `track_id`s.

**How a track reaches other constructs.** A track measured on one variant propagates to
the others only where a residue is *native*: it occupies the reference's alignment column
**and** carries the reference's letter.

- An **inserted** residue has no value, even when the inserted block is a verbatim copy
  of reference sequence. A transplanted copy is not under the constraint that shaped the
  original, and filling it in by sequence identity would assert that it is.
- A **substituted** residue carries no value either: the score describes the residue that
  was there, and the introduced residue carries no value. The position's score stays available for
  readouts, which is usually the interesting number about a point mutant.

## Presentation

The rendered workspace follows this contract.

- **Labels.** Each hypothesis shows its question and, beneath it,
  **Rationale:** (`hypothesis.mechanism`). Construct details label the
  uncertainty **Caveats:** and omit repeated comparison text. Attempted
  analyses print under **Not measured**, declared chemistry gaps under
  **Not encoded**, and a measure's method under **About this measure**. The
  controls are **Reset view**, a sequence view menu (**Regions** or
  **Amino acids**) and a **Coloring scheme** menu.
- **Width.** The workspace measures its own container, and the browser viewport
  and the `--width` option play no part. At container widths of 640px or more,
  which includes the normal 736px chat frame, each hypothesis question sits
  beside its construct group. Below 640px the question sits above its group.
  The question stays visible when its mechanism and measurement details are
  collapsed.
- **What the overview omits.** Role badges, the reference-group heading, the
  coordinate footer and source-read coverage stay out of the overview. Concise
  site labels and positions stay visible, with notes and evidence in
  disclosures.
- **Display modes and zoom.** Regions and Amino acids are display modes the
  reader chooses, and switching between them leaves the viewport where it is.
  Regions draws no letters at any zoom. Amino acids draws the residue strip at
  every zoom, and the letters resolve as columns widen. Zoom keeps the selected
  mode. A static SVG has no mode, and letters appear where the columns have
  room.
- **Coloring scheme.** The menu opens on **Functional region**, and a measure
  is turned on deliberately. Each measure names its actual comparison set.
  Charge and variation among designed constructs never stand in for homolog
  conservation, and a precomputed track is reused only after exact sequence
  verification, with its provenance preserved.
- **Shared scale.** Regions are drawn on a shared residue scale across every
  construct, with lengths counted from the sequences themselves.
- **Colour.** Colour is assigned per region. Regions of kind `binding`,
  `assembly`, `regulatory` or `catalytic` take one of nine hues in order of
  appearance, the hues cycle after the ninth, and every other kind takes a
  neutral. A `membrane` region has its own token. A region keeps its colour
  across every construct, and every band carries its region name. `kind` is a
  presentation hint and does not establish function.
- **Lanes and labels.** Overlapping annotations are treated as overlapping
  functions and given separate lanes. Labels that do not fit inside their region
  move to a label lane with a leader line, and a label longer than the figure is
  shortened with an ellipsis and kept in full in the tooltip and the detail
  list.
- **Edits** are marked with texture and a junction marker in addition to colour.
- **Membrane.** A membrane motif is drawn only where a record annotates a
  `membrane` region, so a soluble scaffold never shows one.
- **Generated output.** Use the renderer's own output and startup behaviour. An
  appended automatic Reset view click, a rebuilt simplified figure or a patched
  generated page imitates the workspace and loses its behaviour. `--width` sets
  the initial SVG geometry, and the host's actual width decides what the reader
  sees.
- **Validation** checks identity, coordinates, references and link safety. A
  record that validates is well formed and may still be wrong, so a passing
  validation is no scientific verification.

## Export files

`node scripts/render.js export RECORD.json OUTDIR/` writes the same constructs as
files someone can act on, from the same normalized model the figure is drawn
from:

- `<record>.gp` — GenPept, **one file for the whole library**: a record per
  declared chain of every construct.
  Every feature becomes a `Region` at its own coordinates, so each copy of a
  repeated region is its own named feature rather than N features sharing one
  name, and carries the figure's own hue for it (see the colour row below).
- `<variant_id>.fasta` — protein FASTA, **one file per construct**, with an
  entry per declared chain of it.

The two formats split the opposite way on purpose. The GenPept file is
imported whole into a viewer, where the library is the unit. A FASTA is read by
sequence tools one construct at a time, where the other constructs would be
noise. A multi-chain construct keeps its chains in one FASTA
either way, because those are one molecule.

Locus names are assigned across the whole record, so merging the constructs
into one GenPept file cannot make two records share a name.

What the format cannot do, and what the exporter therefore does:

| Problem | What is written |
|---|---|
| GenPept has no field for stoichiometry | Prose in `DEFINITION` and in **every** chain's `COMMENT`, because a folder groups sequences without encoding that they assemble, and the files get separated |
| `copies: 2` is a count, not two molecules | One record per **declared** chain. Two identical records would be a different molecule |
| A deleted parent span has no coordinates in the child | Stated in `COMMENT` in the parent's frame with the junction position. A `Region` there would mark residues that survived |
| `region_name` must distinguish repeat copies | `feature.label ?? region.name`, so an occurrence label wins |
| A viewer paints by feature TYPE, and every feature here is a `Region` | The default profile writes SnapGene's documented encoding: `/note="color: #RRGGBB"` as the feature's **last** note, in upper-case hex, with the figure's own hue. SnapGene's documentation says it reads that note only from a file it recognises, so the same profile writes the two markers: a LOCUS name containing `Exported` and a last `REFERENCE` whose `TITLE` is `Direct Submission` and `JOURNAL` mentions SnapGene (`AUTHORS` stays `.`). Both are case-sensitive. The COMMENT says the file was generated by construct-maps, because the markers name a format and leave the author unnamed. `--plain` writes standards-only GenPept with no colour and no markers |
| `/label` is what SnapGene prefers as a feature name | Written beside `/region_name`, which NCBI protein records use, with the same text |
| A `RegionKind` is a presentation hint | Everything is `Region`. Mapping `catalytic` to `Site /site_type="active"` would turn a colour hint into a biological claim |
| These are proposals, not database records | `ACCESSION` and `VERSION` are omitted entirely — not `.`, which some parsers read as the identifier. `LOCUS` carries a local name built from `variant_id` and `chain_id`; the exact ids are always in `COMMENT` |
| Provenance belongs to a donor span, not to whatever overlaps it | An assembly segment merges into the **one** feature covering exactly its span, as a labelled `Assembly segment: ...` note plus the `db_xref`; it gets a Region of its own where no single feature does. A feature straddling a boundary cites neither, and where two features share a span neither is given the donor |
| A flat file has one letter per residue and no chemistry | A chain carrying chemistry is **refused**, naming the positions, and the whole export stops without writing any file. There is nowhere in the format to put a D-residue, a cap or a bond, so the letters would describe a different molecule, and a FASTA is what reaches downstream tools. Both writers are guarded separately, because the `.gp` block and the FASTA reach the sequence by different routes |
| A `literal` segment establishes only that no donor is referenced | It says that and nothing about whether the residues were invented. A literal can hold a known tag or a sequence read from a paper |
| A version is not part of an accession | `/db_xref` carries the accession alone. UniProt distinguishes accession, sequence version and entry version, so concatenating one makes an identifier the record never stated; the recorded version is named as text in the note |
| A generated label can be too long to write | A run of substitutions is named `L22Q/W23S` while that fits and `Designed substitutions at 101..112` past it, with every change in the note. Refusing an author's over-long name is deliberate; refusing a valid edit run because the exporter built an unbreakable label is not |
| An identifier must never be rewritten to fit | Accessions skip the prose transliteration entirely and are refused if they are not printable and unbroken. Folding whitespace inside an accession produces a different accession that still looks like one |
| `/db_xref` takes a controlled namespace | Emitted only for a namespace the qualifier accepts. Any other `database` string is transcribed into the note instead, where it claims nothing about which database it is |
| Two adjacent substitutions merge into one change segment | Every position in the run is named, for example `Designed substitutions L22Q/W23S` |
| A terminal deletion joins nothing to nothing | "before residue 1" or "after the final residue" |
| A token too long to wrap would over-run the line | Refused, measured on the serialized token after quote doubling. Splitting it would put a space inside the value when a reader rejoins the continuation lines |
| A flat file is printable ASCII | A small explicit transliteration, then an **error** naming the field. Nothing is silently dropped from a note |

**Protein only.** No coding sequence is written. A back-translation is a design
decision that depends on host codon usage, GC windows, internal restriction
sites for an unknown cloning strategy, and diversifying codons between tandem
repeats, because an identical repeat at the nucleotide level is a synthesis and
recombination failure mode.

Each record carries the sha256 of the design record it came from, so a file can
be traced to an exact revision.

The exporter wraps lines at 79 columns, and the feature-table specification
permits content through 80.

Transliteration is documented and lossy: Greek is spelled (`Δ1-3` becomes
`Delta1-3`) so the export does not refuse most of the nomenclature in this
field, and that mapping is not reversible, since a record that literally said
`Delta1-3` produces the same output.

**No SnapGene import and no independent parser has read these files.** Format
conformance is checked against a reference record from NCBI, and the CLI prints
the same statement about SnapGene after every export. Whether a given SnapGene
version paints the colour on a **protein** import follows SnapGene's
documentation and is unverified here.

## Legacy records

Records in the `title`/`sources`/`variants` form with free-text feature labels are adapted automatically. The adapter reports what it synthesised and never invents an edit list, a source or an evidence status, so an adapted record always shows derived correspondence.
