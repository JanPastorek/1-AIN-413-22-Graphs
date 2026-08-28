"""Read and validate the deliberately small JSON graph format."""

import json
import math
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data" / "studio_graphs.json"


def validate_graph(graph):
    if not isinstance(graph, dict):
        raise ValueError("A graph must be an object")
    if type(graph.get("directed")) is not bool:
        raise ValueError("directed must be boolean")
    vertices, edges = graph.get("vertices"), graph.get("edges")
    if not isinstance(vertices, list) or any(not isinstance(v, str) for v in vertices):
        raise ValueError("vertices must be a list of strings")
    if len(set(vertices)) != len(vertices):
        raise ValueError("Duplicate vertex")
    if not isinstance(edges, list):
        raise ValueError("edges must be a list")
    seen = set()
    for edge in edges:
        if not isinstance(edge, list) or len(edge) != 3:
            raise ValueError("An edge must be [source, target, weight]")
        u, v, w = edge
        if u not in vertices or v not in vertices or u == v:
            raise ValueError("Unknown endpoint or loop")
        if type(w) not in (int, float) or (type(w) is float and not math.isfinite(w)):
            raise ValueError("Weights must be finite real numbers")
        key = (u, v) if graph["directed"] else tuple(sorted((u, v)))
        if key in seen:
            raise ValueError("Parallel or duplicate edge")
        seen.add(key)
    return graph


def load_graph(name, path=DATA):
    with Path(path).open(encoding="utf-8") as handle:
        collection = json.load(handle)
    if name not in collection:
        raise ValueError(f"Unknown graph {name!r}; choose from {', '.join(collection)}")
    return validate_graph(collection[name])


def adjacency(graph):
    validate_graph(graph)
    result = {v: {} for v in graph["vertices"]}
    for u, v, w in graph["edges"]:
        result[u][v] = w
        if not graph["directed"]:
            result[v][u] = w
    return result
