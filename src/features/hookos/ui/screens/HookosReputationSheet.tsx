import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Address } from 'viem';

import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useColorMode, useForegroundColor } from '@/design-system';
import { ZERO_ADDRESS } from '@/features/hookos/core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type ReputationLeaderboardEntry } from '@/features/hookos/core/types';
import { useReputationStore } from '@/features/hookos/data/gamification/reputationStore';
import { ReputationRankBadge } from '@/features/hookos/ui/components/ReputationRankBadge';
import { opacity } from '@/framework/ui/utils/opacity';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

function toBreakdownEntries(breakdown: {
  trade: bigint;
  launch: bigint;
  quest: bigint;
  clan: bigint;
  referral: bigint;
  creator: bigint;
  ambassador: bigint;
  governance: bigint;
  custom: bigint;
}): Array<{ label: string; value: bigint }> {
  return [
    { label: 'Trading', value: breakdown.trade },
    { label: 'Launches', value: breakdown.launch },
    { label: 'Quests', value: breakdown.quest },
    { label: 'Clans', value: breakdown.clan },
    { label: 'Referrals', value: breakdown.referral },
    { label: 'Creator', value: breakdown.creator },
    { label: 'Ambassador', value: breakdown.ambassador },
    { label: 'Governance', value: breakdown.governance },
    { label: 'Custom', value: breakdown.custom },
  ];
}

function formatScore(value: bigint): string {
  return Number(value).toLocaleString('en-US');
}

function truncateAddress(address: Address): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const BreakdownBar = memo(function BreakdownBar({ label, value, max }: { label: string; value: bigint; max: bigint }) {
  const { isDarkMode } = useColorMode();
  const green = useForegroundColor('green');
  const trackColor = isDarkMode ? opacity('#FFFFFF', 0.08) : opacity('#000000', 0.06);
  const ratio = max > 0n ? Number(value) / Number(max) : 0;

  return (
    <Box gap={6}>
      <Box alignItems="center" flexDirection="row" justifyContent="space-between">
        <Text color="labelSecondary" size="13pt" weight="semibold">
          {label}
        </Text>
        <Text color="labelTertiary" size="13pt" weight="bold">
          {formatScore(value)}
        </Text>
      </Box>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View style={[styles.fill, { backgroundColor: green, width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
      </View>
    </Box>
  );
});

const LeaderboardRow = memo(function LeaderboardRow({ entry, place }: { entry: ReputationLeaderboardEntry; place: number }) {
  return (
    <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
      <Box alignItems="center" flexDirection="row" gap={12} flexShrink={1}>
        <Text color="labelTertiary" size="15pt" weight="heavy">
          {`${place}`}
        </Text>
        <Text color="label" size="15pt" weight="semibold">
          {truncateAddress(entry.address)}
        </Text>
      </Box>
      <Box alignItems="center" flexDirection="row" gap={10}>
        <Text color="labelSecondary" size="15pt" weight="bold">
          {formatScore(entry.score)}
        </Text>
        <ReputationRankBadge rank={entry.rank} />
      </Box>
    </Box>
  );
});

export const HookosReputationSheet = memo(function HookosReputationSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_REPUTATION_SHEET>();
  const address = (params?.address as Address | undefined) ?? ZERO_ADDRESS;
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;

  const profile = useReputationStore(state => state.getProfile());
  const leaderboard = useReputationStore(state => state.getLeaderboard());

  useEffect(() => {
    useReputationStore.getState().fetch({ chainId, address });
  }, [chainId, address]);

  const breakdownEntries = useMemo(() => (profile ? toBreakdownEntries(profile.breakdown) : []), [profile]);
  const maxBreakdown = useMemo(
    () => breakdownEntries.reduce((acc, entry) => (entry.value > acc ? entry.value : acc), 0n),
    [breakdownEntries]
  );

  const hasProfile = profile !== null && profile.initialized;

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Text color="label" size="22pt" weight="heavy">
            {'Reputation'}
          </Text>

          {/* Connected wallet's score + rank. */}
          {hasProfile ? (
            <Stack space="20px">
              <Box alignItems="center" flexDirection="row" justifyContent="space-between">
                <Stack space="6px">
                  <Text color="labelTertiary" size="13pt" weight="bold">
                    {'Your score'}
                  </Text>
                  <Text color="label" size="34pt" weight="heavy">
                    {formatScore(profile.totalScore)}
                  </Text>
                </Stack>
                <ReputationRankBadge rank={profile.rank} size="large" />
              </Box>

              <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

              <Stack space="12px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'Score breakdown'}
                </Text>
                <Stack space="12px">
                  {breakdownEntries.map(entry => (
                    <BreakdownBar key={entry.label} label={entry.label} max={maxBreakdown} value={entry.value} />
                  ))}
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <Box paddingVertical="12px">
              <Text color="labelTertiary" size="15pt" weight="semibold">
                {address === ZERO_ADDRESS
                  ? 'Connect a wallet to see your HookOS reputation.'
                  : 'No reputation yet — trade, launch, and complete quests to earn score.'}
              </Text>
            </Box>
          )}

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          {/* Leaderboard (independent of the connected wallet). */}
          <Stack space="16px">
            <Text color="labelTertiary" size="13pt" weight="bold">
              {'Leaderboard'}
            </Text>
            {leaderboard.length === 0 ? (
              <Text color="labelQuaternary" size="15pt" weight="medium">
                {'No ranked wallets yet.'}
              </Text>
            ) : (
              <Stack separator={<Separator color="separatorTertiary" direction="horizontal" thickness={1} />} space="12px">
                {leaderboard.map((entry, i) => (
                  <LeaderboardRow entry={entry} key={`${entry.address}-${i}`} place={i + 1} />
                ))}
              </Stack>
            )}
          </Stack>
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
