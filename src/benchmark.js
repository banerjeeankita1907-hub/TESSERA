import { performance } from 'node:perf_hooks';
import { solve } from './engine.js';
import { verifyCertificate } from './certificate.js';

function layeredModel(size) {
  const states = Array.from({ length: size }, (_, i) => `q${String(i).padStart(4, '0')}`);
  const transitions = [];
  for (let i = 0; i < size - 1; i += 1) {
    transitions.push([states[i], states[i + 1]]);
    if (i + 2 < size) transitions.push([states[i], states[i + 2]]);
  }
  transitions.push([states.at(-1), states.at(-1)]);
  const labels = Object.fromEntries(states.map((s, i) => [s, i === size - 1 ? ['goal'] : []]));
  return { id: `layered-${size}`, states, initial: [states[0]], transitions, labels };
}

const rows = [];
for (const size of [32, 64, 128, 256]) {
  const model = layeredModel(size);
  const formula = { op: 'AF', arg: { op: 'atom', name: 'goal' } };
  const start = performance.now();
  const solved = solve(model, formula);
  const solveMs = performance.now() - start;
  const verifyStart = performance.now();
  verifyCertificate(model, formula, solved.certificate);
  const verifyMs = performance.now() - verifyStart;
  const certificateBytes = Buffer.byteLength(JSON.stringify(solved.certificate));
  rows.push({ states: size, transitions: model.transitions.length, solveMs: +solveMs.toFixed(2), verifyMs: +verifyMs.toFixed(2), certificateBytes });
}
console.log(JSON.stringify({ note: 'Single local run; illustrative, not a comparative performance claim.', rows }, null, 2));
