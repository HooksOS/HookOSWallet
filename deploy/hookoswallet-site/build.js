/* Build the HookOS Wallet apex landing.
 *
 * Compiles the editable JSX in src/ into a single production bundle at www/landing.js
 * (no runtime Babel — the browser only loads React + the compiled bundle).
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

const core = fs.readFileSync(path.join(SRC, 'landing-core.jsx'), 'utf8');
const more = fs.readFileSync(path.join(SRC, 'landing-more.jsx'), 'utf8');

// Page wrapper: mounts the 15 sections in order into #root.
const wrapper = `
/* ---- page wrapper ---- */
function LandingPage() {
  return (
    <div data-screen-label="HookOS Wallet">
      <LTopbar></LTopbar>
      <LTicker></LTicker>
      <LndHero></LndHero>
      <LaunchOnX></LaunchOnX>
      <HowItWorks></HowItWorks>
      <SixWeapons></SixWeapons>
      <ProtocolPulse></ProtocolPulse>
      <RevenueSplits></RevenueSplits>
      <Gamification></Gamification>
      <WalletOS></WalletOS>
      <CreatorEconomy></CreatorEconomy>
      <MultiChain></MultiChain>
      <TrendingTokens></TrendingTokens>
      <BottomCTA></BottomCTA>
      <LFooter></LFooter>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<LandingPage></LandingPage>);
`;

const source = `(function(){\n${core}\n${more}\n${wrapper}\n})();`;

const { code } = babel.transformSync(source, {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  compact: false,
  comments: false,
  babelrc: false,
  configFile: false,
});

fs.writeFileSync(path.join(OUT_DIR, 'landing.js'), code, 'utf8');
console.log('wrote www/landing.js (' + code.length + ' bytes)');
