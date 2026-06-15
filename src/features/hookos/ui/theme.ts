/**
 * HookOS Pro brand tokens — "pump.fun × Bloomberg on Atlas Paper".
 *
 * Single source of truth ported from the handoff-pro design system
 * (`handoff-pro/HookOS-Pro-Design-System.md` + `prototype/pro-lib.jsx` object `P`).
 *
 * Usage rules (enforced by convention, not the type system):
 *  - Market data: `up` (green) for gains/buys, `down` (red) for losses/sells.
 *  - Brand-green TEXT and CTAs use `acidInk` — never `acid` on white.
 *  - `acid` is for fills / graphics / glows only.
 *  - `gold` only for premium / graduated / rank.
 */
export const HOOKOS_COLORS = {
  paper: '#f1f2ec', // app background
  paper2: '#e7e9e1', // wells, tracks, insets
  card: '#ffffff', // panels

  ink: '#0d100c',
  ink2: '#494c44',
  ink3: '#86887e',
  ink4: '#aeb0a6',

  up: '#0c9f52',
  upBg: 'rgba(12,159,82,0.10)',
  down: '#d23b30',
  downBg: 'rgba(210,59,48,0.09)',

  acid: '#38e07b', // fills / graphics / glows ONLY
  acidInk: '#0c8a42', // all green text + CTAs
  acidBg: 'rgba(56,224,123,0.12)',

  gold: '#bd8a0e', // premium · graduated · rank
  ice: '#2a7bb5', // Base · info · chains
  plasma: '#7a3dbd', // AI moments
} as const;

export type HookosColor = keyof typeof HOOKOS_COLORS;

export const HOOKOS_FONTS = {
  /** UI + headings. */
  sans: 'Inter',
  /** Every number, price, address, ticker. Tabular. */
  mono: 'JetBrainsMono',
} as const;

export const HOOKOS_RADII = {
  card: 14,
  button: 10,
  chip: 6,
} as const;

/** Brand metadata. */
export const HOOKOS_BRAND = {
  name: 'HookOS',
  tagline: 'Markets are now software.',
  site: 'hookos.fun',
  x: '@hookosfun',
  telegram: '@hookos_alpha',
  poweredBy: 'Powered by HookOS',
} as const;
