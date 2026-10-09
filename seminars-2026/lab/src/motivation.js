/* ============================================================
   Motivation: every concept starts from a real problem that needs it.
   WHY[module][i] is shown on definition card i; MOTIVATION[module] becomes
   the first lab task of the session.
   ============================================================ */
const WHY = {
  traverse: [
    'A delivery driver may drive a street twice, a snowplough wants no street twice, and a fibre cable may not pass a junction twice. Each rule is a different kind of route, and we need words for them.',
    'An infection spreads one contact per day. On which day does each person get it? “Distance” must mean the fewest steps, and we need a method that finds it for everyone at once.',
    'Where should a city put one fire station so that the worst response time is as small as possible? That worst case is the eccentricity; the best location is the centre.',
    'A manager must split staff into two shifts so that no two people who clash work together. This is possible exactly when the clash graph is bipartite, and an odd cycle of clashes proves it impossible.',
    'In what order can you take courses with prerequisites, or build software packages that depend on each other? Only a cycle of dependencies makes it impossible.',
  ],
  degrees: [
    'A survey reports that at a party exactly 5 people shook an odd number of hands. Without asking anyone again, you can say the survey is wrong. The handshake lemma is the reason.',
    'A data set claims seven routers have 4, 4, 4, 1, 1, 1 and 1 links. Before modelling it, check whether any network has these degrees at all.',
    'To test a routing protocol you need a network where every router has a prescribed number of links. Havel–Hakimi builds one, or proves that none exists.',
    'Which single station closure or cable cut would disconnect part of the network? Engineers call these single points of failure; we call them cut vertices and bridges.',
    'Power grids must survive any one failure (the “N − 1 rule”). How many components must fail before customers are cut off? That number is the connectivity.',
  ],
  iso: [
    'Two chemists draw the same molecule differently; a leaked “anonymised” network might be your company’s. Deciding “same structure, different names” is the isomorphism question.',
    'A chemical database holds millions of compounds. To find a match fast, first throw away everything whose cheap counts (atoms, bonds, rings) differ. Those counts are invariants.',
    'Graph databases and graph neural networks summarise a vertex by its neighbourhood, repeatedly. Colour refinement is exactly that process, and it shows what such methods cannot tell apart.',
    'In NMR spectroscopy, hydrogen atoms in symmetric positions give one signal. Counting signals means counting orbits of the molecule’s symmetry group.',
    'A robot in a symmetric building cannot tell mirror-image corridors apart. How few landmarks must it recognise to know exactly where it is? That is a fixing set.',
  ],
  mst: [
    'A network with no redundant link has exactly one route between any two sites: river drainage, family trees, a file system. Trees are the backbone of all of these.',
    'You must connect all campus buildings using some of the possible cable trenches. Any choice that connects everything with no loop is a spanning tree.',
    'Why is it safe to commit to the cheapest bridge across a river before planning the rest of the network? The cut property says that choice is never a mistake.',
    'A cheap detour already exists around an expensive link. Can we drop that link without losing optimality? The cycle property answers yes.',
    'Kruskal asks thousands of times whether two buildings are already connected. Union–find answers each question in almost constant time.',
  ],
  sp: [
    'The route with the fewest stops is often not the fastest, because segments take different times. Distance must add weights, not count edges.',
    'A navigation app keeps improving its estimate whenever it notices a shorter way to a place. That single update rule is relaxation.',
    'A router does not store whole routes, only the next hop towards every destination. Those next hops form a shortest-path tree.',
    'Trading EUR → USD → JPY → EUR and ending with more euros is arbitrage. With weights −log(rate), it is a negative cycle.',
    'A map app routing you across town does not explore the whole country first. A heuristic that never overestimates lets A* skip most of the map and stay correct.',
  ],
  route: [
    'A snowplough or street sweeper must drive every street exactly once and return to the depot. Euler’s parity condition says when that is possible.',
    'If the plough must repeat some streets, which ones, as cheaply as possible? Pairing up the odd-degree corners answers the Chinese postman problem.',
    'A courier must visit every customer exactly once and return. This is a Hamilton cycle, and no fast test for it is known.',
    'On road maps, driving straight to the next new customer is never longer than a detour through an old one. Approximation guarantees for TSP rest on this triangle inequality.',
    'Delivery-route solvers that only demand “two edges at every customer” return several separate small loops. Subtour constraints forbid them.',
  ],
  flow: [
    'How many litres per second can a pipe network deliver, or how many evacuees per minute can leave a stadium through corridors of limited width? A flow models both.',
    'A dispatcher may reroute traffic that was already sent, cancelling part of an earlier decision. The residual network records exactly which changes are still possible.',
    'To evacuate more people, find one more route that still has spare capacity everywhere and send people along it. That route is an augmenting path.',
    'Which corridors limit the evacuation, and how can you prove that no plan does better? A cut of small capacity is that proof.',
    'How many cables can fail before a hospital loses its connection to the data centre? Menger’s theorem counts independent routes.',
  ],
  match: [
    'Assigning taxis to passengers greedily, first come first served, can leave passengers stranded even though everyone could have been served.',
    'Reshuffle the current assignment so that one more student gets an internship. Each such reshuffle is an augmenting path.',
    'What is the smallest number of inspectors at road junctions that can watch every road? It also proves that a matching cannot be larger.',
    'The dean wants proof that the internships cannot all be filled. A group of students who together accept too few firms is a short, checkable proof.',
    'Hospitals and residents, schools and pupils: if some pair prefers each other to their assigned partners, they defect. Stable matchings (used in the US medical residency match) prevent this.',
  ],
  color: [
    'Two exams that share a student cannot be in the same time slot. The fewest slots needed is the chromatic number of the conflict graph. Radio frequencies for nearby towers work the same way.',
    'If five courses all share students with each other, five slots are unavoidable. Cliques give lower bounds; Brooks’ theorem bounds the worst case.',
    'Can all connections on a circuit board be printed on one layer, or a set of roads be built without bridges? That is the question whether the graph is planar.',
    'How dense can a single-layer circuit be? Euler’s formula limits the number of connections a planar layout can carry.',
    'Colouring the countries of a map so that neighbours differ is colouring the vertices of its dual graph. That is how the four colour theorem is stated for graphs.',
  ],
  random: [
    'To claim that a real network is special, compare it with networks whose links formed by chance. G(n, p) is the simplest such null model.',
    'When does an epidemic or a rumour reach a large share of the population, rather than dying out in small clusters? That is the emergence of the giant component.',
    'In friendship networks, friends of friends tend to be friends. The clustering coefficient measures how far a network is from random.',
    'How many triangles of mutual friends should we expect by chance? Indicator variables answer this without listing a single triangle.',
    'How many random links does a sensor network need before every sensor can reach every other? The connectivity threshold answers this.',
  ],
  dom: [
    'Place the fewest fire alarms so that every room has one or is next to a room that has one. Cell towers and security guards pose the same problem.',
    'Each sensor covers at most Δ + 1 rooms, so the budget can never go below n/(Δ + 1). Even a crude lower bound tells you when to stop searching.',
    'Rooms far apart need separate sensors. A packing of such rooms proves that a cheaper plan does not exist.',
    'Industrial solvers accept problems written as integer programs. Writing domination as an ILP lets you hand real instances to them.',
    'When exact solving is too slow, the LP relaxation still gives a lower bound in polynomial time, and the gap shows the price of integrality.',
  ],
  cagt: [
    'To test a claim on “all networks with 8 nodes” you must check 12 346 shapes, not 268 million labelled versions. Counting isomorphism classes is what makes exhaustive search possible.',
    'nauty, House of Graphs and PHOEG all rely on lists of every small graph. Adding one vertex in all ways, then removing duplicates, is how such lists are built.',
    'One collapsed bridge refutes “all designs of this type are safe”; a thousand standing ones prove nothing. Mathematics works the same way.',
    'Design the densest network in which no three nodes pairwise interfere. Extremal graph theory answers such questions exactly.',
    'Engineers optimise chip layouts and timetables by random improvements that sometimes accept a worse step. Simulated annealing applies the same idea to graphs.',
  ],
};

