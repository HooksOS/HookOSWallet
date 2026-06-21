import { memo, useEffect } from 'react';
import { type Address } from 'viem';

import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text } from '@/design-system';
import { ZERO_ADDRESS } from '@/features/hookos/core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type HookAchievement, type HookLpPosition } from '@/features/hookos/core/types';
import { useNftStore } from '@/features/hookos/data/gamification/nftStore';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

function truncateAddress(address: Address): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatDate(unix: number): string {
  return unix > 0 ? new Date(unix * 1000).toLocaleDateString('en-US') : '—';
}

const LpRow = memo(function LpRow({ position }: { position: HookLpPosition }) {
  return (
    <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
      <Stack space="6px">
        <Text color="label" size="15pt" weight="semibold">
          {`${truncateAddress(position.token0)} / ${truncateAddress(position.token1)}`}
        </Text>
        <Text color="labelTertiary" size="13pt" weight="medium">
          {`Liquidity ${Number(position.liquidity).toLocaleString('en-US')}`}
        </Text>
      </Stack>
      <Text color="labelTertiary" size="13pt" weight="medium">
        {formatDate(position.depositedAt)}
      </Text>
    </Box>
  );
});

const AchievementRow = memo(function AchievementRow({ badge }: { badge: HookAchievement }) {
  return (
    <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
      <Stack space="6px">
        <Text color="label" size="15pt" weight="semibold">
          {badge.name}
        </Text>
        <Text color="labelTertiary" size="13pt" weight="medium">
          {badge.category}
        </Text>
      </Stack>
      <Text color="labelTertiary" size="13pt" weight="medium">
        {formatDate(badge.earnedAt)}
      </Text>
    </Box>
  );
});

export const HookosNftSheet = memo(function HookosNftSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_NFT_SHEET>();
  const address = (params?.address as Address | undefined) ?? ZERO_ADDRESS;
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;

  const collection = useNftStore(state => state.getCollection());

  useEffect(() => {
    useNftStore.getState().fetch({ chainId, address });
  }, [chainId, address]);

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Text color="label" size="22pt" weight="heavy">
            {'NFTs'}
          </Text>

          {address === ZERO_ADDRESS ? (
            <Box paddingVertical="12px">
              <Text color="labelTertiary" size="15pt" weight="semibold">
                {'Connect a wallet to see your HookOS NFTs.'}
              </Text>
            </Box>
          ) : (
            <Stack space="24px">
              {/* LP-position NFTs held by the connected wallet. */}
              <Stack space="16px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'LP Positions'}
                </Text>
                {!collection || collection.lpPositions.length === 0 ? (
                  <Text color="labelQuaternary" size="15pt" weight="medium">
                    {'No LP positions yet.'}
                  </Text>
                ) : (
                  <Stack separator={<Separator color="separatorTertiary" direction="horizontal" thickness={1} />} space="12px">
                    {collection.lpPositions.map(position => (
                      <LpRow key={position.tokenId} position={position} />
                    ))}
                  </Stack>
                )}
              </Stack>

              <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

              {/* Achievement (badge) NFTs held by the connected wallet. */}
              <Stack space="16px">
                <Text color="labelTertiary" size="13pt" weight="bold">
                  {'Achievements'}
                </Text>
                {!collection || collection.achievements.length === 0 ? (
                  <Text color="labelQuaternary" size="15pt" weight="medium">
                    {'No achievements yet.'}
                  </Text>
                ) : (
                  <Stack separator={<Separator color="separatorTertiary" direction="horizontal" thickness={1} />} space="12px">
                    {collection.achievements.map(badge => (
                      <AchievementRow badge={badge} key={badge.tokenId} />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});
