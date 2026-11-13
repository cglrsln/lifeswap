# Lifeswap

Live a thousand lives you'd never get to try.

Lifeswap is a career life-simulator for iOS and Android. It is not a random life. You pick a job, then play that person’s working life from training through retirement or death. Each scene is a short situation with a few choices. Choices change five stats and can set flags that unlock or block later scenes, so the early years still matter at the end.

This prototype has three playable careers:

- **Dancer** — Maya Chen, from age 16
- **Teacher** — Elena Vasquez, from age 22
- **Firefighter** — Andre Brooks, from age 23

Each run is a short story of roughly 15 to 20 scenes, with real-job fact cards and three endings. Progress, including which endings you have found, is saved on the device. There is no account and no server.

## Run it on a phone with Expo Go

You need Node.js 20 or newer.

```bash
npm install
npx expo start
```

Install **Expo Go** from the App Store or Google Play. Phone and computer have to be on the same Wi-Fi. Scan the QR code from the terminal:

- iOS: use the Camera app, then open the link in Expo Go.
- Android: scan the QR code from inside Expo Go.

The game is portrait, one screen wide, and works the same on both platforms.

To run it in a desktop browser instead:

```bash
npx expo start --web
```

## Tests

The game engine is plain TypeScript, separate from the UI.

```bash
npm test
```

That checks stat changes (including the 0–100 clamp), flag set/clear, scenes skipped when their flags or stats do not match, group priority (an early flag changing which later scene plays), terminal scenes, ending selection, and that all 9 endings in the three careers are actually reachable.

`npm run typecheck` runs the TypeScript compiler.

## How a life plays

1. The gallery shows the careers, how many endings you have found (“2 of 9”), and which titles are unlocked.
2. A scene card gives the situation and 2 to 4 choices. Fact scenes are marked **Real fact** and cite a source.
3. The choice updates Money, Health, Happiness, Reputation, and Relationships, and may set or clear flags.
4. The next scene is the next one in the career file whose conditions match. Scenes that share a `group` are alternatives; only one of them plays.
5. A terminal scene ends the run. The end-of-life card shows the career, age, ending title, happiness score, final stats, and up to four key moments.
6. **Share this life** captures that card as an image and opens the native share sheet (on the web, it shares the image when the browser allows it, otherwise it downloads the PNG). The unlocked ending is stored locally.

Happiness on the card is a weighted score, not the raw Happiness stat:

`happiness×0.40 + relationships×0.22 + health×0.18 + reputation×0.12 + money×0.08`

## Content schema

Careers live in `src/content/` as TypeScript objects that match the `Career` type in `src/engine/types.ts`. The engine in `src/engine/engine.ts` does not know anything about ballet, classrooms, or firehouses. To add a career you add data, then register it. You do not change the engine.

