import { memo } from 'react';
import { Alert } from 'react-native';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { PanelSheet } from '@/components/PanelSheet/PanelSheet';
import { Box, Separator, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookosQuest } from '@/features/hookos/core/types';
import { useQuestsStore } from '@/features/hookos/data/gamification/questStore';
import { QUEST_TYPE_LABEL } from '@/features/hookos/ui/components/QuestRow';
import { useRoute } from '@/navigation/Navigation';
import type Routes from '@/navigation/routesNames';
import { THICKER_BORDER_WIDTH } from '@/styles/constants';

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

export const HookosQuestDetailSheet = memo(function HookosQuestDetailSheet() {
  const { params } = useRoute<typeof Routes.HOOKOS_QUEST_DETAIL_SHEET>();
  const questId = params.questId;

  const green = useForegroundColor('green');
  const quest: HookosQuest | null = useQuestsStore(state => state.getQuest(questId));

  const handleClaim = () => {
    // TODO: wire to src/raps execution + src/model/wallet signer (user-confirmed)
    Alert.alert('Claim reward', 'Quest reward claiming is not wired to signing yet.');
  };

  if (!quest) {
    return (
      <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
        <Box alignItems="center" justifyContent="center" paddingHorizontal="24px" paddingVertical="44px">
          <Text align="center" color="labelTertiary" size="17pt" weight="bold">
            {'Quest not found'}
          </Text>
        </Box>
      </PanelSheet>
    );
  }

  const canClaim = quest.active && quest.ethReward > 0n;
  const completionsLabel = quest.maxCompletions > 0 ? `${quest.completions}/${quest.maxCompletions}` : `${quest.completions}`;

  return (
    <PanelSheet innerBorderWidth={THICKER_BORDER_WIDTH}>
      <Box paddingBottom="36px" paddingHorizontal="24px" paddingTop="36px">
        <Stack space="24px">
          <Stack space="6px">
            <Text color="label" numberOfLines={2} size="22pt" weight="heavy">
              {quest.name || `Quest #${quest.questId}`}
            </Text>
            <Text color="labelTertiary" size="13pt" weight="semibold">
              {`${quest.active ? 'Active' : 'Ended'} · ${QUEST_TYPE_LABEL[quest.questType]}`}
            </Text>
          </Stack>

          {quest.description.length > 0 && (
            <Text color="labelSecondary" size="15pt" weight="medium">
              {quest.description}
            </Text>
          )}

          <Separator color="separatorTertiary" direction="horizontal" thickness={1} />

          <Stack space="12px">
            <StatRow label="Type" value={QUEST_TYPE_LABEL[quest.questType]} />
            <StatRow label="XP reward" value={`${Number(quest.xpReward).toLocaleString('en-US')} XP`} />
            <StatRow label="ETH reward" value={quest.ethReward > 0n ? formatEth(quest.ethReward) : '—'} />
            <StatRow label="Target" value={`${quest.targetProgress}`} />
            <StatRow label="Completions" value={completionsLabel} />
            <StatRow label="Status" value={quest.active ? 'Active' : 'Ended'} />
          </Stack>

          {canClaim && (
            <ButtonPressAnimation onPress={handleClaim} scaleTo={0.96}>
              <Box
                alignItems="center"
                borderRadius={12}
                height={{ custom: 52 }}
                justifyContent="center"
                style={{ backgroundColor: green }}
              >
                <Text align="center" color="label" size="17pt" weight="heavy">
                  {'Claim reward'}
                </Text>
              </Box>
            </ButtonPressAnimation>
          )}
        </Stack>
      </Box>
    </PanelSheet>
  );
});
