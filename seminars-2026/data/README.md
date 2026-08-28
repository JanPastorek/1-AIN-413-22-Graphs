# Graph data catalog

These seven **synthetic practice graphs** were constructed for this pack. They do not describe real infrastructure or people. Edge values are costs in `fiber`, travel-time units in `transit`, capacities in `flow`, and unit weights elsewhere. Directed arcs are listed once; undirected edges are also listed once and expanded by the loader. Vertex labels are strings; there are no parallel edges or loops.

| Name | n | m | Used for |
|---|---:|---:|---|
| bfs | 6 | 6 | BFS queue, layers, unreachable-vertex perturbation |
| fiber | 6 | 9 | MST, exchange and updated cost |
| transit | 5 | 7 | Directed shortest paths and algorithm choice |
| flow | 4 | 5 | Integral flow, reverse residual arcs, cut certificate |
| placements | 6 | 5 | Bipartite allocation and augmenting paths |
| sensor | 6 | 6 | Radius-one coverage and domination bounds |
| coloring | 5 | 5 | Backtracking, odd-cycle lower bound |

The [JSON source](studio_graphs.json) can also be read directly without Python. Run `python3 -m labs.inspect_graph NAME` from the pack root for a textual adjacency view. These are public practice instances, never the future protected test data.

The existing course's Vienna subway, power-grid, collaboration, biological, and other networks remain in the historical repository. Their presence does not establish a redistribution license. For an authentic-data extension, first record the original publisher, license, snapshot date, graph construction, units, loops/multiedges, missing observations, and any privacy issues. The synthetic examples let the first pilot proceed without assuming these details.
