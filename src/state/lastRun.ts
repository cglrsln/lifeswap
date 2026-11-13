import type { RunSummary } from '@/engine/types';

let current: RunSummary | null = null;

export function setLastRun(summary: RunSummary): void {
  current = summary;
}

export function getLastRun(): RunSummary | null {
  return current;
}
