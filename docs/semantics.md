# TESSERA semantics

## 1. Model

A model is a finite Kripke structure \(K=(S,R,L,I)\):

- \(S\) is a finite, non-empty set of named states.
- \(R\subseteq S\times S\) is the transition relation.
- \(L:S\to 2^{AP}\) assigns atomic propositions to states.
- \(I\subseteq S\) is a non-empty set of initial states.

TESSERA requires **totality**: every state has at least one outgoing transition. A terminal state is represented by an explicit self-loop. This keeps the path semantics and the `AX` operator unambiguous.

## 2. Supported syntax

State formulas:

\[
\varphi ::= \top\mid\bot\mid p\mid \neg\varphi\mid
(\varphi\land\varphi)\mid(\varphi\lor\varphi)\mid(\varphi\to\varphi)
\]

\[
\mid EX\,\varphi\mid AX\,\varphi\mid EF\,\varphi\mid AF\,\varphi\mid EG\,\varphi\mid AG\,\varphi
\]

\[
\mid E[\varphi\ U\ \psi]\mid A[\varphi\ U\ \psi]
\]

The JSON representation uses `true`, `false`, `atom`, `not`, `and`, `or`, `implies`, and the exact uppercase temporal operator names.

## 3. Predecessor operators

For a set of states \(X\):

\[
Pre_E(X)=\{s\in S\mid \exists t:(s,t)\in R\land t\in X\}
\]

\[
Pre_A(X)=\{s\in S\mid \forall t:(s,t)\in R\Rightarrow t\in X\}
\]

Because the relation is total, every state has at least one successor. Therefore \(AX\,\varphi\equiv\neg EX\,\neg\varphi\).

## 4. Temporal fixed points

The implementation evaluates temporal formulas over the finite powerset lattice \((2^S,\subseteq)\). Let \(Sat(\varphi)\) denote the satisfying-state set for \(\varphi\).

### Next

\[
Sat(EX\,\varphi)=Pre_E(Sat(\varphi))
\]
\[
Sat(AX\,\varphi)=Pre_A(Sat(\varphi))
\]

### Eventually and globally

\[
Sat(EF\,\varphi)=\mu X.(Sat(\varphi)\cup Pre_E(X))
\]
\[
Sat(AF\,\varphi)=\mu X.(Sat(\varphi)\cup Pre_A(X))
\]
\[
Sat(EG\,\varphi)=\nu X.(Sat(\varphi)\cap Pre_E(X))
\]
\[
Sat(AG\,\varphi)=\nu X.(Sat(\varphi)\cap Pre_A(X))
\]

### Until

\[
Sat(E[\varphi U \psi])=\mu X.(Sat(\psi)\cup(Sat(\varphi)\cap Pre_E(X)))
\]
\[
Sat(A[\varphi U \psi])=\mu X.(Sat(\psi)\cup(Sat(\varphi)\cap Pre_A(X)))
\]

Here \(\mu\) is the least fixed point and \(\nu\) is the greatest fixed point.

## 5. Why finite iteration terminates

For a least fixed point, iteration starts at \(X_0=\varnothing\) and repeatedly applies its monotone transformer \(F\):

\[
X_0=\varnothing,\qquad X_{i+1}=F(X_i).
\]

The sequence is ascending. Every strict step adds at least one state, so there can be at most \(|S|\) strict additions before a fixed point is reached.

For a greatest fixed point, iteration starts at \(X_0=S\) and repeatedly applies \(F\). The sequence is descending. Every strict step removes at least one state, so it also stabilizes after at most \(|S|\) strict removals.

## 6. Correctness argument (implementation-level)

A structural induction over the formula tree establishes that each non-temporal node computes the standard Boolean set operation. `EX` and `AX` use the predecessor definitions above. For each temporal node, its transformer is monotone; iteration from the bottom (least) or top (greatest) element of the finite lattice reaches the corresponding extremal fixed point. Thus the reported set agrees with the stated CTL semantics, assuming the implementation of set and predecessor operations is correct.

This is a mathematical argument about the algorithm and its semantics, **not** a formal proof of the source code. The verifier is not machine-checked, and the implementation remains in the trusted computing base.
