# Privacy

Effective date: 2026-11-15

Construct Maps does not collect, store or transmit personal data. It has no accounts, no servers
and no analytics.

## What it handles

The sequences, records and files given to it in a conversation. They are processed by scripts that
run inside the session and are written to that session's working folder. The plugin's author never
receives them.

## What leaves the session

Only the lookups listed in the README, and only when the matching step is used.

- **UniProt** receives an accession, a cluster id or a Pfam id when homologs are fetched.
- **NCBI** receives a request for one public file, a substitution matrix.
- **Europe PMC** receives the DOIs, PubMed ids or PMC ids of cited papers when citations are checked.
- **PyPI** receives package install requests for `rdkit` and `pyfamsa`.

None of these requests carries the sequence being designed. Like any web request, each one is
visible to the service that receives it, including the address it comes from and the identifier
asked for, and an accession or a paper id can show what a person is working on. Each service
handles requests under its own privacy policy.

## Retention

The plugin retains nothing. Files created in a session stay in that session, under the rules of
the product it runs in.

## Audience

A research tool for people working on proteins and peptides. It is not directed at children.

## Contact

Raise questions through the repository's issue tracker.
