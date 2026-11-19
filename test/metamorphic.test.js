import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/engine.js';
import { verifyCertificate } from '../src/certificate.js';

function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x = (1664525 * x + 1013904223) >>> 0;
    return x / 0x100000000;
  };
}

function randomModel(seed, size) {
  const random = rng(seed);
  const states = Array.from({ length: size }, (_, i) => `s${i}`);
  const transitions = [];
  for (const state of states) {
    const count = 1 + Math.floor(random() * Math.min(3, size));
    const targets = new Set();
    while (targets.size < count) targets.add(states[Math.floor(random() * size)]);
    for (const target of targets) transitions.push([state, target]);
  }
  const labels = Object.fromEntries(states.map(state => [state, random() < 0.35 ? ['p'] : []]));
  return { id: `random-${seed}`, states, initial: [states[0]], transitions, labels };
}

const atom = name => ({ op: 'atom', name });
const not = arg => ({ op: 'not', arg });
const unary = (op, arg) => ({ op, arg });

function setOf(model, formula) {
  return new Set(solve(model, formula).result.satisfyingStates);
}
function equal(a, b) {
  return a.size === b.size && [...a].every(x => b.has(x));
}

test('seeded finite-graph metamorphic checks preserve CTL dualities and certificates', () => {
  for (let seed = 1; seed <= 80; seed += 1) {
    const model = randomModel(seed, 2 + (seed % 6));
    const p = atom('p');
    const notP = not(p);
    const checks = [
      [unary('EF', p), not(unary('AG', notP))],
      [unary('AF', p), not(unary('EG', notP))],
      [unary('EG', p), not(unary('AF', notP))],
      [unary('EX', p), not(unary('AX', notP))]
    ];
    for (const [a, b] of checks) assert.equal(equal(setOf(model, a), setOf(model, b)), true, `duality failed for seed ${seed}`);
    const formula = unary('AF', p);
    const solved = solve(model, formula);
    assert.equal(verifyCertificate(model, formula, solved.certificate).verified, true);
  }
});
