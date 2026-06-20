import { memo } from 'react';
import { Alert } from 'react-native';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { type Battle, BattleSide, BattleStatus } from '@/features/hookos/core/types';
import { useArenaStore } from '@/features/hookos/data/protocol/arenaStore';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

const STATUS_LABEL: Record<BattleStatus, string> = {
  [BattleStatus.Open]: 'Open',
  [BattleStatus.Active]: 'Active',
  [BattleStatus.Settled]: 'Settled',
  [BattleStatus.Cancelled]: 'Cancelled',
};

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

export const HookosBattleDetailSheet = memo(function HookosBattleDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_BATTLE_DETAIL_SHEET>();
  const battleId = params.battleId;

  const green = useForegroundColor('green');
  const battle: Battle | null = useArenaStore(state => state.getBattle(battleId));

  const handleWager = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Place wager', 'Wagering is not wired to signing yet.');
  };

  if (!battle) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'Battle not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  const settled = battle.status === BattleStatus.Settled;
  const canWager = battle.status === BattleStatus.Open || battle.status === BattleStatus.Active;
  const winnerLabel = settled ? (battle.winner === BattleSide.TeamA ? 'Team A' : 'Team B') : '—';

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Stack space="6px">
            <Text color="label" size="22pt" weight="heavy">
              {`Battle #${battle.battleId}`}
            </Text>
            <Text color="labelTertiary" size="13pt" weight="semibold">
              {`${STATUS_LABEL[battle.status]} · Round ${battle.round}`}
            </Text>
          </Stack>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Total pot" value={formatEth(battle.pot)} />
            <StatRow label="Team A pot" value={formatEth(battle.teamAPot)} />
            <StatRow label="Team B pot" value={formatEth(battle.teamBPot)} />
            <StatRow label="Wagers" value={`${battle.wagerCount}`} />
            <StatRow label="Min wager" value={formatEth(battle.minWager)} />
            <StatRow label="Winner" value={winnerLabel} />
            <StatRow label="Token A" value={truncateAddress(battle.tokenA)} />
            <StatRow label="Token B" value={truncateAddress(battle.tokenB)} />
          </Stack>

          {canWager && (
            <ButtonPressAnimation onPress={handleWager} scaleTo={0.96}>
              <Box
                alignItems="center"
                borderRadius={12}
                height={{ custom: 52 }}
                justifyContent="center"
                style={{ backgroundColor: green }}
              >
                <Text align="center" color="label" size="17pt" weight="heavy">
                  {'Place wager'}
                </Text>
              </Box>
            </ButtonPressAnimation>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});
