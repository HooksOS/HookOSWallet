import { memo } from 'react';

import { Box, Text } from '@/design-system';
import { opacity } from '@/framework/ui/utils/opacity';

import { HookosRank } from '../../core/types';

type ReputationRankBadgeProps = {
  rank: HookosRank;
  size?: 'small' | 'large';
};

/** Display label + accent color per on-chain rank tier. */
const RANK_META: Record<HookosRank, { label: string; color: string }> = {
  [HookosRank.Bronze]: { label: 'Bronze', color: '#a1683a' },
  [HookosRank.Silver]: { label: 'Silver', color: '#8d949b' },
  [HookosRank.Gold]: { label: 'Gold', color: '#bd8a0e' },
  [HookosRank.Diamond]: { label: 'Diamond', color: '#2a7bb5' },
  [HookosRank.Legend]: { label: 'Legend', color: '#7a3dbd' },
};

export function rankLabel(rank: HookosRank): string {
  return RANK_META[rank].label;
}

/** A colored pill showing a wallet's reputation rank. */
export const ReputationRankBadge = memo(function ReputationRankBadge({ rank, size = 'small' }: ReputationRankBadgeProps) {
  const meta = RANK_META[rank];
  const large = size === 'large';

  return (
    <Box
      alignItems="center"
      borderRadius={large ? 12 : 8}
      height={{ custom: large ? 32 : 24 }}
      justifyContent="center"
      paddingHorizontal={large ? '12px' : '8px'}
      style={{ backgroundColor: opacity(meta.color, 0.14) }}
    >
      <Text align="center" color={{ custom: meta.color }} size={large ? '15pt' : '13pt'} weight="heavy">
        {meta.label}
      </Text>
    </Box>
  );
});
