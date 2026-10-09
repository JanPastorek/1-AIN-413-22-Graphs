/* ============================================================
   Certificate checker: the student submits, the lab verifies only that.
   sel kinds: 'v' vertex set, 'e' edge set, 'col' vertex colouring, 'text'
   check(g, sel, ctx) -> { ok, msg, nc?, ec? }   ctx: { P (algorithm params) }
   ============================================================ */
function selEdges(g, S) { return [...S].map(i => g.edges[i]).filter(Boolean); }
function compCount(n, edges, removedV = new Set()) {
  const p = [...Array(n).keys()]; const f = x => p[x] === x ? x : (p[x] = f(p[x]));
  for (const e of edges) if (!removedV.has(e.u) && !removedV.has(e.v)) p[f(e.u)] = f(e.v);
  return new Set([...Array(n).keys()].filter(i => !removedV.has(i)).map(f)).size;
}
function cycleCheck(g, S) { // selected edges form exactly one cycle? returns ordered vertices or reason
  const E = selEdges(g, S); if (E.length < 3) return { err: 'A cycle needs at least 3 edges.' };
  const deg = new Map(); E.forEach(e => { deg.set(e.u, (deg.get(e.u) || 0) + 1); deg.set(e.v, (deg.get(e.v) || 0) + 1); });
  const badV = [...deg].filter(([, d]) => d !== 2).map(([v]) => v);
  if (badV.length) return { err: `Vertex ${badV.map(v => lab(g, v)).join(', ')} touches ${deg.get(badV[0])} selected edges; on a cycle every vertex touches exactly 2.`, badV };
  if (compCount(g.nodes.length, E) - (g.nodes.length - deg.size) !== 1) return { err: 'The selected edges split into several disjoint cycles.' };
  return { len: E.length, verts: [...deg.keys()] };
}
function pathCheck(g, S) {
  const E = selEdges(g, S); if (!E.length) return { err: 'Select the edges of a path.' };
  const deg = new Map(); E.forEach(e => { deg.set(e.u, (deg.get(e.u) || 0) + 1); deg.set(e.v, (deg.get(e.v) || 0) + 1); });
  const ends = [...deg].filter(([, d]) => d === 1).map(([v]) => v);
  if ([...deg.values()].some(d => d > 2) || ends.length !== 2 || compCount(g.nodes.length, E) - (g.nodes.length - deg.size) !== 1) return { err: 'The selected edges do not form a single path (each inner vertex must touch exactly two selected edges, and there must be two ends).' };
  return { ends, len: E.reduce((a, e) => a + e.w, 0), E };
}
function parseMap(text, g, fromPart, toPart) {
  const m = new Map(); const byLab = (lab0, part) => g.nodes.findIndex(v => v.label === lab0 && (part === undefined || v.part === part));
  for (const pair of text.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)) {
    const [a, b] = pair.split(/\s*(?:->|→|=|:|\s)\s*/).filter(Boolean); if (!a || !b) throw new Error(`Cannot read “${pair}”. Write pairs like a->x.`);
    const i = byLab(a, fromPart), j = byLab(b, toPart); if (i < 0) throw new Error(`No vertex “${a}”${fromPart !== undefined ? ' in graph ' + (fromPart + 1) : ''}.`); if (j < 0) throw new Error(`No vertex “${b}”${toPart !== undefined ? ' in graph ' + (toPart + 1) : ''}.`);
    if (m.has(i)) throw new Error(`“${a}” is mapped twice.`); m.set(i, j);
  }
  return m;
}
function checkBijection(g, map, dom, cod) {
  if (map.size !== dom.length) return { ok: false, msg: `Map all ${dom.length} vertices; ${map.size} are mapped.` };
  const img = new Set(map.values()); if (img.size !== map.size) return { ok: false, msg: 'Two vertices have the same image, so this is not a bijection.' };
  const M = adjMatrix(g, true);
  for (const a of dom) for (const b of dom) if (a < b && M[a][b] !== M[map.get(a)][map.get(b)]) return { ok: false, msg: `${lab(g, a)}–${lab(g, b)} is ${M[a][b] ? 'an edge' : 'not an edge'}, but ${lab(g, map.get(a))}–${lab(g, map.get(b))} is ${M[map.get(a)][map.get(b)] ? 'an edge' : 'not an edge'}.`, nc: { [a]: 'cut', [b]: 'cut', [map.get(a)]: 'front', [map.get(b)]: 'front' } };
  return { ok: true };
}

