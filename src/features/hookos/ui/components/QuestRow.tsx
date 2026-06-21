import { memo, useMemo } from 'react';
import { formatEther } from 'viem';

import ButtonPressAnimation from '@/components/animations/ButtonPressAnimation';
import { Box, Stack, Text, useForegroundColor } from '@/design-system';
import { type HookosQuest, QuestType } from '@/features/hookos/core/types';
import { opacity } from '@/framework/ui/utils/opacity';

type QuestRowProps = {
  quest: HookosQuest;
  onPress: (quest: HookosQuest) => void;
};

export const QUEST_TYPE_LABEL: Record<QuestType, string> = {
  [QuestType.Trading]: 'Trading',
  [QuestType.Launch]: 'Launch',
  [QuestType.HookInstall]: 'Hook Install',
  [QuestType.Referral]: 'Referral',
  [QuestType.Content]: 'Content',
  [QuestType.Clan]: 'Clan',
  [QuestType.Campaign]: 'Campaign',
  [QuestType.Daily]: 'Daily',
  [QuestType.Weekly]: 'Weekly',
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
        {active ? 'Active' : 'Ended'}
      </Text>
    </Box>
  );
});

/** A single row in the Quests list: name/type, completions, reward, status. */
export const QuestRow = memo(function QuestRow({ quest, onPress }: QuestRowProps) {
  const completionsLabel = useMemo(
    () => (quest.maxCompletions > 0 ? `${quest.completions}/${quest.maxCompletions} completed` : `${quest.completions} completed`),
    [quest.completions, quest.maxCompletions]
  );
  const rewardLabel = useMemo(
    () =>
      quest.ethReward > 0n
        ? `${Number(formatEther(quest.ethReward)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`
        : `${Number(quest.xpReward).toLocaleString('en-US')} XP`,
    [quest.ethReward, quest.xpReward]
  );

  return (
    <ButtonPressAnimation onPress={() => onPress(quest)} scaleTo={0.96}>
      <Box gap={8} paddingHorizontal="20px" paddingVertical="12px">
        <Box alignItems="center" flexDirection="row" gap={8} justifyContent="space-between">
          <Box flexShrink={1}>
            <Stack space="4px">
              <Text color="label" numberOfLines={1} size="17pt" weight="heavy">
                {quest.name || `Quest #${quest.questId}`}
              </Text>
              <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                {QUEST_TYPE_LABEL[quest.questType]}
              </Text>
            </Stack>
          </Box>
          <StatusBadge active={quest.active} />
        </Box>
        <Box alignItems="center" flexDirection="row" gap={12} justifyContent="space-between">
          <Text color="labelQuaternary" size="13pt" weight="bold">
            {completionsLabel}
          </Text>
          <Text color="labelSecondary" size="13pt" weight="bold">
            {rewardLabel}
          </Text>
        </Box>
      </Box>
    </ButtonPressAnimation>
  );
});
