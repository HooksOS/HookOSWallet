import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { ImgixImage } from '@/components/images';
import { Box, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookToken } from '@/features/hookos/core/types';
import { BondingCurveProgressBar } from '@/features/hookos/ui/components/BondingCurveProgressBar';

const ICON_SIZE = 40;

type HookTokenRowProps = {
  token: HookToken;
  onPress: (token: HookToken) => void;
};

function GraduatedBadge() {
  const green = useForegroundColor('green');
  return (
    <Box
      alignItems="center"
      borderRadius={8}
      height={{ custom: 20 }}
      justifyContent="center"
      paddingHorizontal="6px"
      style={{ backgroundColor: green }}
    >
      <Text align="center" color="label" size="11pt" weight="heavy">
        {'Graduated'}
      </Text>
    </Box>
  );
}

/** A single row in the HookOS tokens list: icon, name/symbol, price, progress bar, graduated badge. */
export const HookTokenRow = memo(function HookTokenRow({ token, onPress }: HookTokenRowProps) {
  const fallbackColor = useForegroundColor('fillSecondary');

  const priceLabel = useMemo(() => (token.priceEth ? `${token.priceEth} ETH` : '—'), [token.priceEth]);
  const progressPercent = useMemo(() => `${Math.round(Math.max(0, Math.min(1, token.progress)) * 100)}%`, [token.progress]);

  return (
    <ButtonPressAnimation onPress={() => onPress(token)} scaleTo={0.96}>
      <Box alignItems="center" flexDirection="row" gap={12} paddingHorizontal="20px" paddingVertical="12px">
        <View style={styles.iconContainer}>
          {token.imageUrl ? (
            <ImgixImage enableFasterImage size={ICON_SIZE} source={{ uri: token.imageUrl }} style={styles.icon} />
          ) : (
            <View style={[styles.icon, styles.iconFallback, { backgroundColor: fallbackColor }]}>
              <Text align="center" color="label" size="13pt" weight="heavy">
                {token.symbol.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Box flexGrow={1} flexShrink={1}>
          <Stack space="8px">
            <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
              <Box flexShrink={1}>
                <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
                  {token.name}
                </Text>
                <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                  {token.symbol}
                </Text>
              </Box>
              <Box alignItems="flex-end">
                <Text align="right" color="labelSecondary" numberOfLines={1} size="15pt" weight="bold">
                  {priceLabel}
                </Text>
                {token.graduated && (
                  <Box paddingTop="4px">
                    <GraduatedBadge />
                  </Box>
                )}
              </Box>
            </Box>

            <Box alignItems="center" flexDirection="row" gap={8}>
              <Box flexGrow={1} flexShrink={1}>
                <BondingCurveProgressBar graduated={token.graduated} progress={token.progress} />
              </Box>
              <Text color="labelQuaternary" size="11pt" weight="bold">
                {token.graduated ? '100%' : progressPercent}
              </Text>
            </Box>
          </Stack>
        </Box>
      </Box>
    </ButtonPressAnimation>
  );
});

const styles = StyleSheet.create({
  icon: {
    borderRadius: ICON_SIZE / 2,
    height: ICON_SIZE,
    width: ICON_SIZE,
  },
  iconContainer: {
    borderRadius: ICON_SIZE / 2,
    height: ICON_SIZE,
    overflow: 'hidden',
    width: ICON_SIZE,
  },
  iconFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
