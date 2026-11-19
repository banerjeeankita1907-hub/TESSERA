import { sorted } from './canonical.js';

function fail(message) {
  throw new TypeError(`Invalid transition system: ${message}`);
}

export function normalizeModel(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('expected an object');
  if (typeof input.id !== 'string' || input.id.trim() === '') fail('id must be a non-empty string');
  if (!Array.isArray(input.states) || input.states.length === 0) fail('states must be a non-empty array');
  if (input.states.some(s => typeof s !== 'string' || s.trim() === '')) fail('every state must be a non-empty string');
  if (new Set(input.states).size !== input.states.length) fail('state names must be unique');

  const states = sorted(input.states);
  const stateSet = new Set(states);
  if (!Array.isArray(input.initial) || input.initial.length === 0) fail('initial must be a non-empty array');
  for (const state of input.initial) if (!stateSet.has(state)) fail(`unknown initial state: ${state}`);
  if (new Set(input.initial).size !== input.initial.length) fail('initial states must be unique');

  if (!Array.isArray(input.transitions)) fail('transitions must be an array of [from, to] pairs');
  const edgeKeys = new Set();
  const transitions = input.transitions.map((edge, index) => {
    if (!Array.isArray(edge) || edge.length !== 2) fail(`transition ${index} must be a [from, to] pair`);
    const [from, to] = edge;
    if (!stateSet.has(from) || !stateSet.has(to)) fail(`transition ${index} references an unknown state`);
    const key = `${from}\u0000${to}`;
    if (edgeKeys.has(key)) fail(`duplicate transition ${from} -> ${to}`);
    edgeKeys.add(key);
    return [from, to];
  }).sort((a, b) => `${a[0]}\u0000${a[1]}`.localeCompare(`${b[0]}\u0000${b[1]}`));

  const successors = new Map(states.map(s => [s, []]));
  for (const [from, to] of transitions) successors.get(from).push(to);
  for (const state of states) {
    if (successors.get(state).length === 0) fail(`state ${state} has no successor; TESSERA requires a total transition relation (add an explicit self-loop for terminal states)`);
  }

  if (input.labels === undefined || input.labels === null || typeof input.labels !== 'object' || Array.isArray(input.labels)) {
    fail('labels must be an object mapping state names to arrays of propositions');
  }
  for (const state of Object.keys(input.labels)) if (!stateSet.has(state)) fail(`labels contain unknown state ${state}`);
  const labels = {};
  for (const state of states) {
    const props = input.labels[state] ?? [];
    if (!Array.isArray(props) || props.some(p => typeof p !== 'string' || p.trim() === '')) fail(`labels for ${state} must be an array of non-empty strings`);
    if (new Set(props).size !== props.length) fail(`labels for ${state} contain duplicates`);
    labels[state] = sorted(props);
  }

  return {
    id: input.id,
    states,
    initial: sorted(input.initial),
    labels,
    transitions
  };
}

export function buildSuccessors(model) {
  const map = new Map(model.states.map(state => [state, []]));
  for (const [from, to] of model.transitions) map.get(from).push(to);
  return map;
}
