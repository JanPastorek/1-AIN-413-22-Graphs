# Lab and database explorations

**Optional companion to the twelve studios.** Each block pairs a step-through run in the [Graph Studio Lab](../lab/index.html) with a paper task, and where it helps, a [PHOEG](https://phoeg.umons.ac.be/phoeg/) or [House of Graphs](https://houseofgraphs.org/search) query. Nothing here is graded unless your teacher announces it. Use the [evidence card](../syllabus/platforms.md#evidence-card-copy-onto-half-a-page) for every database task and end with a conclusion label: example, counterexample, finite computational evidence, proof, or still unresolved here.

**How to use the lab.** Pick the session in the left rail, choose an algorithm, and step with ← →. Every run ends with a *certificate* in the right column: an odd cycle, a cut, a cover, a colouring, a search count. Your written answer should name the certificate and say who could check it, and how fast. Graphs are typed as edge lists (`u v` or `u v weight`, a line `directed` for arcs, `---` to start a second graph). Any House of Graphs or PHOEG graph can be pasted in graph6 format.

**Four ways to use a session.** The mode bar above the board switches between *Watch* (step freely), *Predict* (the lab stops before each decisive step and asks you which vertex, edge or number comes next, and keeps score), *Check a certificate* (you click a cut, cover, cycle, colouring, packing, Kuratowski subgraph or type a bijection; the lab checks only your submission), and *Exit ticket* (a fresh small instance per seed, with an answer key for the teacher). The right-hand column has three tabs: the algorithm's data structures, CLRS-style pseudocode with the current line highlighted, and networkx code for the graph on the board. Above the board, five animated definition cards per session; eight of them also have a Manim video.

**Every session opens with a motivating problem.** Exercise 1 of each session is a real problem that cannot be solved reliably without that session’s concepts. Attempt it before the session, keep your attempt, and return to it at the end to solve it properly with a certificate. The same problem is the first task in the lab, with a button that loads its data.

**Tags.** *Motivation*: a real problem that needs the session’s concepts. *Predict*: write the answer before running anything. *Lab*: use the lab. *Proof*: no tools. *PHOEG* / *HoG*: database work with an evidence card. *Model*: translate a real situation into a graph.

---

## Warm-up: read graph6 by hand

House of Graphs and PHOEG hand you graphs as graph6 strings. Decode `Dhc` with pencil: the first character gives n = ord('D') − 63; each further character carries 6 bits of the upper triangle of the adjacency matrix in the column order (0,1), (0,2), (1,2), (0,3), (1,3), (2,3), … Name the graph you get. Paste the string into the lab’s graph6 box and compare. Then explain why two different graph6 strings can describe isomorphic graphs.

---

## 1 · Modelling and traversal

1. **Motivation — the outbreak problem.** An infection starts at Karlsplatz and spreads one U-Bahn stop per hour. After how many hours does it reach each station, and which station is reached last? The city also wants two staff rotas so that neighbouring stations never share a rota: is that possible? Attempt both by hand before the session. To answer reliably you will need *distance* in a graph, an algorithm that computes it for every station at once (BFS), and *bipartite* graphs. Return at the end of the session and solve both parts with a certificate.
2. **Predict / Lab.** Load the Vienna U-Bahn (from `data/Vienna_subway.csv`). Before running BFS from Karlsplatz, write the station you expect to be farthest in stops. Run it. Then find a station of minimum eccentricity by trying several starts. Is it also the station that minimises the *sum* of distances? Give a witness if not.
3. **Proof.** Show that in an undirected BFS every non-tree edge joins layers i and i or i and i+1. Deduce that an edge inside one layer gives an odd cycle, and that otherwise colouring layers by parity is proper. This is exactly the certificate the lab prints.
4. **Model / Lab.** Write six courses with prerequisites as a digraph and get a topological order from DFS. Add one arc that makes the requirements circular, rerun, and identify the back edge. Why does a back edge exist exactly when there is a directed cycle?
5. **Model.** The U-Bahn file counts every connection as one hop. Name two passenger questions where that model gives a wrong answer, and say which change fixes each (weights, transfer vertices, directed arcs).

## 2 · Degree sequences and resilience

1. **Motivation — the suspicious network report.** A provider claims its 7 routers have 4, 4, 4, 1, 1, 1 and 1 links and that no single failure can disconnect a customer. Decide whether such a network can exist at all, and, for the Vienna U-Bahn, list the single closures that would cut passengers off. This needs *degree sequences* (when are they graphical?) and *cut vertices* and *bridges*.
2. **Predict / Lab.** Is (4, 4, 4, 1, 1, 1, 1) graphical? Decide on paper, then run Havel–Hakimi and read the failing Erdős–Gallai row. Turn that row into one sentence about hubs and leaves.
3. **Lab.** Realise (3, 3, 2, 2, 2, 1, 1), then run degree-preserving swaps with different seeds until two realisations differ in triangle count or diameter. That invariant is your non-isomorphism certificate.
4. **PHOEG — the Al Capone riddle** (from the PHOEG teaching material). A gang of seven has “knows” degrees 2, 3, 3, 3, 4, 4, 5, and among any three members at least two know each other (independence number 2). At order 7 constrain Size = 12, Minimum degree = 2, Maximum degree = 5, Independence number = 2. Inspect what remains and decide whether the boss (degree 5) knows the newcomer (degree 2). Then prove it without the tool.
5. **HoG / Lab.** Whitney’s inequality κ ≤ λ ≤ δ can be strict twice. Search *Connected*, *Vertex Connectivity* = 1, *Edge Connectivity* = 2, *Minimum Degree* = 3. Take the smallest result, paste its graph6 into the lab, and confirm with “Bridges and cut vertices” that a cut vertex exists and no bridge does.

## 3 · Isomorphism, invariants and symmetry

1. **Motivation — same molecule or not?** Two notebooks draw a 6-carbon compound: one as a ring, one as two triangles. Two more draw 8-atom cages in which every atom has 3 bonds. Same compound in each case? And how many chemically different atom positions does each have (the number of NMR signals)? This needs *isomorphism*, *invariants*, and *automorphisms* with their *orbits*.
2. **Lab.** Run colour refinement on *C₆ versus two triangles*. The histograms agree. Write precisely what has and has not been shown, then name the invariant that separates them.
3. **Lab.** *Cube versus Wagner graph*: both are cubic on 8 vertices, so refinement never splits the first class. Produce a non-isomorphism certificate using another session’s tool.
4. **Lab.** *Two trees, same degree sequence*: in which round do the histograms differ, and which structural feature does the separating colour encode?
5. **Proof / Lab.** The lab reports |Aut(Petersen)| = 120, one orbit, and a greedy fixing set of size 3. Prove that no two vertices fix every automorphism, treating adjacent and non-adjacent pairs separately.
6. **HoG — asymmetric graphs.** Search *Group Size* = 1. What is the smallest *Number of Vertices* you find? Paste two such graphs into the lab and confirm |Aut| = 1. Then argue why no asymmetric graph has 2, 3, 4 or 5 vertices; checking all graphs with the lab’s enumeration counts only as finite evidence, so make the argument structural for at least n ≤ 3.
7. **HoG.** Search *Number of Vertices* = 10 and *Number of Vertex Orbits* = 1. Compare *Group Size* across the results; check one with the lab’s automorphism tool.

## 4 · Trees, MST and union–find

1. **Motivation — the campus fibre auction.** Six buildings must be connected; contractors bid a price for each possible trench (the studio fiber graph). Any building can relay traffic. Choose trenches to connect everything as cheaply as possible, and write two sentences that convince the finance office nothing cheaper exists. This needs *spanning trees*, the *cut* and *cycle properties*, and a fast connectivity test (*union–find*).
2. **Lab.** Kruskal and Prim on the campus fiber bids give the same weight. Edit one bid so that two minimum spanning trees exist and the two algorithms return different ones.
3. **Proof.** Use the lab’s cycle-property table to write the exchange argument: a non-tree edge lighter than an edge on its tree cycle gives a lighter tree. Prove the converse, that a tree passing every row is minimum.
4. **Lab.** Watch `parent[]` during Kruskal. Construct an edge order that creates a find path of length 3 without union by rank, and explain why rank prevents it.
5. **HoG.** Read *Number of Spanning Trees* for K₄, K₅, K₆ and conjecture Cayley’s formula. Then read it for the Petersen graph, and check it is not 10⁸.
6. **Predict.** Does the MST contain, for every pair of vertices, a path minimising the heaviest edge used? Decide, then try to break your claim with an edited instance.

## 5 · Shortest paths: choosing the algorithm

1. **Motivation — the transit control room.** Find the fastest S → T trip on the transit network and compare it with the fewest-stops trip. Then add a fare rebate that makes one connection negative and ask whether your method still works. Finally, describe how you would automatically detect a loop of currency exchanges that makes money. This needs *weighted distance*, *relaxation*, and the effect of *negative cycles*.
2. **Lab.** *Transit with a rebate*: Dijkstra prints a warning and the cross-check with Bellman–Ford lists wrong labels. Find the exact step where a settled vertex could have improved.
3. **Predict / Lab.** “Add 3 to every weight, then run Dijkstra.” Make that edit and compare the S→T route with Bellman–Ford on the original. Which paths does a constant shift penalise, and why?
4. **Lab.** *Currency loop*: read the negative cycle from Bellman–Ford. Explain how weights −log(rate) turn a profitable round trip into a negative cycle.
5. **Lab — A\*.** Load *City blocks with a river*, run A\* from A1 to E7 and then the *Race*. Drag several vertices away from their grid positions and rerun A\*: the distance stays the same, the number of settled vertices changes. Explain both facts with the definition of an admissible heuristic.
6. **Lab — Floyd–Warshall.** Run it on the transit network and watch round k = B. Prove that k must be the outermost loop; give a 3-vertex example where an innermost k fails.
7. **Model — transfers.** Load *Vienna U-Bahn with transfer times* (2 minutes per hop, 4 per change of line, one vertex per line at each interchange). Find a destination from Oberlaa where the fastest route is not the route with the fewest stops.
8. **Choose.** For each scenario name the algorithm, its running time and the invariant it needs: unit-weight metro hops; road travel times; a project DAG with negative bonuses; all pairs among 300 depots; fares with discounts that might loop.

## 6 · Euler versus Hamilton, postman and TSP

1. **Motivation — snowplough versus courier.** On the street map, a snowplough must clear every street and return; a courier must visit every corner once and return. Plan both routes as short as you can. Why can one question be settled by a quick count and the other apparently not? This needs *Euler circuits*, the *Chinese postman* problem, *Hamilton cycles* and the *travelling salesman problem*.
2. **Lab.** *Snowplough streets*: which corners are odd, which pairing does the postman choose, and what is the extra cost? List the other two pairings and their costs by hand.
3. **Proof.** Prove the postman lower bound: the set J of repeated edges makes every degree even, so J contains a family of paths pairing the odd vertices.
4. **Lab.** Run the Hamilton search on Petersen and note the call count. Compare with the Euler parity test on the same graph. What would a short certificate of “no Hamilton cycle” look like, and why is none known in general?
5. **Gentle ILP.** Run the TSP tool on the fiber graph. Write the TSP integer program with *only* the degree constraints Σ x(e) = 2. Find a 0/1 solution that is two disjoint triangles, name the subtour constraint it violates, add it, and argue the new optimum is a tour. This is the lazy-constraint loop real solvers use.
6. **Lab — approximation ratios.** On *Courier stops*, compare nearest neighbour, double tree, Christofides and the Held–Karp optimum. Which guarantee (2 or 1.5) is close to tight here? Prove the double-tree bound in three lines.
7. **HoG / Lab.** Search *Hypohamiltonian* = true and take the smallest *Number of Vertices*. Delete any vertex in the lab and show a Hamilton cycle appears. Then search *Eulerian* = true with *Hamiltonian* = false, and verify one result both ways in the lab.

## 7 · Flows, cuts and residual networks

1. **Motivation — evacuation control.** People leave a stadium (s) through corridors to an exit (t); each corridor carries a limited number of people per minute (the CLRS network). What is the largest evacuation rate? Which corridors should be widened first, and how would you prove to the city that no routing plan beats yours? This needs *flows*, *residual networks* and *cuts*.
2. **Lab.** CLRS Fig. 26.1 network: step through and switch to the residual view whenever the path uses a backward arc. Explain in plain words what cancelling flow on that arc does.
3. **Predict.** From the final minimum cut alone, predict which single capacity increase by 5 raises the maximum flow, and by how much. Check by editing. Why can raising a capacity outside every minimum cut never help?
4. **Lab.** *Bad case for DFS augmenting*: Edmonds–Karp needs 2 augmentations. Describe a sequence of augmenting paths that would need 2000, and state what shortest augmenting paths guarantee.
5. **Lab — path rules.** Run *Race: path rules* on the bad-case network: 2 augmentations for Edmonds–Karp, 2000 for the unlucky rule. Explain what the shortest-path rule guarantees.
6. **Certificate.** In *Check a certificate* mode, click a source side S on the CLRS network until the lab accepts it as a minimum cut. Then submit a cut that is valid but not minimum and read the response.
7. **Proof.** Menger from max-flow/min-cut: with unit capacities, an integral maximum flow splits into that many arc-disjoint s–t paths, and the minimum cut is a smallest separating arc set.

## 8 · Matchings, Hall witnesses and stable marriage

1. **Motivation — the placement office.** Five students list the firms they would accept (the placement-shortfall graph). Place as many as possible. If someone stays unplaced, write the dean a short proof that no assignment does better. With preferences on both sides, how do you stop a student and a firm from secretly abandoning their assignments for each other? This needs *matchings*, *augmenting paths*, *Hall’s condition* and *stable matchings*.
2. **Lab.** *Placement shortfall*: the lab returns a maximum matching, a cover of equal size, and a Hall violator S. Check |N(S)| < |S| by hand. Which single new edge makes everyone placeable?
3. **Proof.** From the lab’s construction (Z = vertices reachable by alternating paths from unmatched left vertices) prove that (L ∖ Z) ∪ (R ∩ Z) is a vertex cover of size |M|.
4. **Lab.** Run Gale–Shapley, then swap the two blocks of the preference box so the other side proposes. Compare the two stable matchings and explain who gains.
5. **Lab — phases and potentials.** Run Hopcroft–Karp on the crown graph (session 9) and compare its edge scans with one-path-at-a-time in the *Race*. Then run the Hungarian method and check its dual certificate by hand: all reduced costs ≥ 0 and Σu + Σv equals the cost.
6. **HoG — Petersen’s theorem.** Every bridgeless cubic graph has a perfect matching. Search *Regular* = true, *Maximum Degree* = 3 and *Matching Number* below half the order. Find the smallest such graph, paste it into the lab, and show it has a bridge (session 2 tool). Explain why it must.

## 9 · Planarity, duality and colouring

1. **Motivation — exams and circuit boards.** Eight courses; two courses that share a student need different exam slots (the crown graph). How few slots suffice, and how do you prove you cannot do with fewer? A circuit with the connections of the Petersen graph must be printed on one layer: possible? This needs *colourings* and the *chromatic number*, *planarity*, *faces* and *Euler’s formula*.
2. **Lab.** The crown graph in the listed order makes greedy use 4 colours on a bipartite graph. Generalise to n colours on Kₙ,ₙ minus a perfect matching. Then prove that every graph has *some* order on which greedy is optimal.
3. **Lab / Proof.** Petersen passes both quick planarity bounds in the lab, yet it is not planar. Derive m ≤ g(n − 2)/(g − 2) for planar graphs of girth g and apply it.
4. **PHOEG.** x = *Independence number*, y = *Chromatic number*, orders 6–8. Explain the lower boundary with χ ≥ n/α and give a witness on each order with α ≥ 2 attaining it.
5. **PHOEG — a Turán-type facet.** x = *Size*, y = *Independence number*, order 7. Conjecture the lower boundary as a function of m. Compare with α ≥ n²/(2m + n) and describe the graphs that attain it.
6. **Lab — Kuratowski and duals.** Run *Planarity test and dual* on the Petersen graph; then, in *Check a certificate* mode, select the K₃,₃ subdivision yourself until it is accepted. Run it on the icosahedron and identify the dual solid. Verify n − m + f = 2 for both.
7. **HoG.** Every planar graph has a vertex of degree at most 5. Search *Planar* = true, *Minimum Degree* = 5 and find the smallest order. Name the graph and the solid you get from its dual.

## 10 · Random graphs and real networks

1. **Motivation — is the airline network special?** The US airport network in the course data has 546 airports and 2 781 routes. Would a randomly wired network of the same size also have huge hubs, many triangles of routes, short connections, and one cluster connecting almost everyone? Write your guesses first. This needs a *random graph model*, the *giant component*, *clustering*, and expected counts via *indicator variables*.
2. **Lab.** Step c = (n − 1)p from 0 to 6. When does the largest component pass 10% of the vertices? Repeat with n = 40 and n = 300 and three seeds each. Describe how the transition sharpens.
3. **Proof.** With indicator variables, E[#triangles] = C(n, 3)p³ and E[#isolated vertices] = n(1 − p)ⁿ⁻¹. With c fixed, what do these tend to? Compare with the lab’s table at several steps.
4. **Data.** The lab lists clustering C and density p for the course datasets. In G(n, p), C ≈ p. Compute C/p for each network. Which is furthest from G(n, p), and which mechanism (triadic closure, geography, hierarchy) would you blame?
5. **Data — a real network.** Run *US airports vs G(n, m)*: same n and m, maximum degree 153 against about 20, transitivity 0.31 against 0.02. Read the log–log degree plot and explain “heavy tail”. Which random model would you try next?
6. **HoG — selection bias.** Why would a degree histogram of House of Graphs entries on 10 vertices *not* estimate anything about G(10, p)? Name the bias precisely.

## 11 · Domination, ILP and approximation

1. **Motivation — the sensor budget.** A gallery has 16 rooms in a 4 × 4 grid; a sensor watches its own room and the rooms sharing a wall with it. How few sensors cover everything, and how do you convince an insurer that fewer is impossible? This needs *dominating sets*, *lower bounds* (counting and packings) and the *integer programming* formulation.
2. **Lab.** *Gallery floor 4×4*: greedy places 6 sensors, the optimum is 4. Find the first greedy pick that belongs to no optimal solution.
3. **ILP and duality.** Write the domination ILP for the 4×4 grid and its LP relaxation. Write the dual LP and interpret it as a fractional *packing* (weights on vertices, every closed neighbourhood carrying total weight at most 1). Find 4 vertices with pairwise disjoint closed neighbourhoods and conclude that even the LP cannot go below 4. Why is ⌈n/(Δ + 1)⌉ a weaker form of the same argument, and on which graphs does the LP bound stay strictly below γ?
4. **PHOEG — Ore’s bound.** With no isolated vertices, γ ≤ n/2. Set x = *Minimum degree*, y = *Domination number*, order 8, Minimum degree ≥ 1. Describe the graphs with γ = 4 and prove Ore’s bound using a spanning tree.
5. **Proof.** Greedy domination is a ln(Δ + 1)-approximation (it is greedy set cover). Build a family where it uses about twice the optimum.

## 12 · Computer-assisted graph theory (Graphathon)

1. **Motivation — test before you prove.** A colleague claims every connected graph can be properly coloured with Δ colours. Before spending a week on a proof, check it on every connected graph with up to 8 vertices and study the counterexamples. Then ask how dense a network can be with no three mutually interfering nodes. This needs *isomorphism classes*, *exhaustive generation*, the difference between *evidence* and *proof*, and *extremal graphs*.
2. **Lab — Brooks.** In “Test a conjecture on all small graphs” check `chi <= dmax` on connected graphs for n = 4, …, 8. List the counterexamples and state Brooks’ theorem with exactly those exceptions. Mark your conclusion as finite evidence for n ≤ 8.
3. **Lab — two classical bounds.** Test `alpha * chi >= n && alpha + chi <= n + 1` on all graphs, plot α against χ, and look at the hull. Prove both and describe the boundary graphs.
4. **Lab — the small-data trap.** `chi <= omega + 1` survives every graph on at most 8 vertices (12 346 of them). Is it true? Decide by construction, not by data. Connect your answer to the alternative studio on colouring.
5. **Lab — annealing.** Search for triangle-free graphs with the most edges for n = 7, …, 12 and compare with ⌊n²/4⌋. Switch to C₄-free and compare with the known values. Vary steps and seed. Write one paragraph on what a miss shows and what it does not.
6. **Predict the generator.** Choose *Watch the generator* with n = 4 in *Predict* mode and classify each candidate as a new class or a duplicate before it is revealed.
7. **How the generator works.** The lab lists all graphs on n vertices by adding a vertex to each graph on n − 1 vertices in all 2ⁿ⁻¹ ways and discarding isomorphic copies. Prove that no isomorphism class is missed. Then estimate how many candidates it examines for n = 8, and explain why serious tools (nauty’s `geng`, used by PHOEG and House of Graphs) use canonical augmentation instead.
8. **PHOEG / HoG.** Extend one finding from n ≤ 8 to orders 9–10 in PHOEG with the same invariants, and search House of Graphs for a candidate counterexample at larger order. Your evidence card must state the scope of every claim.

---

## Database detective (any week, 20 minutes)

**Twenty questions with House of Graphs.** One student secretly picks a graph from House of Graphs and notes its URL. Partners may ask only invariant questions (“Is it bipartite?”, “Is the girth at least 5?”, “Number of Edges ≤ 15?”) and must reproduce each answer as a search filter. Win by naming the graph with the fewest questions, then confirm by graph6. Debrief: which invariants split the database best, and why are Boolean properties usually poor first questions?

**Snark hunt.** Search *Regular* = true, *Maximum Degree* = 3, *Chromatic Index* = 4, *Girth* ≥ 5, *Edge Connectivity* = 3. Identify the smallest result by name, run the Hamilton search on it in the lab, and connect the two facts: why does a Hamiltonian cubic graph always have chromatic index 3?

**Reverse PHOEG.** The teacher shows a PHOEG hull without axis labels. Pairs propose which two invariants and which order produce it, reproduce the view, and prove one facet inequality.

---

### Sources and scope

PHOEG teaching examples: [PHOEG web interface paper](https://arxiv.org/html/2603.27242v1). House of Graphs invariant names: [House of Graphs 2.0](https://arxiv.org/abs/2210.17253). Interface labels can change; check names on the live sites before class. Readings: West, *Introduction to Graph Theory*; Cormen et al., *Introduction to Algorithms* (3rd ed.); Grimaldi, *Discrete and Combinatorial Mathematics*; Stanoyevitch, *Discrete Structures with Contemporary Applications*. Section references for each session appear in the lab under “Reading”.
