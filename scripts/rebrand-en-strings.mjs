/**
 * One-off: rebrand user-facing "Rainbow" -> "HookOS" in the English localization source.
 * Guarded: skips lines that are genuine must-keeps (Rainbow-as-external-wallet examples,
 * Rainbow×partner app-icon collab names, and Rainbow's own token/airdrop product names).
 * Only capitalized "Rainbow" is touched, so lowercase JSON keys (rainbow_fee, ...) are safe.
 * Run: node scripts/rebrand-en-strings.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src/languages/en_US.json');

// 1-indexed lines to LEAVE unchanged (keep "Rainbow"):
const SKIP_RANGES = [[941, 970]]; // alternate app-icon collab names (Rainbow×partner art)
const SKIP_LINES = new Set([
  1912, // "Rainbow users claimed" — Rainbow's rewards product
  2786, // "...Secret Phrase from Rainbow, MetaMask, or another wallet" — import FROM example
  2800, // "...private key from Rainbow or another crypto wallet" — import FROM example
  3216, // "Claim Rainbow Coins" — Rainbow token product
  3438, // "Rainbow Token" — Rainbow token product
  3449, // airdrop calc — Rainbow's airdrop product
]);

const skip = n => SKIP_LINES.has(n) || SKIP_RANGES.some(([a, b]) => n >= a && n <= b);

const lines = readFileSync(FILE, 'utf8').split('\n');
let changed = 0;
const touched = [];
const out = lines.map((line, i) => {
  const n = i + 1;
  if (skip(n) || !line.includes('Rainbow')) return line;
  const next = line.replace(/Rainbow/g, 'HookOS');
  if (next !== line) {
    changed++;
    touched.push(n);
  }
  return next;
});

writeFileSync(FILE, out.join('\n'));
console.log(`Rebranded ${changed} lines in en_US.json`);
console.log('Lines changed:', touched.join(', '));
console.log(
  'Skipped (kept "Rainbow"):',
  [...SKIP_LINES].sort((a, b) => a - b).join(', '),
  '+ range 941-970'
);
