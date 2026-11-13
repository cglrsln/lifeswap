import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RunSummary } from '@/engine/types';

const PROGRESS_KEY = 'lifeswap.progress.v1';
const LAST_RUN_KEY = 'lifeswap.lastRun.v1';

export type Progress = {
  version: 1;
  unlocked: Record<string, string[]>;
};

export function emptyProgress(): Progress {
  return { version: 1, unlocked: {} };
}

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Progress;
    if (!parsed || parsed.version !== 1 || typeof parsed.unlocked !== 'object') return emptyProgress();
    return parsed;
  } catch {
    return emptyProgress();
  }
}

export async function unlockEnding(
  careerId: string,
  endingId: string,
): Promise<{ progress: Progress; isNew: boolean }> {
  const progress = await loadProgress();
  const current = progress.unlocked[careerId] ?? [];
  const isNew = !current.includes(endingId);
  if (isNew) {
    progress.unlocked = { ...progress.unlocked, [careerId]: [...current, endingId] };
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
  return { progress, isNew };
}

export function countUnlocked(progress: Progress): number {
  return Object.values(progress.unlocked).reduce((sum, ids) => sum + ids.length, 0);
}

export async function resetProgress(): Promise<void> {
  await AsyncStorage.removeItem(PROGRESS_KEY);
}

export async function saveLastRun(summary: RunSummary): Promise<void> {
  await AsyncStorage.setItem(LAST_RUN_KEY, JSON.stringify(summary));
}

export async function loadLastRun(): Promise<RunSummary | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_RUN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RunSummary;
  } catch {
    return null;
  }
}
