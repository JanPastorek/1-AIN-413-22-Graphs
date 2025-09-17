import networkx as nx
from home_project_2_solution import asymmetric_depth


def test_asym_depth():
    # note that these are the same seq. as we did by hand on exercises
    g6_1 = "G?qfRk"
    G1 = nx.from_graph6_bytes(g6_1.encode())
    G2 = nx.path_graph(5)
    G3 = nx.cycle_graph(6)
    g6_4 = "Jft|WxPA]?_"
    G4 = nx.from_graph6_bytes(g6_4.encode())

    assert asymmetric_depth(G1) == 2
    print("Test 1 passed ")
    assert asymmetric_depth(G2) == 0
    print("Test 2 passed ")
    assert asymmetric_depth(G3) == 0
    print("Test 3 passed ")
    assert asymmetric_depth(G4) == 3
    print("Test 4 passed ")


if __name__ == "__main__":
    test_asym_depth()
