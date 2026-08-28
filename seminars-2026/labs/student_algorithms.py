"""Complete during the relevant studios. No graded take-home submission."""


def bfs_distances(neighbors, source):
    """Return {vertex: minimum edge count} for reachable vertices only.

    neighbors maps each vertex to a dictionary of neighbors and weights.
    Ignore weights. Raise ValueError if source is absent. Do not mutate input.
    Explain when a vertex is first discovered and why its distance is final.
    """
    raise NotImplementedError("Week 1: implement BFS and state its invariant")


def dijkstra_distances(neighbors, source):
    """Return distances to reachable vertices for a nonnegative weighted graph.

    Raise ValueError if source is absent or ANY input edge has negative weight,
    including an unreachable one. Do not mutate input. Consider a heap and
    stale entries; explain why a settled distance cannot improve.
    """
    raise NotImplementedError("Week 5: implement Dijkstra and justify settling")


def color_backtracking(neighbors, k):
    """Return a proper coloring with labels 0..k-1, or None if impossible.

    Input is a simple UNDIRECTED graph. Empty graph: return {} for k >= 0.
    Nonempty graph and k == 0: return None. Negative/noninteger k: ValueError.
    Do not mutate input. Explain the invariant and why every candidate
    assignment is considered or safely pruned. A heuristic failure is not None.
    """
    raise NotImplementedError("Coloring studio: implement exact backtracking")
