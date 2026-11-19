# Related foundations

TESSERA implements standard finite-state CTL semantics; it does not claim to originate CTL or fixed-point model checking.

- E. M. Clarke, O. Grumberg, and D. A. Peled, *Model Checking*, MIT Press, 1999. A foundational reference for temporal-logic model checking.
- C. Baier and J.-P. Katoen, *Principles of Model Checking*, MIT Press, 2008. A broad treatment of transition systems, temporal logics, and verification algorithms.
- A. Biere, A. Cimatti, E. M. Clarke, O. Strichman, and Y. Zhu, “Bounded Model Checking,” *Advances in Computers*, 2003. Background on bounded SAT-based model checking; TESSERA currently does not implement BMC.

The project-specific engineering question is how to structure a small explicit-state CTL evaluator so that its computed truth sets are accompanied by independently checkable fixed-point iteration records. This repository is a prototype for studying that interface, not evidence of algorithmic novelty relative to established tools.
