/* Build the HookOS Wallet apex landing.
 *
 * Compiles the editable JSX in src/landing.jsx into a single production bundle at www/landing.js
 * (no runtime Babel — the browser only loads React + the compiled bundle). The source self-mounts
 * into #root and fetches live data from the public HookOS indexer (api.hookos.fun).
 *
 * Run from the repo root so @babel/* resolves from the app's node_modules:
 *   NODE_PATH="$(pwd)/node_modules" node deploy/hookoswallet-site/build.js
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const SITE = __dirname;
const SRC = path.join(SITE, 'src');
const OUT_DIR = path.join(SITE, 'www');

const landing = fs.readFileSync(path.join(SRC, 'landing.jsx'), 'utf8');

// Wrap in an IIFE so top-level consts don't leak to the global scope.
const source = `(function(){\n${landing}\n})();`;

const { code } = babel.transformSync(source, {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  compact: false,
  comments: false,
  babelrc: false,
  configFile: false,
});

fs.writeFileSync(path.join(OUT_DIR, 'landing.js'), code, 'utf8');
console.log('wrote www/landing.js (' + code.length + ' bytes)');
