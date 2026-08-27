"""Tests supplied infrastructure, not the unfinished student functions."""

import copy
import json
import unittest
from labs.graph_io import DATA, adjacency, load_graph, validate_graph
from labs.certificates import is_coloring, is_dominating_set, route_cost


class InfrastructureTests(unittest.TestCase):
    def test_all_data_valid(self):
        with DATA.open(encoding="utf-8") as handle:
            collection = json.load(handle)
        for name in collection:
            with self.subTest(name=name):
                validate_graph(load_graph(name))

    def test_undirected_expansion(self):
        graph = load_graph("bfs")
        original = copy.deepcopy(graph)
        adj = adjacency(graph)
        self.assertEqual(adj["A"]["B"], adj["B"]["A"])
        self.assertEqual(graph, original)

    def test_directed_not_expanded(self):
        self.assertNotIn("S", adjacency(load_graph("transit"))["A"])

    def test_invalid_graphs(self):
        base = {"directed": False, "vertices": ["a", "b"], "edges": []}
        for edges in [[["a", "a", 1]], [["a", "z", 1]], [["a", "b", 1], ["b", "a", 1]], [["a", "b", float("nan")]], [["a", "b", True]]]:
            with self.subTest(edges=edges), self.assertRaises(ValueError):
                validate_graph(dict(base, edges=edges))

    def test_coloring_checks_domain_and_edges(self):
        graph = {"directed": False, "vertices": ["a", "b"], "edges": [["a", "b", 1]]}
        self.assertTrue(is_coloring(graph, {"a": 0, "b": 1}, 2))
        self.assertFalse(is_coloring(graph, {"a": 0, "b": 0}, 2))
        self.assertFalse(is_coloring(graph, {"a": 0}, 2))
        self.assertFalse(is_coloring(graph, {"a": False, "b": True}, 2))

    def test_domination_closed_neighborhood(self):
        graph = {"directed": False, "vertices": ["a"], "edges": []}
        self.assertTrue(is_dominating_set(graph, ["a"]))
        self.assertFalse(is_dominating_set(graph, []))
        self.assertFalse(is_dominating_set(graph, ["unknown"]))

    def test_route_cost_and_invalid_arc(self):
        graph = load_graph("transit")
        self.assertEqual(route_cost(graph, ["S", "A"]), 2)
        with self.assertRaises(ValueError):
            route_cost(graph, ["A", "S"])
        with self.assertRaises(ValueError):
            route_cost(graph, [])

    def test_unknown_dataset(self):
        with self.assertRaises(ValueError):
            load_graph("unknown")


if __name__ == "__main__":
    unittest.main()
