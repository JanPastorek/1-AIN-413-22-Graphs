# Reasoning guide

## An algorithm answer in six parts

1. **Model:** vertices, edges, direction, weights, input representation, objective.
2. **Method:** precise pseudocode or a clearly specified algorithm.
3. **Invariant:** what remains true before/after each important operation?
4. **Correctness:** why termination gives the required result, or what certificate verifies it.
5. **Cost:** define n and m; include data-structure and representation assumptions.
6. **Transfer:** test a boundary/adversarial case and interpret the result in the original story.

An implementation and its tests answer different questions from a proof. A greedy coloring using four colors proves an upper bound of four, not that four are necessary.

## Reusable proof moves

| Move | Questions to ask | Typical topic |
|---|---|---|
| Induction / minimal counterexample | What smaller object preserves the hypotheses? How do I extend its solution? | Trees, six-color theorem |
| Loop invariant | Initialization? Preservation? Termination? | BFS, Dijkstra |
| Exchange | Can I replace one edge in an optimum without making it worse? | MST |
| Counting twice | What set of incidences am I counting in two ways? | Handshaking, planar edge bounds |
| Witness and bound | Does a feasible result meet an independently justified bound? | Flow/cut, matching/cover, domination |
| Augmenting path | What alternating or residual structure improves the current solution? | Flows, matching |
| Counterexample | Which implication is false? Which assumption repairs it? | False converses, greedy methods |
| Indicator variables | Which elementary events make up the quantity? Must they be independent? | Random graphs |

## Counterexample checklist

State the false claim precisely. Supply an edge list or unambiguous construction. Verify **every hypothesis** and show the conclusion fails. “The software says no” is not yet your explanation. If you claim the counterexample is smallest, justify why smaller orders cannot work.

## Peer explanation protocol

Rehearse for two minutes with your partner. Give a four-minute explanation to another pair: one student introduces the model or statement; the other explains the key proof step. The audience asks one question about an assumption. Switch roles next time. Record one correction after feedback. This happens inside the seminar, not as a graded home presentation.
