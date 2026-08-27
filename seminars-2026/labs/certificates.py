"""Feasibility checks, intentionally not optimization algorithms."""

from .graph_io import adjacency, validate_graph


def is_coloring(graph, colors, k):
    """Check a proper k-coloring. This alone does not prove k is necessary."""
    validate_graph(graph)
    if graph["directed"] or type(k) is not int or k < 0:
        raise ValueError("Use an undirected graph and nonnegative integer k")
    if set(colors) != set(graph["vertices"]):
        return False
    if any(type(c) is not int or not 0 <= c < k for c in colors.values()):
        return False
    return all(colors[u] != colors[v] for u, v, _ in graph["edges"])


def is_dominating_set(graph, selected):
    neighbors = adjacency(graph)
    if graph["directed"]:
        raise ValueError("This activity uses undirected domination")
    chosen = set(selected)
    if not chosen <= set(neighbors):
        return False
    covered = set(chosen)
    for v in chosen:
        covered.update(neighbors[v])
    return covered == set(neighbors)


def route_cost(graph, route):
    """Validate a nonempty walk and return its cost, not its optimality."""
    neighbors = adjacency(graph)
    if not route or any(v not in neighbors for v in route):
        raise ValueError("Route must contain known vertices")
    total = 0
    for u, v in zip(route, route[1:]):
        if v not in neighbors[u]:
            raise ValueError(f"No edge/arc from {u} to {v}")
        total += neighbors[u][v]
    return total
