import networkx as nx
from typing import List
from home_project_1_solution import havel_hakimi, all_graphs_from_degree_sequence


def test_havel_hakimi():
    # note that these are the same seq. as we did by hand on exercises
    list1 = [2, 2, 2, 1, 1]
    list2 = [2, 2]
    list3 = [2, 2, 2, 2]
    list4 = [3, 3, 5, 1, 7, 9, 1]
    list5 = [3, 3, 3, 3, 3, 3, 3, 3]
    list6 = [6, 5, 5, 4, 3, 3, 3, 2, 2]
    list7 = [3, 3, 2, 2, 1, 1]
    list8 = [7, 6, 4, 3, 3, 2]
    list9 = [3, 3, 1, 1]
    list10 = [5, 4, 3, 3, 2, 2, 2, 1, 1, 1]

    # check if the sequence is graphical or not
    assert havel_hakimi(list1) == nx.is_graphical(list1, method="hh")
    print("Test 1 passed ", str(list1), " is graphical? ",
          nx.is_graphical(list1, method="hh"))
    assert havel_hakimi(list2) == nx.is_graphical(list2, method="hh")
    print("Test 2 passed ", str(list2), " is graphical? ",
          nx.is_graphical(list2, method="hh"))
    assert havel_hakimi(list3) == nx.is_graphical(list3, method="hh")
    print("Test 3 passed ", str(list3), " is graphical? ",
          nx.is_graphical(list3, method="hh"))
    assert havel_hakimi(list4) == nx.is_graphical(list4, method="hh")
    print("Test 4 passed ", str(list4), " is graphical? ",
          nx.is_graphical(list4, method="hh"))
    assert havel_hakimi(list5) == nx.is_graphical(list5, method="hh")
    print("Test 5 passed ", str(list5), " is graphical? ",
          nx.is_graphical(list5, method="hh"))
    assert havel_hakimi(list6) == nx.is_graphical(list6, method="hh")
    print("Test 6 passed ", str(list6), " is graphical? ",
          nx.is_graphical(list6, method="hh"))
    assert havel_hakimi(list7) == nx.is_graphical(list7, method="hh")
    print("Test 7 passed ", str(list7), " is graphical? ",
          nx.is_graphical(list7, method="hh"))
    assert havel_hakimi(list8) == nx.is_graphical(list8, method="hh")
    print("Test 8 passed ", str(list8), " is graphical? ",
          nx.is_graphical(list8, method="hh"))
    assert havel_hakimi(list9) == nx.is_graphical(list9, method="hh")
    print("Test 9 passed ", str(list9), " is graphical? ",
          nx.is_graphical(list9, method="hh"))
    assert havel_hakimi(list10) == nx.is_graphical(list10, method="hh")
    print("Test 10 passed ", str(list10), " is graphical? ",
          nx.is_graphical(list10, method="hh"))


def display_graphs(graphs: List[nx.Graph]):
    # display all graphs in the list
    for i, g in enumerate(graphs):
        nx.draw(g, with_labels=True)
    plt.show()


def test_havel_hakimi_2():
    # note that these are the same seq. as we did by hand on exercises
    list1 = [2, 2, 2, 1, 1]
    list2 = [3, 3, 3, 3, 3, 3]
    list3 = [3, 3, 3]

    set1 = all_graphs_from_degree_sequence(list1)
    set2 = all_graphs_from_degree_sequence(list2)
    set3 = all_graphs_from_degree_sequence(list3)

    assert len(set3) == 0

    set_1_correct = [nx.from_graph6_bytes(
        b'>>graph6<<DqC'), nx.from_graph6_bytes(b'>>graph6<<DqG'), nx.from_graph6_bytes(b'>>graph6<<DwC')]

    sols2 = "b'>>graph6<<EuLg\n', b'>>graph6<<Es\\o\n', b'>>graph6<<EtTg\n', b'>>graph6<<E{LW\n', b'>>graph6<<EtXW\n', b'>>graph6<<E{Sw\n', b'>>graph6<<EuWw\n'".split(
        ", ")

    set_2_correct = [nx.from_graph6_bytes(bytes(sol.replace(
        "b'", "").replace("'", "").strip(), "utf-8")) for sol in sols2]

    solutions_tests = [(set1, set_1_correct), (set2, set_2_correct)]

    for i, sol_t in enumerate(solutions_tests):
        for g in sol_t[0]:
            is_in = False
            for g_corr in sol_t[1]:

                is_in = nx.is_isomorphic(g, g_corr)
                if is_in:
                    break
            assert is_in == True


if __name__ == "__main__":
    test_havel_hakimi()
    test_havel_hakimi_2()
