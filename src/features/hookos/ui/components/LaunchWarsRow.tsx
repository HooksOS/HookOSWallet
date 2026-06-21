import { memo } from 'react';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Stack, Text } from '@/design-system';
import { type LaunchWarsLeaderboardEntry } from '@/features/hookos/core/types';

type LaunchWarsRowProps = {
  entry: LaunchWarsLeaderboardEntry;
  onPress: (entry: LaunchWarsLeaderboardEntry) => void;
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** A single row in the Launch Wars leaderboard: rank + token on the left, composite score on the right. */
export const LaunchWarsRow = memo(function LaunchWarsRow({ entry, onPress }: LaunchWarsRowProps) {
  return (
    <ButtonPressAnimation onPress={() => onPress(entry)} scaleTo={0.96}>
      <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between" paddingHorizontal="20px" paddingVertical="12px">
        <Box alignItems="center" flexDirection="row" flexShrink={1} gap={12}>
          <Text color="labelTertiary" size="17pt" weight="heavy">
            {`#${entry.rank}`}
          </Text>
          <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
            {truncateAddress(entry.token)}
          </Text>
        </Box>
        <Stack alignHorizontal="right" space="2px">
          <Text align="right" color="labelSecondary" size="15pt" weight="bold">
            {Number(entry.score).toLocaleString('en-US')}
          </Text>
          <Text align="right" color="labelQuaternary" size="11pt" weight="bold">
            {'score'}
          </Text>
        </Stack>
      </Box>
    </ButtonPressAnimation>
  );
});
