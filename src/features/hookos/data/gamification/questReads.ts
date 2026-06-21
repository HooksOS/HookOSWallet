/**
 * Pure on-chain read functions for the HookOS Quest contract (gamification quests).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with `QUEST_READ_ABI` in `core/gamificationAbis.ts`. Failures throw a namespaced
 * `RainbowError`. `getActiveQuests` returns the active quest ids; `browseQuests` loops them ->
 * `getQuest(id)`. Writes (claim reward) live in the wallet's signer/RAP path.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { QUEST_READ_ABI } from '../../core/gamificationAbis';
import { type HookosQuest, type QuestProgress, QuestType } from '../../core/types';

function getQuestSystem(chainId: HookosChainId): Address {
  const { QuestSystem } = getProtocolAddresses(chainId);
  if (QuestSystem === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/questReads]: QuestSystem is not deployed on chain ${chainId}`);
  }
  return QuestSystem;
}

function toQuestType(raw: number | bigint): QuestType {
  const v = Number(raw);
  return v >= QuestType.Trading && v <= QuestType.Weekly ? (v as QuestType) : QuestType.Trading;
}

type QuestTuple = readonly [
  name: string,
  description: string,
  questType: number,
  xpReward: bigint,
  ethReward: bigint,
  targetProgress: bigint,
  maxCompletions: bigint,
  completions: bigint,
  startsAt: bigint,
  endsAt: bigint,
  active: boolean,
  sponsored: boolean,
];

function mapQuest(questId: number, t: QuestTuple): HookosQuest {
  return {
    questId,
    name: t[0],
    description: t[1],
    questType: toQuestType(t[2]),
    xpReward: t[3],
    ethReward: t[4],
    targetProgress: Number(t[5]),
    maxCompletions: Number(t[6]),
    completions: Number(t[7]),
    startsAt: Number(t[8]),
    endsAt: Number(t[9]),
    active: t[10],
    sponsored: t[11],
  };
}

/** The ids of the currently active quests on `chainId`. */
export async function getActiveQuestIds(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<number[]> {
  const questSystem = getQuestSystem(chainId);
  const client = createHookosPublicClient(chainId, options);
  const ids = await client.readContract({ address: questSystem, abi: QUEST_READ_ABI, functionName: 'getActiveQuests' });
  return ids.map(Number);
}

/** Reads a single quest by id. */
export async function getQuest(chainId: HookosChainId, questId: number, options?: { signal?: AbortSignal }): Promise<HookosQuest> {
  const questSystem = getQuestSystem(chainId);
  const client = createHookosPublicClient(chainId, options);
  const tuple = await client.readContract({
    address: questSystem,
    abi: QUEST_READ_ABI,
    functionName: 'getQuest',
    args: [BigInt(questId)],
  });
  return mapQuest(questId, tuple);
}

/** A wallet's progress on `questId`. */
export async function getQuestProgress(
  chainId: HookosChainId,
  questId: number,
  wallet: Address,
  options?: { signal?: AbortSignal }
): Promise<QuestProgress> {
  const questSystem = getQuestSystem(chainId);
  const client = createHookosPublicClient(chainId, options);
  const [progress, target, completed, claimed, completedAt] = await client.readContract({
    address: questSystem,
    abi: QUEST_READ_ABI,
    functionName: 'getQuestProgress',
    args: [BigInt(questId), wallet],
  });
  return {
    progress: Number(progress),
    target: Number(target),
    completed,
    claimed,
    completedAt: Number(completedAt),
  };
}

/** Browses up to `limit` active quests. Skips entries whose read fails. */
export async function browseQuests(chainId: HookosChainId, limit: number, options?: { signal?: AbortSignal }): Promise<HookosQuest[]> {
  const ids = await getActiveQuestIds(chainId, options);
  const take = ids.slice(0, limit);
  const quests: HookosQuest[] = [];

  for (const id of take) {
    try {
      quests.push(await getQuest(chainId, id, options));
    } catch {
      // Skip quests whose on-chain read fails; the list stays best-effort.
    }
  }
  return quests;
}
