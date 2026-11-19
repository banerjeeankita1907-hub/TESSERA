# Trust and threat model

## Assets and claims

TESSERA aims to establish a narrow claim: for a supplied finite, total transition system and a supported CTL formula, the reported satisfying-state set is justified by a certificate that the separate checker accepts.

## In scope

- Accidental model/formula/certificate mismatch.
- Corrupted certificate bytes.
- A producer that reports a forged satisfying-state set.
- A producer that inserts an incorrect fixed-point iteration and recomputes the outer digest.
- Malformed transition systems and malformed formula ASTs.

## Mitigations

- Strict model and formula validation.
- Normalized SHA-256 input binding.
- Certificate integrity digest.
- Semantic verification of every proof node.
- Tests that deliberately mutate proof content and re-seal the digest to bypass the simple integrity check.

## Out of scope

- Malicious JavaScript runtime, compromised host, or altered verifier source.
- Cryptographic identity, signatures, remote attestation, or supply-chain provenance.
- Model extraction correctness: a correct model checker cannot compensate for an incorrect model.
- Infinite-state systems, concurrency outside the explicitly modelled transition graph, or assumptions omitted from the model.

## Operational guidance

Treat successful verification as evidence about the exact model and formula supplied, not as blanket certification of a production system. Review assumptions, state abstraction, environment behaviour, and protocol-to-model correspondence separately.
