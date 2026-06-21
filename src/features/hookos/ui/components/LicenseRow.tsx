import { memo, useMemo } from 'react';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookLicense, HookLicenseType } from '@/features/hookos/core/types';
import { opacity } from '@/framework/ui/utils/opacity';

type LicenseRowProps = {
  license: HookLicense;
  onPress: (license: HookLicense) => void;
};

export const LICENSE_TYPE_LABEL: Record<HookLicenseType, string> = {
  [HookLicenseType.Perpetual]: 'Perpetual',
  [HookLicenseType.LimitedEdition]: 'Limited Edition',
  [HookLicenseType.Subscription]: 'Subscription',
};

const StatusBadge = memo(function StatusBadge({ active }: { active: boolean }) {
  const green = useForegroundColor('green');
  const labelTertiary = useForegroundColor('labelTertiary');
  const color = active ? green : labelTertiary;
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
        {active ? 'Active' : 'Inactive'}
      </Text>
    </Box>
  );
});

/** A single row in the Licenses list: name/type, supply minted, price, status. */
export const LicenseRow = memo(function LicenseRow({ license, onPress }: LicenseRowProps) {
  const priceLabel = useMemo(
    () =>
      license.price > 0n
        ? `${Number(formatEther(license.price)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`
        : 'Free',
    [license.price]
  );
  const supplyLabel = useMemo(
    () => (license.maxSupply > 0 ? `${license.totalMinted}/${license.maxSupply} minted` : `${license.totalMinted} minted`),
    [license.maxSupply, license.totalMinted]
  );

  return (
    <ButtonPressAnimation onPress={() => onPress(license)} scaleTo={0.96}>
      <Box gap={8} paddingHorizontal="20px" paddingVertical="12px">
        <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
          <Box flexShrink={1}>
            <Stack space="4px">
              <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
                {license.name || `License #${license.licenseId}`}
              </Text>
              <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                {LICENSE_TYPE_LABEL[license.licenseType]}
              </Text>
            </Stack>
          </Box>
          <StatusBadge active={license.active} />
        </Box>
        <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
          <Text color="labelQuaternary" size="13pt" weight="bold">
            {supplyLabel}
          </Text>
          <Text color="labelSecondary" size="13pt" weight="bold">
            {priceLabel}
          </Text>
        </Box>
      </Box>
    </ButtonPressAnimation>
  );
});
