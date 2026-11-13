import type { Stats } from '@/engine/types';

const INJURY = new Set([
  'danced_hurt',
  'hid_injury',
  'injury_stop',
  'pushed_through_break',
  'cardiac_scare',
  'went_back',
]);

export type Outfit = 'worn' | 'plain' | 'sharp';

export type Presence = {
  tired: boolean;
  limp: boolean;
  outfit: Outfit;
  /** 0 to 2. Friends fade in as relationships grow. */
  friendStrength: number;
};

export function presence(stats: Stats, flags: string[]): Presence {
  return {
    tired: stats.health < 50 || stats.happiness < 42,
    limp: stats.health < 42 || flags.some((flag) => INJURY.has(flag)),
    outfit: stats.money >= 70 ? 'sharp' : stats.money < 36 ? 'worn' : 'plain',
    friendStrength: Math.max(0, Math.min(2, stats.relationships / 36)),
  };
}
