"""Small public smoke checks, not a grade or proof of correctness."""

from .certificates import is_coloring
from .graph_io import adjacency, load_graph
from .student_algorithms import bfs_distances, color_backtracking, dijkstra_distances


def main():
    tiny = {"A": {"B": 2}, "B": {}}
    checks = [
        ("BFS: two vertices", lambda: bfs_distances(tiny, "A") == {"A": 0, "B": 1}),
        ("Dijkstra: two vertices", lambda: dijkstra_distances(tiny, "A") == {"A": 0, "B": 2}),
        ("Coloring: cycle practice", lambda: is_coloring(load_graph("coloring"), color_backtracking(adjacency(load_graph("coloring")), 3) or {}, 3)),
    ]
    failed = 0
    for name, check in checks:
        try:
            ok = check()
            print(f"{'PASS' if ok else 'FAIL'}: {name}")
            failed += not ok
        except NotImplementedError:
            print(f"NOT IMPLEMENTED: {name}")
            failed += 1
        except Exception as error:
            print(f"ERROR: {name}: {type(error).__name__}: {error}")
            failed += 1
    print("Public feedback only. Add boundary/adversarial tests and explain correctness.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
