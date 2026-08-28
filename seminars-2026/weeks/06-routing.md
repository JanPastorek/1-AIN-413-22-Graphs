# 06 — Snowplough versus courier

**90 minutes.** Prerequisites: degree parity, connectedness, trails/cycles. Paper, capacity-free route cards, optional House of Graphs search.

You will distinguish edge coverage from vertex visitation, construct an Euler trail, and avoid treating a failed Hamilton search as proof.

## A — Foundation

Explain why every non-endpoint of an Euler trail has even degree. What changes for a closed trail? State the connectivity condition carefully, including isolated vertices.

## B — Core studio

Two service teams use the same street map: the snowplough must traverse every street; a courier must visit every location. The undirected graph has triangle ABC, triangle ADE, and isolated vertex F. Edges: AB, BC, CA, AD, DE, EA.

1. Write each objective. Is revisiting a junction allowed? Is F part of the service requirement? Identify the modeling decision before invoking a theorem.
2. Construct an Euler circuit on the non-isolated component by splicing cycles. Explain why the splice remains a trail and eventually uses every edge.
3. Prove necessity of the parity condition and explain the constructive sufficiency argument. Add one new edge and predict which Euler objects remain possible.
4. Decide whether the five-vertex non-isolated component has a Hamilton cycle. Give a structural reason, not just unsuccessful enumeration. Do not include F unless you are deliberately discussing disconnectedness.
5. In [House of Graphs](https://houseofgraphs.org/search), search for a connected 10-vertex graph with minimum and maximum degree 3 and **Hamiltonian = No**. Inspect a result. Which properties can you verify yourself quickly? Which statement still relies on the source?

## C — Challenge

Investigate the Petersen graph's non-Hamiltonicity with an instructor proof scaffold. Or formulate the Chinese Postman problem when repeated streets are allowed but expensive. Explain why a sufficient Hamiltonicity condition such as Dirac's is not a necessary condition.

## Session rhythm

7 recall; 10 model; 20 route construction; 15 compare; 18 Euler proof; 13 Hamilton obstruction/search; 7 protected exit. If no database access is available, use the teacher's graph card. Never infer nonexistence from a single heuristic's failure.
