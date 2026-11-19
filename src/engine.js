import { normalizeModel, buildSuccessors } from './model.js';
import { validateFormula } from './formula.js';
import { sha256 } from './canonical.js';
import {
  union, intersect, complement, predecessorExists, predecessorAll,
  fixedPoint, asArray
} from './semantics.js';
import { makeCertificate } from './certificate.js';

function solveNode(node, ctx) {
  const { model, successors, universe } = ctx;
  const solve = child => solveNode(child, ctx);
  const make = (result, children = [], iterations = undefined) => {
    const proof = { op: node.op, result: asArray(result), children };
    if (iterations) proof.iterations = iterations;
    return proof;
  };

  if (node.op === 'true') return make(new Set(universe));
  if (node.op === 'false') return make(new Set());
  if (node.op === 'atom') {
    return make(new Set(model.states.filter(state => model.labels[state].includes(node.name))));
  }
  if (node.op === 'not') {
    const child = solve(node.arg);
    return make(complement(universe, new Set(child.result)), [child]);
  }
  if (node.op === 'and' || node.op === 'or' || node.op === 'implies') {
    const left = solve(node.left);
    const right = solve(node.right);
    const a = new Set(left.result);
    const b = new Set(right.result);
    if (node.op === 'and') return make(intersect(a, b), [left, right]);
    if (node.op === 'or') return make(union(a, b), [left, right]);
    return make(union(complement(universe, a), b), [left, right]);
  }
  if (node.op === 'EX' || node.op === 'AX') {
    const child = solve(node.arg);
    const target = new Set(child.result);
    const result = node.op === 'EX'
      ? predecessorExists(universe, successors, target)
      : predecessorAll(universe, successors, target);
    return make(result, [child]);
  }

  let leftProof;
  let rightProof;
  let target;
  let kind;
  let step;
  if (['EF', 'AF', 'EG', 'AG'].includes(node.op)) {
    const child = solve(node.arg);
    target = new Set(child.result);
    const existential = node.op === 'EF' || node.op === 'EG';
    const least = node.op === 'EF' || node.op === 'AF';
    kind = least ? 'least' : 'greatest';
    step = current => {
      const pre = existential
        ? predecessorExists(universe, successors, current)
        : predecessorAll(universe, successors, current);
      return least ? union(target, pre) : intersect(target, pre);
    };
    const fp = fixedPoint({ kind, states: universe, step });
    return make(fp.result, [child], fp.iterations);
  }

  if (node.op === 'EU' || node.op === 'AU') {
    leftProof = solve(node.left);
    rightProof = solve(node.right);
    const left = new Set(leftProof.result);
    const right = new Set(rightProof.result);
    const existential = node.op === 'EU';
    kind = 'least';
    step = current => {
      const pre = existential
        ? predecessorExists(universe, successors, current)
        : predecessorAll(universe, successors, current);
      return union(right, intersect(left, pre));
    };
    const fp = fixedPoint({ kind, states: universe, step });
    return make(fp.result, [leftProof, rightProof], fp.iterations);
  }
  throw new Error(`Internal error: unhandled operator ${node.op}`);
}

export function solve(modelInput, formula) {
  const model = normalizeModel(modelInput);
  validateFormula(formula);
  const successors = buildSuccessors(model);
  const proof = solveNode(formula, { model, successors, universe: model.states });
  const result = new Set(proof.result);
  const initialSatisfied = model.initial.filter(s => result.has(s));
  const certificate = makeCertificate(model, formula, proof);
  return {
    model,
    formula,
    proof,
    certificate,
    result: {
      satisfyingStates: proof.result,
      initialSatisfied,
      initialViolated: model.initial.filter(s => !result.has(s)),
      holdsAtAllInitial: initialSatisfied.length === model.initial.length
    }
  };
}

export function fingerprintModel(modelInput) {
  return sha256(normalizeModel(modelInput));
}
