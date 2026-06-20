import { memo, useMemo } from 'react';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookEntry } from '@/features/hookos/core/types';
import { opacity } from '@/framework/ui/utils/opacity';

type HookRowProps = {
  hook: HookEntry;
  onPress: (hook: HookEntry) => void;
};

function VerifiedBadge() {
  const green = useForegroundColor('green');
  return (
    <Box
      alignItems="center"
      borderRadius={8}
      height={{ custom: 20 }}
      justifyContent="center"
      paddingHorizontal="6px"
      style={{ backgroundColor: opacity(green, 0.14) }}
    >
      <Text align="center" color={{ custom: green }} size="11pt" weight="heavy">
        {'Verified'}
      </Text>
    </Box>
  );
}

/** A single row in the HookOS hooks marketplace: name, category, verified badge, installs + rating. */
export const HookRow = memo(function HookRow({ hook, onPress }: HookRowProps) {
  const installsLabel = useMemo(() => `${hook.installs.toLocaleString('en-US')} installs`, [hook.installs]);
  const ratingLabel = useMemo(
    () => (hook.ratingCount > 0 ? `★ ${hook.averageRating.toFixed(1)} (${hook.ratingCount})` : 'Unrated'),
    [hook.averageRating, hook.ratingCount]
  );

  return (
    <ButtonPressAnimation onPress={() => onPress(hook)} scaleTo={0.96}>
      <Box gap={8} paddingHorizontal="20px" paddingVertical="12px">
        <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
          <Box flexShrink={1}>
            <Stack space="4px">
              <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
                {hook.name || 'Unnamed hook'}
              </Text>
              <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                {hook.category || 'Uncategorized'}
              </Text>
            </Stack>
          </Box>
          {hook.verified && <VerifiedBadge />}
        </Box>

        <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
          <Text color="labelQuaternary" size="13pt" weight="bold">
            {installsLabel}
          </Text>
          <Text color="labelSecondary" size="13pt" weight="bold">
            {ratingLabel}
          </Text>
        </Box>
      </Box>
    </ButtonPressAnimation>
  );
});
