import { memo, useCallback } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItemInfo, StyleSheet } from 'react-native';

import { Box, Separator, Text, useColorMode } from '@/design-system';
import { type HookToken } from '@/features/hookos/core/types';
import { useHookosTokensStore } from '@/features/hookos/data/protocol/hookosTokensStore';
import { HookTokenRow } from '@/features/hookos/ui/components/HookTokenRow';
import { navigate } from '@/navigation/Navigation';
import Routes from '@/navigation/routesNames';
import safeAreaInsetValues from '@/utils/safeAreaInsetValues';

function keyExtractor(token: HookToken): string {
  return `${token.chainId}:${token.address}`;
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
        {'No tokens yet'}
      </Text>
      <Box paddingTop="8px">
        <Text align="center" color="labelQuaternary" size="15pt" weight="medium">
          {'Tokens launched on HookOS will appear here.'}
        </Text>
      </Box>
    </Box>
  );
});

function Header() {
  return (
    <Box paddingBottom="12px" paddingHorizontal="20px" paddingTop="8px">
      <Text color="label" size="26pt" weight="heavy">
        {'HookOS Tokens'}
      </Text>
    </Box>
  );
}

export const HookosTokensScreen = memo(function HookosTokensScreen() {
  const tokens = useHookosTokensStore(state => state.getTokens());

  const handlePressToken = useCallback((token: HookToken) => {
    navigate(Routes.HOOKOS_TOKEN_DETAIL_SHEET, { address: token.address, chainId: token.chainId });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HookToken>) => <HookTokenRow onPress={handlePressToken} token={item} />,
    [handlePressToken]
  );

  return (
    <Box
      background="surfacePrimary"
      style={[styles.container, { paddingTop: safeAreaInsetValues.top }]}
    >
      <Header />
      {tokens === null ? (
        <LoadingState />
      ) : (
        <FlatList
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          data={tokens}
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
