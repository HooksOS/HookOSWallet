import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useColorMode, useForegroundColor } from '@/design-system';
import { opacity } from '@/framework/ui/utils/opacity';

type BondingCurveProgressBarProps = {
  /** 0..1 progress toward graduation. */
  progress: number;
  /** Whether the token has graduated off the bonding curve. */
  graduated?: boolean;
  height?: number;
};

/** A compact horizontal bar showing bonding-curve progress toward graduation. */
export const BondingCurveProgressBar = memo(function BondingCurveProgressBar({
  progress,
  graduated = false,
  height = 6,
}: BondingCurveProgressBarProps) {
  const { isDarkMode } = useColorMode();
  const accent = useForegroundColor('blue');
  const green = useForegroundColor('green');

  const clamped = useMemo(() => Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0)), [progress]);
  const fillColor = graduated ? green : accent;
  const trackColor = isDarkMode ? opacity('#FFFFFF', 0.08) : opacity('#000000', 0.06);

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            borderRadius: height / 2,
            width: `${(graduated ? 1 : clamped) * 100}%`,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {
    height: '100%',
  },
  track: {
    overflow: 'hidden',
    width: '100%',
  },
});
