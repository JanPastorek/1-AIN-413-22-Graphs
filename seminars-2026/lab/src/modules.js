/* ============================================================
   Presets and session modules (content)
   ============================================================ */
const crownText = (() => { let v = '', e = ''; for (let i = 1; i <= 4; i++) v += `a${i}\nb${i}\n`; for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) if (i !== j) e += `a${i} b${j}\n`; return v + e; })();
const gridText = (() => { const R = 'ABCD'; let s = ''; for (let r = 0; r < 4; r++) for (let c = 1; c <= 4; c++) { if (c < 4) s += `${R[r]}${c} ${R[r]}${c + 1}\n`; if (r < 3) s += `${R[r]}${c} ${R[r + 1]}${c}\n`; } return s; })();
const cubeText = '000 001\n000 010\n000 100\n001 011\n001 101\n010 011\n010 110\n100 101\n100 110\n011 111\n101 111\n110 111';
const cityText = (() => { const R = 'ABCDE'; let s = ''; for (let r = 0; r < 5; r++) for (let c = 1; c <= 7; c++) { if (c < 7 && !(r === 1 && (c === 3 || c === 4))) s += `${R[r]}${c} ${R[r]}${c + 1} 2\n`; if (r < 4 && (r !== 2 || c === 2 || c === 6)) s += `${R[r]}${c} ${R[r + 1]}${c} ${r === 2 ? 4 : 3}\n`; } return s; })();
const wagnerText = '0 1\n1 2\n2 3\n3 4\n4 5\n5 6\n6 7\n7 0\n0 4\n1 5\n2 6\n3 7';
const PRESETS = Object.assign({}, REPO_PRESETS, {
  petersen: { name: 'Petersen graph', text: '0 1\n1 2\n2 3\n3 4\n4 0\n0 5\n1 6\n2 7\n3 8\n4 9\n5 7\n7 9\n9 6\n6 8\n8 5', layout: 'petersen', group: 'Classics' },
  cube: { name: 'Cube Q₃', text: cubeText, layout: 'cube', group: 'Classics' },
  k5: { name: 'Complete graph K₅', text: '1 2\n1 3\n1 4\n1 5\n2 3\n2 4\n2 5\n3 4\n3 5\n4 5', layout: 'circle', group: 'Classics' },
  k33: { name: 'Utilities graph K₃,₃', text: 'h1 g\nh1 w\nh1 e\nh2 g\nh2 w\nh2 e\nh3 g\nh3 w\nh3 e', layout: 'columns', group: 'Classics' },
  wheel: { name: 'Wheel W₆ (hub + C₆)', text: 'h c1\nh c2\nh c3\nh c4\nh c5\nh c6\nc1 c2\nc2 c3\nc3 c4\nc4 c5\nc5 c6\nc6 c1', layout: 'wheel', group: 'Classics' },
  crown: { name: 'Crown graph, adversarial order', text: crownText, layout: 'columns', group: 'Colouring' },
  barbell: { name: 'Two clusters joined by one link', text: 'a b\nb c\nc a\nc d\nd e\ne f\nf g\ng e', group: 'Connectivity' },
  streets: { name: 'Snowplough streets (4 odd corners)', text: 'A B 3\nB C 2\nC D 4\nD A 3\nA E 2\nE C 3\nB E 1\nD E 2', group: 'Routing' },
  clrs: { name: 'CLRS Fig. 26.1 flow network', text: 'directed\ns v1 16\ns v2 13\nv2 v1 4\nv1 v3 12\nv3 v2 9\nv2 v4 14\nv4 v3 7\nv3 t 20\nv4 t 4', group: 'Flows' },
  zigzag: { name: 'Bad case for DFS augmenting', text: 'directed\ns a 1000\ns b 1000\na b 1\na t 1000\nb t 1000', group: 'Flows' },
  hall: { name: 'Placement shortfall (Hall fails)', text: 'Ana Bank\nBen Bank\nBen Lab\nCid Bank\nCid Lab\nDan Lab\nDan Mill\nDan Port\nEva Bank\nEva Lab', layout: 'columns', group: 'Matchings' },
  rebate: { name: 'Transit with a rebate (negative edge)', text: 'directed\nS A 2\nS B 4\nB A -3\nA C 1\nC T 2\nB T 7', group: 'Shortest paths' },
  arbitrage: { name: 'Currency loop (negative cycle)', text: 'directed\nEUR USD 1\nUSD JPY -2\nJPY GBP 1\nGBP EUR -1\nUSD CHF 2\nCHF EUR 1', group: 'Shortest paths' },
  grid44: { name: 'Gallery floor, 4×4 grid', text: gridText, layout: 'grid', group: 'Domination' },
  city: { name: 'City blocks with a river (A* demo)', text: cityText, layout: 'grid', group: 'Shortest paths' },
  courier: { name: 'Courier stops on a road map', text: 'A B 10\nA E 21\nA D 32\nB E 31\nB D 32\nC I 10\nC H 12\nC G 20\nD I 17\nD H 20\nC D 26\nE J 29\nF I 21\nC F 22\nF H 32\nG J 13\nG H 16\nH I 12\nH J 13\nC J 24', layout: 'pos', pos: { A: [86, 176], B: [71, 78], C: [574, 261], D: [389, 72], E: [64, 388], F: [722, 101], G: [461, 424], H: [450, 265], I: [526, 171], J: [356, 350] }, group: 'Routing' },
  planar_oct: { name: 'Octahedron (planar, 3-connected)', text: 'a b\na c\na d\na e\nf b\nf c\nf d\nf e\nb c\nc d\nd e\ne b', group: 'Planarity' },
  planar_prism: { name: 'Triangular prism', text: 'a b\nb c\nc a\nx y\ny z\nz x\na x\nb y\nc z', group: 'Planarity' },
  planar_ico: { name: 'Icosahedron (dual: dodecahedron)', text: '0 1\n0 2\n0 3\n0 4\n0 5\n1 2\n2 3\n3 4\n4 5\n5 1\n1 6\n2 6\n2 7\n3 7\n3 8\n4 8\n4 9\n5 9\n5 10\n1 10\n6 7\n7 8\n8 9\n9 10\n10 6\n11 6\n11 7\n11 8\n11 9\n11 10', group: 'Planarity' },
  pair_c6: { name: 'C₆ versus two triangles', text: 'a b\nb c\nc d\nd e\ne f\nf a\n---\na b\nb c\nc a\nd e\ne f\nf d', layout: 'parts', group: 'Pairs to compare' },
  pair_p4: { name: 'Path P₄ versus star K₁,₃', text: 'a b\nb c\nc d\n---\nh x\nh y\nh z', layout: 'parts', group: 'Pairs to compare' },
  pair_cube: { name: 'Cube versus Wagner graph (both cubic, 8 vertices)', text: cubeText + '\n---\n' + wagnerText, layout: 'parts', group: 'Pairs to compare' },
  pair_trees: { name: 'Two trees, same degree sequence', text: '1 2\n2 3\n3 4\n4 5\n2 6\n4 7\n---\nx a\ny a\na b\nb z\nb c\nc w', layout: 'parts', group: 'Pairs to compare' },
});
for (const k of Object.keys(REPO_PRESETS)) if (k === 'studio_placements') PRESETS[k].layout = 'columns';

