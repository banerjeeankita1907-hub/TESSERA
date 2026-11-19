# TESSERA

**Proof-carrying temporal-logic model checking for finite transition systems.**

TESSERA evaluates a supported CTL fragment over finite total Kripke structures and emits proof certificates that a separate verifier checks independently.

This is a research-engineering prototype, not a claim of a new model-checking algorithm or a replacement for industrial verification tools. The implementation prioritizes explicit semantics, inspectable proof objects, reproducible tests, and honest limitations.

## Status

Initial source publication. See the complete project documentation, examples, tests, and research agenda in this repository.

## Quick start

Requires Node.js 20 or newer.

```bash
npm test
npm run demo
npm run benchmark
```

## Research scope

The project implements CTL fixed-point evaluation and proof-certificate verification. It does not currently implement fairness, LTL/CTL*, symbolic BDD/SAT backends, or machine-checked verification of its own verifier.

See the docs for semantics, certificate format, threat model, related foundations, and next experiments.