const CERTS = {
  traverse: [
    { key: 'odd', name: 'Odd cycle: the graph is not bipartite', sel: 'e', hint: 'Click the edges of an odd cycle.', check(g, S) { const c = cycleCheck(g, S); if (c.err) return { ok: false, msg: c.err, nc: Object.fromEntries((c.badV || []).map(v => [v, 'cut'])) }; return c.len % 2 ? { ok: true, msg: `A cycle of odd length ${c.len}. Any 2-colouring would alternate colours around it and fail on the last edge, so the graph is not bipartite.` } : { ok: false, msg: `This is a cycle, but of even length ${c.len}. Even cycles are bipartite.` }; } },
    { key: 'bip', name: '2-colouring: the graph is bipartite', sel: 'col', colors: 2, hint: 'Click vertices to give each one colour 1 or 2.', check(g, C) { const un = g.nodes.map((v, i) => i).filter(i => !C[i]); if (un.length) return { ok: false, msg: `${un.length} vertices still have no colour.`, nc: Object.fromEntries(un.map(i => [i, 'cut'])) }; const bad = g.edges.map((e, i) => i).filter(i => C[g.edges[i].u] === C[g.edges[i].v]); return bad.length ? { ok: false, msg: `${bad.length} edge${bad.length > 1 ? 's join' : ' joins'} two vertices of the same colour.`, ec: Object.fromEntries(bad.map(i => [i, 'cut'])) } : { ok: true, msg: 'Every edge joins colour 1 to colour 2: a proper 2-colouring, so the graph is bipartite.' }; } },
  ],
  degrees: [
    { key: 'cutv', name: 'Cut vertex', sel: 'v', hint: 'Click one vertex whose removal disconnects the graph.', check(g, S) { if (S.size !== 1) return { ok: false, msg: 'Select exactly one vertex.' }; const v = [...S][0]; const before = compCount(g.nodes.length, g.edges), after = compCount(g.nodes.length, g.edges, new Set([v])); return after > before ? { ok: true, msg: `Removing ${lab(g, v)} leaves ${after} components instead of ${before}. So κ(G) ≤ 1.` } : { ok: false, msg: `Removing ${lab(g, v)} leaves the remaining vertices connected (${after} component${after > 1 ? 's' : ''}).` }; } },
    { key: 'bridge', name: 'Bridge', sel: 'e', hint: 'Click one edge whose removal disconnects the graph.', check(g, S) { if (S.size !== 1) return { ok: false, msg: 'Select exactly one edge.' }; const i = [...S][0]; const before = compCount(g.nodes.length, g.edges), after = compCount(g.nodes.length, g.edges.filter((e, k) => k !== i)); return after > before ? { ok: true, msg: `Removing ${edgeName(g, i)} disconnects the graph, so it lies on no cycle and λ(G) ≤ 1.` } : { ok: false, msg: `${edgeName(g, i)} lies on a cycle: the graph stays connected without it.` }; } },
    { key: 'sep', name: 'Vertex separator (upper bound on κ)', sel: 'v', hint: 'Click a set of vertices whose removal disconnects the rest.', check(g, S) { const left = g.nodes.length - S.size; if (left < 2) return { ok: false, msg: 'At least two vertices must remain.' }; const c = compCount(g.nodes.length, g.edges, S); return c > 1 ? { ok: true, msg: `Removing these ${S.size} vertices leaves ${c} components, so κ(G) ≤ ${S.size}.` } : { ok: false, msg: 'The remaining vertices are still connected.' }; } },
  ],
  iso: [
    { key: 'bij', name: 'Isomorphism between graph 1 and graph 2', sel: 'text', hint: 'Type the bijection as pairs, e.g. a->x, b->y, … (graph 1 → graph 2).', check(g, text) { if ((g.parts || 1) < 2) return { ok: false, msg: 'Load two graphs separated by ---.' }; let m; try { m = parseMap(text, g, 0, 1); } catch (e) { return { ok: false, msg: esc(e.message) }; } const dom = g.nodes.map((v, i) => i).filter(i => g.nodes[i].part === 0), cod = g.nodes.map((v, i) => i).filter(i => g.nodes[i].part === 1); if (dom.length !== cod.length) return { ok: false, msg: 'The graphs have different orders, so no bijection exists.' }; const r = checkBijection(g, m, dom, cod); return r.ok ? { ok: true, msg: 'Adjacency is preserved in both directions for every pair: the graphs are isomorphic.' } : r; } },
    { key: 'aut', name: 'Automorphism', sel: 'text', hint: 'Type a permutation of the vertices, e.g. a->b, b->c, c->a (unmapped vertices are fixed).', check(g, text) { let m; try { m = parseMap(text, g); } catch (e) { return { ok: false, msg: esc(e.message) }; } g.nodes.forEach((v, i) => { if (!m.has(i)) m.set(i, i); }); const r = checkBijection(g, m, g.nodes.map((v, i) => i)); if (!r.ok) return r; const moved = [...m].filter(([a, b]) => a !== b).length; return { ok: true, msg: moved ? `A non-trivial automorphism moving ${moved} vertices.` : 'This is the identity permutation; it is always an automorphism.' }; } },
  ],
  mst: [
    { key: 'st', name: 'Minimum spanning tree', sel: 'e', hint: 'Click the edges of your spanning tree.', check(g, S) {
      const n = g.nodes.length, E = selEdges(g, S); if (E.length !== n - 1) return { ok: false, msg: `A spanning tree on ${n} vertices has ${n - 1} edges; you selected ${E.length}.` };
      if (compCount(n, E) !== 1) return { ok: false, msg: 'The selected edges do not connect all vertices (so they also contain a cycle).' };
      const tree = [...S]; const w = E.reduce((a, e) => a + e.w, 0);
      for (let i = 0; i < g.edges.length; i++) { if (S.has(i)) continue; const e = g.edges[i]; const mx = treePathMax(g, tree, e.u, e.v); if (mx !== null && e.w < mx) { const f = tree.find(t => g.edges[t].w === mx && treePathMax(g, tree.filter(x => x !== t), e.u, e.v) === null); return { ok: false, msg: `A spanning tree of weight ${fmt(w)}, but not minimum: ${edgeName(g, i)} (w = ${fmt(e.w)}) closes a cycle containing ${f !== undefined ? edgeName(g, f) : 'an edge'} (w = ${fmt(mx)}). Swapping them saves ${fmt(mx - e.w)}.`, ec: Object.assign({ [i]: 'path' }, f !== undefined ? { [f]: 'cut' } : {}) }; } }
      return { ok: true, msg: `A spanning tree of weight ${fmt(w)} satisfying the cycle property for every non-tree edge, so it is minimum.` }; } },
  ],
  sp: [
    { key: 'path', name: 'Shortest path between its ends', sel: 'e', hint: 'Click the edges of a path; the lab checks it is shortest between its two ends.', check(g, S) {
      const p = pathCheck(g, S); if (p.err) return { ok: false, msg: p.err };
      const [a, b] = p.ends; const d1 = bellmanFordPlain(g, a), d2 = bellmanFordPlain(g, b);
      if (!d1 || !d2) return { ok: false, msg: 'A negative cycle is reachable: shortest paths are undefined here.' };
      if (g.directed) { // must be oriented from one end to the other
        const fw = orientPath(g, p.E, a, b), bw = orientPath(g, p.E, b, a); if (!fw && !bw) return { ok: false, msg: 'In a directed graph the arcs must all point the same way along the path.' }; const [s, t] = fw ? [a, b] : [b, a]; const d = fw ? d1[b] : d2[a]; return Math.abs(d - p.len) < 1e-9 ? { ok: true, msg: `Length ${fmt(p.len)} from ${lab(g, s)} to ${lab(g, t)} equals the distance d = ${fmt(d)}.` } : { ok: false, msg: `Length ${fmt(p.len)}, but the distance from ${lab(g, s)} to ${lab(g, t)} is ${fmt(d)}.` };
      }
      return Math.abs(d1[b] - p.len) < 1e-9 ? { ok: true, msg: `Length ${fmt(p.len)} equals the distance d(${lab(g, a)}, ${lab(g, b)}) = ${fmt(d1[b])}.` } : { ok: false, msg: `Length ${fmt(p.len)}, but d(${lab(g, a)}, ${lab(g, b)}) = ${fmt(d1[b])}.` }; } },
  ],
  route: [
    { key: 'ham', name: 'Hamilton cycle', sel: 'e', hint: 'Click the edges of a cycle through every vertex.', check(g, S) { const c = cycleCheck(g, S); if (c.err) return { ok: false, msg: c.err, nc: Object.fromEntries((c.badV || []).map(v => [v, 'cut'])) }; return c.verts.length === g.nodes.length ? { ok: true, msg: `A cycle through all ${g.nodes.length} vertices: Hamiltonian. This certificate is checkable in linear time.` } : { ok: false, msg: `A cycle, but it misses ${g.nodes.length - c.verts.length} vertices.` }; } },
    { key: 'euler', name: 'Euler circuit (vertex sequence)', sel: 'text', hint: 'Type the circuit as a vertex sequence, e.g. A B C A D C … A.', check(g, text) {
      const seq = text.split(/[\s,→-]+/).filter(Boolean).map(x => g.nodes.findIndex(v => v.label === x)); if (seq.some(i => i < 0)) return { ok: false, msg: 'Some names are not vertices of the graph.' };
      if (seq.length < 2 || seq[0] !== seq[seq.length - 1]) return { ok: false, msg: 'A circuit must end where it starts.' };
      const used = new Set(); for (let k = 0; k + 1 < seq.length; k++) { const i = g.edges.findIndex((e, j) => !used.has(j) && ((e.u === seq[k] && e.v === seq[k + 1]) || (!g.directed && e.u === seq[k + 1] && e.v === seq[k]))); if (i < 0) return { ok: false, msg: `Step ${lab(g, seq[k])} → ${lab(g, seq[k + 1])} uses no unused edge.` }; used.add(i); }
      return used.size === g.edges.length ? { ok: true, msg: `Uses all ${used.size} edges exactly once and returns to the start.` } : { ok: false, msg: `Uses ${used.size} of ${g.edges.length} edges.` }; } },
  ],
  flow: [
    { key: 'cut', name: 's–t cut (proves a flow is maximum)', sel: 'v', hint: 'Click the vertices of the source side S (it must contain the source, not the sink).', check(g, S, ctx) {
      const s = ctx.P.source, t = ctx.P.sink; if (!S.has(s)) return { ok: false, msg: `S must contain the source ${lab(g, s)}.` }; if (S.has(t)) return { ok: false, msg: `S must not contain the sink ${lab(g, t)}.` };
      let cap = 0; const ec = {}; g.edges.forEach((e, i) => { if (S.has(e.u) && !S.has(e.v)) { cap += e.w; ec[i] = 'cut'; } });
      const mf = flowRun(g, s, t, 'bfs').value;
      return Math.abs(cap - mf) < 1e-9 ? { ok: true, msg: `Cut capacity ${fmt(cap)} equals the maximum flow value ${fmt(mf)}: this cut is minimum and certifies that no flow can exceed ${fmt(mf)}.`, ec } : { ok: false, msg: `A valid cut of capacity ${fmt(cap)}: every flow is at most ${fmt(cap)}. The maximum flow is ${fmt(mf)}, so a smaller cut exists.`, ec }; } },
  ],
  match: [
    { key: 'matching', name: 'Maximum matching', sel: 'e', hint: 'Click the edges of your matching.', check(g, S) { const seen = new Map(); for (const i of S) for (const v of [g.edges[i].u, g.edges[i].v]) { if (seen.has(v)) return { ok: false, msg: `${lab(g, v)} is covered twice.`, nc: { [v]: 'cut' } }; seen.set(v, i); } const k = kuhnCount(g); const opt = k ? k.size : null; return opt === null ? { ok: true, msg: `A matching of size ${S.size}.` } : S.size === opt ? { ok: true, msg: `A matching of size ${S.size} = ν(G): maximum (a vertex cover of the same size exists).` } : { ok: false, msg: `A valid matching of size ${S.size}, but ν(G) = ${opt}: look for an augmenting path.` }; } },
    { key: 'cover', name: 'Vertex cover', sel: 'v', hint: 'Click a set of vertices touching every edge.', check(g, S) { const un = g.edges.map((e, i) => i).filter(i => !S.has(g.edges[i].u) && !S.has(g.edges[i].v)); if (un.length) return { ok: false, msg: `${un.length} edge${un.length > 1 ? 's are' : ' is'} not covered.`, ec: Object.fromEntries(un.map(i => [i, 'cut'])) }; const k = kuhnCount(g); return k && k.size === S.size ? { ok: true, msg: `A vertex cover of size ${S.size} = ν(G). Together with a matching of that size it proves both are optimal (König).` } : { ok: true, msg: `A valid vertex cover of size ${S.size}: every matching has at most ${S.size} edges.${k ? ` (ν(G) = ${k.size}.)` : ''}` }; } },
    { key: 'hall', name: 'Hall violator', sel: 'v', hint: 'Click a set S on one side with fewer than |S| neighbours.', check(g, S) { const col = twoColoring(g); if (!col) return { ok: false, msg: 'The graph is not bipartite.' }; const sides = new Set([...S].map(v => col[v])); if (sides.size !== 1) return { ok: false, msg: 'Choose S inside one side of the bipartition.' }; const N = new Set(); g.edges.forEach(e => { if (S.has(e.u)) N.add(e.v); if (S.has(e.v)) N.add(e.u); }); const nc = {}; N.forEach(v => nc[v] = 'front'); return N.size < S.size ? { ok: true, msg: `|N(S)| = ${N.size} < |S| = ${S.size}: no matching covers S (Hall).`, nc } : { ok: false, msg: `|N(S)| = ${N.size} ≥ |S| = ${S.size}: Hall’s condition holds for this S.`, nc }; } },
  ],
  color: [
    { key: 'coloring', name: 'Proper colouring', sel: 'col', colors: 10, hint: 'Click vertices to cycle through colours 1–10.', check(g, C) { const un = g.nodes.map((v, i) => i).filter(i => !C[i]); if (un.length) return { ok: false, msg: `${un.length} vertices have no colour.`, nc: Object.fromEntries(un.map(i => [i, 'cut'])) }; const bad = g.edges.map((e, i) => i).filter(i => C[g.edges[i].u] === C[g.edges[i].v]); if (bad.length) return { ok: false, msg: `${bad.length} edge${bad.length > 1 ? 's are' : ' is'} monochromatic.`, ec: Object.fromEntries(bad.map(i => [i, 'cut'])) }; const k = new Set(Object.values(C)).size; const w = maxClique(g).length; return { ok: true, msg: k === w ? `Proper with ${k} colours = ω(G), so χ(G) = ${k}.` : `Proper with ${k} colours: χ(G) ≤ ${k}. (ω(G) = ${w}, so χ ≥ ${w}.)` }; } },
    { key: 'clique', name: 'Clique (lower bound on χ)', sel: 'v', hint: 'Click pairwise adjacent vertices.', check(g, S) { const M = adjMatrix(g, true); const V = [...S]; for (const a of V) for (const b of V) if (a < b && !M[a][b]) return { ok: false, msg: `${lab(g, a)} and ${lab(g, b)} are not adjacent.`, nc: { [a]: 'cut', [b]: 'cut' } }; return { ok: true, msg: `A clique of size ${S.size}: χ(G) ≥ ${S.size}.` }; } },
    { key: 'kur', name: 'Kuratowski subgraph (proves non-planarity)', sel: 'e', hint: 'Click the edges of a subdivision of K₅ or K₃,₃.', check(g, S) {
      const E = selEdges(g, S); const deg = new Map(); E.forEach(e => { deg.set(e.u, (deg.get(e.u) || 0) + 1); deg.set(e.v, (deg.get(e.v) || 0) + 1); });
      const br = [...deg].filter(([, d]) => d >= 3).map(([v]) => v); if ([...deg.values()].some(d => d === 1)) return { ok: false, msg: 'Some selected path stops at a vertex of degree 1.' };
      const adj = new Map(); E.forEach((e, i) => { (adj.get(e.u) || adj.set(e.u, []).get(e.u)).push([e.v, i]); (adj.get(e.v) || adj.set(e.v, []).get(e.v)).push([e.u, i]); });
      const used = new Set(), links = []; for (const b of br) for (const [v, i] of adj.get(b)) { if (used.has(i)) continue; used.add(i); let prev = b, cur = v; while (!br.includes(cur)) { const nx = adj.get(cur).find(([w, j]) => !used.has(j)); if (!nx) return { ok: false, msg: 'A path between branch vertices is broken.' }; used.add(nx[1]); prev = cur; cur = nx[0]; } links.push([b, cur]); }
      const key = (a, b) => Math.min(a, b) + ',' + Math.max(a, b); const L = new Set(links.map(([a, b]) => key(a, b)));
      if (links.some(([a, b]) => a === b) || L.size !== links.length) return { ok: false, msg: 'Two paths join the same pair of branch vertices, or a path returns to its start.' };
      if (br.length === 5 && links.length === 10) return { ok: true, msg: 'A subdivision of K₅: five branch vertices joined pairwise by internally disjoint paths. The graph is not planar.' };
      if (br.length === 6 && links.length === 9) { const col = new Map(); col.set(br[0], 0); const q = [br[0]]; while (q.length) { const x = q.pop(); for (const [a, b] of links) { const y = a === x ? b : b === x ? a : null; if (y === null) continue; if (!col.has(y)) { col.set(y, 1 - col.get(x)); q.push(y); } else if (col.get(y) === col.get(x)) return { ok: false, msg: 'Nine paths among six branch vertices, but not in the K₃,₃ pattern.' }; } } return { ok: true, msg: 'A subdivision of K₃,₃: two triples of branch vertices, every cross pair joined by a path. The graph is not planar.' }; }
      return { ok: false, msg: `${br.length} branch vertices and ${links.length} paths: not the pattern of K₅ (5 and 10) or K₃,₃ (6 and 9).` }; } },
  ],
  dom: [
    { key: 'domset', name: 'Dominating set', sel: 'v', hint: 'Click your sensor positions.', check(g, S) { const Nc = closedNbhd(g); const und = g.nodes.map((v, i) => i).filter(v => !Nc[v].some(x => S.has(x))); if (und.length) return { ok: false, msg: `${und.length} vertices are not dominated.`, nc: Object.fromEntries(und.map(v => [v, 'cut'])) }; const ex = exactDomination(g); return ex.exact && S.size === ex.set.length ? { ok: true, msg: `Dominating with ${S.size} vertices = γ(G): optimal.` } : { ok: true, msg: `Dominating with ${S.size} vertices, so γ(G) ≤ ${S.size}.${ex.exact ? ` (γ(G) = ${ex.set.length}.)` : ''}` }; } },
    { key: 'packing', name: 'Packing (lower bound on γ)', sel: 'v', hint: 'Click vertices whose closed neighbourhoods are pairwise disjoint.', check(g, S) { const Nc = closedNbhd(g); const V = [...S]; for (const a of V) for (const b of V) if (a < b && Nc[a].some(x => Nc[b].includes(x))) return { ok: false, msg: `N[${lab(g, a)}] and N[${lab(g, b)}] overlap.`, nc: { [a]: 'cut', [b]: 'cut' } }; return { ok: true, msg: `${S.size} pairwise disjoint closed neighbourhoods: each needs its own dominating vertex, so γ(G) ≥ ${S.size}. (This is a feasible solution of the dual LP.)` }; } },
  ],
};
function orientPath(g, E, a, b) { let x = a; const left = E.slice(); while (left.length) { const k = left.findIndex(e => e.u === x); if (k < 0) return false; x = left[k].v; left.splice(k, 1); } return x === b; }
