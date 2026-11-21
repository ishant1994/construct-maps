# BLOSUM62

`BLOSUM62.txt` is the amino-acid substitution table used by the built-in aligner of
`scripts/compute_conservation.py`. It ships with the skill, unchanged, so no download is
needed to use it. The `.txt` only marks it as a text file; the bytes are NCBI's `BLOSUM62`.

- **What:** the BLOSUM62 matrix in NCBI's text format, 2,122 bytes.
- **Source:** https://ftp.ncbi.nlm.nih.gov/blast/matrices/BLOSUM62, retrieved 2026-11-16.
- **SHA-256:** `85510d3846ee6d5f4778e425cf8daf6e0dbb889b306f2d13434e1254780efb40`
- **Original work:** Henikoff S, Henikoff JG. Amino acid substitution matrices from protein
  blocks. Proc Natl Acad Sci USA 1992;89:10915-10919. doi:10.1073/pnas.89.22.10915
- **Basis for redistributing it:** it is a published table of numbers, and NCBI states that it
  "places no restrictions on the use or distribution of the data contained therein"
  (https://www.ncbi.nlm.nih.gov/home/about/policies/, read 2026-11-16). This records the
  basis; it is not a legal opinion.
- **Integrity:** `scripts/fetch_homologs.py` refuses to use a copy whose SHA-256 differs, because
  a changed table would change every score the built-in aligner produces.
