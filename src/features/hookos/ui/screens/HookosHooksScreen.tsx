import { memo, useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItemInfo, StyleSheet } from 'react-native';

import { Box, Separator, Text, useColorMode } from '@/design-system';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type HookEntry } from '@/features/hookos/core/types';
import { useHooksStore } from '@/features/hookos/data/protocol/hooksStore';
import { HookRow } from '@/features/hookos/ui/components/HookRow';
import { navigate, useRoute } from '@/navigation/Navigation';
import Routes from '@/navigation/routesNames';
import safeAreaInsetValues from '@/utils/safeAreaInsetValues';

function keyExtractor(hook: HookEntry): string {
  return hook.hookId;
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
        {'No hooks yet'}
      </Text>
      <Box paddingTop="8px">
        <Text align="center" color="labelQuaternary" size="15pt" weight="medium">
          {'Hooks registered on HookOS will appear here.'}
        </Text>
      </Box>
    </Box>
  );
});

function Header() {
  return (
    <Box paddingBottom="12px" paddingHorizontal="20px" paddingTop="8px">
      <Text color="label" size="26pt" weight="heavy">
        {'Hooks'}
      </Text>
    </Box>
  );
}

export const HookosHooksScreen = memo(function HookosHooksScreen() {
  const { params } = useRoute<typeof Routes.HOOKOS_HOOKS_SCREEN>();
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;
  const hooks = useHooksStore(state => state.getHooks());

  useEffect(() => {
    useHooksStore.getState().fetch({ chainId });
  }, [chainId]);

  const handlePressHook = useCallback(
    (hook: HookEntry) => {
      navigate(Routes.HOOKOS_HOOK_DETAIL_SHEET, { hookId: hook.hookId, chainId });
    },
    [chainId]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HookEntry>) => <HookRow hook={item} onPress={handlePressHook} />,
    [handlePressHook]
  );

  return (
    <Box background="surfacePrimary" style={[styles.container, { paddingTop: safeAreaInsetValues.top }]}>
      <Header />
      {hooks === null ? (
        <LoadingState />
      ) : (
        <FlatList
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          data={hooks}
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
