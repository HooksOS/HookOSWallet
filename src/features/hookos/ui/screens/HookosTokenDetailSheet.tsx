import { memo, useCallback, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { type Address } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { ImgixImage } from '@/components/images';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { useHookosTokensStore } from '@/features/hookos/data/protocol/hookosTokensStore';
import { BondingCurveProgressBar } from '@/features/hookos/ui/components/BondingCurveProgressBar';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

const ICON_SIZE = 56;

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
      <Text color="labelTertiary" size="15pt" weight="semibold">
        {label}
      </Text>
      <Box flexShrink={1}>
        <Text align="right" color="label" numberOfLines={1} size="15pt" weight="bold">
          {value}
        </Text>
      </Box>
    </Box>
  );
}

function ActionButton({
  label,
  color,
  onPress,
  testID,
}: {
  label: string;
  color: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <ButtonPressAnimation onPress={onPress} scaleTo={0.94} style={styles.actionButtonWrapper} testID={testID}>
      <Box alignItems="center" height={{ custom: 52 }} justifyContent="center" style={[styles.actionButton, { backgroundColor: color }]}>
        <Text align="center" color="label" size="20pt" weight="heavy">
          {label}
        </Text>
      </Box>
    </ButtonPressAnimation>
  );
}

export const HookosTokenDetailSheet = memo(function HookosTokenDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_TOKEN_DETAIL_SHEET>();
  const green = useForegroundColor('green');
  const red = useForegroundColor('red');
  const fallbackColor = useForegroundColor('fillSecondary');

  // Reads are real: pull the token straight from the protocol query store.
  const token = useHookosTokensStore(state => state.getToken(params.address as Address));

  const handleBuy = useCallback(() => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Buy', token ? `Buying ${token.symbol} is not wired up yet.` : 'Token unavailable.');
  }, [token]);

  const handleSell = useCallback(() => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Sell', token ? `Selling ${token.symbol} is not wired up yet.` : 'Token unavailable.');
  }, [token]);

  const progressPercent = useMemo(
    () => (token ? `${Math.round(Math.max(0, Math.min(1, token.progress)) * 100)}%` : '—'),
    [token]
  );

  if (!token) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'Token not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Box alignItems="center" flexDirection="row" gap={14}>
            <View style={styles.iconContainer}>
              {token.imageUrl ? (
                <ImgixImage enableFasterImage size={ICON_SIZE} source={{ uri: token.imageUrl }} style={styles.icon} />
              ) : (
                <View style={[styles.icon, styles.iconFallback, { backgroundColor: fallbackColor }]}>
                  <Text align="center" color="label" size="17pt" weight="heavy">
                    {token.symbol.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Box flexShrink={1}>
              <Text color="label" numberOfLines={1} size="22pt" weight="heavy">
                {token.name}
              </Text>
              <Text color="labelTertiary" numberOfLines={1} size="15pt" weight="semibold">
                {token.symbol}
              </Text>
            </Box>
          </Box>

          <Stack space="10px">
            <BondingCurveProgressBar graduated={token.graduated} height={8} progress={token.progress} />
            <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
              <Text color="labelQuaternary" size="13pt" weight="bold">
                {token.graduated ? 'Graduated' : 'Bonding curve'}
              </Text>
              <Text color="labelSecondary" size="13pt" weight="bold">
                {token.graduated ? '100%' : progressPercent}
              </Text>
            </Box>
          </Stack>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Price" value={token.priceEth ? `${token.priceEth} ETH` : '—'} />
            <StatRow label="Market cap" value={token.marketCapEth ? `${token.marketCapEth} ETH` : '—'} />
            <StatRow label="Creator" value={truncateAddress(token.creator)} />
          </Stack>

          <Box alignItems="center" flexDirection="row" gap={12}>
            <ActionButton color={green} label="Buy" onPress={handleBuy} testID="hookos-token-detail-buy" />
            <ActionButton color={red} label="Sell" onPress={handleSell} testID="hookos-token-detail-sell" />
          </Box>
        </Stack>
      </Box>
    </PanelSheet>
  );
});

const styles = StyleSheet.create({
  actionButton: {
    borderCurve: 'continuous',
    borderRadius: 22,
    width: '100%',
  },
  actionButtonWrapper: {
    flex: 1,
  },
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
