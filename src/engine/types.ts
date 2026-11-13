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

export type ChoiceIcon =
  | 'check'
  | 'x'
  | 'heart'
  | 'star'
  | 'shield'
  | 'flame'
  | 'book'
  | 'users'
  | 'home'
  | 'coin'
  | 'bed'
  | 'music'
  | 'foot'
  | 'megaphone'
  | 'door'
  | 'apple'
  | 'clock'
  | 'hands'
  | 'walk'
  | 'crown'
  | 'teach'
  | 'water'
  | 'alert';

export type SettingId =
  | 'studio'
  | 'stage'
  | 'apartment'
  | 'classroom'
  | 'hallway'
  | 'station'
  | 'fire'
  | 'street';

export type DayBeat = 'wake' | 'meal' | 'commute' | 'work' | 'evening' | 'sleep';

export type HomeId = 'shared' | 'family' | 'flat' | 'house' | 'bunk';

export type FoodId =
  | 'rice'
  | 'banana'
  | 'eggs'
  | 'noodles'
  | 'salad'
  | 'toast'
  | 'packed'
  | 'leftovers'
  | 'cereal'
  | 'chili'
  | 'coffee'
  | 'bar';

export type MiniGameKind = 'rhythm' | 'balance' | 'hose' | 'rescue' | 'seating' | 'meltdown';

/** The mini-game picks one of these choice ids. Effects still live on the choice. */
export type MiniGameSpec = {
  kind: MiniGameKind;
  success: string;
  partial: string;
  fail: string;
};

export type Choice = {
  id: string;
  /** One to four words on the icon button. */
  label: string;
  icon?: ChoiceIcon;
  effects?: Partial<Stats>;
  setFlags?: string[];
  clearFlags?: string[];
  expression?: Expression;
  /** Short stamp after the choice. Omit to advance immediately. */
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
  /** At most about ten words. The picture does the rest. */
  body: string;
  expression: Expression;
  setting?: SettingId;
  /** A beat in the day-in-the-life around the job. Omitted scenes are the work itself. */
  beat?: DayBeat;
  /** Short role in the first-person line, e.g. "ballet student". */
  role?: string;
  /** Where they live for this beat. If omitted, home follows money and flags. */
  home?: HomeId;
  /** The meal on the table for a meal beat. */
  food?: FoodId;
  /** Fact scenes render as a Real Fact card. */
  kind?: 'story' | 'fact';
  /** Citation shown on a fact card. */
  source?: string;
  condition?: Condition;
  /** When set, the play screen runs this game and then applies the matching choice. */
  miniGame?: MiniGameSpec;
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
