"""Usage: python3 -m labs.inspect_graph transit"""

import argparse
from .graph_io import adjacency, load_graph


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name")
    args = parser.parse_args()
    try:
        graph = load_graph(args.name)
    except ValueError as error:
        parser.error(str(error))
    print(f"{args.name}: {len(graph['vertices'])} vertices, {len(graph['edges'])} edges/arcs")
    print("directed" if graph["directed"] else "undirected")
    for vertex, neighbors in adjacency(graph).items():
        print(f"{vertex}: " + ", ".join(f"{v} ({w})" for v, w in neighbors.items()))


if __name__ == "__main__":
    main()
