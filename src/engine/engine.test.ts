import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { careers } from '../content/index.ts';
import {
  applyChoice,
  choose,
  clampStat,
  createRun,
  currentScene,
  happinessScore,
  matchesCondition,
  playUntilDone,
  selectEnding,
  summarize,
  validateCareer,
} from './engine.ts';
import type { Career, Stats } from './types.ts';

const stats = (overrides: Partial<Stats> = {}): Stats => ({
  money: 40,
  health: 40,
  happiness: 40,
  reputation: 40,
  relationships: 40,
  ...overrides,
});

function fixture(): Career {
  return {
    id: 'fixture',
    name: 'Fixture',
    blurb: 'Test',
    intro: 'Test',
    character: {
      name: 'Test',
      pronouns: 'they/them',
      skin: '#fff',
      hair: '#000',
      blush: '#fcc',
      lip: '#900',
      style: 'crop',
    },
    theme: {
      primary: '#000',
      secondary: '#111',
      ink: '#222',
      paper: '#fff',
      card: '#fff',
      deep: '#333',
    },
    startAge: 20,
    startStats: stats({ money: 10, health: 10, happiness: 10, reputation: 10, relationships: 10 }),
    endings: [
      {
        id: 'special',
        title: 'Special',
        summary: 'Special ending.',
        priority: 10,
        condition: { flags: ['took_high'] },
      },
      { id: 'plain', title: 'Plain', summary: 'Plain ending.', priority: 0 },
    ],
    scenes: [
      {
        id: 'open',
        stage: 'training',
        age: 20,
        title: 'Open',
        body: 'Open',
        expression: 'neutral',
        choices: [
          {
            id: 'up',
            label: 'Up',
            effects: { money: 200, health: -50 },
            setFlags: ['rich'],
            result: 'Clamped.',
          },
          { id: 'side', label: 'Side', setFlags: ['side'], clearFlags: ['rich'] },
          { id: 'both', label: 'Both', effects: { money: 40 }, setFlags: ['side'] },
        ],
      },
      {
        id: 'blocked',
        stage: 'training',
        age: 21,
        title: 'Blocked',
        body: 'Should not play.',
        expression: 'neutral',
        condition: { flags: ['nope'] },
        choices: [{ id: 'no', label: 'No' }],
      },
      {
        id: 'needs_any',
        stage: 'first_job',
        age: 22,
        title: 'Any',
        body: 'Any flag.',
        expression: 'neutral',
        condition: { anyFlags: ['side', 'other'] },
        choices: [{ id: 'ok', label: 'Ok', setFlags: ['saw_any'] }],
      },
      {
        id: 'group_low',
        group: 'fork',
        priority: 0,
        stage: 'mid_career',
        age: 30,
        title: 'Low',
        body: 'Low',
        expression: 'neutral',
        choices: [{ id: 'low', label: 'Low', setFlags: ['took_low'] }],
      },
      {
        id: 'group_high',
        group: 'fork',
        priority: 5,
        stage: 'mid_career',
        age: 30,
        title: 'High',
        body: 'High',
        expression: 'proud',
        condition: { flags: ['side'] },
        choices: [{ id: 'high', label: 'High', setFlags: ['took_high'] }],
      },
      {
        id: 'gated',
        stage: 'crisis',
        age: 40,
        title: 'Gated',
        body: 'Needs the high road and some money.',
        expression: 'determined',
        condition: { flags: ['took_high'], minStats: { money: 50 } },
        choices: [{ id: 'go', label: 'Go', moment: 'You passed the gate.' }],
      },
      {
        id: 'hidden_by_flag',
        stage: 'late_career',
        age: 50,
        title: 'Hidden',
        body: 'Hidden once rich.',
        expression: 'neutral',
        condition: { missingFlags: ['rich'] },
        choices: [{ id: 'seen', label: 'Seen', setFlags: ['saw_hidden'] }],
      },
      {
        id: 'end_special',
        group: 'finale',
        priority: 10,
        stage: 'late_career',
        age: 60,
        title: 'End special',
        body: 'Special',
        expression: 'proud',
        terminal: true,
        endingId: 'special',
        condition: { flags: ['took_high'] },
        choices: [{ id: 'bye', label: 'Bye' }],
      },
      {
        id: 'end_plain',
        group: 'finale',
        priority: 0,
        stage: 'late_career',
        age: 60,
        title: 'End plain',
        body: 'Plain',
        expression: 'neutral',
        terminal: true,
        endingId: 'plain',
        choices: [{ id: 'bye', label: 'Bye' }],
      },
    ],
  };
}

