import { memo, useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItemInfo, StyleSheet } from 'react-native';

import { Box, Separator, Text, useColorMode } from '@/design-system';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type HookosEvent } from '@/features/hookos/core/types';
import { useEventsStore } from '@/features/hookos/data/protocol/eventsStore';
import { EventRow } from '@/features/hookos/ui/components/EventRow';
import { navigate, useRoute } from '@/navigation/Navigation';
import Routes from '@/navigation/routesNames';
import safeAreaInsetValues from '@/utils/safeAreaInsetValues';

function keyExtractor(event: HookosEvent): string {
  return `${event.eventId}`;
}

const ListSeparator = memo(function ListSeparator() {
  return (
    <Box paddingHorizontal="20px">
      <Separator color="separatorTertiary" direction="horizontal" thickness={1} />
    </Box>
  );
});

const LoadingState = memo(function LoadingState() {
  const { isDarkMode } = useColorMode();
  return (
    <Box alignItems="center" justifyContent="center" paddingTop="104px">
      <ActivityIndicator color={isDarkMode ? '#FFFFFF' : '#000000'} />
    </Box>
  );
});

const EmptyState = memo(function EmptyState() {
  return (
    <Box alignItems="center" justifyContent="center" paddingHorizontal="36px" paddingTop="104px">
      <Text align="center" color="labelTertiary" size="17pt" weight="bold">
        {'No events yet'}
      </Text>
      <Box paddingTop="8px">
        <Text align="center" color="labelQuaternary" size="15pt" weight="medium">
          {'Seasonal competitions will appear here.'}
        </Text>
      </Box>
    </Box>
  );
});

const Header = memo(function Header({ season }: { season: number }) {
  return (
    <Box
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
      paddingBottom="12px"
      paddingHorizontal="20px"
      paddingTop="8px"
    >
      <Text color="label" size="26pt" weight="heavy">
        {'Events'}
      </Text>
      {season > 0 && (
        <Text color="labelTertiary" size="15pt" weight="heavy">
          {`Season ${season}`}
        </Text>
      )}
    </Box>
  );
});

export const HookosEventsScreen = memo(function HookosEventsScreen() {
  const { params } = useRoute<typeof Routes.HOOKOS_EVENTS_SCREEN>();
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;
  const events = useEventsStore(state => state.getEvents());
  const season = useEventsStore(state => state.getCurrentSeason());

  useEffect(() => {
    useEventsStore.getState().fetch({ chainId });
  }, [chainId]);

  const handlePressEvent = useCallback(
    (event: HookosEvent) => {
      navigate(Routes.HOOKOS_EVENT_DETAIL_SHEET, { eventId: event.eventId, chainId });
    },
    [chainId]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HookosEvent>) => <EventRow event={item} onPress={handlePressEvent} />,
    [handlePressEvent]
  );

  return (
    <Box background="surfacePrimary" style={[styles.container, { paddingTop: safeAreaInsetValues.top }]}>
      <Header season={season} />
      {events === null ? (
        <LoadingState />
      ) : (
        <FlatList
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          data={events}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Box>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: safeAreaInsetValues.bottom + 24,
  },
});
