import { memo, useMemo } from 'react';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Text, useForegroundColor } from '@/design-system';
import { type Battle, BattleStatus } from '@/features/hookos/core/types';
import { opacity } from '@/framework/ui/utils/opacity';

type BattleRowProps = {
  battle: Battle;
  onPress: (battle: Battle) => void;
};

const STATUS_LABEL: Record<BattleStatus, string> = {
  [BattleStatus.Open]: 'Open',
  [BattleStatus.Active]: 'Active',
  [BattleStatus.Settled]: 'Settled',
  [BattleStatus.Cancelled]: 'Cancelled',
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const StatusBadge = memo(function StatusBadge({ status }: { status: BattleStatus }) {
  const green = useForegroundColor('green');
  const labelTertiary = useForegroundColor('labelTertiary');
  const live = status === BattleStatus.Open || status === BattleStatus.Active;
  const color = live ? green : labelTertiary;
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
        {STATUS_LABEL[status]}
      </Text>
    </Box>
  );
});

/** A single row in the Arena list: tokenA vs tokenB, pot, status. */
export const BattleRow = memo(function BattleRow({ battle, onPress }: BattleRowProps) {
  const potLabel = useMemo(
    () => `${Number(formatEther(battle.pot)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`,
    [battle.pot]
  );

  return (
    <ButtonPressAnimation onPress={() => onPress(battle)} scaleTo={0.96}>
      <Box gap={8} paddingHorizontal="20px" paddingVertical="12px">
        <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
          <Box flexShrink={1}>
            <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
              {`${truncateAddress(battle.tokenA)} vs ${truncateAddress(battle.tokenB)}`}
            </Text>
          </Box>
          <StatusBadge status={battle.status} />
        </Box>
        <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
          <Text color="labelTertiary" size="13pt" weight="semibold">
            {`Round ${battle.round} · ${battle.wagerCount} wagers`}
          </Text>
          <Text color="labelSecondary" size="13pt" weight="bold">
            {potLabel}
          </Text>
        </Box>
      </Box>
    </ButtonPressAnimation>
  );
});
