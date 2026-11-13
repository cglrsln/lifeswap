import type {
  Career,
  Choice,
  Condition,
  Ending,
  GameState,
  RunSummary,
  Scene,
  StatKey,
  Stats,
} from './types';
import { STAT_KEYS } from './types';

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function matchesCondition(
  condition: Condition | undefined,
  state: { stats: Stats; flags: string[] },
): boolean {
  if (!condition) return true;
  if (condition.flags?.some((flag) => !state.flags.includes(flag))) return false;
  if (condition.anyFlags && condition.anyFlags.length > 0) {
    if (!condition.anyFlags.some((flag) => state.flags.includes(flag))) return false;
  }
  if (condition.missingFlags?.some((flag) => state.flags.includes(flag))) return false;
  if (condition.minStats) {
    for (const key of STAT_KEYS) {
      const min = condition.minStats[key];
      if (min !== undefined && state.stats[key] < min) return false;
    }
  }
  if (condition.maxStats) {
    for (const key of STAT_KEYS) {
      const max = condition.maxStats[key];
      if (max !== undefined && state.stats[key] > max) return false;
    }
  }
  return true;
}

export function applyChoice(
  stats: Stats,
  flags: string[],
  choice: Choice,
): { stats: Stats; flags: string[] } {
  const nextStats: Stats = { ...stats };
  if (choice.effects) {
    for (const key of STAT_KEYS) {
      const delta = choice.effects[key];
      if (delta !== undefined) nextStats[key] = clampStat(nextStats[key] + delta);
    }
  }
  let nextFlags = choice.clearFlags
    ? flags.filter((flag) => !choice.clearFlags!.includes(flag))
    : [...flags];
  if (choice.setFlags) {
    for (const flag of choice.setFlags) {
      if (!nextFlags.includes(flag)) nextFlags.push(flag);
    }
  }
  return { stats: nextStats, flags: nextFlags };
}

export function createRun(career: Career): GameState {
  return {
    careerId: career.id,
    stats: { ...career.startStats },
    flags: [],
    age: career.startAge,
    cursor: 0,
    moments: [],
    sceneLog: [],
    choiceLog: [],
    finished: false,
  };
}

export function resolveScene(
  career: Career,
  state: Pick<GameState, 'stats' | 'flags' | 'cursor'>,
): { scene: Scene; nextCursor: number } | null {
  const scenes = career.scenes;
  let index = state.cursor;
  while (index < scenes.length) {
    const scene = scenes[index];
    if (scene.group) {
      const group = scene.group;
      let end = index;
      const grouped: Scene[] = [];
      while (end < scenes.length && scenes[end].group === group) {
        grouped.push(scenes[end]);
        end += 1;
      }
      const eligible = grouped.filter((candidate) => matchesCondition(candidate.condition, state));
      if (eligible.length === 0) {
        index = end;
        continue;
      }
      eligible.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
      return { scene: eligible[0], nextCursor: end };
    }
    if (matchesCondition(scene.condition, state)) {
      return { scene, nextCursor: index + 1 };
    }
    index += 1;
  }
  return null;
}

export function currentScene(career: Career, state: GameState): Scene | null {
  if (state.finished) return null;
  return resolveScene(career, state)?.scene ?? null;
}

export function selectEnding(career: Career, state: Pick<GameState, 'stats' | 'flags'>): Ending {
  const eligible = career.endings.filter((ending) => matchesCondition(ending.condition, state));
  eligible.sort((a, b) => b.priority - a.priority);
  const ending = eligible[0];
  if (!ending) {
    throw new Error(`No ending matches for career "${career.id}". Add a default ending.`);
  }
  return ending;
}

function withEnding(career: Career, state: GameState, endingId?: string): GameState {
  const ending = endingId
    ? (career.endings.find((item) => item.id === endingId) ?? selectEnding(career, state))
    : selectEnding(career, state);
  return { ...state, finished: true, endingId: ending.id };
}

export function choose(career: Career, state: GameState, choiceId: string): GameState {
  if (state.finished) return state;
  const resolved = resolveScene(career, state);
  if (!resolved) return withEnding(career, state);
  const { scene, nextCursor } = resolved;
  const choice = scene.choices.find((item) => item.id === choiceId);
  if (!choice) {
    throw new Error(`Scene "${scene.id}" has no choice "${choiceId}".`);
  }
  const applied = applyChoice(state.stats, state.flags, choice);
  const moments = [...state.moments];
  if (scene.moment) moments.push(scene.moment);
  if (choice.moment) moments.push(choice.moment);
  const next: GameState = {
    ...state,
    stats: applied.stats,
    flags: applied.flags,
    age: scene.age,
    cursor: nextCursor,
    moments,
    sceneLog: [...state.sceneLog, scene.id],
    choiceLog: [...state.choiceLog, { sceneId: scene.id, choiceId: choice.id }],
  };
  if (scene.terminal) return withEnding(career, next, scene.endingId);
  if (!resolveScene(career, next)) return withEnding(career, next);
  return next;
}

/** Happiness score used on the end-of-life card. Weights sum to 1. */
export function happinessScore(stats: Stats): number {
  const score =
    stats.happiness * 0.4 +
    stats.relationships * 0.22 +
    stats.health * 0.18 +
    stats.reputation * 0.12 +
    stats.money * 0.08;
  return clampStat(score);
}

