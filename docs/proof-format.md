# Certificate format and verifier obligations

A TESSERA certificate has five fields:

```json
{
  "version": "tessera-ctl-certificate/v1",
  "modelDigest": "<sha256 of normalized model>",
  "formulaDigest": "<sha256 of formula AST>",
  "proof": { "op": "...", "result": ["..."], "children": [] },
  "certificateDigest": "<sha256 of all preceding fields>"
}
```

The digest canonicalizes object keys before hashing. Arrays retain their order. Model normalization sorts state names, labels, initial states, and transitions, so irrelevant JSON object ordering does not change the model binding.

## Proof nodes

Each proof node mirrors one formula AST node and stores:

- `op`: the same operator as the corresponding formula node;
- `children`: recursively checked child proofs;
- `result`: sorted, duplicate-free satisfying-state set;
- `iterations`: present on fixed-point operators and containing the complete sequence of state sets, including the initial lattice bound and final repeated stable set.

## Verifier checks

1. Normalize the supplied model and validate the formula.
2. Check the certificate version, model digest, formula digest, and whole-certificate digest.
3. Recursively ensure each proof node has the same operator and child structure as the formula.
4. Recompute atomic and Boolean state sets from the model and checked child sets.
5. Recompute `EX` and `AX` directly from the transition relation.
6. For a least fixed point, require the first snapshot to be empty. For a greatest fixed point, require it to be the full state universe.
7. Recompute every fixed-point successor set from the operator's semantic recurrence and the already-verified child sets.
8. Require the last snapshot to be stable and the node's claimed `result` to equal it.

The verifier does not call the solver. The semantic recurrence is re-applied in the checker, making the certificate a checkable execution trace rather than a trusted answer from the search engine.

## What the certificate does not establish

- It is not a digital signature and does not identify who generated the proof.
- SHA-256 hashes bind the proof to input data and detect accidental/stale edits; hashes do not prove semantic correctness.
- It does not prove that the input model faithfully represents a real deployed system.
- It does not prove the verifier implementation itself correct.
- It does not prove properties of an infinite-state or unmodelled implementation.
