import { memo, useCallback } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItemInfo, StyleSheet } from 'react-native';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Separator, Stack, Text, useColorMode, useForegroundColor } from '@/design-system';
import { HOOKOS_CHAIN_IDS } from '@/features/hookos/core/chains';
import { type HookToken } from '@/features/hookos/core/types';
import { useHookosTokensStore } from '@/features/hookos/data/protocol/hookosTokensStore';
import { HookTokenRow } from '@/features/hookos/ui/components/HookTokenRow';
import { opacity } from '@/framework/ui/utils/opacity';
import { navigate } from '@/navigation/Navigation';
import Routes from '@/navigation/routesNames';
import { useAccountAddress } from '@/state/wallets/walletsStore';
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

const NavPill = memo(function NavPill({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  const accent = useForegroundColor('green');
  return (
    <ButtonPressAnimation onPress={onPress} scaleTo={0.92} testID={testID}>
      <Box
        alignItems="center"
        borderRadius={10}
        height={{ custom: 32 }}
        justifyContent="center"
        paddingHorizontal="12px"
        style={{ backgroundColor: opacity(accent, 0.12) }}
      >
        <Text align="center" color={{ custom: accent }} size="13pt" weight="heavy">
          {label}
        </Text>
      </Box>
    </ButtonPressAnimation>
  );
});

function Header({
  onPressReputation,
  onPressHooks,
  onPressFees,
}: {
  onPressReputation: () => void;
  onPressHooks: () => void;
  onPressFees: () => void;
}) {
  return (
    <Box paddingBottom="12px" paddingHorizontal="20px" paddingTop="8px">
      <Stack space="12px">
        <Text color="label" size="26pt" weight="heavy">
          {'HookOS Tokens'}
        </Text>
        <Box alignItems="center" flexDirection="row" gap={8}>
          <NavPill label="Reputation" onPress={onPressReputation} testID="hookos-open-reputation" />
          <NavPill label="Hooks" onPress={onPressHooks} testID="hookos-open-hooks" />
          <NavPill label="Fees" onPress={onPressFees} testID="hookos-open-fees" />
        </Box>
      </Stack>
    </Box>
  );
}

export const HookosTokensScreen = memo(function HookosTokensScreen() {
  const tokens = useHookosTokensStore(state => state.getTokens());
  const accountAddress = useAccountAddress();

  const handlePressToken = useCallback((token: HookToken) => {
    navigate(Routes.HOOKOS_TOKEN_DETAIL_SHEET, { address: token.address, chainId: token.chainId });
  }, []);

  const handlePressReputation = useCallback(() => {
    navigate(Routes.HOOKOS_REPUTATION_SHEET, { address: accountAddress, chainId: HOOKOS_CHAIN_IDS.base });
  }, [accountAddress]);

  const handlePressHooks = useCallback(() => {
    navigate(Routes.HOOKOS_HOOKS_SCREEN, { chainId: HOOKOS_CHAIN_IDS.base });
  }, []);

  const handlePressFees = useCallback(() => {
    navigate(Routes.HOOKOS_FEES_SCREEN, { chainId: HOOKOS_CHAIN_IDS.base });
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
      <Header onPressFees={handlePressFees} onPressHooks={handlePressHooks} onPressReputation={handlePressReputation} />
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