export function pickMoments(moments: string[], max = 4): string[] {
  const unique: string[] = [];
  for (const moment of moments) {
    if (!unique.includes(moment)) unique.push(moment);
  }
  if (unique.length <= max) return unique;
  const indexes = new Set<number>([0, unique.length - 1]);
  while (indexes.size < max) {
    const sorted = [...indexes].sort((a, b) => a - b);
    let bestGap = -1;
    let insertAt = -1;
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const gap = sorted[i + 1] - sorted[i];
      if (gap > bestGap) {
        bestGap = gap;
        insertAt = Math.floor((sorted[i] + sorted[i + 1]) / 2);
      }
    }
    if (insertAt < 0 || indexes.has(insertAt)) break;
    indexes.add(insertAt);
  }
  return [...indexes].sort((a, b) => a - b).map((index) => unique[index]);
}

export function summarize(career: Career, state: GameState): RunSummary {
  const ending = state.endingId
    ? (career.endings.find((item) => item.id === state.endingId) ?? selectEnding(career, state))
    : selectEnding(career, state);
  return {
    careerId: career.id,
    careerName: career.name,
    characterName: career.character.name,
    pronouns: career.character.pronouns,
    look: career.character,
    theme: career.theme,
    endingId: ending.id,
    endingTitle: ending.title,
    endingSummary: ending.summary,
    age: state.age,
    stats: { ...state.stats },
    happiness: happinessScore(state.stats),
    moments: pickMoments(state.moments),
  };
}

export function statDelta(before: Stats, after: Stats): Partial<Stats> {
  const delta: Partial<Stats> = {};
  for (const key of STAT_KEYS) {
    const change = after[key] - before[key];
    if (change !== 0) delta[key] = change;
  }
  return delta;
}

export function validateCareer(career: Career): string[] {
  const errors: string[] = [];
  const sceneIds = new Set<string>();
  for (const scene of career.scenes) {
    if (sceneIds.has(scene.id)) errors.push(`Duplicate scene id "${scene.id}"`);
    sceneIds.add(scene.id);
    if (scene.choices.length < 1 || scene.choices.length > 4) {
      errors.push(`Scene "${scene.id}" must have 1 to 4 choices`);
    }
    const choiceIds = new Set<string>();
    for (const choice of scene.choices) {
      if (choiceIds.has(choice.id)) errors.push(`Duplicate choice "${choice.id}" in "${scene.id}"`);
      choiceIds.add(choice.id);
      const labelWords = wordCount(choice.label);
      if (labelWords < 1 || labelWords > 4) {
        errors.push(`Choice "${scene.id}.${choice.id}" label is ${labelWords} words; use 1 to 4`);
      }
      if (choice.result && wordCount(choice.result) > 8) {
        errors.push(`Choice "${scene.id}.${choice.id}" result is too long`);
      }
    }
    if (scene.kind === 'fact' && !scene.source) {
      errors.push(`Fact scene "${scene.id}" is missing a source`);
    }
    const bodyWords = wordCount(scene.body);
    if (scene.kind === 'fact' && bodyWords > 16) {
      errors.push(`Fact "${scene.id}" is ${bodyWords} words; keep it to one short line`);
    }
    if (scene.kind !== 'fact' && bodyWords > 10) {
      errors.push(`Scene "${scene.id}" body is ${bodyWords} words; keep it to about 10`);
    }
    if (wordCount(scene.title) > 6) {
      errors.push(`Scene "${scene.id}" title is too long`);
    }
    if (scene.miniGame) {
      const ids = [scene.miniGame.success, scene.miniGame.partial, scene.miniGame.fail];
      for (const outcomeId of ids) {
        if (!scene.choices.some((choice) => choice.id === outcomeId)) {
          errors.push(`Mini-game on "${scene.id}" points at missing choice "${outcomeId}"`);
        }
      }
    }
    if (scene.terminal && !scene.endingId) {
      errors.push(`Terminal scene "${scene.id}" needs an endingId`);
    }
    if (scene.endingId && !career.endings.some((ending) => ending.id === scene.endingId)) {
      errors.push(`Scene "${scene.id}" points at unknown ending "${scene.endingId}"`);
    }
  }
  const endingIds = new Set<string>();
  for (const ending of career.endings) {
    if (endingIds.has(ending.id)) errors.push(`Duplicate ending "${ending.id}"`);
    endingIds.add(ending.id);
  }
  if (career.endings.length < 3) errors.push(`${career.id} needs at least 3 endings`);
  if (!career.endings.some((ending) => !ending.condition)) {
    errors.push(`${career.id} needs a default ending with no condition`);
  }
  let index = 0;
  const seenGroups = new Set<string>();
  while (index < career.scenes.length) {
    const group = career.scenes[index].group;
    if (!group) {
      index += 1;
      continue;
    }
    if (seenGroups.has(group)) errors.push(`Group "${group}" is not contiguous`);
    seenGroups.add(group);
    while (index < career.scenes.length && career.scenes[index].group === group) index += 1;
  }
  for (const key of STAT_KEYS) {
    const value = career.startStats[key];
    if (value < 0 || value > 100) errors.push(`Starting ${key} is out of range`);
  }
  return errors;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function playUntilDone(
  career: Career,
  picks: Record<string, string> = {},
): GameState {
  let state = createRun(career);
  let guard = 0;
  while (!state.finished && guard < 60) {
    const scene = currentScene(career, state);
    if (!scene) return choose(career, state, '');
    const choiceId = picks[scene.id] ?? scene.choices[0].id;
    state = choose(career, state, choiceId);
    guard += 1;
  }
  return state;
}

export type { StatKey };
