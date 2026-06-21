import { memo, useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItemInfo, StyleSheet } from 'react-native';

import { Box, Separator, Text, useColorMode } from '@/design-system';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '@/features/hookos/core/chains';
import { type HookLicense } from '@/features/hookos/core/types';
import { useLicensesStore } from '@/features/hookos/data/gamification/licenseStore';
import { LicenseRow } from '@/features/hookos/ui/components/LicenseRow';
import { navigate, useRoute } from '@/navigation/Navigation';
import Routes from '@/navigation/routesNames';
import safeAreaInsetValues from '@/utils/safeAreaInsetValues';

function keyExtractor(license: HookLicense): string {
  return `${license.licenseId}`;
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
        {'No licenses yet'}
      </Text>
      <Box paddingTop="8px">
        <Text align="center" color="labelQuaternary" size="15pt" weight="medium">
          {'Hook licenses will appear here.'}
        </Text>
      </Box>
    </Box>
  );
});

function Header() {
  return (
    <Box paddingBottom="12px" paddingHorizontal="20px" paddingTop="8px">
      <Text color="label" size="26pt" weight="heavy">
        {'Hook Licenses'}
      </Text>
    </Box>
  );
}

export const HookosLicensesScreen = memo(function HookosLicensesScreen() {
  const { params } = useRoute<typeof Routes.HOOKOS_LICENSES_SCREEN>();
  const chainId = (params?.chainId as HookosChainId | undefined) ?? HOOKOS_CHAIN_IDS.base;
  const licenses = useLicensesStore(state => state.getLicenses());

  useEffect(() => {
    useLicensesStore.getState().fetch({ chainId });
  }, [chainId]);

  const handlePressLicense = useCallback(
    (license: HookLicense) => {
      navigate(Routes.HOOKOS_LICENSE_DETAIL_SHEET, { licenseId: license.licenseId, chainId });
    },
    [chainId]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HookLicense>) => <LicenseRow license={item} onPress={handlePressLicense} />,
    [handlePressLicense]
  );

  return (
    <Box background="surfacePrimary" style={[styles.container, { paddingTop: safeAreaInsetValues.top }]}>
      <Header />
      {licenses === null ? (
        <LoadingState />
      ) : (
        <FlatList
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          data={licenses}
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
