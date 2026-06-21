import { memo, useEffect } from 'react';
import { Alert } from 'react-native';
import { type Address, formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { ZERO_ADDRESS } from '@/features/hookos/core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { useStakingStore } from '@/features/hookos/data/gamification/stakingStore';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

function formatEth(wei: bigint): string {
  return `${Number(formatEther(wei)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`;
}

function formatHook(wei: bigint): string {
  return `${Number(formatEther(wei)).toLocaleString('en-US', { maximumFractionDigits: 4 })} HOOK`;
}

function formatDate(unix: number): string {
  return unix > 0 ? new Date(unix * 1000).toLocaleDateString('en-US') : '—';
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

export const HookosStakingSheet = memo(function HookosStakingSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_STAKING_SHEET>();
  const address = (params?.address as Address | undefined) ?? ZERO_ADDRESS;
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.megaeth;

  const green = useForegroundColor('green');
  const pool = useStakingStore(state => state.getPool());
  const position = useStakingStore(state => state.getPosition());

  useEffect(() => {
    useStakingStore.getState().fetch({ chainId, address });
  }, [chainId, address]);

  const handleClaim = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Claim rewards', 'Reward claiming is not wired to signing yet.');
  };

  const handleStake = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Stake', 'Staking is not wired to signing yet.');
  };

  const hasStake = position !== null && (position.staked > 0n || position.unbonding > 0n || position.pending > 0n);

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Text color="label" size="22pt" weight="heavy">
            {'Staking'}
          </Text>

          {/* Connected wallet's stake. */}
          {hasStake ? (
            <Stack space="20px">
              <Stack space="6px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'Staked'}
                </Text>
                <Text color="label" size="34pt" weight="heavy">
                  {formatHook(position.staked)}
                </Text>
              </Stack>

              <Stack space="12px">
                <StatRow label="Pending rewards" value={formatEth(position.pending)} />
                {position.unbonding > 0n && (
                  <>
                    <StatRow label="Unbonding" value={formatHook(position.unbonding)} />
                    <StatRow label="Unlocks" value={formatDate(position.unlockTime)} />
                  </>
                )}
              </Stack>

              {position.pending > 0n && (
                <ButtonPressAnimation onPress={handleClaim} scaleTo={0.96}>
                  <Box
                    alignItems="center"
                    borderRadius={12}
                    height={{ custom: 52 }}
                    justifyContent="center"
                    style={{ backgroundColor: green }}
                  >
                    <Text align="center" color="label" size="17pt" weight="heavy">
                      {'Claim rewards'}
                    </Text>
                  </Box>
                </ButtonPressAnimation>
              )}
            </Stack>
          ) : (
            <Stack space="16px">
              <Box paddingVertical="12px">
                <Text color="labelTertiary" size="15pt" weight="semibold">
                  {address === ZERO_ADDRESS
                    ? 'Connect a wallet to see your HOOK stake.'
                    : 'No active stake — stake HOOK to earn protocol fees.'}
                </Text>
              </Box>

              <ButtonPressAnimation onPress={handleStake} scaleTo={0.96}>
                <Box
                  alignItems="center"
                  borderRadius={12}
                  height={{ custom: 52 }}
                  justifyContent="center"
                  style={{ backgroundColor: green }}
                >
                  <Text align="center" color="label" size="17pt" weight="heavy">
                    {'Stake'}
                  </Text>
                </Box>
              </ButtonPressAnimation>
            </Stack>
          )}

          {/* Pool-wide staking stats (independent of the connected wallet). */}
          {pool !== null && (
            <>
              <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

              <Stack space="12px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'Pool'}
                </Text>
                <Stack space="12px">
                  <StatRow label="APR" value={`${(pool.aprBps / 100).toFixed(2)}%`} />
                  <StatRow label="Total staked" value={formatHook(pool.totalStaked)} />
                  <StatRow label="Total distributed" value={formatEth(pool.totalDistributed)} />
                  <StatRow label="Minimum stake" value={formatHook(pool.minimumStake)} />
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});
