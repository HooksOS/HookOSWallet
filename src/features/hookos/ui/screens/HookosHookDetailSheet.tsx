import { memo } from 'react';
import { Alert } from 'react-native';
import { type Hex } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookEntry } from '@/features/hookos/core/types';
import { useHooksStore } from '@/features/hookos/data/protocol/hooksStore';
import { opacity } from '@/framework/ui/utils/opacity';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
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

export const HookosHookDetailSheet = memo(function HookosHookDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_HOOK_DETAIL_SHEET>();
  const hookId = params.hookId as Hex;

  const green = useForegroundColor('green');
  const hook: HookEntry | null = useHooksStore(state => state.getHook(hookId));

  const handleAttach = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Attach hook', 'Hook attach is not wired to signing yet.');
  };

  if (!hook) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'Hook not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  const ratingLabel = hook.ratingCount > 0 ? `★ ${hook.averageRating.toFixed(1)} (${hook.ratingCount})` : 'Unrated';

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Box alignItems="center" flexDirection="row" gap={10} justifyContent="space-between">
            <Box flexShrink={1}>
              <Stack space="6px">
                <Text color="label" numberOfLines={1} size="22pt" weight="heavy">
                  {hook.name || 'Unnamed hook'}
                </Text>
                <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                  {hook.category || 'Uncategorized'}
                </Text>
              </Stack>
            </Box>
            {hook.verified && (
              <Box
                alignItems="center"
                borderRadius={10}
                height={{ custom: 28 }}
                justifyContent="center"
                paddingHorizontal="10px"
                style={{ backgroundColor: opacity(green, 0.14) }}
              >
                <Text align="center" color={{ custom: green }} size="13pt" weight="heavy">
                  {'Verified'}
                </Text>
              </Box>
            )}
          </Box>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Installs" value={hook.installs.toLocaleString('en-US')} />
            <StatRow label="Rating" value={ratingLabel} />
            <StatRow label="Status" value={hook.active ? 'Active' : 'Inactive'} />
            <StatRow label="Author" value={truncateAddress(hook.author)} />
            <StatRow label="Implementation" value={truncateAddress(hook.implementation)} />
          </Stack>

          <ButtonPressAnimation onPress={handleAttach} scaleTo={0.96}>
            <Box
              alignItems="center"
              borderRadius={12}
              height={{ custom: 52 }}
              justifyContent="center"
              style={{ backgroundColor: green }}
            >
              <Text align="center" color="label" size="17pt" weight="heavy">
                {'Attach to token'}
              </Text>
            </Box>
          </ButtonPressAnimation>
        </Stack>
      </Box>
    </PanelSheet>
  );
});
