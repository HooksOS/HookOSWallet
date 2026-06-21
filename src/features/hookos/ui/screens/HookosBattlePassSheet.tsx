import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Address, formatEther } from 'viem';

import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useColorMode, useForegroundColor } from '@/design-system';
import { ZERO_ADDRESS } from '@/features/hookos/core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { useBattlePassStore } from '@/features/hookos/data/gamification/battlePassStore';
import { opacity } from '@/framework/ui/utils/opacity';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

function formatEth(wei: bigint): string {
  return `${Number(formatEther(wei)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`;
}

const StatRow = memo(function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Box alignItems="center" flexDirection="row" justifyContent="space-between">
      <Text color="labelTertiary" size="15pt" weight="semibold">
        {label}
      </Text>
      <Text color="label" size="15pt" weight="bold">
        {value}
      </Text>
    </Box>
  );
});

export const HookosBattlePassSheet = memo(function HookosBattlePassSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_BATTLE_PASS_SHEET>();
  const address = (params?.address as Address | undefined) ?? ZERO_ADDRESS;
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;

  const { isDarkMode } = useColorMode();
  const green = useForegroundColor('green');
  const labelTertiary = useForegroundColor('labelTertiary');
  const trackColor = isDarkMode ? opacity('#FFFFFF', 0.08) : opacity('#000000', 0.06);

  const season = useBattlePassStore(state => state.getSeason());
  const progress = useBattlePassStore(state => state.getProgress());

  useEffect(() => {
    useBattlePassStore.getState().fetch({ chainId, address });
  }, [chainId, address]);

  const ratio = progress && progress.xpNeeded > 0n ? Number(progress.xpCurrent) / Number(progress.xpNeeded) : 0;

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Text color="label" size="22pt" weight="heavy">
            {'Battle Pass'}
          </Text>

          {/* Connected wallet's pass + XP progress. */}
          {progress?.hasPass ? (
            <Stack space="20px">
              <Box alignItems="center" flexDirection="row" justifyContent="space-between">
                <Text color="label" size="34pt" weight="heavy">
                  {`Tier ${progress.tier}`}
                </Text>
                <Box
                  alignItems="center"
                  borderRadius={8}
                  justifyContent="center"
                  paddingHorizontal="8px"
                  paddingVertical="4px"
                  style={{ backgroundColor: progress.isPro ? green : labelTertiary }}
                >
                  <Text color="label" size="13pt" weight="heavy">
                    {progress.isPro ? 'PRO' : 'FREE'}
                  </Text>
                </Box>
              </Box>

              <Box gap={6}>
                <View style={[styles.track, { backgroundColor: trackColor }]}>
                  <View style={[styles.fill, { backgroundColor: green, width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
                </View>
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {`${Number(progress.xpCurrent).toLocaleString('en-US')} / ${Number(progress.xpNeeded).toLocaleString('en-US')} XP`}
                </Text>
              </Box>

              <Stack space="12px">
                <StatRow label="Current streak" value={`${progress.currentStreak} days`} />
                <StatRow label="Longest streak" value={`${progress.longestStreak} days`} />
                <StatRow label="Streak multiplier" value={`${(progress.multiplierBps / 100).toFixed(2)}x`} />
              </Stack>
            </Stack>
          ) : (
            <Box paddingVertical="12px">
              <Text color="labelTertiary" size="15pt" weight="semibold">
                {address === ZERO_ADDRESS
                  ? 'Connect a wallet to see your Battle Pass.'
                  : 'No Battle Pass yet — mint a pass and earn XP to climb tiers.'}
              </Text>
            </Box>
          )}

          {season && (
            <>
              <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

              <Stack space="12px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'Season'}
                </Text>
                <Stack space="12px">
                  <StatRow label="Status" value={season.active ? 'Active' : 'Ended'} />
                  <StatRow label="Participants" value={`${season.totalParticipants}`} />
                  <StatRow label="Max tiers" value={`${season.maxTiers}`} />
                  <StatRow label="Prize pool" value={formatEth(season.totalPrizePool)} />
                  <StatRow label="Pro price" value={season.proPassPrice > 0n ? formatEth(season.proPassPrice) : 'Free'} />
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});

const styles = StyleSheet.create({
  fill: {
    height: '100%',
  },
  track: {
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
});
