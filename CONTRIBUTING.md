# Contributing

Contributions should preserve the project's narrow, explicit semantics.

1. Add or update a test before changing model, formula, fixed-point, or certificate behaviour.
2. Keep the verifier independent from `solve()` and do not make it trust solver-provided result sets.
3. When changing certificate semantics, bump the certificate version and update `docs/proof-format.md`.
4. Include deterministic seeds for randomized tests.
5. Distinguish measured results from expectations and avoid unrepeatable performance claims.

Run `npm test`, `npm run demo`, and `npm run benchmark` before submitting a change.