const BOOKS = {
  W: 'West, <i>Introduction to Graph Theory</i>', C: 'Cormen et al., <i>Introduction to Algorithms</i> (3rd ed.)', G: 'Grimaldi, <i>Discrete and Combinatorial Mathematics</i>', S: 'Stanoyevitch, <i>Discrete Structures with Contemporary Applications</i>',
};
const PHOEG = '<a href="https://phoeg.umons.ac.be/phoeg/" target="_blank" rel="noopener">PHOEG</a>';
const HOG = '<a href="https://houseofgraphs.org/search" target="_blank" rel="noopener">House of Graphs</a>';

const MODULES = [
  {
    key: 'traverse', num: 1, title: 'Modelling and traversal', studio: 'Network detective', anchor: 'Models, BFS layers, DFS times, bipartiteness', preset: 'studio_bfs',
    algos: [
      { key: 'bfs', name: 'Breadth-first search', run: algBFS, params: [{ id: 'source', type: 'vertex', label: 'Start' }] },
      { key: 'dfs', name: 'Depth-first search', run: algDFS, params: [{ id: 'source', type: 'vertex', label: 'Start' }] },
    ],
    legend: [['n', 'front', 'in queue / on stack'], ['n', 'cur', 'current'], ['n', 'done', 'finished'], ['e', 'tree', 'tree edge'], ['e', 'back', 'back edge'], ['e', 'cut', 'odd-cycle certificate']],
    tasks: [
      { tag: 'Predict', text: 'Load the Vienna U-Bahn. Before running BFS from Karlsplatz, write down the station you expect to be farthest in stops, and its distance. Then run it. Which line ends sit in the last layer?', setup: { preset: 'vienna', algo: 'bfs', params: { source: 'Karlsplatz' } } },
      { tag: 'Lab', text: 'The last layer index is the eccentricity of the start. Try four or five starts and find a station with smallest eccentricity (a centre). Is the centre also the station minimising the <em>sum</em> of distances? Record a witness for any difference.' },
      { tag: 'Proof', text: 'Prove that in an undirected BFS every non-tree edge joins vertices whose layers differ by at most 1. Use it to explain the lab’s certificate: an edge inside one layer yields an odd closed walk, hence an odd cycle.' },
      { tag: 'Lab', text: 'Model six courses and their prerequisites as a digraph (one arc per prerequisite), switch to DFS and read off a topological order. Add one arc that creates a circular requirement and find the back edge that exposes it.' },
      { tag: 'Model', text: 'The U-Bahn file treats every connection as one hop. Name two questions a passenger cares about where this model gives the wrong answer, and say which change (weights, transfer vertices, directed arcs) fixes each.' },
      { tag: 'Predict', text: 'Switch the mode bar to <b>Predict</b> and run BFS again: before each dequeue the lab stops and asks which vertex leaves the queue. Aim for a perfect score, then do the same for DFS finishing order.', setup: { algo: 'bfs' } },
    ],
    refs: [['W', '§1.1–1.2, §1.4'], ['C', 'Ch. 22.2–22.4'], ['G', 'Ch. 11']],
  },
  {
    key: 'degrees', num: 2, title: 'Degree sequences and resilience', studio: 'Same degrees, different networks', anchor: 'Handshaking, Havel–Hakimi, Erdős–Gallai, cut vertices', preset: 'barbell',
    algos: [
      { key: 'hh', name: 'Havel–Hakimi', run: algHavelHakimi, own: true, params: [{ id: 'seq', type: 'text', label: 'Degree sequence', def: '3 3 2 2 2 1 1' }] },
      { key: 'swap', name: 'Degree-preserving swaps', run: algSwaps, params: [{ id: 'k', type: 'int', label: 'Swaps', def: 4, min: 1, max: 40 }, { id: 'seed', type: 'int', label: 'Seed', def: 1, min: 1, max: 9999 }] },
      { key: 'bridges', name: 'Bridges and cut vertices', run: algBridges, params: [{ id: 'source', type: 'vertex', label: 'DFS root' }] },
    ],
    legend: [['n', 'cur', 'current'], ['n', 'front', 'partner'], ['e', 'hl', 'new edge'], ['e', 'rej', 'removed'], ['e', 'cut', 'bridge'], ['n', 'cut', 'cut vertex']],
    tasks: [
      { tag: 'Predict', text: 'Is (4, 4, 4, 1, 1, 1, 1) graphical? The sum is even and every degree is at most 6. Decide by hand, then run Havel–Hakimi and find the failing Erdős–Gallai row. Explain that row in one sentence about three hubs and four leaves.', setup: { algo: 'hh', params: { seq: '4 4 4 1 1 1 1' } } },
      { tag: 'Lab', text: 'Realise (3, 3, 2, 2, 2, 1, 1), copy the edges into the graph box, then run degree-preserving swaps with several seeds. Find two realisations with a different number of triangles or a different diameter. That invariant is your non-isomorphism certificate.' },
      { tag: PHOEG, text: 'The PHOEG “Al Capone” riddle: a graph has degrees 2, 3, 3, 3, 4, 4, 5 and independence number 2. In PHOEG choose order 7 and constrain Size = 12, Minimum degree = 2, Maximum degree = 5, Independence number = 2. Inspect the graph(s) and decide whether the degree-5 vertex is adjacent to the degree-2 vertex. Then prove your answer without the tool.' },
      { tag: 'Lab', text: 'Run bridges and cut vertices on the Vienna U-Bahn. How many stations are single points of failure? Pick one and describe, in passenger terms, which part of the network it disconnects.', setup: { preset: 'vienna', algo: 'bridges' } },
      { tag: HOG, text: 'Whitney: κ ≤ λ ≤ δ. Search for Connected, Vertex Connectivity = 1, Edge Connectivity = 2, Minimum Degree = 3. Take the smallest result, paste its graph6 here, and check κ = 1 (a cut vertex exists) and λ = 2 (no bridge) with the lab.' },
    ],
    refs: [['W', '§1.3, §4.1'], ['G', '§11.3'], ['C', 'Problem 22-2 (articulation points, bridges)']],
  },
  {
    key: 'iso', num: 3, title: 'Isomorphism and symmetry', studio: 'Graph forensics', anchor: 'Invariants, colour refinement (1-WL), automorphisms, fixing sets', preset: 'pair_c6',
    algos: [
      { key: 'wl', name: 'Weisfeiler–Leman colour refinement', run: algWL, params: [] },
      { key: 'aut', name: 'Automorphisms and fixing set', run: algAut, params: [] },
    ],
    legend: [['n', 'k0', 'colour classes'], ['n', 'k1', ''], ['n', 'k2', ''], ['n', 'cur', 'fixed vertex']],
    tasks: [
      { tag: 'Lab', text: 'C₆ versus two triangles: refinement stops with identical histograms. State precisely what the lab has and has not proved. Give a one-line invariant that separates them.', setup: { preset: 'pair_c6', algo: 'wl' } },
      { tag: 'Lab', text: 'Cube versus Wagner graph: both are 3-regular on 8 vertices, so 1-WL never splits the first colour. Find a certificate of non-isomorphism with another module (hint: session 1 detects odd cycles).', setup: { preset: 'pair_cube', algo: 'wl' } },
      { tag: 'Lab', text: 'Two trees with the same degree sequence: watch which round separates them, and relate the separating colour to a concrete structural difference. (Colour refinement decides isomorphism for all trees.)', setup: { preset: 'pair_trees', algo: 'wl' } },
      { tag: 'Proof', text: 'Petersen: the lab reports |Aut| = 120, one orbit, and a greedy fixing set of size 3. Prove that no 2 vertices can form a fixing set. (Consider adjacent and non-adjacent pairs separately and exhibit a non-trivial automorphism fixing each.)', setup: { preset: 'petersen', algo: 'aut' } },
      { tag: HOG, text: 'Search Number of Vertices = 10, Number of Vertex Orbits = 1 (vertex-transitive) and compare their Group Size values. Paste two results as graph6, run the automorphism tool, and check the orbit count and group size against the database.' },
    ],
    refs: [['W', '§1.1 (isomorphism, Petersen graph)'], ['G', '§11.2']],
  },
  {
    key: 'mst', num: 4, title: 'Trees, MST and union–find', studio: 'Campus fiber auction', anchor: 'Cut property, exchange argument, disjoint sets', preset: 'studio_fiber', weighted: true,
    algos: [
      { key: 'kruskal', name: 'Kruskal + union–find', run: algKruskal, params: [] },
      { key: 'prim', name: 'Prim', run: algPrim, params: [{ id: 'source', type: 'vertex', label: 'Start' }] },
      { key: 'race', name: 'Race', run: algRaceMST, params: [] },
    ],
    legend: [['e', 'cand', 'considered / crossing'], ['e', 'tree', 'in tree'], ['e', 'rej', 'rejected'], ['n', 'done', 'in tree']],
    tasks: [
      { tag: 'Lab', text: 'Run Kruskal and Prim on the fiber bids. Same weight, same tree? Now change one weight so that two different MSTs exist, and make Kruskal and Prim return different trees.' },
      { tag: 'Proof', text: 'Turn the cycle-property table into an exchange proof: if T has a non-tree edge e lighter than some edge f on its tree cycle, T − f + e is lighter. Then prove the converse direction that the lab’s ✓ column relies on.' },
      { tag: 'Lab', text: 'Watch parent[] in Kruskal. After which union does a find path have length 2? Add three edges to make a path of length 3 appear, then explain why union by rank keeps trees shallow.' },
      { tag: HOG, text: 'Look up K₄, K₅ and K₆ by name and read Number of Spanning Trees. Conjecture the formula (Cayley). Then read the value for the Petersen graph and check that it is not of the form nⁿ⁻².' },
      { tag: 'Predict', text: 'Bottleneck routing: does the MST contain, between every pair of buildings, a path whose heaviest edge is as small as possible? Decide, then try to break it with an edited instance.' },
    ],
    refs: [['W', '§2.1–2.3'], ['C', 'Ch. 21, Ch. 23'], ['G', 'Ch. 12; §13.2']],
  },
  {
    key: 'sp', num: 5, title: 'Shortest paths: choosing the algorithm', studio: 'Transit control room', anchor: 'Relaxation, settling invariant, negative weights and cycles', preset: 'studio_transit', weighted: true,
    algos: [
      { key: 'dijkstra', name: 'Dijkstra', run: algDijkstra, params: [{ id: 'source', type: 'vertex', label: 'Source', def: 'S' }] },
      { key: 'bf', name: 'Bellman–Ford', run: algBellmanFord, params: [{ id: 'source', type: 'vertex', label: 'Source', def: 'S' }] },
      { key: 'hops', name: 'BFS (count hops)', run: algBFS, params: [{ id: 'source', type: 'vertex', label: 'Source', def: 'S' }] },
      { key: 'astar', name: 'A*', run: algAStar, params: [{ id: 'source', type: 'vertex', label: 'Source', def: 'S' }, { id: 'target', type: 'vertex', label: 'Target', def: 'T', last: true }] },
      { key: 'fw', name: 'Floyd–Warshall', run: algFloyd, params: [] },
      { key: 'race', name: 'Race', run: algRaceSP, params: [{ id: 'source', type: 'vertex', label: 'Source', def: 'S' }] },
    ],
    legend: [['n', 'cur', 'settled now'], ['n', 'front', 'label improved'], ['n', 'done', 'settled'], ['e', 'tree', 'predecessor edge'], ['e', 'cand', 'being relaxed'], ['e', 'cut', 'negative cycle']],
    tasks: [
      { tag: 'Lab', text: 'Run Dijkstra on the rebate network. The lab flags wrong labels. Find the exact step where a settled vertex could have improved, and explain why the settling invariant needs w ≥ 0.', setup: { preset: 'rebate', algo: 'dijkstra', params: { source: 'S' } } },
      { tag: 'Predict', text: 'A classmate suggests: add 3 to every weight to remove negatives, then run Dijkstra. Edit the rebate network that way and compare the S→T route with Bellman–Ford on the original. Which paths does the shift penalise?' },
      { tag: 'Lab', text: 'Currency loop: run Bellman–Ford and read the negative cycle. Explain how weights −log(rate) turn a profitable exchange loop into a negative cycle.', setup: { preset: 'arbitrage', algo: 'bf', params: { source: 'EUR' } } },
      { tag: 'Choose', text: 'For each scenario name the algorithm and its running time: unit-weight metro hops; road travel times; a project DAG with negative “bonus” durations; all pairs among 300 depots; fares with discounts that might loop. Justify with the invariant each algorithm needs.' },
      { tag: 'Lab', text: 'City blocks with a river: run A* from A1 to E7, then Dijkstra, then the Race. How many vertices does each settle? Drag some vertices far from their grid position and rerun A*: the path stays optimal but the effort changes. Explain using admissibility.', setup: { preset: 'city', algo: 'astar', params: { source: 'A1', target: 'E7' } } },
      { tag: 'Lab', text: 'Floyd–Warshall on the transit network: which entries change in round k = B? Prove that k must be the outermost loop, and give a 3-vertex example where putting k innermost gives a wrong answer.', setup: { preset: 'studio_transit', algo: 'fw' } },
      { tag: 'Model', text: 'Load “Vienna U-Bahn with transfer times” (2 min per hop, 4 min per line change, modelled with one vertex per line at interchanges). Run Dijkstra from Oberlaa. Find a destination where the fastest route differs from the fewest-stops route, and explain the modelling choice that causes it.', setup: { preset: 'vienna_t', algo: 'dijkstra', params: { source: 'Oberlaa' } } },
    ],
    refs: [['C', 'Ch. 24 (24.1 Bellman–Ford, 24.2 DAGs, 24.3 Dijkstra), Ch. 25'], ['G', '§13.1'], ['W', '§2.3']],
  },
  {
    key: 'route', num: 6, title: 'Euler, Hamilton, postman and TSP', studio: 'Snowplough versus courier', anchor: 'Parity, pairing odd vertices, backtracking, a first ILP', preset: 'streets', weighted: true,
    algos: [
      { key: 'euler', name: 'Euler circuit / Chinese postman', run: algEuler, params: [{ id: 'goal', type: 'select', label: 'Tour', options: [['closed', 'must return to start'], ['open', 'may end elsewhere']], def: 'closed' }] },
      { key: 'ham', name: 'Hamilton cycle (backtracking)', run: algHamilton, params: [{ id: 'source', type: 'vertex', label: 'Start' }] },
      { key: 'tsp', name: 'TSP: heuristics vs optimum', run: algTSPCompare, params: [{ id: 'source', type: 'vertex', label: 'Start' }] },
    ],
    legend: [['n', 'cut', 'odd degree'], ['e', 'path', 'pairing path'], ['e', 'dup', 'duplicated'], ['e', 'cand', 'walked'], ['e', 'tree', 'in circuit / tour']],
    tasks: [
      { tag: 'Lab', text: 'Snowplough streets: which corners are odd, which pairing does the lab choose, and what is the extra cost? List the other two pairings and their costs by hand.', setup: { preset: 'streets', algo: 'euler' } },
      { tag: 'Proof', text: 'Prove the postman lower bound: the edges walked twice in any closed covering walk form a set J in which odd vertices have odd J-degree and even vertices even J-degree, so J contains paths pairing the odd vertices.' },
      { tag: 'Lab', text: 'Run the Hamilton search on the Petersen graph and note the number of recursive calls. Compare: how long does the Euler parity test take on the same graph? What would a short certificate of “no Hamilton cycle” even look like?', setup: { preset: 'petersen', algo: 'ham' } },
      { tag: 'ILP', text: 'Run TSP on the fiber graph. Write the TSP integer program for it with only the degree constraints. Find a 0/1 solution that is two disjoint triangles, name the subtour constraint it violates, and add it.', setup: { preset: 'studio_fiber', algo: 'tsp' } },
      { tag: HOG, text: 'Search Hypohamiltonian = true and sort by Number of Vertices. Paste the smallest result, delete one vertex in the graph box, and confirm with the Hamilton search that a cycle appears. Also search Eulerian = true with Hamiltonian = false and verify one result both ways here.' },
      { tag: 'Lab', text: 'Courier stops: compare nearest neighbour, double tree, Christofides and the exact optimum. Which guarantees are visibly tight or loose here? Find the first nearest-neighbour step that is clearly a mistake.', setup: { preset: 'courier', algo: 'tsp', params: { source: 'A' } } },
    ],
    refs: [['W', '§1.2, §2.3, §7.2'], ['C', '§34.5.3–34.5.4, §35.2'], ['G', '§11.3, §11.5']],
  },
  {
    key: 'flow', num: 7, title: 'Flows, cuts and residual networks', studio: 'Evacuation control', anchor: 'Augmenting paths, residual arcs, max-flow = min-cut certificate', preset: 'clrs', weighted: true, residual: true,
    algos: [
      { key: 'ek', name: 'Edmonds–Karp', run: algFlow, params: [{ id: 'source', type: 'vertex', label: 'Source', def: 's' }, { id: 'sink', type: 'vertex', label: 'Sink', def: 't', last: true }] },
      { key: 'race', name: 'Race: path rules', run: algRaceFlow, params: [{ id: 'source', type: 'vertex', label: 'Source', def: 's' }, { id: 'sink', type: 'vertex', label: 'Sink', def: 't', last: true }] },
    ],
    legend: [['e', 'path', 'augmenting path'], ['e', 'cancel', 'flow cancelled'], ['e', 'flow', 'carries flow'], ['e', 'cut', 'min cut'], ['n', 'done', 'source side S']],
    tasks: [
      { tag: 'Lab', text: 'CLRS network: step through and switch to the residual view whenever the path uses a backward arc. Explain in words what “cancelling” 4 units on that arc means for the evacuees.', setup: { preset: 'clrs', algo: 'ek' } },
      { tag: 'Predict', text: 'Using only the final min cut, predict which single capacity increase by 5 raises the maximum flow, and by how much. Edit the network to check. Why can increasing an edge outside the cut never help?' },
      { tag: 'Lab', text: 'Bad case network: Edmonds–Karp finishes in 2 augmentations. Describe a sequence of augmenting paths (each through a→b or its residual reverse) that would need 2000. What does choosing shortest paths guarantee?', setup: { preset: 'zigzag', algo: 'ek', params: { source: 's', sink: 't' } } },
      { tag: 'Proof', text: 'Menger via flows: give every arc capacity 1. Prove that an integral maximum flow decomposes into that many arc-disjoint s–t paths, and that the min cut is a smallest set of arcs whose removal separates s from t.' },
      { tag: HOG, text: 'Pick a graph with Edge Connectivity = 3 from the search. Enter each edge as two opposite arcs of capacity 1, choose two far-apart vertices, and confirm the flow value is at least 3. When is it larger?' },
      { tag: 'Lab', text: 'Run the <b>Race: path rules</b> on the bad-case network. Edmonds–Karp needs 2 augmentations, the unlucky rule 2000. Step through the first unlucky augmentations and say which residual arc alternates direction.', setup: { preset: 'zigzag', algo: 'race', params: { source: 's', sink: 't' } } },
    ],
    refs: [['C', 'Ch. 26.1–26.2'], ['W', '§4.3'], ['G', '§13.3']],
  },
  {
    key: 'match', num: 8, title: 'Matchings, Hall witnesses and stable marriage', studio: 'Placement office', anchor: 'Augmenting paths, König covers, Hall violators, Gale–Shapley', preset: 'studio_placements',
    algos: [
      { key: 'kuhn', name: 'Augmenting paths (bipartite)', run: algKuhn, params: [] },
      { key: 'hk', name: 'Hopcroft–Karp', run: algHopcroftKarp, params: [] },
      { key: 'hung', name: 'Hungarian (min-cost assignment)', run: algHungarian, own: true, params: [{ id: 'cost', type: 'area', label: 'Cost matrix (rows: workers; first line: jobs)', def: 'jobs: Bank Lab Mill Port\nAna: 9 2 7 8\nBen: 6 4 3 7\nCid: 5 8 1 8\nDan: 7 6 9 4' }] },
      { key: 'race', name: 'Race', run: algRaceMatch, params: [] },
      { key: 'gs', name: 'Gale–Shapley stable matching', run: algGaleShapley, own: true, params: [{ id: 'prefs', type: 'area', label: 'Preferences (proposers, ---, receivers)', def: 'a: x y z\nb: y x z\nc: x y z\n---\nx: b a c\ny: a b c\nz: a b c' }] },
    ],
    legend: [['e', 'match', 'matched'], ['e', 'cand', 'explored'], ['e', 'path', 'matched edge being re-routed'], ['e', 'rej', 'rejected'], ['n', 'cut', 'vertex cover']],
    tasks: [
      { tag: 'Lab', text: 'Placement shortfall: the lab finds a maximum matching, a vertex cover of the same size and a Hall violator S. Check by hand that |N(S)| &lt; |S|. Which single new edge would make everyone placeable?', setup: { preset: 'hall', algo: 'kuhn' } },
      { tag: 'Proof', text: 'From the lab’s construction (Z = vertices reachable by alternating paths from unmatched left vertices) prove that C = (L∖Z) ∪ (R∩Z) is a vertex cover with |C| = |M|.' },
      { tag: 'Lab', text: 'Run Gale–Shapley, then swap the two blocks so that x, y, z propose. Compare both stable matchings. Who is better off in each, and why does “the proposers get their best stable partner” explain it?', setup: { algo: 'gs' } },
      { tag: HOG, text: 'Search Bipartite = true, Regular = true, Number of Vertices = 8. Check that Matching Number = 4 for every result, and prove with Hall’s condition that every k-regular bipartite graph (k ≥ 1) has a perfect matching.' },
      { tag: 'Lab', text: 'Run Hopcroft–Karp on the crown graph from session 9 (paste it in the graph box). How many phases? Compare edge scans with the one-path-at-a-time algorithm in the Race, then argue why the number of phases is O(√n).', setup: { preset: 'crown', algo: 'hk' } },
      { tag: 'ILP', text: 'Hungarian method: step through the potentials. At the end, check the dual certificate by hand: every reduced cost is ≥ 0 and Σu + Σv equals the assignment cost. Why does that prove optimality without comparing all 4! assignments?', setup: { algo: 'hung' } },
    ],
    refs: [['W', '§3.1–3.2'], ['C', '§26.3'], ['G', '§13.4']],
  },
  {
    key: 'color', num: 9, title: 'Planarity, duality and colouring', studio: 'Circuit-board inspectors', anchor: 'Greedy orders, DSatur, exact χ, Euler-formula bounds', preset: 'crown',
    algos: [
      { key: 'planar', name: 'Planarity test and dual', run: algPlanarity, params: [] },
      { key: 'greedy', name: 'Greedy colouring', run: algGreedyColor, params: [{ id: 'order', type: 'select', label: 'Vertex order', options: [['listed', 'as listed'], ['largest', 'largest degree first'], ['smallestlast', 'smallest last'], ['random', 'random']], def: 'listed' }, { id: 'seed', type: 'int', label: 'Seed', def: 1, min: 1, max: 9999 }] },
      { key: 'dsatur', name: 'DSatur', run: algDSatur, params: [] },
      { key: 'exact', name: 'Exact χ (backtracking)', run: algExactColor, params: [] },
    ],
    legend: [['n', 'k0', 'colour 1'], ['n', 'k1', 'colour 2'], ['n', 'k2', 'colour 3'], ['n', 'cut', 'clique / Kuratowski'], ['e', 'path', 'path being embedded'], ['e', 'dual', 'dual edge']],
    tasks: [
      { tag: 'Lab', text: 'Crown graph with the listed order: greedy uses 4 colours on a bipartite graph. Generalise: describe an order on Kₙ,ₙ minus a perfect matching that forces n colours, then prove that for every graph some order makes greedy optimal.', setup: { preset: 'crown', algo: 'greedy', params: { order: 'listed' } } },
      { tag: 'Lab', text: 'Petersen: run the exact search. The planarity quick test passes both bounds, yet Petersen is not planar. Derive m ≤ g(n − 2)/(g − 2) for planar graphs of girth g and apply it with g = 5.', setup: { preset: 'petersen', algo: 'exact' } },
      { tag: PHOEG, text: 'Choose x = Independence number, y = Chromatic number, orders 6–8. Explain the lower boundary using χ ≥ n/α, and find a graph on each order where the bound is attained with α ≥ 2.' },
      { tag: HOG, text: 'Every planar graph has a vertex of degree ≤ 5. Search Planar = true, Minimum Degree = 5 and find the smallest order. Identify the graph by name, and draw its dual: what familiar solid appears?' },
      { tag: 'Lab', text: 'Run the planarity test on the Petersen graph. It returns a subdivision of K₃,₃. Switch to <b>Check a certificate</b>, choose “Kuratowski subgraph”, click those edges yourself and get them accepted.', setup: { preset: 'petersen', algo: 'planar' } },
      { tag: 'Lab', text: 'Icosahedron: run the planarity test and read the face count and the dual. Which solid is the dual? Verify n − m + f = 2 for both, and explain why the dual of the dual is the original graph.', setup: { preset: 'planar_ico', algo: 'planar' } },
    ],
    refs: [['W', '§5.1, §6.1–6.3'], ['G', '§11.4, §11.6']],
  },
  {
    key: 'random', num: 10, title: 'Random graphs and real networks', studio: 'Network forecast', anchor: 'Giant component, thresholds, Poisson degrees, clustering', own: true,
    algos: [
      { key: 'gnp', name: 'Erdős–Rényi process G(n, p)', run: algRandom, own: true, params: [{ id: 'n', type: 'int', label: 'n', def: 160, min: 10, max: 300 }, { id: 'cmax', type: 'num', label: 'max average degree', def: 6, min: 1, max: 20 }, { id: 'seed', type: 'int', label: 'Seed', def: 7, min: 1, max: 9999 }] },
      { key: 'real', name: 'US airports vs G(n, m)', run: algRealVsRandom, own: true, params: [{ id: 'seed', type: 'int', label: 'Seed for G(n, m)', def: 1, min: 1, max: 9999 }] },
    ],
    legend: [['n', 'giant', 'largest component'], ['n', 'small', 'other components'], ['n', 'iso', 'isolated']],
    tasks: [
      { tag: 'Lab', text: 'Step through c = 0 … 6. At which c does the largest component exceed 10% of the vertices? Repeat with three seeds and with n = 40 and n = 300. Describe how the transition sharpens with n.' },
      { tag: 'Proof', text: 'With indicator variables, show E[#triangles] = C(n,3)p³ and E[#isolated] = n(1 − p)ⁿ⁻¹. With c = (n−1)p fixed, what happens to each as n grows? Compare with the table in the lab.' },
      { tag: 'Data', text: 'In G(n, p) the clustering coefficient is about p, the density. Use the table below: for each real network compute C/p. Which networks are furthest from G(n, p), and what mechanism (triadic closure, geography, hierarchy) would you blame?' },
      { tag: 'Predict', text: 'For US air transportation (546 airports, average degree ≈ 10.2), predict the giant-component fraction and average path length of a G(n, p) with the same n and m. Then simulate n = 300, c ≈ 10 here and compare with the data row.' },
      { tag: 'Data', text: 'Run <b>US airports vs G(n, m)</b>. Same n and m, yet the maximum degree is 153 against about 20, and transitivity 0.31 against 0.02. Read the log–log degree plot and explain what “heavy tail” means. Which model would you try next (preferential attachment, configuration model)?', setup: { algo: 'real' } },
    ],
    refs: [['W', '§8.5']],
  },
  {
    key: 'dom', num: 11, title: 'Domination, ILP and approximation', studio: 'Sensor budget', anchor: 'Greedy vs exact, counting bounds, integer programming', preset: 'grid44',
    algos: [
      { key: 'greedy', name: 'Greedy dominating set', run: algDomGreedy, params: [] },
      { key: 'exact', name: 'Exact (branch and bound)', run: algDomExact, params: [] },
    ],
    legend: [['n', 'sel', 'sensor placed'], ['n', 'done', 'dominated']],
    tasks: [
      { tag: 'Lab', text: 'Gallery floor: greedy uses 6 sensors, the optimum is 4. Find the first greedy choice that is not part of any optimal solution, and explain the trap.', setup: { preset: 'grid44', algo: 'greedy' } },
      { tag: 'ILP', text: 'Write the domination ILP for the 4×4 grid. Its LP relaxation already has value 4. Prove that with the dual: find 4 vertices whose closed neighbourhoods are pairwise disjoint (a packing). Why is the counting bound ⌈n/(Δ+1)⌉ a weaker form of the same idea?' },
      { tag: PHOEG, text: 'Ore: a graph without isolated vertices has γ ≤ n/2. Choose x = Minimum degree, y = Domination number, order 8, with Minimum degree ≥ 1. Inspect the graphs reaching γ = 4 and describe their shape. Then prove Ore’s bound with a spanning tree.' },
      { tag: 'Proof', text: 'The greedy rule is an ln(Δ+1)-approximation (set cover). On the cycle C₆ it is optimal. Construct a family where greedy uses roughly twice the optimum.' },
    ],
    refs: [['W', '§3.1 (dominating sets)'], ['C', '§35.1, §35.3 (set cover), Ch. 29']],
  },
  {
    key: 'cagt', num: 12, title: 'Computer-assisted graph theory', studio: 'Graphathon', anchor: 'Isomorph-free generation, counterexample search, simulated annealing', own: true,
    algos: [
      { key: 'conj', name: 'Test a conjecture on all small graphs', run: algConjecture, own: true, params: [{ id: 'expr', type: 'text', label: 'Statement', def: 'chi <= dmax' }, { id: 'n', type: 'int', label: 'order n', def: 6, min: 1, max: 8 }, { id: 'scope', type: 'select', label: 'Graphs', options: [['connected', 'connected only'], ['all', 'all']], def: 'connected' }, { id: 'x', type: 'select', label: 'Plot x', options: Object.entries(INV_NAMES), def: 'dmax' }, { id: 'y', type: 'select', label: 'Plot y', options: Object.entries(INV_NAMES), def: 'chi' }] },
      { key: 'gen', name: 'Watch the generator', run: algGenWalk, own: true, params: [{ id: 'n', type: 'int', label: 'order n', def: 4, min: 2, max: 5 }] },
      { key: 'sa', name: 'Simulated annealing for extremal graphs', run: algAnneal, own: true, params: [{ id: 'forbid', type: 'select', label: 'Forbidden subgraph', options: [['tri', 'triangle K₃'], ['c4', '4-cycle C₄'], ['k4', 'K₄']], def: 'tri' }, { id: 'n', type: 'int', label: 'n', def: 10, min: 4, max: 20 }, { id: 'iters', type: 'int', label: 'Steps', def: 20000, min: 1000, max: 400000 }, { id: 'seed', type: 'int', label: 'Seed', def: 3, min: 1, max: 9999 }] },
    ],
    legend: [['e', 'cut', 'edge in a forbidden copy'], ['n', 'k0', 'side 1'], ['n', 'k1', 'side 2']],
    tasks: [
      { tag: 'Lab', text: 'Brooks: test “chi &lt;= dmax” on connected graphs for n = 4 … 8 and list the counterexamples. State the theorem with exactly those exceptions. The tool proves nothing beyond n = 8.', setup: { algo: 'conj', params: { expr: 'chi <= dmax', n: 7, scope: 'connected' } } },
      { tag: 'Lab', text: 'Test “alpha * chi >= n” and “alpha + chi &lt;= n + 1” for n ≤ 8, plot α against χ and look at the hull. Prove both inequalities and describe the graphs on the boundary.', setup: { algo: 'conj', params: { expr: 'alpha * chi >= n && alpha + chi <= n + 1', n: 7, scope: 'all', x: 'alpha', y: 'chi' } } },
      { tag: 'Trap', text: 'Test “chi &lt;= omega + 1” up to n = 8. It survives. Is it true? Do not decide from the data: look for a construction (the small-data-trap studio is about exactly this).', setup: { algo: 'conj', params: { expr: 'chi <= omega + 1', n: 8, scope: 'all', x: 'omega', y: 'chi' } } },
      { tag: 'Lab', text: 'Annealing for triangle-free graphs with n = 7 … 12: does it reach ⌊n²/4⌋? Then switch to C₄-free and compare with the known values. Change steps and seed. What does a miss tell you, and what does it not?', setup: { algo: 'sa', params: { forbid: 'tri', n: 10 } } },
      { tag: `${PHOEG} / ${HOG}`, text: 'Extend a finding from n ≤ 8 to orders 9–10 in PHOEG (same two invariants, compare the hull), and search House of Graphs for a candidate counterexample at larger order. Record scope and conclusion label on an evidence card.' },
      { tag: 'Predict', text: 'Choose <b>Watch the generator</b> with n = 4 and switch to Predict mode. For each candidate, decide “new class” or “duplicate” before it is revealed. Which invariant did you use to decide quickly, and when did it fail?', setup: { algo: 'gen', params: { n: 4 } } },
    ],
    refs: [['W', '§1.3 (Mantel), §5.1 (Brooks), §5.2 (Turán)']],
  },
];