describe('stat effects', () => {
  it('applies deltas and clamps to 0–100', () => {
    const career = fixture();
    const state = choose(career, createRun(career), 'up');
    assert.equal(state.stats.money, 100);
    assert.equal(state.stats.health, 0);
    assert.equal(clampStat(140), 100);
    assert.equal(clampStat(-4), 0);
    assert.ok(state.flags.includes('rich'));
  });

  it('clears flags and then sets new ones', () => {
    const applied = applyChoice(stats(), ['rich', 'keep'], {
      id: 'side',
      label: 'Side',
      clearFlags: ['rich'],
      setFlags: ['side'],
    });
    assert.deepEqual(applied.flags, ['keep', 'side']);
  });
});

describe('flag gating', () => {
  it('skips scenes whose flags are missing and honors anyFlags and missingFlags', () => {
    const career = fixture();
    let blocked = choose(career, createRun(career), 'side');
    blocked = choose(career, blocked, 'ok');
    assert.equal(blocked.sceneLog.includes('blocked'), false);
    assert.ok(blocked.sceneLog.includes('needs_any'));
    assert.ok(blocked.flags.includes('saw_any'));
    let rich = choose(career, createRun(career), 'up');
    rich = choose(career, rich, 'low');
    assert.equal(rich.sceneLog.includes('needs_any'), false);
    assert.equal(rich.sceneLog.includes('blocked'), false);
  });

  it('lets an early flag change which later scene plays', () => {
    const career = fixture();
    const lowRoad = playUntilDone(career, { open: 'up' });
    assert.ok(lowRoad.sceneLog.includes('group_low'));
    assert.equal(lowRoad.sceneLog.includes('group_high'), false);
    assert.equal(lowRoad.sceneLog.includes('gated'), false);
    assert.equal(lowRoad.endingId, 'plain');

    const highRoad = playUntilDone(career, { open: 'both' });
    assert.ok(highRoad.sceneLog.includes('group_high'));
    assert.ok(highRoad.sceneLog.includes('gated'));
    assert.equal(highRoad.sceneLog.includes('group_low'), false);
    assert.equal(highRoad.endingId, 'special');
    assert.ok(highRoad.moments.includes('You passed the gate.'));
  });
});

describe('ending selection', () => {
  it('picks the highest priority matching ending', () => {
    const career = fixture();
    const plain = selectEnding(career, { stats: stats(), flags: [] });
    assert.equal(plain.id, 'plain');
    const special = selectEnding(career, { stats: stats(), flags: ['took_high'] });
    assert.equal(special.id, 'special');
  });

  it('stops the run on a terminal scene', () => {
    const career = fixture();
    const state = playUntilDone(career, { open: 'side' });
    assert.equal(state.finished, true);
    assert.equal(state.endingId, 'special');
    assert.equal(currentScene(career, state), null);
    assert.equal(state.sceneLog.at(-1), 'end_special');
  });
});

describe('happiness score', () => {
  it('weights happiness most and stays in range', () => {
    const joyful = happinessScore(
      stats({ happiness: 100, relationships: 0, health: 0, reputation: 0, money: 0 }),
    );
    const rich = happinessScore(
      stats({ happiness: 0, relationships: 0, health: 0, reputation: 0, money: 100 }),
    );
    assert.equal(joyful, 40);
    assert.equal(rich, 8);
    assert.equal(happinessScore(stats({ happiness: 100, relationships: 100, health: 100, reputation: 100, money: 100 })), 100);
  });
});

