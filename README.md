# TESSERA

**Proof-carrying temporal-logic model checking for finite transition systems.**

TESSERA evaluates a supported Computation Tree Logic (CTL) fragment over finite total Kripke structures and emits a machine-checkable certificate for every result. A separate verifier checks the certificate against the model and formula without trusting the solver's claimed satisfying-state set.

> TESSERA is a research-engineering prototype. It does not claim a new model-checking algorithm or replace established verification tools. Its goal is a small, inspectable implementation with explicit semantics, reproducible tests, and independently checked proof objects.

## Why it is different

[CONCORD](https://github.com/banerjeeankita1907-hub/CONCORD) explores bounded concurrent executions and audits scheduling reductions. TESSERA addresses a different question: **which temporal properties hold over every or some path through a transition system?**

The central separation is:
1. `src/engine.js` computes satisfying-state sets and proof traces.
2. `src/certificate.js` checks semantic obligations and each fixed-point iteration independently.
3. Tests mutate certificates—including recomputing a forged certificate digest—to test whether semantic forgery is rejected.

## Capabilities

- CTL operators: `EX`, `AX`, `EF`, `AF`, `EG`, `AG`, `EU`, and `AU`.
- Boolean operators: `true`, `false`, `atom`, `not`, `and`, `or`, and `implies`.
- Explicit finite Kripke structures with multiple initial states and proposition labels.
- Total-transition validation: terminal states must have explicit self-loops.
- Least/greatest fixed-point iteration with state-set snapshots.
- SHA-256 model/formula binding and certificate integrity digest.
- Independent proof verification, including lattice start bound, recurrence steps, convergence, and the final result.
- Deterministic escrow-protocol example, seeded metamorphic tests, mutation tests, and a benchmark harness.
- No third-party runtime dependencies.

## Quick start

Requires Node.js 20 or newer.

```bash
npm test
npm run demo
npm run benchmark
```

The test suite contains 17 tests, including 80 deterministic generated-graph checks for CTL dualities and certificate acceptance. The demo checks five expected protocol properties and independently verifies every emitted certificate.

## CLI

Evaluate a formula and optionally write its proof certificate:

```bash
node src/cli.js check examples/escrow-protocol.json examples/paid-eventually-settles.json proof.json
```

Verify a previously emitted certificate:

```bash
node src/cli.js verify examples/escrow-protocol.json examples/paid-eventually-settles.json proof.json
```

The formula is a JSON abstract syntax tree. For example, “on every path, if `paid` holds, eventually `settled` holds” is:

```json
{
  "op": "AG",
  "arg": {
    "op": "implies",
    "left": { "op": "atom", "name": "paid" },
    "right": { "op": "AF", "arg": { "op": "atom", "name": "settled" } }
  }
}
```

See [semantics](docs/semantics.md) for the exact equations and [proof format](docs/proof-format.md) for verifier obligations.

## Architecture

```text
JSON model + CTL AST
        |
        v
 model / formula validation
        |
        v
 CTL fixed-point engine  ------> satisfying-state set
        |                                  |
        v                                  v
 proof certificate  ------------> independent verifier
                                           |
                                           v
                              verified state set + verdict
```

The verifier is a separate implementation path, not a callback into `solve()`. It validates child proof nodes, reconstructs predecessor operations, and checks that fixed-point traces begin at the correct lattice bound and reach a stable set.

## Soundness boundary

For a validated finite **total** transition system and a well-formed formula in the supported CTL fragment, the fixed-point equations implement the standard finite-state semantics. A successful certificate check establishes that the reported state set follows from those equations for the exact model and formula digests in the certificate.

The digest is an integrity check, not a signature. The verifier still checks semantic obligations even when a forged certificate has been re-hashed. The trusted computing base includes the certificate verifier, model normalizer, formula validator, and JavaScript runtime. The verifier itself is not machine-checked.

## Limitations

- Finite explicit-state models only; no symbolic BDD or SAT/SMT backend.
- CTL fragment only; no LTL, CTL*, or real-time temporal logic.
- No fairness constraints; paths use the ordinary total transition relation.
- No state-space reduction, distributed exploration, or compositional abstraction.
- Full fixed-point snapshots can require quadratic state-identifier storage in the worst case.
- No industrial benchmark comparison is claimed.
- Certificate checking is independent of the solver implementation but is not itself formally verified.

## Research agenda

The next meaningful steps are fairness-aware path quantifiers, witness/counterexample lasso extraction, compact proof traces, differential testing against an established CTL implementation, and comparison with symbolic engines on reproducible model families. These are future work, not implied capabilities. See [docs/research-agenda.md](docs/research-agenda.md).

## Project map

- `src/model.js` — model validation and deterministic normalization.
- `src/formula.js` — CTL AST validation.
- `src/engine.js` — fixed-point evaluator and proof-tree generation.
- `src/certificate.js` — certificate producer and independent verifier.
- `src/semantics.js` — finite-set and predecessor operations.
- `examples/` — escrow settlement model and CTL properties.
- `test/` — semantic, mutation, and seeded metamorphic tests.
- `docs/` — semantics, proof format, related foundations, threat model, and research agenda.

## License

MIT. See [LICENSE](LICENSE).
