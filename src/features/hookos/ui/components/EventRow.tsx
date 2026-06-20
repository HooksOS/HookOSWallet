import { memo, useMemo } from 'react';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookosEvent, HookosEventStatus } from '@/features/hookos/core/types';
import { opacity } from '@/framework/ui/utils/opacity';

type EventRowProps = {
  event: HookosEvent;
  onPress: (event: HookosEvent) => void;
};

const STATUS_LABEL: Record<HookosEventStatus, string> = {
  [HookosEventStatus.Upcoming]: 'Upcoming',
  [HookosEventStatus.Live]: 'Live',
  [HookosEventStatus.Ended]: 'Ended',
  [HookosEventStatus.Cancelled]: 'Cancelled',
};

const StatusBadge = memo(function StatusBadge({ status }: { status: HookosEventStatus }) {
  const green = useForegroundColor('green');
  const labelTertiary = useForegroundColor('labelTertiary');
  const live = status === HookosEventStatus.Upcoming || status === HookosEventStatus.Live;
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

/** A single row in the Events list: name/category, prize pool, player count, status. */
export const EventRow = memo(function EventRow({ event, onPress }: EventRowProps) {
  const prizeLabel = useMemo(
    () => `${Number(formatEther(event.prizePool)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`,
    [event.prizePool]
  );
  const playersLabel = useMemo(
    () => (event.maxPlayers > 0 ? `${event.playerCount}/${event.maxPlayers} players` : `${event.playerCount} players`),
    [event.maxPlayers, event.playerCount]
  );

  return (
    <ButtonPressAnimation onPress={() => onPress(event)} scaleTo={0.96}>
      <Box gap={8} paddingHorizontal="20px" paddingVertical="12px">
        <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
          <Box flexShrink={1}>
            <Stack space="4px">
              <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
                {event.name || `Event #${event.eventId}`}
              </Text>
              <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                {`${event.category || 'Uncategorized'} · S${event.season}`}
              </Text>
            </Stack>
          </Box>
          <StatusBadge status={event.status} />
        </Box>
        <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
          <Text color="labelQuaternary" size="13pt" weight="bold">
            {playersLabel}
          </Text>
          <Text color="labelSecondary" size="13pt" weight="bold">
            {`${prizeLabel} pool`}
          </Text>
        </Box>
      </Box>
    </ButtonPressAnimation>
  );
});
