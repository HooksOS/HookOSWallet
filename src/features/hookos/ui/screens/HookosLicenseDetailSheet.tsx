import { memo } from 'react';
import { Alert } from 'react-native';
import { type Address, formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookLicense, HookLicenseType } from '@/features/hookos/core/types';
import { useLicensesStore } from '@/features/hookos/data/gamification/licenseStore';
import { LICENSE_TYPE_LABEL } from '@/features/hookos/ui/components/LicenseRow';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

function truncateAddress(address: Address): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

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

export const HookosLicenseDetailSheet = memo(function HookosLicenseDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_LICENSE_DETAIL_SHEET>();
  const licenseId = params.licenseId;

  const green = useForegroundColor('green');
  const license: HookLicense | null = useLicensesStore(state => state.getLicense(licenseId));

  const handleMint = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Mint license', 'License minting is not wired to signing yet.');
  };

  if (!license) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'License not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  const supplyLabel = license.maxSupply > 0 ? `${license.totalMinted}/${license.maxSupply}` : `${license.totalMinted}`;

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Stack space="6px">
            <Text color="label" numberOfLines={2} size="22pt" weight="heavy">
              {license.name || `License #${license.licenseId}`}
            </Text>
            <Text color="labelTertiary" size="13pt" weight="semibold">
              {`${license.active ? 'Active' : 'Inactive'} · ${LICENSE_TYPE_LABEL[license.licenseType]}`}
            </Text>
          </Stack>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Hook" value={`#${license.hookId.toString()}`} />
            <StatRow label="Creator" value={truncateAddress(license.creator)} />
            <StatRow label="Type" value={LICENSE_TYPE_LABEL[license.licenseType]} />
            <StatRow label="Price" value={license.price > 0n ? formatEth(license.price) : 'Free'} />
            <StatRow label="Supply" value={supplyLabel} />
            <StatRow label="Royalty" value={`${(license.royaltyBps / 100).toFixed(2)}%`} />
            {license.licenseType === HookLicenseType.Subscription && (
              <StatRow label="Duration" value={`${Math.round(license.subscriptionDuration / 86400)} days`} />
            )}
          </Stack>

          {license.active && (
            <ButtonPressAnimation onPress={handleMint} scaleTo={0.96}>
              <Box
                alignItems="center"
                borderRadius={12}
                height={{ custom: 52 }}
                justifyContent="center"
                style={{ backgroundColor: green }}
              >
                <Text align="center" color="label" size="17pt" weight="heavy">
                  {'Mint license'}
                </Text>
              </Box>
            </ButtonPressAnimation>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});
