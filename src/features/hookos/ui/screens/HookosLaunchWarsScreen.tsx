import { memo, useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItemInfo, StyleSheet } from 'react-native';

import { Box, Separator, Text, useColorMode } from '@/design-system';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type LaunchWarsLeaderboardEntry } from '@/features/hookos/core/types';
import { useLaunchWarsStore } from '@/features/hookos/data/gamification/launchWarsStore';
import { LaunchWarsRow } from '@/features/hookos/ui/components/LaunchWarsRow';
import { navigate, useRoute } from '@/navigation/Navigation';
import Routes from '@/navigation/routesNames';
import safeAreaInsetValues from '@/utils/safeAreaInsetValues';

function keyExtractor(entry: LaunchWarsLeaderboardEntry): string {
  return entry.token;
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
        {'No entries yet'}
      </Text>
      <Box paddingTop="8px">
        <Text align="center" color="labelQuaternary" size="15pt" weight="medium">
          {'Token launch rankings will appear here.'}
        </Text>
      </Box>
    </Box>
  );
});

const Header = memo(function Header({ seasonId }: { seasonId: number }) {
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
        {'Launch Wars'}
      </Text>
      {seasonId > 0 && (
        <Text color="labelTertiary" size="15pt" weight="heavy">
          {`Season ${seasonId}`}
        </Text>
      )}
    </Box>
  );
});

export const HookosLaunchWarsScreen = memo(function HookosLaunchWarsScreen() {
  const { params } = useRoute<typeof Routes.HOOKOS_LAUNCH_WARS_SCREEN>();
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;
  const entries = useLaunchWarsStore(state => state.getEntries());
  const seasonId = useLaunchWarsStore(state => state.getSeasonId());

  useEffect(() => {
    useLaunchWarsStore.getState().fetch({ chainId });
  }, [chainId]);

  const handlePressEntry = useCallback(
    (entry: LaunchWarsLeaderboardEntry) => {
      navigate(Routes.HOOKOS_LAUNCH_ENTRY_DETAIL_SHEET, { seasonId, token: entry.token, chainId });
    },
    [chainId, seasonId]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LaunchWarsLeaderboardEntry>) => <LaunchWarsRow entry={item} onPress={handlePressEntry} />,
    [handlePressEntry]
  );

  return (
    <Box background="surfacePrimary" style={[styles.container, { paddingTop: safeAreaInsetValues.top }]}>
      <Header seasonId={seasonId} />
      {entries === null ? (
        <LoadingState />
      ) : (
        <FlatList
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          data={entries}
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
