import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/engine.js';
import { verifyCertificate } from '../src/certificate.js';
import { sha256 } from '../src/canonical.js';
import { tinyModel, atom, unary } from '../fixtures-data.js';

function reseal(certificate) {
  const { certificateDigest: _old, ...payload } = certificate;
  return { ...payload, certificateDigest: sha256(payload) };
}

test('independent checker accepts generated certificates', () => {
  const formula = unary('AF', atom('goal'));
  const solved = solve(tinyModel, formula);
  const checked = verifyCertificate(tinyModel, formula, solved.certificate);
  assert.equal(checked.verified, true);
  assert.deepEqual(checked.initialViolated, ['s0']);
});

test('rejects a certificate bound to another model or formula', () => {
  const formula = unary('EF', atom('goal'));
  const solved = solve(tinyModel, formula);
  const otherModel = { ...tinyModel, id: 'other-model' };
  assert.throws(() => verifyCertificate(otherModel, formula, solved.certificate), /different model/);
  assert.throws(() => verifyCertificate(tinyModel, unary('EF', atom('bad')), solved.certificate), /different formula/);
});

test('rejects accidental certificate corruption by digest', () => {
  const formula = unary('AF', atom('goal'));
  const solved = solve(tinyModel, formula);
  const broken = structuredClone(solved.certificate);
  broken.proof.iterations[1] = ['s0', 's1'];
  assert.throws(() => verifyCertificate(tinyModel, formula, broken), /digest mismatch/);
});

test('rejects a forged result even when the attacker recomputes the digest', () => {
  const formula = unary('EF', atom('goal'));
  const solved = solve(tinyModel, formula);
  const forged = structuredClone(solved.certificate);
  forged.proof.result = ['s1'];
  assert.throws(() => verifyCertificate(tinyModel, formula, reseal(forged)), /result does not follow/);
});

test('rejects a forged fixed-point layer even when the digest is recomputed', () => {
  const formula = unary('AF', atom('goal'));
  const solved = solve(tinyModel, formula);
  const forged = structuredClone(solved.certificate);
  forged.proof.iterations[1] = ['s0', 's1'];
  assert.throws(() => verifyCertificate(tinyModel, formula, reseal(forged)), /semantic successor/);
});
