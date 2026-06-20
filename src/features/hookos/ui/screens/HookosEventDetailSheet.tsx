import { memo } from 'react';
import { Alert } from 'react-native';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookosEvent, HookosEventStatus } from '@/features/hookos/core/types';
import { useEventsStore } from '@/features/hookos/data/protocol/eventsStore';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

const STATUS_LABEL: Record<HookosEventStatus, string> = {
  [HookosEventStatus.Upcoming]: 'Upcoming',
  [HookosEventStatus.Live]: 'Live',
  [HookosEventStatus.Ended]: 'Ended',
  [HookosEventStatus.Cancelled]: 'Cancelled',
};

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

export const HookosEventDetailSheet = memo(function HookosEventDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_EVENT_DETAIL_SHEET>();
  const eventId = params.eventId;

  const green = useForegroundColor('green');
  const event: HookosEvent | null = useEventsStore(state => state.getEvent(eventId));

  const handleRegister = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Register', 'Event registration is not wired to signing yet.');
  };

  if (!event) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'Event not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  const canRegister = event.status === HookosEventStatus.Upcoming;
  const playersLabel = event.maxPlayers > 0 ? `${event.playerCount}/${event.maxPlayers}` : `${event.playerCount}`;

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Stack space="6px">
            <Text color="label" numberOfLines={2} size="22pt" weight="heavy">
              {event.name || `Event #${event.eventId}`}
            </Text>
            <Text color="labelTertiary" size="13pt" weight="semibold">
              {`${STATUS_LABEL[event.status]} · ${event.category || 'Uncategorized'} · Season ${event.season}`}
            </Text>
          </Stack>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Prize pool" value={formatEth(event.prizePool)} />
            <StatRow label="Entry fee" value={event.entryFee > 0n ? formatEth(event.entryFee) : 'Free'} />
            <StatRow label="Players" value={playersLabel} />
          </Stack>

          {canRegister && (
            <ButtonPressAnimation onPress={handleRegister} scaleTo={0.96}>
              <Box
                alignItems="center"
                borderRadius={12}
                height={{ custom: 52 }}
                justifyContent="center"
                style={{ backgroundColor: green }}
              >
                <Text align="center" color="label" size="17pt" weight="heavy">
                  {'Register'}
                </Text>
              </Box>
            </ButtonPressAnimation>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});
