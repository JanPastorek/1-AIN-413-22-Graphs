# Graph Studio Lab

An in-browser lab for the twelve seminar studios: every session has motivated definitions with animations, step-through algorithms that end in a checkable certificate, and four modes of use. It is one self-contained page (`index.html`); no installation, account or server is needed.

**Open it:** download the folder and open `index.html`, or enable GitHub Pages for this repository (Settings → Pages → deploy from the `main` branch) and visit `…/seminars-2026/lab/`. The page needs network access only for its two web fonts; everything else, including the data, is inside the file. The videos in `videos/` must sit next to the page.

Companion exercises: [Lab and database explorations](../practice/lab-and-database-explorations.md). Database recipes and the evidence card: [platform guide](../syllabus/platforms.md).

## What students see in each session

- **A motivating problem first.** The first task of every session is a real problem (an outbreak on the U-Bahn, a fibre auction, a stadium evacuation, an exam timetable…) that cannot be solved reliably without the session’s concepts. A button loads its data into the lab.
- **Five definition cards.** Each card states the real problem that needs the concept (“Why we need it”), a precise definition in West’s notation, and a short animation that can be stepped through. Five cards can replay on whatever graph is on the board; eight concepts also have a Manim video.
- **Step-through algorithms** with the data structures (queue, union–find, labels, residual capacities, potentials) and, at the end, a certificate: an odd cycle, a minimum cut, a König cover and Hall violator, a Kuratowski subgraph, a dual LP solution, an exhaustive-search count.
- **Three tabs** beside the board: the algorithm’s state; CLRS-style pseudocode with the line that produced the current step highlighted; and networkx code (with SciPy for the ILP) for the graph on the board.

| Mode | What it does |
|---|---|
| Watch | Step freely, play, scrub, zoom and pan, drag vertices, edit the graph. |
| Predict | Before each decisive step the lab asks which vertex, edge or number comes next (ties accepted) and keeps score. |
| Check a certificate | Students click a cut, cover, cycle, matching, colouring, packing, Kuratowski subgraph, or type a bijection; the lab checks only their submission. |
| Exit ticket | A different small instance per seed (e.g. the student number) for paper work with the lab closed. **This public build hides the answer keys**, in line with the release boundary in the [seminar README](../README.md); the teacher’s private copy shows them and can copy keys for seeds 1–30. |

## Algorithms by session

| Session | Algorithms and views |
|---|---|
| 1 Modelling and traversal | BFS with layers and odd-cycle certificate; DFS with times and topological order |
| 2 Degree sequences and resilience | Havel–Hakimi with Erdős–Gallai check; degree-preserving swaps; bridges and cut vertices |
| 3 Isomorphism and symmetry | 1-WL colour refinement on two graphs; automorphism group, orbits and a greedy fixing set |
| 4 Trees, MST and union–find | Kruskal with union–find; Prim; cycle-property certificate; race |
| 5 Shortest paths | Dijkstra (cross-checked by Bellman–Ford), Bellman–Ford with negative cycles, BFS, A*, Floyd–Warshall; race |
| 6 Euler, Hamilton, postman, TSP | Hierholzer and Chinese postman; Hamilton backtracking; nearest neighbour, double tree, Christofides and Held–Karp with the DFJ integer program |
| 7 Flows and cuts | Edmonds–Karp with a residual view and min-cut certificate; race of path rules (2 vs 2000 augmentations) |
| 8 Matchings | Augmenting paths with König cover and Hall violator; Hopcroft–Karp; Hungarian method with dual certificate; Gale–Shapley; race |
| 9 Planarity, duality, colouring | Planarity test (Demoucron–Malgrange–Pertuiset) with plane drawing, faces, Euler’s formula, dual graph or Kuratowski subgraph; greedy, DSatur, exact χ |
| 10 Random graphs | Erdős–Rényi process with giant-component theory; US airports vs G(n, m) |
| 11 Domination | Greedy; exact branch and bound; counting bound; ILP and LP relaxation |
| 12 Computer-assisted graph theory | Conjecture tester over all graphs up to 8 vertices with a PHOEG-style scatter and hull; the vertex-augmentation generator step by step; simulated annealing for extremal graphs |

## Data from this repository

The studio graphs (`data/studio_graphs.json`), the karate club, the Vienna U-Bahn (also as a transfer-time model: 2 minutes per hop, 4 per change of line), the US airport network and the network statistics from `data/summary_statistics.csv` are embedded in the page. `src/data.js` is generated from those files.

## Checks behind the page

`node tests/run-tests.js` runs 2 768 checks without dependencies, among them:

- graph counts 1, 2, 4, 11, 34, 156, 1044 from the generator (12 346 for n = 8 in the browser);
- the planarity test agrees with the known numbers of planar graphs (33, 142, 822 for n = 5, 6, 7), Euler’s formula holds on every embedding, and every 2-connected planar graph on up to 7 vertices is drawn without crossings;
- Hungarian results against brute force on 40 random matrices, Hopcroft–Karp against the simple algorithm on 30 random graphs;
- every pseudocode line reference, prediction question, certificate verifier, exit ticket and definition animation is consistent.

All 37 Python exports were run against networkx 3.6, SciPy 1.18 and the lab’s own answers.

**Colour vision.** The categorical palette was chosen by a farthest-point search in CIELAB and checked with simulated protanopia, deuteranopia and tritanopia (Machado et al. 2009, CIEDE2000). The first six colours stay at least 12.6 apart under all three; all ten at least 8.9 (light) and 7.3 (dark). Colour-coded views also print colour numbers on the vertices, and the main states differ in shape (solid disc, ring, dashed line) as well as hue.

## Building and editing

The page is assembled from `src/` by `python3 build.py`, which writes `index.html` (public, keys hidden) and `graph-studio-lab.html` (teacher copy, keys shown). Session content (presets, tasks, readings) is in `src/modules.js`, definitions in `src/defs.js`, the motivating problems in `src/motivation.js`, certificate checks in `src/certs.js`, ticket generators in `src/tickets.js` and pseudocode and Python export in `src/pseudo.js`.

The videos are rendered from `manim/graph_concepts.py` with Manim Community 0.22: `manim -qm -a graph_concepts.py`, then copy the MP4 files to `videos/` under the names used in `src/app.js` and add WebM copies (`ffmpeg -i x.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 x.webm`) for browsers without H.264. The scenes use Unicode text instead of LaTeX.

Sources for platform features: [PHOEG web interface paper](https://arxiv.org/html/2603.27242v1), [House of Graphs 2.0](https://arxiv.org/abs/2210.17253). Textbook section references appear under “Reading” in each session.
