# Privacy

Effective date: 2026-11-16

This page describes the Construct Maps plugin and its bundled scripts. The AI application hosting the plugin, along with any connected tools or services, has separate privacy and retention policies.

## Plugin-operated services

Construct Maps has no author-operated backend, account system, or analytics. It does not send conversation content, sequences, or generated files to the plugin’s author through a plugin-operated service.

## Files and processing

The plugin works with the sequences, design records, and files available in your session. Its scripts run in the execution environment provided by the hosting application and write outputs to that environment.

The hosting application controls how conversations, files, and execution environments are processed and retained.

## External requests made by the bundled scripts

The scripts may make public lookups or install dependencies as part of completing a task:

- **UniProt:** receives accession numbers, UniRef cluster identifiers, or Pfam identifiers when homologs are retrieved.
- **NCBI:** receives a request for a public substitution-matrix file.
- **Europe PMC:** receives DOI, PubMed, or PMC identifiers when citation metadata is checked.
- **Package services:** the configured package index and download hosts receive requests for Python packages and dependencies.

These database lookup requests do not include the sequence being designed. They may be initiated automatically when the workflow requires them.

As with other network requests, the receiving service may observe network metadata, such as the originating IP address. Public identifiers can also reveal the subject of a research task. Each service handles requests under its own policies.

## Other research tools

The hosting AI may use additional tools for literature search, browsing, file access, or other work. This page does not describe or control those tools’ requests.

Their data handling depends on the hosting application, tool provider, permissions, and task instructions.

## Retention

The plugin does not maintain a separate author-operated copy of session data. Generated files and conversation content are retained according to the hosting application’s policies and your settings.

## Audience

Construct Maps is a research tool for people working with proteins and peptides. It is not directed at children.

## Contact

Raise questions through the repository’s issue tracker. Avoid including confidential sequences, unpublished results, or other sensitive information in public issues.
