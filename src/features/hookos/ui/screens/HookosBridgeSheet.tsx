import { memo, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useColorMode, useForegroundColor } from '@/design-system';
import { HOOKOS_CHAIN_IDS, type BridgeChainId } from '@/features/hookos/core/chains';
import { useBridgeStatusStore } from '@/features/hookos/data/bridge/bridgeStatusStore';
import { opacity } from '@/framework/ui/utils/opacity';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

const CHAIN_LABELS: Record<BridgeChainId, string> = {
  [HOOKOS_CHAIN_IDS.base]: 'Base',
  [HOOKOS_CHAIN_IDS.megaeth]: 'MegaETH',
};

function HealthChip({ chainId, healthy }: { chainId: BridgeChainId; healthy: boolean }) {
  const green = useForegroundColor('green');
  const red = useForegroundColor('red');
  const labelColor = healthy ? green : red;
  return (
    <Box
      alignItems="center"
      borderRadius={12}
      flexDirection="row"
      gap={6}
      height={{ custom: 28 }}
      justifyContent="center"
      paddingHorizontal="12px"
      style={{ backgroundColor: opacity(labelColor, 0.12) }}
    >
      <View style={[styles.dot, { backgroundColor: labelColor }]} />
      <Text color="label" size="13pt" weight="bold">
        {CHAIN_LABELS[chainId]}
      </Text>
      <Text color="labelTertiary" size="11pt" weight="semibold">
        {healthy ? 'Healthy' : 'Unhealthy'}
      </Text>
    </Box>
  );
}

function ChainPill({ label }: { label: string }) {
  const fill = useForegroundColor('fillSecondary');
  return (
    <Box
      alignItems="center"
      borderRadius={16}
      height={{ custom: 44 }}
      justifyContent="center"
      style={[styles.chainPill, { backgroundColor: fill }]}
    >
      <Text align="center" color="label" size="17pt" weight="heavy">
        {label}
      </Text>
    </Box>
  );
}

export const HookosBridgeSheet = memo(function HookosBridgeSheet() {
  const { isDarkMode } = useColorMode();
  const separatorSecondary = useForegroundColor('separatorSecondary');
  const labelTertiary = useForegroundColor('labelTertiary');
  const fill = useForegroundColor('fillSecondary');

  const status = useBridgeStatusStore(state => state.getLaneStatus());
  const laneHealthy = useBridgeStatusStore(state => state.isLaneHealthy());

  // From/To are fixed to the live Base <-> MegaETH lane; tapping swaps direction.
  const [fromChainId, setFromChainId] = useState<BridgeChainId>(HOOKOS_CHAIN_IDS.base);
  const toChainId = fromChainId === HOOKOS_CHAIN_IDS.base ? HOOKOS_CHAIN_IDS.megaeth : HOOKOS_CHAIN_IDS.base;
  const [amount, setAmount] = useState('');

  const chipChains = useMemo<BridgeChainId[]>(() => [HOOKOS_CHAIN_IDS.base, HOOKOS_CHAIN_IDS.megaeth], []);

  const chainHealth = useMemo(() => {
    const map = new Map<number, boolean>();
    status?.chains.forEach(c => map.set(c.chainId, c.healthy));
    return map;
  }, [status]);

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Text color="label" size="22pt" weight="heavy">
            {'Bridge'}
          </Text>

          {/* Lane health is real, sourced from the Infura status API. */}
          <Stack space="12px">
            <Text color="labelTertiary" size="13pt" weight="bold">
              {`Lane status${laneHealthy ? '' : ' · degraded'}`}
            </Text>
            <Box alignItems="center" flexDirection="row" gap={8}>
              {chipChains.map(chainId => (
                <HealthChip chainId={chainId} healthy={chainHealth.get(chainId) ?? false} key={chainId} />
              ))}
            </Box>
          </Stack>

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          {/* From / To selector */}
          <Box alignItems="center" flexDirection="row" gap={10}>
            <Box flexGrow={1} flexShrink={1}>
              <Stack space="6px">
                <Text color="labelQuaternary" size="11pt" weight="heavy">
                  {'From'}
                </Text>
                <ChainPill label={CHAIN_LABELS[fromChainId]} />
              </Stack>
            </Box>
            <ButtonPressAnimation
              onPress={() => setFromChainId(toChainId)}
              scaleTo={0.8}
              testID="hookos-bridge-swap-direction"
            >
              <Box alignItems="center" height={{ custom: 36 }} justifyContent="center" paddingTop="16px" width={{ custom: 36 }}>
                <Text align="center" color="labelSecondary" size="20pt" weight="heavy">
                  {'􀄬'}
                </Text>
              </Box>
            </ButtonPressAnimation>
            <Box flexGrow={1} flexShrink={1}>
              <Stack space="6px">
                <Text color="labelQuaternary" size="11pt" weight="heavy">
                  {'To'}
                </Text>
                <ChainPill label={CHAIN_LABELS[toChainId]} />
              </Stack>
            </Box>
          </Box>

          {/* Amount input */}
          <Stack space="6px">
            <Text color="labelQuaternary" size="11pt" weight="heavy">
              {'Amount'}
            </Text>
            <Box borderRadius={16} style={[styles.inputContainer, { backgroundColor: fill }]}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setAmount}
                placeholder="0.0"
                placeholderTextColor={labelTertiary}
                style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                value={amount}
              />
            </Box>
          </Stack>

          {/* Primary action — intentionally disabled: the warp route + IGP aren't deployed yet. */}
          <Stack space="10px">
            <Box
              alignItems="center"
              height={{ custom: 52 }}
              justifyContent="center"
              borderRadius={22}
              style={[styles.disabledButton, { backgroundColor: separatorSecondary }]}
            >
              <Text align="center" color="labelTertiary" size="20pt" weight="heavy">
                {'Bridge'}
              </Text>
            </Box>
            <Text align="center" color="labelQuaternary" size="13pt" weight="semibold">
              {'Bridge transfers are not yet live'}
            </Text>
          </Stack>
        </Stack>
      </Box>
    </PanelSheet>
  );
});

const styles = StyleSheet.create({
  chainPill: {
    borderCurve: 'continuous',
    width: '100%',
  },
  disabledButton: {
    borderCurve: 'continuous',
    width: '100%',
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputContainer: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
});
