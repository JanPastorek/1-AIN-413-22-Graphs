# 07 — Evacuation control

**90 minutes.** Prerequisites: directed graphs, paths, conservation. Use tokens or a paper flow ledger; Python is optional.

You will model capacity, use reverse residual arcs, and prove optimality using an equal-capacity cut.

## A — Foundation

Define a feasible flow: capacities, nonnegativity, and conservation. Is the capacity of a cut the sum of all incident arcs, or only some directed arcs? Does shortest-path routing maximize total throughput?

## B — Core studio

**Brief:** send people per minute from S to T. Arc capacities are SA3, SB2, AB2, AT2, BT3. Use `flow`; this steady-state model omits travel times and queues.

1. Write the conservation equations at A and B. Decide what the units mean before computing.
2. Start by sending two units along S–A–B–T. Draw the full residual network, including reverse arcs. Explain the meaning of B→A even though the original input lacks that arc.
3. Improve the flow. Every augmentation must record the residual path, bottleneck, changed original flows, and conservation check.
4. Another pair chooses a cut separating S from T. Compare cut capacity with your flow value. If they match, give a two-sided optimality argument.
5. Prove weak duality: any feasible flow value is at most any S–T cut capacity. Then explain how the residual reachable set gives a matching cut when no augmenting path remains. Integral capacities and integral augmentations explain integrality here.

**Change:** AT loses one unit of capacity. Predict whether the old flow remains feasible and whether the old cut proves the new optimum. Repair both where necessary.

## C — Challenge

Split a vertex to model a capacity limit at a junction. Or sketch the tournament-elimination network from the lecture: what does each source-side game node represent, and what cut certificate would explain elimination? Keep assumptions about remaining games explicit.

## Session rhythm

7 recall; 10 model; 20 residual simulation; 15 compare; 18 cut proof; 13 capacity change; 7 protected exit. A value printed by a solver is not the complete answer: exhibit feasible flow and cut separately.