describe('condition matching', () => {
  it('requires every min and max stat', () => {
    assert.equal(
      matchesCondition({ minStats: { health: 50 }, maxStats: { money: 20 } }, { stats: stats({ health: 50, money: 20 }), flags: [] }),
      true,
    );
    assert.equal(
      matchesCondition({ maxStats: { money: 20 } }, { stats: stats({ money: 21 }), flags: [] }),
      false,
    );
  });
});

describe('careers', () => {
  it('validates every career and plays a full run', () => {
    assert.equal(careers.length, 3);
    let endings = 0;
    for (const career of careers) {
      assert.deepEqual(validateCareer(career), []);
      endings += career.endings.length;
      const state = playUntilDone(career);
      assert.equal(state.finished, true);
      assert.ok(state.endingId);
      assert.ok(career.endings.some((ending) => ending.id === state.endingId));
      assert.ok(state.sceneLog.length >= 14, `${career.id} played ${state.sceneLog.length} scenes`);
      const games = career.scenes.filter((scene) => scene.miniGame);
      assert.ok(games.length >= 2, `${career.id} needs two mini-games`);
      assert.ok(new Set(games.map((scene) => scene.miniGame?.kind)).size >= 2);
      for (const stage of ['training', 'first_job', 'mid_career', 'crisis', 'late_career'] as const) {
        for (const beat of ['wake', 'meal', 'commute', 'evening', 'sleep'] as const) {
          assert.ok(
            career.scenes.some((scene) => scene.stage === stage && scene.beat === beat),
            `${career.id} ${stage} missing ${beat}`,
          );
        }
      }
      const ages = state.sceneLog.map((id) => career.scenes.find((scene) => scene.id === id)!.age);
      for (let i = 1; i < ages.length; i += 1) {
        assert.ok(ages[i] >= ages[i - 1], `${career.id} age went backwards at ${state.sceneLog[i]}`);
      }
      const summary = summarize(career, state);
      assert.equal(summary.endingId, state.endingId);
      assert.ok(summary.moments.length <= 4);
    }
    assert.equal(endings, 9);
  });

  it('reaches every dancer ending', () => {
    const dancer = careers.find((career) => career.id === 'dancer')!;
    assert.equal(playUntilDone(dancer).endingId, 'final_bow');
    assert.equal(
      playUntilDone(dancer, { crisis_money: 'commercial', after_commercial: 'studio' }).endingId,
      'second_act',
    );
    const lights = playUntilDone(dancer, {
      apartment: 'joke',
      shin: 'rest',
      showcase_clean: 'think',
      understudy: 'mark',
      cast_passed: 'bitter',
      new_work: 'no',
      love: 'end_it',
      crisis_money: 'stay',
      after_loyal: 'exhausted',
      late_default: 'walk',
    });
    assert.equal(lights.endingId, 'lights_down');
  });

  it('reaches every teacher ending', () => {
    const teacher = careers.find((career) => career.id === 'teacher')!;
    assert.equal(playUntilDone(teacher).endingId, 'legacy');
    assert.equal(playUntilDone(teacher, { crossroads: 'admin' }).endingId, 'office');
    assert.equal(playUntilDone(teacher, { crossroads: 'exit' }).endingId, 'closed');
  });

  it('reaches every firefighter ending, including the early death', () => {
    const firefighter = careers.find((career) => career.id === 'firefighter')!;
    const lived = playUntilDone(firefighter);
    assert.equal(lived.endingId, 'long_shift');
    assert.equal(lived.sceneLog.includes('last_call'), false);
    assert.equal(playUntilDone(firefighter, { officer: 'training' }).endingId, 'after_bell');
    const died = playUntilDone(firefighter, { crisis_heart: 'back' });
    assert.equal(died.endingId, 'last_call');
    assert.equal(died.sceneLog.at(-1), 'last_call');
    assert.equal(died.sceneLog.includes('officer'), false);
    assert.ok(died.age === 38);
  });
});
