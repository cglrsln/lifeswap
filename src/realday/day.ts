export type MoodKey = 'energy' | 'pain' | 'mood' | 'mom' | 'teacher';

export type Moods = Record<MoodKey, number>;

export type DayState = {
  moods: Moods;
  flags: string[];
  seen: string[];
};

export type Atmosphere = {
  vignette: number;
  shake: boolean;
  warm: number;
};

const KEYS: MoodKey[] = ['energy', 'pain', 'mood', 'mom', 'teacher'];

export function createDay(): DayState {
  return {
    moods: { energy: 62, pain: 18, mood: 48, mom: 55, teacher: 40 },
    flags: [],
    seen: [],
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyMoment(
  state: DayState,
  sceneId: string,
  effects?: Partial<Moods>,
  flags?: string[],
): DayState {
  const moods = { ...state.moods };
  if (effects) {
    for (const key of KEYS) {
      const delta = effects[key];
      if (delta !== undefined) moods[key] = clamp(moods[key] + delta);
    }
  }
  const nextFlags = [...state.flags];
  for (const flag of flags ?? []) {
    if (!nextFlags.includes(flag)) nextFlags.push(flag);
  }
  const seen = state.seen.includes(sceneId) ? state.seen : [...state.seen, sceneId];
  return { moods, flags: nextFlags, seen };
}

export function atmosphere(state: DayState): Atmosphere {
  const { energy, pain, mood } = state.moods;
  return {
    vignette: energy < 40 ? 0.55 : energy < 55 ? 0.32 : 0.12,
    shake: pain > 58,
    warm: mood > 68 ? 0.22 : mood > 55 ? 0.1 : 0,
  };
}

export function thoughtFor(base: string, alts: { flag: string; thought: string }[] | undefined, flags: string[]): string {
  if (!alts) return base;
  const hit = alts.find((alt) => flags.includes(alt.flag));
  return hit?.thought ?? base;
}

export function endLine(state: DayState): string {
  if (state.flags.includes('pushed_through') && state.moods.pain > 50) return 'Your ankle kept the whole day.';
  if (state.flags.includes('told_teacher')) return 'You told her. She listened.';
  if (state.flags.includes('sat_with_mom')) return 'She was tired. She still asked.';
  if (state.flags.includes('ate_pastry')) return 'The pastry stayed with you.';
  return 'A Tuesday. You were in it.';
}
