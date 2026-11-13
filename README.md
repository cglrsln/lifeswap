# Lifeswap

Live a thousand lives you'd never get to try.

Lifeswap is a career life-simulator for iOS and Android. It is not a random life, and it is not a wall of text. You wake up in someone else’s body and live a life you would never get: the job, and also the apartment, the breakfast, the commute, the bills, the ache, and the small joys. Scenes stay visual. Choices are a swipe or a big icon. Key moments are short hands-on games. Early choices still change stats and flags, so they still change the ending.

This prototype has three playable careers:

- **Dancer** — Maya Chen, from age 16
- **Teacher** — Elena Vasquez, from age 22
- **Firefighter** — Andre Brooks, from age 23

Each life stage is a day. You wake up as that person, eat what they can afford, get to work, do the job, come home, and sleep. The home changes with money and choices: a shared bunk, a family table, a one-room flat, a house. Two hands-on games (roughly 20 to 40 seconds) sit inside the work. A three-second montage ticks the years when a stage changes. Real-job facts are one line. Each career has three endings. Progress is saved on the device. There is no account and no server.

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

That checks stat changes (including the 0–100 clamp), flag set/clear, scenes skipped when their flags or stats do not match, group priority (an early flag changing which later scene plays), terminal scenes, ending selection, short copy limits, two different mini-games per career, and that all 9 endings are actually reachable.

`npm run typecheck` runs the TypeScript compiler.

## How a life plays

1. The gallery shows the careers, how many endings you have found (“2 of 9”), and which titles are unlocked.
2. A stage opens in the first person: “You wake up as Maya, 16.” The cartoon is the body you are in. A strip marks the day: wake, meal, commute, work, evening, sleep.
3. Home, food, and the trip to work are pictures. A cramped shared room, a family table, chili at 5 a.m., a packed lunch, a bus. You pick among what that life can actually afford. Bills, body pain, loneliness, family, pride, and small joys show up as those choices.
4. Work scenes stay short: the character in a room, about ten words, and two or three icon buttons. Swipe left for the first choice or right for the last one, or tap. The day strip sits on “work.”
5. The character shows how the life is going. Tired eyes, a limp after injury, worn or sharper clothes, and friends who fade in or out. Stats are icon pips, not a column of numbers.
6. Between life stages, a montage of about three seconds ticks the years forward. The next morning’s home may be a different room.
7. Two moments in each career are mini-games. The result picks a choice, so it still changes stats and flags:
   - Dancer: tap a rehearsal beat, and hold a pose that can hurt you if you miss.
   - Firefighter: spray a hose on the flames, and move through smoke toward someone before the clock runs out.
   - Teacher: drag the class into their seats, and calm a meltdown before the bell.
8. A fact is one short line with a Real fact label. The source stays on the scene data.
9. The next scene is the next one in the career file whose conditions match. Scenes that share a `group` are alternatives; only one of them plays. Day beats are ordinary scenes with a `beat`, woven in by `weaveRoutine` in `src/content/routine.ts`.
10. A terminal scene ends the run. The end-of-life card shows the career, age, ending title, happiness score, icon stats, and up to four key moments.
11. **Share this life** captures that card as an image and opens the native share sheet (on the web, it shares the image when the browser allows it, otherwise it downloads the PNG). The unlocked ending is stored locally.

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
  title: string;               // up to about six words
  body: string;                // about ten words; one short line if kind is "fact"
  expression: "neutral" | "happy" | "stressed" | "hurt" | "proud"
            | "sad" | "determined" | "tired" | "angry" | "hopeful";
  setting?: "studio" | "stage" | "apartment" | "classroom"
          | "hallway" | "station" | "fire" | "street";
  beat?: "wake" | "meal" | "commute" | "work" | "evening" | "sleep";
  role?: string;              // "ballet student" in "You wake up as Maya, 16."
  home?: "shared" | "family" | "flat" | "house" | "bunk";
                              // omit and home follows money and flags
  food?: "rice" | "banana" | "eggs" | "noodles" | "salad" | "toast"
       | "packed" | "leftovers" | "cereal" | "chili" | "coffee" | "bar";
  kind?: "story" | "fact";    // "fact" renders a one-line Real fact
  source?: string;            // required when kind is "fact"; kept in data, not shown as a paragraph
  condition?: Condition;      // omit to always be eligible
  miniGame?: {                // replaces the buttons with a hands-on game
    kind: "rhythm" | "balance" | "hose" | "rescue" | "seating" | "meltdown";
    success: string;          // choice id applied for a strong result
    partial: string;
    fail: string;
  };
  choices: Choice[];          // 1 to 4, or the outcomes of a mini-game
  terminal?: boolean;         // ends the run after the choice
  endingId?: string;          // required when terminal
  moment?: string;            // optional line on the recap, just for arriving
};

