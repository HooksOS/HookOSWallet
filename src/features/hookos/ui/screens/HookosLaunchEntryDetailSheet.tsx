import { memo, useEffect } from 'react';
import { type Address, formatEther } from 'viem';

import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text } from '@/design-system';
import { type HookosChainId } from '@/features/hookos/core/chains';
import { type LaunchWarsEntry } from '@/features/hookos/core/types';
import { useLaunchEntryStore } from '@/features/hookos/data/gamification/launchEntryStore';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

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

export const HookosLaunchEntryDetailSheet = memo(function HookosLaunchEntryDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_LAUNCH_ENTRY_DETAIL_SHEET>();
  const chainId = params.chainId as HookosChainId;
  const seasonId = params.seasonId;
  const token = params.token as Address;

  const entry: LaunchWarsEntry | null = useLaunchEntryStore(state => state.getEntry());

  useEffect(() => {
    useLaunchEntryStore.getState().fetch({ chainId, seasonId, token });
  }, [chainId, seasonId, token]);

  if (!entry) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'Entry not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Stack space="6px">
            <Text color="label" numberOfLines={1} size="22pt" weight="heavy">
              {truncateAddress(entry.token)}
            </Text>
            <Text color="labelTertiary" size="13pt" weight="semibold">
              {entry.registered ? `Rank #${entry.rank}` : 'Unregistered'}
            </Text>
          </Stack>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Creator" value={truncateAddress(entry.creator)} />
            <StatRow label="Volume" value={formatEth(entry.volume)} />
            <StatRow label="TVL" value={formatEth(entry.tvl)} />
            <StatRow label="Holders" value={`${entry.holders}`} />
            <StatRow label="Hooks" value={`${entry.hookCount}`} />
            <StatRow label="Social score" value={Number(entry.socialScore).toLocaleString('en-US')} />
            <StatRow label="Composite score" value={Number(entry.compositeScore).toLocaleString('en-US')} />
          </Stack>
        </Stack>
      </Box>
    </PanelSheet>
  );
});
