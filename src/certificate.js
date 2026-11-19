import { sha256, sameArray } from './canonical.js';
import { normalizeModel, buildSuccessors } from './model.js';
import { validateFormula } from './formula.js';
import {
  union, intersect, complement, predecessorExists, predecessorAll,
  asArray, equal
} from './semantics.js';

export const CERTIFICATE_VERSION = 'tessera-ctl-certificate/v1';

function payloadOf(certificate) {
  const { certificateDigest: _ignored, ...payload } = certificate;
  return payload;
}

export function makeCertificate(model, formula, proof) {
  const payload = {
    version: CERTIFICATE_VERSION,
    modelDigest: sha256(model),
    formulaDigest: sha256(formula),
    proof
  };
  return { ...payload, certificateDigest: sha256(payload) };
}

function assert(condition, message) {
  if (!condition) throw new Error(`Certificate rejected: ${message}`);
}

function parseStateSet(value, universe, where) {
  assert(Array.isArray(value), `${where} must be an array`);
  assert(value.every(s => typeof s === 'string' && universe.includes(s)), `${where} contains an unknown state`);
  const canonical = [...new Set(value)].sort((a, b) => a.localeCompare(b));
  assert(canonical.length === value.length && sameArray(canonical, value), `${where} must be sorted and duplicate-free`);
  return new Set(value);
}

function verifyNode(node, proof, ctx, path) {
  const { model, successors, universe } = ctx;
  assert(proof && typeof proof === 'object' && !Array.isArray(proof), `${path} must be an object`);
  assert(proof.op === node.op, `${path}.op does not match the formula`);
  assert(Array.isArray(proof.children), `${path}.children must be an array`);
  const verifyChild = (formulaChild, index) => verifyNode(formulaChild, proof.children[index], ctx, `${path}.children[${index}]`);
  let expected;

  if (node.op === 'true' || node.op === 'false') {
    assert(proof.children.length === 0, `${path} has unexpected children`);
    expected = node.op === 'true' ? new Set(universe) : new Set();
  } else if (node.op === 'atom') {
    assert(proof.children.length === 0, `${path} has unexpected children`);
    expected = new Set(model.states.filter(s => model.labels[s].includes(node.name)));
  } else if (node.op === 'not') {
    assert(proof.children.length === 1, `${path} needs one child`);
    expected = complement(universe, verifyChild(node.arg, 0));
  } else if (['and', 'or', 'implies'].includes(node.op)) {
    assert(proof.children.length === 2, `${path} needs two children`);
    const left = verifyChild(node.left, 0);
    const right = verifyChild(node.right, 1);
    if (node.op === 'and') expected = intersect(left, right);
    else if (node.op === 'or') expected = union(left, right);
    else expected = union(complement(universe, left), right);
  } else if (node.op === 'EX' || node.op === 'AX') {
    assert(proof.children.length === 1, `${path} needs one child`);
    const child = verifyChild(node.arg, 0);
    expected = node.op === 'EX'
      ? predecessorExists(universe, successors, child)
      : predecessorAll(universe, successors, child);
  } else {
    let target;
    let left;
    let existential;
    let kind;
    let step;
    if (['EF', 'AF', 'EG', 'AG'].includes(node.op)) {
      assert(proof.children.length === 1, `${path} needs one child`);
      target = verifyChild(node.arg, 0);
      existential = node.op === 'EF' || node.op === 'EG';
      kind = node.op === 'EF' || node.op === 'AF' ? 'least' : 'greatest';
      step = current => {
        const pre = existential
          ? predecessorExists(universe, successors, current)
          : predecessorAll(universe, successors, current);
        return kind === 'least' ? union(target, pre) : intersect(target, pre);
      };
    } else if (node.op === 'EU' || node.op === 'AU') {
      assert(proof.children.length === 2, `${path} needs two children`);
      left = verifyChild(node.left, 0);
      target = verifyChild(node.right, 1);
      existential = node.op === 'EU';
      kind = 'least';
      step = current => {
        const pre = existential
          ? predecessorExists(universe, successors, current)
          : predecessorAll(universe, successors, current);
        return union(target, intersect(left, pre));
      };
    } else {
      throw new Error(`Certificate rejected: unsupported operator ${node.op} at ${path}`);
    }

    assert(Array.isArray(proof.iterations) && proof.iterations.length >= 2, `${path}.iterations must contain a start and a fixed-point step`);
    assert(proof.iterations.length <= universe.length + 2, `${path}.iterations exceeds the finite-lattice convergence bound`);
    const snapshots = proof.iterations.map((set, i) => parseStateSet(set, universe, `${path}.iterations[${i}]`));
    const start = kind === 'least' ? new Set() : new Set(universe);
    assert(equal(snapshots[0], start), `${path} starts from the wrong lattice bound`);
    for (let i = 0; i < snapshots.length - 1; i += 1) {
      const next = step(snapshots[i]);
      assert(equal(next, snapshots[i + 1]), `${path}.iterations[${i + 1}] is not the semantic successor of iteration ${i}`);
      if (i < snapshots.length - 2) assert(!equal(snapshots[i], snapshots[i + 1]), `${path} contains a premature fixed point`);
    }
    assert(equal(step(snapshots.at(-1)), snapshots.at(-1)), `${path} does not end at a fixed point`);
    expected = snapshots.at(-1);
  }

  const claimed = parseStateSet(proof.result, universe, `${path}.result`);
  assert(equal(claimed, expected), `${path}.result does not follow from its proof obligations`);
  return expected;
}

export function verifyCertificate(modelInput, formula, certificate) {
  const model = normalizeModel(modelInput);
  validateFormula(formula);
  assert(certificate && typeof certificate === 'object' && !Array.isArray(certificate), 'certificate must be an object');
  assert(certificate.version === CERTIFICATE_VERSION, 'unsupported certificate version');
  assert(certificate.modelDigest === sha256(model), 'certificate belongs to a different model');
  assert(certificate.formulaDigest === sha256(formula), 'certificate belongs to a different formula');
  assert(certificate.certificateDigest === sha256(payloadOf(certificate)), 'certificate digest mismatch');

  const satisfying = verifyNode(formula, certificate.proof, {
    model,
    successors: buildSuccessors(model),
    universe: model.states
  }, '$');
  const initialSatisfied = model.initial.filter(s => satisfying.has(s));
  return {
    verified: true,
    modelDigest: sha256(model),
    formulaDigest: sha256(formula),
    satisfyingStates: asArray(satisfying),
    initialSatisfied,
    initialViolated: model.initial.filter(s => !satisfying.has(s)),
    holdsAtAllInitial: initialSatisfied.length === model.initial.length
  };
}
