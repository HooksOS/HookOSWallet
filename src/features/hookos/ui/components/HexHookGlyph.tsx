import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { HOOKOS_COLORS } from '../theme';

interface HexHookGlyphProps {
  size?: number;
  /** Draw the rounded paper backplate (icon style). Off = bare glyph. */
  withBackplate?: boolean;
  /** Stroke color for the hexagon + hook. Defaults to brand acidInk. */
  color?: string;
}

/**
 * The HookOS hexagon-hook brand mark, ported 1:1 from the handoff-pro prototype favicon
 * (`handoff-pro/prototype/HookOS Pro.html`). A hexagon (the "market") with a hook curve inside.
 */
export function HexHookGlyph({ size = 26, withBackplate = true, color = HOOKOS_COLORS.acidInk }: HexHookGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      {withBackplate && <Rect width={26} height={26} rx={6} fill={HOOKOS_COLORS.paper} />}
      <Path
        d="M13 2.5 L22 7.5 L22 18.5 L13 23.5 L4 18.5 L4 7.5 Z"
        stroke={color}
        strokeWidth={1.8}
        fill={HOOKOS_COLORS.acidBg}
      />
      <Path
        d="M9.5 11 Q9.5 15.5 13 15.5 Q16.5 15.5 16.5 11 Q16.5 8.4 14 8.4"
        stroke={color}
        strokeWidth={1.7}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
