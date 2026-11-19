export function union(a, b) {
  return new Set([...a, ...b]);
}

export function intersect(a, b) {
  return new Set([...a].filter(x => b.has(x)));
}

export function complement(universe, a) {
  return new Set(universe.filter(x => !a.has(x)));
}

export function predecessorExists(states, successors, target) {
  const result = new Set();
  for (const state of states) {
    if (successors.get(state).some(next => target.has(next))) result.add(state);
  }
  return result;
}

export function predecessorAll(states, successors, target) {
  const result = new Set();
  for (const state of states) {
    const next = successors.get(state);
    if (next.length > 0 && next.every(s => target.has(s))) result.add(state);
  }
  return result;
}

export function fixedPoint({ kind, states, seed, step }) {
  const initial = kind === 'least' ? new Set() : new Set(states);
  const iterations = [asArray(initial)];
  let current = initial;
  const limit = states.length + 2;
  for (let i = 0; i < limit; i += 1) {
    const next = step(current);
    iterations.push(asArray(next));
    if (equal(current, next)) return { result: next, iterations };
    current = next;
  }
  throw new Error(`Fixed point failed to converge within ${limit} iterations`);
}

export function asArray(set) {
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function equal(a, b) {
  return a.size === b.size && [...a].every(x => b.has(x));
}
