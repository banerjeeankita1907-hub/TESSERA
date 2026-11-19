# Research agenda

TESSERA is an intentionally bounded prototype. The following experiments would turn it into a stronger research project.

## 1. Witness and counterexample extraction

Produce shortest finite witnesses for existential reachability and lasso witnesses for existential globally properties. For universal liveness failures, produce an explicit violating path or lasso. Measure trace length and checker cost separately from state-set computation.

## 2. Certificate compression

Current iteration snapshots can require \(O(|S|^2)\) state identifiers. Compare full snapshots with delta layers, predecessor/rank certificates, and hash-consed proof DAGs. Preserve independent checkability while reporting proof size and verification time.

## 3. Fairness

Add weak/strong fairness semantics with an explicit and documented justice/compassion model. Test against hand-derived examples where unfair infinite schedules invalidate naive liveness conclusions.

## 4. Differential verification

Encode common finite Kripke structures in an established CTL tool and compare all-state truth sets. Record tool versions, model encodings, command lines, and all mismatches. The current project has no such differential baseline.

## 5. Algorithmic comparison

Compare explicit-state fixed-point evaluation with symbolic BDD or SAT-based techniques on model families with controllable graph structure. Report memory, runtime, certificate size, and independent-checker runtime. Avoid single-number claims without repeated trials and reproducible hardware details.

## 6. Verifier assurance

Translate the small certificate checker into a proof assistant or use property-based differential validation to increase confidence in the trusted core. Until then, source-level correctness remains an assumption.
