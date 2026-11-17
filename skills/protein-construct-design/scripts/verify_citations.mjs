#!/usr/bin/env node
/**
 * Checks that each source's title belongs to the work its identifier names.
 *
 *   node scripts/verify_citations.mjs record.json [record2.json ...]
 *   node scripts/verify_citations.mjs --quiet record.json
 *
 * WHY THIS IS NOT PART OF `validate`
 *
 * `validate` establishes that a title is a non-empty string and that a URL is
 * safe https. It cannot establish that the title belongs to the work the
 * identifier names -- and a title written from memory produces a citation that
 * LOOKS checkable and is not: the DOI resolves, the URL matches, validation
 * passes, and the title is wrong. A wrong title can change what the record
 * claims was established and by whom.
 *
 * It lives here rather than in `validate` because it needs the network, and
 * because `src/` is kept browser-safe. That also means it is OPT-IN: a check
 * that silently depends on connectivity would otherwise pass for the wrong
 * reason.
 *
 * WHAT IT CANNOT ESTABLISH
 *
 * - That the paper supports the biological claim attached to it. A correct
 *   title on a real paper says nothing about whether the observation cited
 *   from it is what the paper reports.
 * - That the identifier names the intended work. Europe PMC returns the same
 *   title for an article and its one-page companion item, so a title match
 *   cannot separate them; where identifiers cannot be distinguished this
 *   reports AMBIGUOUS and asks for a human read, rather than reporting a pass.
 *
 * Outcomes are explicit: MATCHED, SHORTENED, PARTIAL, MISMATCH, AMBIGUOUS,
 * UNRESOLVED, OUT-OF-SCOPE, ERROR. Exit 1 on any MISMATCH or ERROR, because a
 * network failure must never read as a successful check, and an identifier that
 * failed to look up is an ERROR even when another identifier of the same source
 * resolved. AMBIGUOUS, UNRESOLVED and OUT-OF-SCOPE leave a source unchecked and
 * exit 0: they need a human read, and the tally says how many there were.
 */

import { readFile } from 'node:fs/promises';

const EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
const HEADERS = { 'User-Agent': 'construct-maps-citation-check/1.0' };
const EPMC_HOST = new URL(EPMC).hostname;

/**
 * A lookup that got no usable answer. `mayBeBlocked` is true when the cause could be an
 * environment withholding access (no answer at all, or a 403/407), as opposed to the server
 * answering with something that is its own problem. It is a possibility, not a diagnosis: the
 * same symptom is a refusal, a timeout, a dead connection and a missing proxy setting.
 */
class LookupError extends Error {
  constructor(message, mayBeBlocked = false) {
    super(message);
    this.mayBeBlocked = mayBeBlocked;
  }
}

/** Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 is set (Node 22.21 or 24 and later). */
const proxyIgnored = () =>
  Boolean(process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY;
/** A lookup that has not answered by now is reported as an ERROR, not waited on. */
const REQUEST_TIMEOUT_MS = 30_000;
/** A pause between lookups, to stay well inside Europe PMC's request-rate guidance. */
const REQUEST_GAP_MS = 120;
/** Share of the real title's words that must appear for SHORTENED, then PARTIAL. */
const SHORTENED_AT = 0.85;
const PARTIAL_AT = 0.6;
/** Words of one or two letters ("of", "a") carry no evidence about a title. */
const MIN_WORD_LENGTH = 3;
/** Characters that would change a Europe PMC query once quoted into it. */
const UNQUOTABLE = /["\\\s\u0000-\u001f]/;

/** Database and repository sources, which have no bibliographic record to check. */
const NON_LITERATURE =
  /uniprot\.org|rcsb\.org|ebi\.ac\.uk\/interpro|pfam|alphafold|addgene|expasy|genome\.jp|drugbank|ncbi\.nlm\.nih\.gov\/(gene|protein|nuccore|snp)/i;

const normalise = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const words = (text) =>
  new Set(normalise(text).split(' ').filter((w) => w.length >= MIN_WORD_LENGTH));

/**
 * Compares on how much of the REAL title appears in what was recorded.
 *
 * Records store "Author Year. Title. Journal vol:pages", and papers often have
 * a subtitle after a colon that a citation drops. Either defeats a containment
 * test, so the question asked is the one that matters: is the real title's
 * wording present in the recorded string?
 */
function compare(recorded, actual) {
  const a = normalise(recorded);
  const b = normalise(actual);
  if (!a || !b) return { outcome: 'MISMATCH', note: 'one title is empty' };

  // MATCHED requires the real title to appear IN ORDER. A word-set score
  // discards order and ignores added words, so "kinase inhibits phosphatase"
  // and "phosphatase inhibits kinase" score identically, and an inserted "not"
  // can leave coverage at 100%. Order-free similarity is a reason to look, not
  // a verdict.
  if (a === b || ` ${a} `.includes(` ${b} `)) return { outcome: 'MATCHED', note: '' };

  const real = words(actual);
  const have = words(recorded);
  const covered = [...real].filter((w) => have.has(w)).length / (real.size || 1);
  const pct = `${(covered * 100).toFixed(0)}% of the real title's words present, out of order or incomplete`;
  if (covered >= SHORTENED_AT) return { outcome: 'SHORTENED', note: pct };
  if (covered >= PARTIAL_AT) return { outcome: 'PARTIAL', note: pct };
  return { outcome: 'MISMATCH', note: pct };
}

/** Typed identifiers first; the URL only as a fallback for records predating them. */
function identifiersOf(source) {
  const out = [];
  const id = source.identifier ?? {};
  if (id.doi) out.push(['DOI', String(id.doi).replace(/^https?:\/\/doi\.org\//i, '')]);
  if (id.pmid) out.push(['EXT_ID', String(id.pmid)]);
  if (id.pmcid) out.push(['PMCID', String(id.pmcid)]);
  if (out.length > 0) return out;

  const url = source.url || '';
  let m;
  if ((m = url.match(/doi\.org\/(10\.[^\s"'?#]+)/i))) out.push(['DOI', m[1]]);
  if ((m = url.match(/biorxiv\.org\/content\/(10\.[^\s"'?#v]+)/i))) out.push(['DOI', m[1]]);
  if ((m = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i))) out.push(['EXT_ID', m[1]]);
  if ((m = url.match(/(PMC\d{4,})/i))) out.push(['PMCID', m[1].toUpperCase()]);
  return out;
}

async function lookup(kind, id) {
  // An identifier is quoted into the query, so one carrying a quote, a
  // backslash, whitespace or a control character would rewrite it.
  if (UNQUOTABLE.test(id)) {
    throw new Error(`identifier ${JSON.stringify(id)} has characters a lookup cannot carry`);
  }
  const query = encodeURIComponent(`${kind}:"${id}"`);
  let response;
  try {
    response = await fetch(`${EPMC}?query=${query}&resultType=lite&format=json&pageSize=2`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      // A redirect would carry the lookup to a host this script does not disclose,
      // so it is reported as an error and not followed.
      redirect: 'manual',
    });
  } catch (e) {
    // fetch reports every network failure as "fetch failed"; the reason is on `cause`.
    const cause = e?.cause?.message ?? e?.cause?.code ?? e?.message ?? String(e);
    throw new LookupError(`could not reach Europe PMC (${EPMC_HOST}): ${cause}`, true);
  }
  if (!response.ok) {
    throw new LookupError(
      `Europe PMC (${EPMC_HOST}) returned HTTP ${response.status}`,
      response.status === 403 || response.status === 407,
    );
  }
  const body = await response.json();
  // A missing result structure is an error. Treating it as "no hits" would
  // report UNRESOLVED and exit zero, so a malformed response would read as a
  // completed check.
  if (!body || typeof body !== 'object' || !Array.isArray(body?.resultList?.result)) {
    throw new Error('Europe PMC returned an unexpected response shape');
  }
  const hits = body.resultList.result;
  return hits.map((hit) => ({
    title: (hit.title || '').replace(/\.$/, ''),
    doi: hit.doi,
    pmid: hit.pmid,
    pmcid: hit.pmcid,
    year: hit.pubYear,
    type: hit.pubType,
  }));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const count = (tally, key) => {
  tally[key] = (tally[key] || 0) + 1;
};

let failed = false;

async function check(path, quiet) {
  const record = JSON.parse(await readFile(path, 'utf8'));
  const sources = record.sources ?? [];
  console.log(`\n=== ${path} — ${sources.length} source(s) ===`);
  if (sources.length === 0) {
    console.log('  [ -- ] no sources to check; nothing was verified');
    return;
  }
  const tally = {};
  let blocked = 0;
  for (const source of sources) {
    const ids = identifiersOf(source);
    if (ids.length === 0) {
      const why = NON_LITERATURE.test(source.url || '')
        ? 'database or repository source, no bibliographic record to check'
        : 'no DOI, PMID or PMCID — declare one in `identifier` so this can be checked';
      count(tally, 'OUT-OF-SCOPE');
      console.log(`  [OUT-OF-SCOPE] ${source.id}: ${why}`);
      continue;
    }

    // Every declared identifier, not the first that resolves: a correct DOI
    // otherwise conceals a PMID that names a different work.
    const resolutions = [];
    const errors = [];
    for (const [kind, id] of ids) {
      try {
        resolutions.push({ label: `${kind}:${id}`, hits: await lookup(kind, id) });
      } catch (e) {
        errors.push(`${kind}:${id}: ${e.message}`);
        if (e instanceof LookupError && e.mayBeBlocked) blocked += 1;
      }
      await sleep(REQUEST_GAP_MS);
    }
    const resolved = resolutions.filter((r) => r.hits.length > 0);
    // An identifier that failed to look up is an ERROR whatever the others
    // returned. A source whose DOI resolved and whose PMID did not is only half
    // checked, and reading it as checked would let the unchecked half be wrong.
    if (errors.length > 0) {
      failed = true;
      count(tally, 'ERROR');
      console.log(
        `  [ERROR] ${source.id}: ${errors.join('; ')}. This is NOT a passed check` +
          (resolved.length > 0 ? '; the identifiers that did resolve are reported below.' : '.'),
      );
      if (resolved.length === 0) continue;
    }
    if (resolved.length === 0) {
      count(tally, 'UNRESOLVED');
      console.log(
        `  [UNRESOLVED] ${source.id}: ${ids.map((x) => x.join(':')).join(', ')} not found. ` +
          'Unchecked, not clean.',
      );
      continue;
    }
    // An identifier that answered with nothing, beside one that resolved, names
    // no work at all. The source is only partly checked, so it is reported, and
    // the identifiers that did resolve are still compared below.
    const empty = resolutions.filter((r) => r.hits.length === 0);
    if (empty.length > 0) {
      count(tally, 'UNRESOLVED');
      console.log(
        `  [UNRESOLVED] ${source.id}: ${empty.map((r) => r.label).join(', ')} not found, although ` +
          `${resolved.map((r) => r.label).join(', ')} resolved. Unchecked, not clean.`,
      );
    }
    const titles = new Set(resolved.map((r) => normalise(r.hits[0].title)));
    if (titles.size > 1) {
      count(tally, 'AMBIGUOUS');
      console.log(
        `  [AMBIGUOUS] ${source.id}: its declared identifiers name different works ` +
          `(${resolved.map((r) => `${r.label} -> ${r.hits[0].title.slice(0, 48)}`).join(' | ')}). ` +
          'Resolve which is cited before trusting either.',
      );
      continue;
    }

    // One identifier returning several records is not a result to pick from.
    // Equal titles are the article-and-companion case, which no title metric
    // can separate; different titles mean the identifier does not select one
    // work. Every resolved identifier is held to this, not only the first, so
    // a second identifier cannot hide behind a first that is clean.
    const several = resolved.find((r) => r.hits.length > 1);
    if (several !== undefined) {
      const same = normalise(several.hits[0].title) === normalise(several.hits[1].title);
      count(tally, 'AMBIGUOUS');
      console.log(
        `  [AMBIGUOUS] ${source.id} (${several.label}): ${several.hits.length} records answer this ` +
          `identifier (${several.hits.map((h) => h.doi ?? h.pmid ?? h.pmcid ?? '?').join(', ')})` +
          (same
            ? '. They share a title, which is the article-and-companion case: no title metric ' +
              'can separate them. Read the source to confirm which is cited.'
            : '. They carry different titles, so the identifier does not select one work.'),
      );
      continue;
    }

    const used = resolved.map((r) => r.label).join(', ');
    const hit = resolved[0].hits[0];
    const { outcome, note } = compare(source.title, hit.title);
    count(tally, outcome);
    if (outcome === 'MISMATCH') failed = true;
    if (outcome === 'MATCHED' && quiet) continue;
    const label = outcome === 'MATCHED' ? ' ok ' : outcome;
    console.log(`  [${label}] ${source.id}${used ? ` (${used})` : ''}${note ? ` — ${note}` : ''}`);
    if (outcome !== 'MATCHED') {
      console.log(`         recorded: ${source.title}`);
      console.log(`         actual:   ${hit.title}`);
    }
    // A declared year that disagrees with the record found is worth seeing even
    // when the title matches: it can mean the identifier points elsewhere.
    if (source.published && hit.year && !String(source.published).startsWith(String(hit.year))) {
      console.log(
        `         note: record says published ${source.published}, Europe PMC says ${hit.year}`,
      );
    }
  }
  console.log(
    '  --- ' +
      Object.entries(tally)
        .map(([k, v]) => `${v} ${k}`)
        .join(', '),
  );
  if (blocked > 0) {
    console.log(
      `  ${blocked} lookup${blocked === 1 ? '' : 's'} could not get an answer from Europe PMC (${EPMC_HOST}), so ` +
        'the sources marked ERROR are unchecked, not clean. ' +
        `If this environment limits outbound access, ${EPMC_HOST} may need to be allowed. ` +
        (proxyIgnored()
          ? "This environment sets HTTPS_PROXY, which Node's fetch ignores unless NODE_USE_ENV_PROXY=1 is " +
            'set (Node 22.21 or later), so the lookup may be failing for that reason and not because the host ' +
            'is blocked. '
          : '') +
        "Otherwise confirm each title against the paper's own page and record how it was checked.",
    );
  }
}

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const files = args.filter((a) => !a.startsWith('--'));
if (files.length === 0) {
  console.error('usage: node scripts/verify_citations.mjs [--quiet] record.json [...]');
  process.exit(2);
}
for (const file of files) {
  try {
    await check(file, quiet);
  } catch (e) {
    failed = true;
    console.log(`\n=== ${file} ===\n  [ERROR] ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
