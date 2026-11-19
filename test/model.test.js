import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeModel } from '../src/model.js';
import { tinyModel } from '../fixtures-data.js';

test('normalizes states, labels, initial set, and edges deterministically', () => {
  const model = normalizeModel({ ...tinyModel, states: ['s2', 's0', 's1'], initial: ['s0'] });
  assert.deepEqual(model.states, ['s0', 's1', 's2']);
  assert.deepEqual(model.initial, ['s0']);
  assert.deepEqual(model.transitions, [['s0', 's1'], ['s0', 's2'], ['s1', 's1'], ['s2', 's2']]);
});

test('rejects duplicate states and unknown edges', () => {
  assert.throws(() => normalizeModel({ ...tinyModel, states: ['s0', 's0'] }), /unique/);
  assert.throws(() => normalizeModel({ ...tinyModel, transitions: [['s0', 'ghost']] }), /unknown state/);
});

test('requires an explicit successor for every state', () => {
  assert.throws(() => normalizeModel({ ...tinyModel, transitions: [['s0', 's1'], ['s0', 's2']] }), /no successor/);
});

test('rejects duplicate transitions and malformed labels', () => {
  assert.throws(() => normalizeModel({ ...tinyModel, transitions: [...tinyModel.transitions, ['s0', 's1']] }), /duplicate transition/);
  assert.throws(() => normalizeModel({ ...tinyModel, labels: { ...tinyModel.labels, s0: 'start' } }), /array/);
});
