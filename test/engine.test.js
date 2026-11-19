import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/engine.js';
import { tinyModel, atom, unary, binary } from '../fixtures-data.js';

const states = formula => solve(tinyModel, formula).result.satisfyingStates;

test('implements existential and universal next-state modalities', () => {
  assert.deepEqual(states(unary('EX', atom('goal'))), ['s0', 's1']);
  assert.deepEqual(states(unary('AX', atom('goal'))), ['s1']);
});

test('computes least fixed points for EF and AF', () => {
  assert.deepEqual(states(unary('EF', atom('goal'))), ['s0', 's1']);
  assert.deepEqual(states(unary('AF', atom('goal'))), ['s1']);
});

test('computes greatest fixed points for EG and AG', () => {
  assert.deepEqual(states(unary('EG', atom('bad'))), ['s2']);
  assert.deepEqual(states(unary('AG', atom('bad'))), ['s2']);
});

test('implements existential and universal until', () => {
  const left = binary('or', atom('start'), atom('bad'));
  assert.deepEqual(states(binary('EU', left, atom('goal'))), ['s0', 's1']);
  assert.deepEqual(states(binary('AU', left, atom('goal'))), ['s1']);
});

test('supports boolean implication and nested CTL formulas', () => {
  const formula = unary('AG', binary('implies', atom('goal'), unary('AF', atom('goal'))));
  assert.deepEqual(states(formula), ['s0', 's1', 's2']);
});

test('reports the truth value at all initial states', () => {
  const good = solve(tinyModel, unary('EF', atom('goal')));
  const bad = solve(tinyModel, unary('AF', atom('goal')));
  assert.equal(good.result.holdsAtAllInitial, true);
  assert.equal(bad.result.holdsAtAllInitial, false);
  assert.deepEqual(bad.result.initialViolated, ['s0']);
});

test('rejects unsupported and malformed formulas', () => {
  assert.throws(() => solve(tinyModel, { op: 'AGG', arg: atom('goal') }), /unsupported operator/);
  assert.throws(() => solve(tinyModel, { op: 'and', left: atom('goal') }), /requires left and right/);
});
