/**
 * Generate HookOS app icons + bootsplash logo from the hex-hook brand glyph.
 * One-off branding tool. Run: node scripts/gen-hookos-icons.mjs
 * Requires `sharp` (already in node_modules).
 *
 * Brand tokens (src/features/hookos/ui/theme.ts):
 *   paper #f1f2ec · acid #38e07b · acidInk #0c8a42 · ink #0d100c
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAPER = '#f1f2ec';
const ACID = '#38e07b';
const ACID_INK = '#0c8a42';

/**
 * Glyph paths are authored in the original 26x26 space (from HexHookGlyph.tsx)
 * and placed via a transform so we control scale/padding per output.
 * `mark` = filled acidInk hexagon + knockout hook (for opaque icons on paper).
 */
function glyphGroup({ scale, hook = PAPER, hex = ACID_INK }) {
  return `
    <g transform="translate(512,512) scale(${scale}) translate(-13,-13)">
      <path d="M13 2.5 L22 7.5 L22 18.5 L13 23.5 L4 18.5 L4 7.5 Z" fill="${hex}"/>
      <path d="M9.5 11 Q9.5 15.5 13 15.5 Q16.5 15.5 16.5 11 Q16.5 8.4 14 8.4"
            stroke="${hook}" stroke-width="1.6" fill="none" stroke-linecap="round"
            transform="translate(13,13) scale(1) translate(-13,-13)"/>
    </g>`;
}

/** Opaque square icon: paper background + mark. viewBox 1024. */
function iconSvg({ scale = 33 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="${PAPER}"/>
    ${glyphGroup({ scale })}
  </svg>`;
}

/** Adaptive foreground: transparent, glyph kept inside the center safe zone (smaller scale). */
function adaptiveForegroundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${glyphGroup({ scale: 22 })}
  </svg>`;
}

/** Adaptive background: solid paper. */
function solidSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="${color}"/></svg>`;
}

/** Bootsplash logo: transparent, acid hexagon outline + hook (shows on paper splash). */
function bootsplashSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <g transform="translate(512,512) scale(30) translate(-13,-13)">
      <path d="M13 2.5 L22 7.5 L22 18.5 L13 23.5 L4 18.5 L4 7.5 Z" fill="rgba(56,224,123,0.14)" stroke="${ACID_INK}" stroke-width="1.4"/>
      <path d="M9.5 11 Q9.5 15.5 13 15.5 Q16.5 15.5 16.5 11 Q16.5 8.4 14 8.4" stroke="${ACID_INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

async function render(svg, size, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log('  ✓', outPath.replace(ROOT + '/', '').replace(ROOT + '\\', ''), `(${size}px)`);
}

const MIPMAP = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

async function main() {
  // ---------- iOS AppIcon (single 1024, modern Xcode single-size set) ----------
  console.log('iOS AppIcon:');
  const iosDir = join(ROOT, 'ios/Rainbow/Images.xcassets/AppIcon.appiconset');
  await render(iconSvg(), 1024, join(iosDir, 'Icon-1024.png'));
  writeFileSync(
    join(iosDir, 'Contents.json'),
    JSON.stringify(
      {
        images: [{ filename: 'Icon-1024.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2
    ) + '\n'
  );
  console.log('  ✓ Contents.json');

  // ---------- Android default launcher (og) ----------
  console.log('Android launcher (og / og_round):');
  for (const [dpi, m] of Object.entries(MIPMAP)) {
    const sq = Math.round(48 * m);
    await render(iconSvg(), sq, join(ROOT, `android/app/src/main/res/mipmap-${dpi}/og.png`));
    await render(iconSvg(), sq, join(ROOT, `android/app/src/main/res/mipmap-${dpi}/og_round.png`));
  }

  // ---------- Android adaptive layers (og_foreground / og_background) ----------
  console.log('Android adaptive layers:');
  for (const [dpi, m] of Object.entries(MIPMAP)) {
    const ad = Math.round(108 * m);
    await render(adaptiveForegroundSvg(), ad, join(ROOT, `android/app/src/main/res/mipmap-${dpi}/og_foreground.png`));
    await render(solidSvg(PAPER), ad, join(ROOT, `android/app/src/main/res/mipmap-${dpi}/og_background.png`));
  }

  // ---------- Bootsplash logo ----------
  console.log('Bootsplash logo:');
  for (const [dpi, m] of Object.entries(MIPMAP)) {
    const sz = Math.round(120 * m);
    await render(bootsplashSvg(), sz, join(ROOT, `android/app/src/main/res/mipmap-${dpi}/bootsplash_logo.png`));
  }

  console.log('\nDone.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
