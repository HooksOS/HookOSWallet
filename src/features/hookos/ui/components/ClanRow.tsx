import { memo, useMemo } from 'react';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookosClan } from '@/features/hookos/core/types';
import { opacity } from '@/framework/ui/utils/opacity';

type ClanRowProps = {
  clan: HookosClan;
  onPress: (clan: HookosClan) => void;
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const StatusBadge = memo(function StatusBadge({ active }: { active: boolean }) {
  const green = useForegroundColor('green');
  const labelTertiary = useForegroundColor('labelTertiary');
  const color = active ? green : labelTertiary;
  return (
    <Box
      alignItems="center"
      borderRadius={8}
      height={{ custom: 20 }}
      justifyContent="center"
      paddingHorizontal="6px"
      style={{ backgroundColor: opacity(color, 0.14) }}
    >
      <Text align="center" color={{ custom: color }} size="11pt" weight="heavy">
        {active ? 'Active' : 'Inactive'}
      </Text>
    </Box>
  );
});

/** A single row in the Clans list: name/tag, member count, leader, volume. */
export const ClanRow = memo(function ClanRow({ clan, onPress }: ClanRowProps) {
  const title = clan.tag ? `[${clan.tag}] ${clan.name}` : clan.name || `Clan #${clan.clanId}`;
  const volumeLabel = useMemo(
    () => `${Number(formatEther(clan.totalVolume)).toLocaleString('en-US', { maximumFractionDigits: 2 })} ETH vol`,
    [clan.totalVolume]
  );

  return (
    <ButtonPressAnimation onPress={() => onPress(clan)} scaleTo={0.96}>
      <Box gap={8} paddingHorizontal="20px" paddingVertical="12px">
        <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
          <Box flexShrink={1}>
            <Stack space="4px">
              <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
                {title}
              </Text>
              <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                {`${clan.memberCount} members`}
              </Text>
            </Stack>
          </Box>
          <StatusBadge active={clan.active} />
        </Box>
        <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
          <Text color="labelQuaternary" size="13pt" weight="bold">
            {`Leader ${truncateAddress(clan.leader)}`}
          </Text>
          <Text color="labelSecondary" size="13pt" weight="bold">
            {volumeLabel}
          </Text>
        </Box>
      </Box>
    </ButtonPressAnimation>
  );
});