type Choice = {
  id: string;                 // unique inside the scene
  label: string;              // 1 to 4 words
  icon?: "check" | "x" | "heart" | "star" | "shield" | "flame" | "book"
       | "users" | "home" | "coin" | "bed" | "music" | "foot" | "megaphone"
       | "door" | "apple" | "clock" | "hands" | "walk" | "crown" | "teach"
       | "water" | "alert";
  effects?: Partial<Stats>;   // deltas, clamped to 0–100 after applying
  setFlags?: string[];
  clearFlags?: string[];
  expression?: Expression;    // face on the consequence beat
  result?: string;            // stamp of up to about eight words; omit to skip it
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
- Story `body` text stays around ten words. Choice `label`s stay one to four words. The picture, the face, and the icon do the explaining.
- Put a fact in the flow as its own scene with `kind: "fact"`, a `source`, a one-line `body`, and one continue choice. Keep the fact specific and sourced. Do not invent statistics.
- Give each career at least two `miniGame` scenes. Point `success`, `partial`, and `fail` at real choice ids so the game feeds the same stat and flag system as a tap. Do not teach the engine about the job.
- A day around the job is more scenes, not a special engine. `src/content/routine.ts` inserts wake, meal, commute, evening, and sleep into every stage. Copy that shape for a new career, or add the beats by hand. Keep the first option of a day beat from accidentally setting an ending flag. Set `food` on meals and `home` when the place is part of the story. Leave `home` empty when it should grow with money.
- A terminal scene is the ending the player reads. Point `endingId` at an ending. If the run ever exhausts the scenes without a terminal scene, the engine picks the highest-priority matching ending anyway.
- One ending must have **no** `condition`, so a run can always finish.
- `moment` strings are the key moments on the recap. The card keeps at most four, spread across the run.

`validateCareer()` in the engine checks these rules. `npm test` runs it on every registered career and also plays scripted paths to each ending.

## Add a career

1. Copy `src/content/dancer.ts` to something like `src/content/nurse.ts`.
2. Give it a new `id`, theme, character, about 15 to 25 short scenes, at least two mini-games, and at least 3 endings. Cover training, first job, mid-career, a crisis, and late career. Make at least one path reach each ending. Gate the crisis and the finale with flags or stats so early choices change the ending. Set `setting` so the room changes, and `icon` on each choice.
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
| `src/content/` | The three careers, plus `routine.ts` for the day around the job. |
| `src/screens/` | Gallery, intro, play, recap. |
| `src/components/` | Cartoon face, rooms, icon choices, montages, recap card. |
| `src/minigames/` | Rhythm, balance, hose, smoke rescue, seating, meltdown. |
| `src/storage/progress.ts` | On-device progress. |
| `src/app/` | Expo Router screens. |

## Stack

React Native and Expo (SDK 58) with TypeScript. One codebase runs in Expo Go on iOS and Android, and in the browser. Art is drawn with `react-native-svg`. Fonts are Fredoka and Nunito.
