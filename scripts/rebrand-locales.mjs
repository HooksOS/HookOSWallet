/**
 * One-off: rebrand user-facing "Rainbow" -> "HookOS" across the NON-English locale files.
 * Guards (keep "Rainbow") are content/key based so they work regardless of line numbers:
 *   1. app-icon collab names (key in ICON_KEYS) — Rainbow×partner art
 *   2. Rainbow's own token/airdrop product (key in PRODUCT_KEYS, or value has "Rainbow Coins")
 *   3. "import FROM Rainbow, MetaMask, ..." examples (Rainbow adjacent to MetaMask)
 * Only capitalized "Rainbow" is touched, so lowercase JSON keys stay intact.
 * Run: node scripts/rebrand-locales.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'src/languages');

const ICON_KEYS = new Set([
  'smol_description', 'smol_title', 'optimism_description', 'optimism_title', 'zora_description', 'zora_title',
  'finiliar_description', 'finiliar_title', 'golddoge_description', 'golddoge_title', 'raindoge_description',
  'raindoge_title', 'pooly_description', 'pooly_title', 'zorb_description', 'zorb_title', 'poolboy_description',
  'poolboy_title', 'adworld_description', 'adworld_title', 'farcaster_description', 'farcaster_title',
  'redacted_description', 'redacted_title', 'baggy_description', 'baggy_title', 'chonks_description',
  'chonks_title', 'mog_description', 'mog_title', 'rnbw_description', 'rnbw_title',
]);
const PRODUCT_KEYS = new Set(['rainbow_users_claimed', 'rainbow_token', 'your_airdrop_description']);

const keyOf = line => {
  const m = line.match(/^\s*"([a-zA-Z0-9_]+)"\s*:/);
  return m ? m[1] : null;
};
const isException = line => {
  const k = keyOf(line);
  if (k && (ICON_KEYS.has(k) || PRODUCT_KEYS.has(k))) return true;
  if (/Rainbow.{0,8}MetaMask/.test(line)) return true; // import-FROM example
  if (line.includes('Rainbow Coins')) return true; // "Claim Rainbow Coins" product
  return false;
};

const files = readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'en_US.json');
let grand = 0;
for (const f of files) {
  const path = join(DIR, f);
  const lines = readFileSync(path, 'utf8').split('\n');
  let changed = 0;
  const out = lines.map(line => {
    if (!line.includes('Rainbow') || isException(line)) return line;
    const next = line.replace(/Rainbow/g, 'HookOS');
    if (next !== line) changed++;
    return next;
  });
  const text = out.join('\n');
  JSON.parse(text); // throws if we broke it
  writeFileSync(path, text);
  grand += changed;
  console.log(`${f}: ${changed} lines rebranded`);
}
console.log(`\nTotal: ${grand} lines across ${files.length} locale files. All valid JSON.`);
