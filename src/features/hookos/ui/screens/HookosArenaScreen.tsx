import { memo, useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItemInfo, StyleSheet } from 'react-native';

import { Box, Separator, Text, useColorMode } from '@/design-system';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type Battle } from '@/features/hookos/core/types';
import { useArenaStore } from '@/features/hookos/data/protocol/arenaStore';
import { BattleRow } from '@/features/hookos/ui/components/BattleRow';
import { navigate, useRoute } from '@/navigation/Navigation';
import Routes from '@/navigation/routesNames';
import safeAreaInsetValues from '@/utils/safeAreaInsetValues';

function keyExtractor(battle: Battle): string {
  return `${battle.battleId}`;
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
        {'No battles yet'}
      </Text>
      <Box paddingTop="8px">
        <Text align="center" color="labelQuaternary" size="15pt" weight="medium">
          {'PvP token battles will appear here.'}
        </Text>
      </Box>
    </Box>
  );
});

function Header() {
  return (
    <Box paddingBottom="12px" paddingHorizontal="20px" paddingTop="8px">
      <Text color="label" size="26pt" weight="heavy">
        {'Arena'}
      </Text>
    </Box>
  );
}

export const HookosArenaScreen = memo(function HookosArenaScreen() {
  const { params } = useRoute<typeof Routes.HOOKOS_ARENA_SCREEN>();
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;
  const battles = useArenaStore(state => state.getBattles());

  useEffect(() => {
    useArenaStore.getState().fetch({ chainId });
  }, [chainId]);

  const handlePressBattle = useCallback(
    (battle: Battle) => {
      navigate(Routes.HOOKOS_BATTLE_DETAIL_SHEET, { battleId: battle.battleId, chainId });
    },
    [chainId]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Battle>) => <BattleRow battle={item} onPress={handlePressBattle} />,
    [handlePressBattle]
  );

  return (
    <Box background="surfacePrimary" style={[styles.container, { paddingTop: safeAreaInsetValues.top }]}>
      <Header />
      {battles === null ? (
        <LoadingState />
      ) : (
        <FlatList
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          data={battles}
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
