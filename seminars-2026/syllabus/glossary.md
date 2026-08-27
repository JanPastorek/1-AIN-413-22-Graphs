# Terminology and assumptions

Use finite simple undirected graphs unless the task explicitly says otherwise. Define n as the number of vertices and m as the number of edges/arcs. Different drawings need not describe different graphs.

| Distinction | Meaning |
|---|---|
| Walk / trail / path | Repetition allowed / no repeated edge / no repeated vertex |
| Euler / Hamilton | Use every edge exactly once / visit every vertex exactly once; specify trail versus circuit and path versus cycle |
| Connected / strongly connected | Undirected reachability / directed reachability both ways between every pair |
| Maximal / maximum | Cannot extend by adding one eligible item / best cardinality among all feasible objects |
| Perfect / left-saturating matching | Covers every vertex / covers the specified left side of a bipartite graph |
| Necessary / sufficient | Required for the conclusion / guarantees the conclusion; neither automatically gives the converse |
| Planar / plane | Has a crossing-free drawing / comes with a particular embedding |
| Radius / diameter | Minimum / maximum vertex eccentricity in a connected graph |
| Dominating set / vertex cover | Every vertex is selected or adjacent to a selected vertex / every edge has a selected endpoint |
| Domination / total domination | A selected vertex covers itself / even selected vertices need a selected neighbor |
| Clique number / chromatic number | Largest complete subgraph / minimum number of colors in a proper vertex coloring |
| Stable matching | No blocking pair who prefer each other to their assigned partners; not an alternative word for maximum matching |

## Algorithm caveats

- BFS minimizes edge count, not general weighted cost.
- Binary-heap Dijkstra with adjacency lists takes O((n+m) log n) and requires nonnegative weights for the usual settling proof.
- Bellman–Ford detects a negative cycle reachable from the source. A target has shortest-walk value unbounded below only if that cycle can also reach the target.
- Replacing an undirected negative edge by opposite arcs creates a negative two-arc cycle. A financial-rebate example should therefore use a suitable directed model.
- A directed acyclic graph allows shortest-path relaxation in topological order even with negative weights.
- An Euler circuit requires even degrees and connectivity among vertices of nonzero degree. State how the edgeless case is handled.
- A planar dual depends on the plane embedding. A primal bridge corresponds to a dual loop.
- Havel–Hakimi can decide graphicality or produce one realization; it does not enumerate all non-isomorphic realizations.
- A tree degree sequence on n ≥ 2 has positive entries summing to 2n−2. The one-vertex tree has degree sequence (0).
- A graph-database search and a random sample have different meanings. Record the class, order bounds, and whether enumeration is complete.
