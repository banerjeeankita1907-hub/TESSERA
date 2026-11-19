const UNARY = new Set(['not', 'EX', 'AX', 'EF', 'AF', 'EG', 'AG']);
const BINARY = new Set(['and', 'or', 'implies', 'EU', 'AU']);
const NULLARY = new Set(['true', 'false', 'atom']);

function invalid(path, message) {
  throw new TypeError(`Invalid CTL formula at ${path}: ${message}`);
}

export function validateFormula(formula, path = '$') {
  if (!formula || typeof formula !== 'object' || Array.isArray(formula)) invalid(path, 'expected an object');
  if (typeof formula.op !== 'string') invalid(path, 'op must be a string');
  const { op } = formula;
  if (!NULLARY.has(op) && !UNARY.has(op) && !BINARY.has(op)) invalid(path, `unsupported operator ${op}`);

  if (op === 'atom') {
    if (typeof formula.name !== 'string' || formula.name.trim() === '') invalid(path, 'atom.name must be a non-empty string');
    return;
  }
  if (op === 'true' || op === 'false') return;
  if (UNARY.has(op)) {
    if (!Object.hasOwn(formula, 'arg')) invalid(path, `${op} requires arg`);
    validateFormula(formula.arg, `${path}.arg`);
    return;
  }
  if (!Object.hasOwn(formula, 'left') || !Object.hasOwn(formula, 'right')) invalid(path, `${op} requires left and right`);
  validateFormula(formula.left, `${path}.left`);
  validateFormula(formula.right, `${path}.right`);
}
