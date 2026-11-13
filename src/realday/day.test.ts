import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyMoment, atmosphere, createDay, endLine, thoughtFor } from './day.ts';

describe('real day consequences', () => {
  it('shows pain as shake and tiredness as a darker vignette, not numbers', () => {
    const calm = atmosphere(createDay());
    assert.equal(calm.shake, false);
    const hurting = applyMoment(createDay(), 'pain', { pain: 50, energy: -30 }, ['pushed_through']);
    const look = atmosphere(hurting);
    assert.equal(look.shake, true);
    assert.ok(look.vignette > calm.vignette);
  });

  it('lets an early choice change a later thought and the last line', () => {
    let state = createDay();
    state = applyMoment(state, 'breakfast', { mood: 8, energy: 6 }, ['ate_pastry']);
    assert.equal(
      thoughtFor('Rice again.', [{ flag: 'ate_pastry', thought: 'Still sitting there.' }], state.flags),
      'Still sitting there.',
    );
    assert.equal(endLine(state), 'The pastry stayed with you.');
    const told = applyMoment(createDay(), 'pain', { teacher: 20 }, ['told_teacher']);
    assert.equal(endLine(told), 'You told her. She listened.');
  });
});
