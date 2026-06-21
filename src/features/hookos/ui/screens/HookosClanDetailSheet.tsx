import { memo } from 'react';
import { Alert } from 'react-native';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookosClan } from '@/features/hookos/core/types';
import { useClansStore } from '@/features/hookos/data/gamification/clanStore';
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

export const HookosClanDetailSheet = memo(function HookosClanDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_CLAN_DETAIL_SHEET>();
  const clanId = params.clanId;

  const green = useForegroundColor('green');
  const clan: HookosClan | null = useClansStore(state => state.getClan(clanId));

  const handleJoin = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Join clan', 'Joining a clan is not wired to signing yet.');
  };

  if (!clan) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'Clan not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  const title = clan.tag ? `[${clan.tag}] ${clan.name}` : clan.name || `Clan #${clan.clanId}`;

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Stack space="6px">
            <Text color="label" numberOfLines={2} size="22pt" weight="heavy">
              {title}
            </Text>
            <Text color="labelTertiary" size="13pt" weight="semibold">
              {`${clan.active ? 'Active' : 'Inactive'} · ${clan.memberCount} members`}
            </Text>
          </Stack>

          {clan.description.length > 0 && (
            <Text color="labelSecondary" size="15pt" weight="medium">
              {clan.description}
            </Text>
          )}

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Leader" value={truncateAddress(clan.leader)} />
            <StatRow label="Members" value={`${clan.memberCount}`} />
            <StatRow label="Officers" value={`${clan.officerCount}`} />
            <StatRow label="Treasury" value={formatEth(clan.treasuryBalance)} />
            <StatRow label="Volume" value={formatEth(clan.totalVolume)} />
            <StatRow label="Launches" value={`${clan.totalLaunches}`} />
            <StatRow label="Clan XP" value={`${Number(clan.totalXP).toLocaleString('en-US')}`} />
          </Stack>

          {clan.active && (
            <ButtonPressAnimation onPress={handleJoin} scaleTo={0.96}>
              <Box
                alignItems="center"
                borderRadius={12}
                height={{ custom: 52 }}
                justifyContent="center"
                style={{ backgroundColor: green }}
              >
                <Text align="center" color="label" size="17pt" weight="heavy">
                  {'Join clan'}
                </Text>
              </Box>
            </ButtonPressAnimation>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});