const MOTIVATION = {
  traverse: { tag: 'Motivation', text: '<b>The outbreak problem.</b> An infection starts at Karlsplatz and spreads one U-Bahn stop per hour. (a) After how many hours has it reached each station, and which station is reached last? (b) The city wants two staff rotas so that neighbouring stations never share a rota. Possible? Try to answer by hand first. You will need a precise notion of <em>distance</em> in a graph, an algorithm that finds it for all stations at once, and the idea of a <em>bipartite</em> graph.', setup: { preset: 'vienna', algo: 'bfs', params: { source: 'Karlsplatz' } } },
  degrees: { tag: 'Motivation', text: '<b>The suspicious network report.</b> A provider claims its 7 routers have 4, 4, 4, 1, 1, 1 and 1 links, and that “no single failure can disconnect a customer”. (a) Can any network have these link counts? (b) For the Vienna U-Bahn, which single closures would cut passengers off? To decide, you will need <em>degree sequences</em> and when they are <em>graphical</em>, and <em>cut vertices</em> and <em>bridges</em>.', setup: { algo: 'hh', params: { seq: '4 4 4 1 1 1 1' } } },
  iso: { tag: 'Motivation', text: '<b>Same molecule or not?</b> Two lab notebooks contain drawings of a compound with 6 carbon atoms: one a ring, the other two triangles. A third pair are both 8-atom cages, each atom bonded to 3 others. Same compound? And how many chemically different atom positions does each have (that is the number of NMR signals)? You will need <em>isomorphism</em>, <em>invariants</em>, and <em>automorphisms</em> with their <em>orbits</em>.', setup: { preset: 'pair_c6', algo: 'wl' } },
  mst: { tag: 'Motivation', text: '<b>The campus fibre auction.</b> Six buildings must be connected by fibre; contractors bid a price for each possible trench (the weights). Any building can relay traffic. Choose trenches to connect all buildings as cheaply as possible, and convince the finance office that nothing cheaper exists. You will need <em>spanning trees</em>, the <em>cut</em> and <em>cycle properties</em>, and a fast way to ask “are these already connected?”.', setup: { preset: 'studio_fiber', algo: 'kruskal' } },
  sp: { tag: 'Motivation', text: '<b>The transit control room.</b> (a) What is the fastest trip from S to T on the transit network, and does the fewest-stops trip agree? (b) A new fare rebate makes one connection “negative cost”: does your method still work? (c) A trader notices a loop of currency exchanges that seems to make money: how would you detect such loops automatically? You will need <em>weighted distance</em>, <em>relaxation</em>, and what <em>negative cycles</em> do to it.', setup: { preset: 'studio_transit', algo: 'dijkstra', params: { source: 'S' } } },
  route: { tag: 'Motivation', text: '<b>Snowplough versus courier.</b> A snowplough must clear every street of the district and return; a courier must visit every corner once and return. Plan both routes on the street map, as short as possible. Why is one of these easy to decide and the other notoriously hard? You will need <em>Euler circuits</em>, the <em>Chinese postman</em> idea, <em>Hamilton cycles</em> and the <em>travelling salesman problem</em>.', setup: { preset: 'streets', algo: 'euler' } },
  flow: { tag: 'Motivation', text: '<b>Evacuation control.</b> People leave a stadium (s) through corridors to the exit (t); each corridor carries a limited number of people per minute (the weights). (a) What is the largest evacuation rate? (b) Which corridors should the city widen first, and how do you prove that no routing plan beats yours? You will need <em>flows</em>, <em>residual networks</em> and <em>cuts</em>.', setup: { preset: 'clrs', algo: 'ek' } },
  match: { tag: 'Motivation', text: '<b>The placement office.</b> Five students each list the firms they would accept. (a) Place as many students as possible. (b) If someone stays unplaced, write the dean a short proof that no assignment does better. (c) With preferences on both sides, how do you avoid a student and a firm secretly breaking their assignments for each other? You will need <em>matchings</em>, <em>augmenting paths</em>, <em>Hall’s condition</em> and <em>stable matchings</em>.', setup: { preset: 'hall', algo: 'kuhn' } },
  color: { tag: 'Motivation', text: '<b>Exams and circuit boards.</b> (a) Eight courses; two courses sharing a student need different exam slots (the edges). How few slots suffice, and how do you prove it? (b) A circuit with the Petersen graph’s connections must be printed on one layer without crossings. Possible? You will need <em>colourings</em> and the <em>chromatic number</em>, <em>planarity</em>, <em>faces</em> and <em>Euler’s formula</em>.', setup: { preset: 'crown', algo: 'greedy', params: { order: 'listed' } } },
  random: { tag: 'Motivation', text: '<b>Is the airline network special?</b> US airports have 546 nodes and 2 781 routes. An epidemiologist asks: would a randomly wired network of the same size also have huge hubs, many triangles and short routes, and would one big cluster connect almost everyone? To answer you need a <em>random graph model</em>, the <em>giant component</em>, <em>clustering</em>, and expected counts via <em>indicator variables</em>.', setup: { algo: 'real' } },
  dom: { tag: 'Motivation', text: '<b>The sensor budget.</b> A gallery floor has 16 rooms in a 4 × 4 grid. A sensor watches its own room and the rooms sharing a wall with it. (a) How few sensors cover every room? (b) Convince the insurer that fewer is impossible. You will need <em>dominating sets</em>, <em>lower bounds</em> (counting, packings) and the <em>integer programming</em> formulation.', setup: { preset: 'grid44', algo: 'greedy' } },
  cagt: { tag: 'Motivation', text: '<b>Check a conjecture before you try to prove it.</b> A colleague claims: “every connected graph can be properly coloured with Δ colours”. Before spending a week on a proof, test it on every connected graph with up to 8 vertices and look at the counterexamples. Then: how dense can a network be with no three mutually interfering nodes? You will need <em>isomorphism classes</em>, <em>exhaustive generation</em>, the difference between <em>evidence and proof</em>, and <em>extremal graphs</em>.', setup: { algo: 'conj', params: { expr: 'chi <= dmax', n: 7, scope: 'connected' } } },
};

for (const m of MODULES) {
  (DEFS[m.key] || []).forEach((d, i) => { if (WHY[m.key] && WHY[m.key][i]) d.why = WHY[m.key][i]; });
  if (MOTIVATION[m.key] && !(m.tasks[0] && m.tasks[0].tag === 'Motivation')) m.tasks.unshift(MOTIVATION[m.key]);
}
