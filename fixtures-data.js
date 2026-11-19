export const tinyModel = {
  id: 'tiny',
  states: ['s0', 's1', 's2'],
  initial: ['s0'],
  labels: { s0: ['start'], s1: ['goal'], s2: ['bad'] },
  transitions: [['s0', 's1'], ['s0', 's2'], ['s1', 's1'], ['s2', 's2']]
};

export const atom = name => ({ op: 'atom', name });
export const unary = (op, arg) => ({ op, arg });
export const binary = (op, left, right) => ({ op, left, right });
