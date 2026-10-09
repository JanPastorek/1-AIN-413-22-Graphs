/* ============================================================
   Seeded exit tickets: a different small instance per student seed.
   gen(seed) -> { text (edge list) | graph, task, answer, layout? }
   ============================================================ */
function randConnected(R, n, extra, weights = null, directed = false) {
  const L = 'ABCDEFGHIJKL'.slice(0, n).split(''); const E = new Set(), out = [];
  const add = (a, b) => { const k = directed ? a + '>' + b : [a, b].sort().join('-'); if (a === b || E.has(k) || (!directed && E.has([b, a].sort().join('-')))) return false; E.add(k); out.push([a, b, weights ? weights() : 1]); return true; };
  for (let i = 1; i < n; i++) { const j = Math.floor(R() * i); R() < 0.5 || directed ? add(L[j], L[i]) : add(L[i], L[j]); }
  let guard = 0; while (out.length < n - 1 + extra && guard++ < 500) add(L[Math.floor(R() * n)], L[Math.floor(R() * n)]);
  return (directed ? 'directed\n' : '') + L.join('\n') + '\n' + out.map(([a, b, w]) => weights ? `${a} ${b} ${w}` : `${a} ${b}`).join('\n');
}
function distinctWeights(R, lo, hi) { const used = new Set(); return () => { let w; do { w = lo + Math.floor(R() * (hi - lo + 1)); } while (used.has(w) && used.size < hi - lo); used.add(w); return w; }; }
const strip2 = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
function lastPanel(r) { return r.frames[r.frames.length - 1].panel; }