```ts
type Career = {
  id: string;                 // used in routes and save data, e.g. "dancer"
  name: string;               // "Dancer"
  blurb: string;              // one line on the gallery card
  intro: string;              // the paragraph on the career intro screen
  character: {
    name: string;
    pronouns: string;         // "she/her"
    skin: string;             // hex
    hair: string;
    blush: string;
    lip: string;
    style: "bun" | "bob" | "crop";
    glasses?: boolean;
  };
  theme: {
    primary: string;
    secondary: string;
    ink: string;
    paper: string;
    card: string;
    deep: string;
  };
  startAge: number;
  startStats: Stats;          // each stat is an integer 0–100
  scenes: Scene[];            // in play order
  endings: Ending[];          // at least 3, exactly one with no condition
};

type Stats = {
  money: number;
  health: number;
  happiness: number;
  reputation: number;
  relationships: number;
};

type Scene = {
  id: string;                 // unique inside the career
  group?: string;             // alternatives that sit next to each other
  priority?: number;          // higher wins inside a group, default 0
  stage: "training" | "first_job" | "mid_career" | "crisis" | "late_career";
  age: number;                // character's age during the scene
  title: string;
  body: string;
  expression: "neutral" | "happy" | "stressed" | "hurt" | "proud"
            | "sad" | "determined" | "tired" | "angry" | "hopeful";
  kind?: "story" | "fact";    // "fact" renders a Real fact card
  source?: string;            // required when kind is "fact"
  condition?: Condition;      // omit to always be eligible
  choices: Choice[];          // 1 to 4
  terminal?: boolean;         // ends the run after the choice
  endingId?: string;          // required when terminal
  moment?: string;            // optional line on the recap, just for arriving
};

type Choice = {
  id: string;                 // unique inside the scene
  label: string;              // the button
  effects?: Partial<Stats>;   // deltas, clamped to 0–100 after applying
  setFlags?: string[];
  clearFlags?: string[];
  expression?: Expression;    // face on the consequence beat
  result?: string;            // consequence sentence; omit to skip that beat
  moment?: string;            // remembered on the recap
};

type Condition = {
  flags?: string[];           // all of these must be set
  anyFlags?: string[];        // at least one must be set
  missingFlags?: string[];    // none of these may be set
  minStats?: Partial<Stats>;  // stat must be >= value
  maxStats?: Partial<Stats>;  // stat must be <= value
};

type Ending = {
  id: string;
  title: string;
  summary: string;            // the paragraph on the recap card
  priority: number;           // higher wins when several match
  condition?: Condition;      // the fallback ending has no condition and the lowest priority
};
```

### Scene rules

- Scenes are considered in file order. The engine plays the next eligible one and remembers how far it got.
- A scene with a `condition` is skipped when the condition fails. That is how an early flag blocks or reveals a later beat.
- Scenes that share a `group` must be **contiguous** in the file. They are one beat. The engine plays the eligible scene with the highest `priority` (file order breaks ties) and skips the rest of the group.
- Put a fact in the flow as its own scene with `kind: "fact"`, a `source`, and one continue choice. Keep the fact specific and sourced. Do not invent statistics.
- A terminal scene is the ending the player reads. Point `endingId` at an ending. If the run ever exhausts the scenes without a terminal scene, the engine picks the highest-priority matching ending anyway.
- One ending must have **no** `condition`, so a run can always finish.
- `moment` strings are the key moments on the recap. The card keeps at most four, spread across the run.

`validateCareer()` in the engine checks these rules. `npm test` runs it on every registered career and also plays scripted paths to each ending.

## Add a career

1. Copy `src/content/dancer.ts` to something like `src/content/nurse.ts`.
2. Give it a new `id`, theme, character, about 15 to 25 scenes, and at least 3 endings. Cover training, first job, mid-career, a crisis, and late career. Make at least one path reach each ending. Gate the crisis and the finale with flags or stats so early choices change the ending.
3. Register it in `src/content/index.ts`:

```ts
import nurse from './nurse';

export const careers: Career[] = [dancer, teacher, firefighter, nurse];
```

4. Run `npm test`. Fix anything `validateCareer` reports, and add a scripted path in `src/engine/engine.test.ts` so the new endings are proven reachable.
5. The gallery, intro, play, and recap screens pick the career up automatically. The face uses `character.style` (`bun`, `bob`, or `crop`) and the career colors.

Save data is under the AsyncStorage keys `lifeswap.progress.v1` (unlocked ending ids) and `lifeswap.lastRun.v1` (the latest recap). Nothing leaves the device.

## Project map

| Path | What it is |
| --- | --- |
| `src/engine/` | Rules: stats, flags, scene picking, endings. No React. |
| `src/content/` | The three careers. |
| `src/screens/` | Gallery, intro, play, recap. |
| `src/components/` | Cartoon face, stat bars, recap card. |
| `src/storage/progress.ts` | On-device progress. |
| `src/app/` | Expo Router screens. |

## Stack

React Native and Expo (SDK 58) with TypeScript. One codebase runs in Expo Go on iOS and Android, and in the browser. Art is drawn with `react-native-svg`. Fonts are Fredoka and Nunito.
