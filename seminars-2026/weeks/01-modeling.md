# 01 — Network detective

**90 minutes.** Prerequisites: sets, functions, basic pseudocode. Tools: paper; Python optional in B. A is ungraded; final individual check is protected.

By the end you can choose a graph model, explain the BFS discovery invariant, and distinguish a route certificate from a shortest-route certificate.

## A — Foundation (before class or first 7 minutes)

For an evacuation network, what might vertices and edges represent? Give a reason to use directed edges and a reason to use weights. Explain how a walk can fail to be a path. Does a graph drawing determine travel time?

## B — Core studio

**Brief:** six rooms A–F have passages AB, AC, BD, CD, DE, CF. Each passage takes one time unit and is usable both ways. A visitor starts at A and wants E. Use the `bfs` practice graph.

1. Write the model, objective, and two omissions from the real evacuation problem. Explain why a shortest route for one visitor does not solve capacity-constrained evacuation for everyone.
2. Predict distances without running code. One partner operates a paper FIFO queue; the other records discovery order, distance, and predecessor. Explore neighbors alphabetically for a reproducible trace.
3. State why vertices leave the queue in nondecreasing distance. Prove that the first discovered distance is shortest, using an induction on layers or a shortest-path predecessor argument.
4. Optionally complete `bfs_distances` in `labs/student_algorithms.py`. It returns only reachable vertices. Add an isolated vertex G and test the contract.
5. Give the route and its length; then explain the additional reasoning that makes it shortest.

**Change:** passage AC now takes ten units; all others take one. Which part of the BFS guarantee no longer answers the original objective? Do not confuse changing the algorithm with changing what an edge means.

## C — Challenge

Two routes can have the same minimum edge count. Does the BFS predecessor tree depend on neighbor order? Does the distance map? Construct a witness and explain both answers. Alternatively, model one-way doors and detect why undirected reachability is insufficient.

## Session rhythm

7 min recall; 10 model; 20 trace/attempt; 15 compare; 18 proof; 13 changed costs/test; 7 individual check. Paper-only pairs can trace the implementation without using a laptop.

**Hand in during the session:** model card, trace, one proof paragraph, and the separate individual response. Only the announced protected response is the exit-ticket grade.
