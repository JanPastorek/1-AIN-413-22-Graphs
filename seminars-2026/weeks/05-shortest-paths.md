# 05 — Transit control room

**90 minutes; host for Practical 1 if scheduled.** Prerequisites: BFS, weighted digraphs, priority queues. Use the normal studio below OR the teacher's live-practical card, not both in full.

You will choose an algorithm from its assumptions, justify Dijkstra's settling step, and distinguish a path from an optimality certificate.

## A — Foundation

Choose a method for: unit edge costs; a directed acyclic graph with rebates; a sparse graph with nonnegative weights; negative weights without a negative cycle. Is one-source routing the same task as all-pairs routing?

## B — Core studio

**Brief:** an operator routes one passenger from S to T. Directed arcs are SA2, SB6, AB1, AC4, BC1, BT7, CT2. Use `transit`; these are synthetic travel times, not real timetable data.

1. State the model and select an algorithm before running it. Predict a route and its cost.
2. Maintain tentative labels, settled vertices, and predecessors. Use alphabetical tie-breaking only for a reproducible trace; explain whether it changes optimal distances.
3. Justify the settling step. Where exactly is nonnegativity used when comparing a possible route through an unsettled vertex?
4. Complete `dijkstra_distances` or inspect teacher-provided starter code. Add a stale-heap-entry case and an unreachable vertex. Read the function's negative-weight contract carefully.
5. Provide a route and distance labels. Check every arc inequality d(v) ≤ d(u)+w(u,v), source label zero, and a tight predecessor path for each reachable vertex. Explain why these facts together certify the shortest distances.
6. Construct a three-vertex directed counterexample to the usual Dijkstra settling rule when a negative arc is allowed. Require no negative cycle. Identify the failed proof step, not just the wrong output.

**Change:** CT is closed. Update the route, or conclude no route exists if appropriate. Separately, distinguish a relevant negative cycle from one that cannot reach the target.

## C — Challenge

Compare DAG relaxation, Bellman–Ford, and Dijkstra under one relaxation framework. Give a sparse/dense and single-source/all-pairs input profile where another algorithm is preferable. State a runtime with its representation assumptions.

## Session rhythm

7 recall; 10 model; 20 trace/code; 15 compare; 18 certificate/proof; 13 closure/counterexample; 7 protected exit. For a practical day use the 90-minute schedule in [the practical guide](../assessed-live/README.md).
