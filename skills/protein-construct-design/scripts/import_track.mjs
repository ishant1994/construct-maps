#!/usr/bin/env node
/**
 * Attach a computed per-residue track to a design record.
 *
 * The computation script emits an intermediate artifact scored against a FASTA
 * sequence. Turning that into a ResidueTrack means asserting it describes a
 * particular variant, and that assertion is checked here rather than assumed:
 * the target variant's sequence must hash to exactly what was scored. Matching
 * lengths or identifiers are not enough, because both can coincide between two
 * different sequences.
 *
 *   node scripts/import_track.mjs record.json track.json variant-id [--chain id] [--track-id id]
 */
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import process from 'node:process';
import { parseArgs } from 'node:util';

/** The reserved chain id of a bare `sequence`, which has no chain of its own. */
const SINGLE_CHAIN = '_single';
const USAGE =
  'usage: import_track.mjs <record.json> <track.json> <variant-id> [--chain id] [--track-id id]';

// Strict, so a mistyped or dangling flag is an error and not an option that
// silently did nothing.
let parsed;
try {
  parsed = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: { chain: { type: 'string' }, 'track-id': { type: 'string' } },
  });
} catch (error) {
  console.error(`${error.message}\n${USAGE}`);
  process.exit(1);
}
if (parsed.positionals.length !== 3) {
  console.error(USAGE);
  process.exit(1);
}
const [recordPath, trackPath, variantId] = parsed.positionals;
const overrideId = parsed.values['track-id'];
const chainArg = parsed.values.chain;

const record = JSON.parse(await readFile(recordPath, 'utf8'));
const incoming = JSON.parse(await readFile(trackPath, 'utf8'));

const variant = (record.variants ?? []).find((v) => v.variant_id === variantId);
if (variant === undefined) {
  console.error(`No variant ${JSON.stringify(variantId)} in ${recordPath}.`);
  console.error(`Known: ${(record.variants ?? []).map((v) => v.variant_id).join(', ')}`);
  process.exit(2);
}

// The track belongs to ONE chain, so the hash covers that chain's sequence
// alone. A construct with several chains has no single sequence to hash, and a
// concatenation would make chain order part of verification while still
// letting a track pass while indexed against the wrong chain.
const chains = Array.isArray(variant.chains) && variant.chains.length > 0
  ? variant.chains
  : [{ chain_id: SINGLE_CHAIN, name: variant.name, sequence: variant.sequence }];
let chain;
if (chains.length === 1) {
  chain = chains[0];
  if (chainArg !== undefined && chainArg !== chain.chain_id) {
    console.error(`${JSON.stringify(variantId)} has one chain, ${JSON.stringify(chain.chain_id)}, `
      + `not ${JSON.stringify(chainArg)}.`);
    process.exit(2);
  }
} else {
  const wanted = chainArg ?? incoming.chain_id;
  chain = chains.find((c) => c.chain_id === wanted);
  if (chain === undefined) {
    console.error(`${JSON.stringify(variantId)} has ${chains.length} chains: `
      + `${chains.map((c) => c.chain_id).join(', ')}.`);
    console.error('A track is one value per residue of ONE chain, so name it with --chain.');
    console.error('A sequence hash cannot settle this: two chains may have identical sequences.');
    process.exit(2);
  }
}
if (chain.chain_id !== SINGLE_CHAIN) incoming.chain_id = chain.chain_id;

const actual = createHash('sha256').update(chain.sequence).digest('hex');
const expected = incoming.computed_against_sha256;
if (expected === undefined) {
  console.error(
    'The track carries no computed_against_sha256, so what it was scored against cannot be\n' +
      'checked. Recompute it with a version of the script that records the hash.',
  );
  process.exit(2);
}
if (actual !== expected) {
  console.error(`Refusing to import: the scores were not computed against ${variantId}.`);
  console.error(`  scored sequence : ${incoming.computed_against_sequence} ` +
                `(${incoming.computed_against_length} aa, sha256 ${expected.slice(0, 16)}...)`);
  console.error(`  ${(chain.chain_id === SINGLE_CHAIN ? variantId : `${variantId}:${chain.chain_id}`).padEnd(16)}: ${chain.sequence.length} aa, ` +
                `sha256 ${actual.slice(0, 16)}...`);
  console.error('\nValues indexed into the wrong sequence would mark the wrong residues.');
  process.exit(3);
}
if (incoming.values.length !== chain.sequence.length) {
  console.error(
    `The hash matches but there are ${incoming.values.length} values for ` +
      `${chain.sequence.length} residues. The track is malformed.`,
  );
  process.exit(3);
}

const track = { ...incoming, applies_to: variantId };
if (overrideId !== undefined) track.track_id = overrideId;
delete track.computed_against_sequence;
delete track.computed_against_length;
delete track.computed_against_sha256;
// The hash stays, as provenance rather than as a field the renderer reads.
track.method = { ...track.method, scored_sequence_sha256: expected };

const replaced = (record.tracks ?? []).some((t) => t.track_id === track.track_id);
record.tracks = (record.tracks ?? []).filter((t) => t.track_id !== track.track_id);
record.tracks.push(track);

// Written beside the record and renamed over it, so an interrupted run cannot
// leave a half-written record where a whole one was. The staging name cannot be
// guessed and the file is created exclusively, so a file or link planted at that
// name makes the write fail and is never written through.
const staging = `${recordPath}.${randomBytes(8).toString('hex')}.tmp`;
try {
  await writeFile(staging, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  await rename(staging, recordPath);
} catch (error) {
  await unlink(staging).catch(() => {});
  throw error;
}
const scored = track.values.filter((v) => v !== null).length;
console.log(`${replaced ? 'Replaced' : 'Imported'} ${track.track_id} onto ${variantId}.`);
console.log(`  sequence verified by sha256 (${chain.sequence.length} aa)`);
console.log(`  ${scored}/${track.values.length} positions carry a value`);
console.log(`  record now has ${record.tracks.length} track(s)`);
if (record.tracks.length > 1) {
  // The viewer paints one track at a time, and its colouring selector lists
  // every paintable track. Conservation computed over different comparison
  // sets shares no scale, so a record holding several needs a reader who knows
  // which set each came from.
  console.log(`  NOTE: all ${record.tracks.length} tracks are listed in the viewer's ` +
    '"Coloring scheme" selector. Tracks scored against different comparison sets share no ' +
    "scale, so each one's method has to be read before two are compared.");
}