const TICKETS = {
  traverse: seed => { const R = rng(seed * 7 + 1); const text = randConnected(R, 8, 3); const g = parseGraph(text); const r = algBFS(g, { source: 0 }); const last = r.frames[r.frames.length - 1];
    return { text, task: 'Run BFS from <b>A</b> by hand, scanning neighbours in alphabetical order. (a) List the layers. (b) Draw the BFS tree. (c) Is the graph bipartite? Give a certificate: a 2-colouring or an odd cycle.', answer: strip2(last.panel).replace(/^CERTIFICATE · /, '') }; },
  degrees: seed => { const R = rng(seed * 11 + 3); const n = 7; let d;
    if (R() < 0.5) { const g = parseGraph(randConnected(R, n, Math.floor(R() * 4))); d = g.nodes.map(() => 0); g.edges.forEach(e => { d[e.u]++; d[e.v]++; }); }
    else { do { d = Array.from({ length: n }, () => 1 + Math.floor(R() * 5)); } while (d.reduce((a, b) => a + b, 0) % 2 || erdosGallai(d).ok); }
    d.sort((a, b) => b - a); const eg = erdosGallai(d); const r = algHavelHakimi(null, { seq: d.join(' ') });
    return { seq: d.join(' '), task: `Is (${d.join(', ')}) graphical? If yes, draw a realisation using Havel–Hakimi. If no, name the obstruction (parity, a degree above n − 1, or the first failing Erdős–Gallai inequality).`, answer: (() => { if (d.reduce((x, y) => x + y, 0) % 2) return 'Not graphical: the degree sum is odd.'; if (eg.ok) return 'Graphical. Havel–Hakimi realisation: ' + r.graph.edges.map(e => `${r.graph.nodes[e.u].label}–${r.graph.nodes[e.v].label}`).join(', ') + ` (vertices v1…v${n} carry degrees ${d.join(', ')}).`; const s2 = d.slice(); let L = 0; for (let k = 1; k <= n; k++) { L += s2[k - 1]; let Rr = k * (k - 1); for (let i = k; i < n; i++) Rr += Math.min(s2[i], k); if (L > Rr) return `Not graphical: Erdős–Gallai fails at k = ${k} (${L} > ${Rr}).`; } return 'Not graphical.'; })() }; },
  iso: seed => { const R = rng(seed * 13 + 5); const n = 6; const g1 = parseGraph(randConnected(R, n, 2 + Math.floor(R() * 3)));
    let g2 = cloneGraph(g1); if (R() < 0.5) { const r2 = algSwaps(g1, { k: 2, seed: seed + 1 }); g2 = r2.frames[r2.frames.length - 1].graph; }
    const perm = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const names = 'uvwxyz'; const t1 = g1.edges.map(e => `${g1.nodes[e.u].label} ${g1.nodes[e.v].label}`).join('\n'); const t2 = g2.edges.map(e => `${names[perm[e.u]]} ${names[perm[e.v]]}`).join('\n');
    const text = t1 + '\n---\n' + t2; const g = parseGraph(text);
    const toA = (G, part) => { const idx = G.nodes.map((v, i) => i).filter(i => G.nodes[i].part === part); const pos = new Map(idx.map((v, k) => [v, k])); const a = Array(idx.length).fill(0); G.edges.forEach(e => { if (pos.has(e.u) && pos.has(e.v)) { a[pos.get(e.u)] |= 1 << pos.get(e.v); a[pos.get(e.v)] |= 1 << pos.get(e.u); } }); return { a, idx }; };
    const A1 = toA(g, 0), A2 = toA(g, 1); let iso = null;
    if (A1.a.length === A2.a.length) { const k1 = invKey(A1.a, A1.a.length), k2 = invKey(A2.a, A2.a.length); if (k1.key === k2.key) iso = isoMap(A1.a, A2.a, A1.a.length, k1.vk, k2.vk); }
    const ans = iso ? 'Isomorphic: ' + iso.map((w, v) => `${g.nodes[A1.idx[v]].label}→${g.nodes[A2.idx[w]].label}`).join(', ') : `Not isomorphic. Triangles: ${triangleCount(parseGraph(t1))} vs ${triangleCount(parseGraph(t2))}; degree sequences ${degreeSummary(parseGraph(t1)).deg.join('')} vs ${degreeSummary(parseGraph(t2)).deg.join('')}. (If those agree, compare neighbour degrees or cycle lengths.)`;
    return { text, layout: 'parts', task: 'Are the two graphs isomorphic? Give an explicit bijection, or an invariant that differs.', answer: ans }; },
  mst: seed => { const R = rng(seed * 17 + 7); const text = randConnected(R, 7, 4, distinctWeights(R, 1, 20)); const g = parseGraph(text); const r = algKruskal(g, {});
    const tree = []; r.frames[r.frames.length - 1].ec && Object.entries(r.frames[r.frames.length - 1].ec).forEach(([k, v]) => { if (v === 'tree') tree.push(+k); });
    return { text, task: 'Find a minimum spanning tree with Kruskal’s algorithm. List the edges in the order they are accepted, mark each rejected edge, and give the total weight. Then verify one non-tree edge with the cycle property.', answer: `Accepted: ${tree.map(i => edgeName(g, i) + ' (' + g.edges[i].w + ')').join(', ')}. ` + strip2(lastPanel(r)).slice(0, 120) }; },
  sp: seed => { const R = rng(seed * 19 + 11); let text = randConnected(R, 6, 4, () => 1 + Math.floor(R() * 9), true); const g = parseGraph(text); const r = algDijkstra(g, { source: 0 });
    const order = r.frames.filter(f => /Extract min: settle/.test(strip2(f.msg))).map(f => strip2(f.msg).match(/settle (\S+)/)[1]); const d = bellmanFordPlain(g, 0);
    return { text, task: 'Run Dijkstra from <b>A</b>. Give the order in which vertices are settled and the final distance labels. Then check one edge u→v that is not in the tree: why does d(v) ≤ d(u) + w(u,v) hold?', answer: `Settled: ${order.join(', ')}. Distances: ${g.nodes.map((v, i) => `${v.label}=${fmt(d[i])}`).join(', ')}.` }; },
  route: seed => { const R = rng(seed * 23 + 13); let text, g, odd; let guard = 0; do { text = randConnected(R, 7, 3 + Math.floor(R() * 3), () => 1 + Math.floor(R() * 9)); g = parseGraph(text); const deg = g.nodes.map(() => 0); g.edges.forEach(e => { deg[e.u]++; deg[e.v]++; }); odd = deg.filter(x => x % 2).length; } while (odd !== 4 && guard++ < 50);
    const r = algEuler(g, { goal: 'closed' }); const pf = r.frames.find(f => /Chinese postman/.test(f.msg));
    return { text, task: 'A snowplough must clear every street and return. Which corners have odd degree? Pair them as cheaply as possible (compare all pairings), give the extra cost and the total tour length.', answer: (pf ? strip2(pf.msg) + ' ' : '') + strip2(lastPanel(r)).slice(0, 80) }; },
  flow: seed => { const R = rng(seed * 29 + 17); const V = ['s', 'a', 'b', 'c', 'd', 't']; const E = new Set(); const out = []; const add = (x, y) => { const k = x + '>' + y; if (x === y || E.has(k) || E.has(y + '>' + x)) return; E.add(k); out.push(`${x} ${y} ${1 + Math.floor(R() * 9)}`); };
    ['a', 'b'].forEach(x => add('s', x)); ['c', 'd'].forEach(x => add(x, 't')); ['a', 'b'].forEach(x => add(x, R() < 0.5 ? 'c' : 'd')); while (out.length < 9) { const i = Math.floor(R() * 5), j = 1 + Math.floor(R() * 5); if (i < j) add(V[i], V[j]); }
    const text = 'directed\n' + out.join('\n'); const g = parseGraph(text); const s = g.nodes.findIndex(v => v.label === 's'), t = g.nodes.findIndex(v => v.label === 't'); const r = algFlow(g, { source: s, sink: t });
    return { text, task: 'Find a maximum s–t flow with augmenting paths. Write each path and its bottleneck. Then give a cut (S, V∖S) whose capacity equals your flow value.', answer: strip2(lastPanel(r)).slice(0, 260) }; },
  match: seed => { const R = rng(seed * 31 + 19); const L = ['p1', 'p2', 'p3', 'p4', 'p5'], Rt = ['j1', 'j2', 'j3', 'j4', 'j5']; const out = []; L.forEach(a => { const k = 1 + Math.floor(R() * 2.4); const ch = Rt.slice().sort(() => R() - 0.5).slice(0, k); ch.forEach(b => out.push(`${a} ${b}`)); });
    const text = L.join('\n') + '\n' + Rt.join('\n') + '\n' + out.join('\n'); const g = parseGraph(text); const r = algKuhn(g, {});
    return { text, layout: 'columns', task: 'Find a maximum matching. Prove it is maximum with a vertex cover of the same size. If not everyone on the left is placed, give a Hall violator S.', answer: strip2(lastPanel(r)).slice(0, 320) }; },
  color: seed => { const R = rng(seed * 37 + 23); const text = randConnected(R, 7, 5 + Math.floor(R() * 4)); const g = parseGraph(text); const gr = algGreedyColor(g, { order: 'listed' }); const ex = algExactColor(g, {}); const w = maxClique(g);
    return { text, task: 'Colour greedily in alphabetical order. How many colours? Then determine χ(G) exactly: exhibit a colouring and a matching lower bound (a clique or an odd cycle argument).', answer: `Greedy uses ${strip2(gr.frames[gr.frames.length - 1].msg).match(/\d+/)[0]}. ${strip2(ex.frames[ex.frames.length - 1].msg)} Clique: {${w.map(i => g.nodes[i].label).join(', ')}}.` }; },
  random: seed => { const R = rng(seed * 41 + 29); const n = 50 + Math.floor(R() * 151), c = [0.5, 1.5, 2, 3, 4][Math.floor(R() * 5)]; const p = c / (n - 1);
    const tri = n * (n - 1) * (n - 2) / 6 * p ** 3, iso = n * (1 - p) ** (n - 1), S = giantTheory(c);
    return { none: true, task: `In G(n, p) with n = ${n} and p = ${p.toFixed(5)} (average degree c = ${c}): (a) the expected number of triangles, (b) the expected number of isolated vertices, (c) is a giant component expected, and roughly what fraction of vertices does it contain? Show the indicator-variable computation for (a).`, answer: `(a) C(n,3)p³ ≈ ${tri.toFixed(2)}  (b) n(1−p)^(n−1) ≈ ${iso.toFixed(1)}  (c) ${c > 1 ? `yes, S solves S = 1 − e^(−cS): S ≈ ${S.toFixed(3)}` : 'no: c ≤ 1, components have size O(log n)'}` }; },
  dom: seed => { const R = rng(seed * 43 + 31); const text = randConnected(R, 8, 2 + Math.floor(R() * 3)); const g = parseGraph(text); const ex = exactDomination(g); const deg = g.nodes.map(() => 0); g.edges.forEach(e => { deg[e.u]++; deg[e.v]++; });
    return { text, task: `Find a minimum dominating set. Prove it is minimum: give a lower bound, e.g. a packing (vertices with pairwise disjoint closed neighbourhoods) or the counting bound ⌈n/(Δ+1)⌉.`, answer: `γ = ${ex.set.length}, e.g. {${ex.set.map(i => g.nodes[i].label).join(', ')}}. Counting bound ⌈8/${Math.max(...deg) + 1}⌉ = ${Math.ceil(8 / (Math.max(...deg) + 1))}.` }; },
  cagt: seed => { const R = rng(seed * 47 + 37);
    const C = [
      ['alpha >= n / (dmax + 1)', 'connected', 'True: greedily pick a vertex and delete it with its neighbours; each step removes at most Δ + 1 vertices.'],
      ['chi <= dmax + 1', 'all', 'True: greedy colouring never needs more than Δ + 1 colours.'],
      ['diam <= 2 * rad', 'connected', 'True: route any two vertices through a centre (triangle inequality).'],
      ['m <= n * (n - 1) / 2 - alpha + 1', 'all', 'True: an independent set of size α forces C(α, 2) ≥ α − 1 non-edges.'],
      ['alpha * omega >= n', 'all', 'False: C₅ has α = ω = 2 and n = 5. (On 6 vertices it holds, because R(3, 3) = 6.)'],
      ['rad <= n / 2', 'connected', 'True: take a centre of a spanning tree; every tree on n vertices has radius ≤ n/2.'],
      ['tri <= m * (n - 2) / 3', 'all', 'True: each edge lies in at most n − 2 triangles and each triangle has 3 edges.'],
      ['diam <= n - dmin', 'connected', 'True: the BFS layers from an end of a diametral path are non-empty and layer 1 has ≥ δ vertices, so n ≥ 1 + δ + (diam − 1).'],
    ];
    const [expr, scope, verdict] = C[Math.floor(R() * C.length)];
    const counts = [5, 6].map(n => { const r = algConjecture(null, { expr, n, scope, x: 'n', y: 'm' }); const m = r.frames[0].panel.match(/(\d+) counterexamples? on/); return `n = ${n}: ${m ? m[1] + ' counterexample' + (m[1] === '1' ? '' : 's') : 'none'}`; });
    return { none: true, task: `Statement for ${scope === 'connected' ? 'connected ' : ''}graphs: <code>${esc(expr)}</code>. Prove it, or give a counterexample and say which graphs violate it. You may use the conjecture tester for n ≤ 6 only after writing your prediction.`, answer: `${verdict} Tester: ${counts.join('; ')}.` }; },
};
