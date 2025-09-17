from datetime import time
from home_project_3_solution import AustraliaMap, USSRMap, USAMap, WorldMap, ImpossibleMap


def test_CSP_1():
    maps = [('Australia', AustraliaMap()),
            ('USSR', USSRMap()),
            ('USA', USAMap()),
            ('World', WorldMap()),

            ('Impossible Australia', ImpossibleMap(AustraliaMap())),
            ('Impossible USSR', ImpossibleMap(USSRMap())),
            ('Impossible USA', ImpossibleMap(USAMap())),
            ('Impossible World', ImpossibleMap(WorldMap()))
            ]

    for name, mapa in maps:
        print('==== {} ===='.format(name))
        t = time.time()
        has_result = mapa.color_map()    # Compute the colors for an empty map
        print('Time: {:.3f} ms'.format((time.time() - t)*1000))
        if has_result:
            mapa.is_correct_coloring()  # Print whether coloring is correct
        else:
            print('Coloring does not exist\n')
        # mapa.print_map()    # Print whole coloring


if __name__ == "__main__":
    test_CSP_1()
