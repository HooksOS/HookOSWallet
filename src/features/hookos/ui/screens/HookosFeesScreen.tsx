import { memo, useEffect, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type FeeShare } from '@/features/hookos/core/types';
import { useFeesStore } from '@/features/hookos/data/protocol/feesStore';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import safeAreaInsetValues from '@/utils/safeAreaInsetValues';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatEth(wei: bigint): string {
  const eth = Number(formatEther(wei));
  return `${eth.toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`;
}

const ShareRow = memo(function ShareRow({ share }: { share: FeeShare }) {
  return (
    <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
      <Box flexShrink={1}>
        <Stack space="4px">
          <Text color="label" numberOfLines={1} size="15pt" weight="bold">
            {share.label || truncateAddress(share.wallet)}
          </Text>
          <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
            {truncateAddress(share.wallet)}
          </Text>
        </Stack>
      </Box>
      <Text color="labelSecondary" size="15pt" weight="heavy">
        {`${(share.shareBps / 100).toFixed(share.shareBps % 100 === 0 ? 0 : 2)}%`}
      </Text>
    </Box>
  );
});

export const HookosFeesScreen = memo(function HookosFeesScreen() {
  const { params } = useRoute<typeof Routes.HOOKOS_FEES_SCREEN>();
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;

  const accent = useForegroundColor('green');
  const overview = useFeesStore(state => state.getOverview());
  const shares = useFeesStore(state => state.getShares());

  useEffect(() => {
    useFeesStore.getState().fetch({ chainId });
  }, [chainId]);

  const totalDistributedLabel = useMemo(() => (overview ? formatEth(overview.totalDistributed) : '—'), [overview]);
  const allocatedLabel = useMemo(
    () => (overview ? `${(overview.totalShareBps / 100).toFixed(0)}%` : '—'),
    [overview]
  );

  const handleDistribute = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Distribute fees', 'Fee distribution is not wired to signing yet.');
  };

  return (
    <Box background="surfacePrimary" style={[styles.container, { paddingTop: safeAreaInsetValues.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Stack space="24px">
          <Text color="label" size="26pt" weight="heavy">
            {'Fees'}
          </Text>

          <Box flexDirection="row" gap={12}>
            <Box flexGrow={1} flexShrink={1}>
              <Stack space="6px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'Total distributed'}
                </Text>
                <Text color="label" numberOfLines={1} size="22pt" weight="heavy">
                  {totalDistributedLabel}
                </Text>
              </Stack>
            </Box>
            <Box flexShrink={0}>
              <Stack space="6px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'Allocated'}
                </Text>
                <Text align="right" color="label" size="22pt" weight="heavy">
                  {allocatedLabel}
                </Text>
              </Stack>
            </Box>
          </Box>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="16px">
            <Text color="labelTertiary" size="13pt" weight="bold">
              {'Recipients'}
            </Text>
            {overview === null ? (
              <Text color="labelQuaternary" size="15pt" weight="medium">
                {'Loading…'}
              </Text>
            ) : shares.length === 0 ? (
              <Text color="labelQuaternary" size="15pt" weight="medium">
                {'No fee recipients configured.'}
              </Text>
            ) : (
              <Stack separator={<Separator color="separatorTertiary" direction="horizontal" thickness={1} />} space="12px">
                {shares.map((share, i) => (
                  <ShareRow key={`${share.wallet}-${i}`} share={share} />
                ))}
              </Stack>
            )}
          </Stack>

          <ButtonPressAnimation onPress={handleDistribute} scaleTo={0.96}>
            <Box
              alignItems="center"
              borderRadius={12}
              height={{ custom: 52 }}
              justifyContent="center"
              style={{ backgroundColor: accent }}
            >
              <Text align="center" color="label" size="17pt" weight="heavy">
                {'Distribute fees'}
              </Text>
            </Box>
          </ButtonPressAnimation>
        </Stack>
      </ScrollView>
    </Box>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: safeAreaInsetValues.bottom + 24,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
