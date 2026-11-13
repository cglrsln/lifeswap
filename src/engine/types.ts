export const STAT_KEYS = [
  'money',
  'health',
  'happiness',
  'reputation',
  'relationships',
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export type Stats = Record<StatKey, number>;

export type Expression =
  | 'neutral'
  | 'happy'
  | 'stressed'
  | 'hurt'
  | 'proud'
  | 'sad'
  | 'determined'
  | 'tired'
  | 'angry'
  | 'hopeful';

export type LifeStage = 'training' | 'first_job' | 'mid_career' | 'crisis' | 'late_career';

export type CharacterStyle = 'bun' | 'bob' | 'crop';

export type CharacterLook = {
  name: string;
  pronouns: string;
  skin: string;
  hair: string;
  blush: string;
  lip: string;
  style: CharacterStyle;
  glasses?: boolean;
};

export type CareerTheme = {
  primary: string;
  secondary: string;
  ink: string;
  paper: string;
  card: string;
  deep: string;
};

/** All listed checks must pass. `anyFlags` passes when at least one flag is set. */
export type Condition = {
  flags?: string[];
  anyFlags?: string[];
  missingFlags?: string[];
  minStats?: Partial<Stats>;
  maxStats?: Partial<Stats>;
};

export type Choice = {
  id: string;
  label: string;
  effects?: Partial<Stats>;
  setFlags?: string[];
  clearFlags?: string[];
  expression?: Expression;
  /** Consequence line shown before the next scene. Omit to advance immediately. */
  result?: string;
  /** Remembered on the end-of-life card. */
  moment?: string;
};

export type Scene = {
  id: string;
  /**
   * Scenes that share a group are alternatives at the same beat.
   * They must sit next to each other. The engine plays only one.
   */
  group?: string;
  /** Higher priority wins inside a group. Ties keep file order. Default 0. */
  priority?: number;
  stage: LifeStage;
  age: number;
  title: string;
  body: string;
  expression: Expression;
  /** Fact scenes render as a Real Fact card. */
  kind?: 'story' | 'fact';
  /** Citation shown on a fact card. */
  source?: string;
  condition?: Condition;
  choices: Choice[];
  /** The run ends after this scene's choice is applied. */
  terminal?: boolean;
  endingId?: string;
  moment?: string;
};

export type Ending = {
  id: string;
  title: string;
  summary: string;
  priority: number;
  condition?: Condition;
};

export type Career = {
  id: string;
  name: string;
  blurb: string;
  intro: string;
  character: CharacterLook;
  theme: CareerTheme;
  startAge: number;
  startStats: Stats;
  scenes: Scene[];
  endings: Ending[];
};

export type GameState = {
  careerId: string;
  stats: Stats;
  flags: string[];
  age: number;
  /** Index of the next scene to consider. */
  cursor: number;
  moments: string[];
  sceneLog: string[];
  choiceLog: { sceneId: string; choiceId: string }[];
  finished: boolean;
  endingId?: string;
};

export type RunSummary = {
  careerId: string;
  careerName: string;
  characterName: string;
  pronouns: string;
  look: CharacterLook;
  theme: CareerTheme;
  endingId: string;
  endingTitle: string;
  endingSummary: string;
  age: number;
  stats: Stats;
  happiness: number;
  moments: string[];
};
