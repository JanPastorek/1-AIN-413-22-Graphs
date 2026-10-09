/* ============================================================
   Algorithms, part 2: routing (Euler / postman / Hamilton / TSP), flows, matchings
   ============================================================ */

function floydUnd(g) {
  const n = g.nodes.length; const D = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity));
  const nxt = Array.from({ length: n }, () => Array(n).fill(-1)), via = Array.from({ length: n }, () => Array(n).fill(-1));
  g.edges.forEach((e, i) => { for (const [a, b] of [[e.u, e.v], [e.v, e.u]]) if (e.w < D[a][b]) { D[a][b] = e.w; nxt[a][b] = b; via[a][b] = i; } });
  for (let i = 0; i < n; i++) nxt[i][i] = i;
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) if (D[i][k] < Infinity) for (let j = 0; j < n; j++) if (D[i][k] + D[k][j] < D[i][j]) { D[i][j] = D[i][k] + D[k][j]; nxt[i][j] = nxt[i][k]; }
  const path = (a, b) => { const out = []; if (nxt[a][b] < 0) return null; let x = a; while (x !== b) { const y = nxt[x][b]; out.push(via[x][y]); x = y; } return out; };
  return { D, path };
}
function minPairing(odd, D) {
  const k = odd.length, memo = new Map();
  function f(mask) {
    if (mask === 0) return [0, []]; if (memo.has(mask)) return memo.get(mask);
    let i = 0; while (!(mask & (1 << i))) i++; let best = [Infinity, null];
    for (let j = i + 1; j < k; j++) if (mask & (1 << j)) { const [c, p] = f(mask & ~(1 << i) & ~(1 << j)); const t = c + D[odd[i]][odd[j]]; if (t < best[0]) best = [t, [[odd[i], odd[j]]].concat(p)]; }
    memo.set(mask, best); return best;
  }
  return f((1 << k) - 1);
}

function algEuler(g, P) {
  const n = g.nodes.length, R = new Rec(); const deg = Array(n).fill(0); g.edges.forEach(e => { deg[e.u]++; deg[e.v]++; });
  g.nodes.forEach((v, i) => R.ntag[i] = 'deg ' + deg[i]);
  const odd = g.nodes.map((v, i) => i).filter(i => deg[i] % 2);
  odd.forEach(i => R.nc[i] = 'cut');
  const note = g.directed ? ' (This lab treats the edges as undirected.)' : '';
  // connectivity among non-isolated
  const { comp } = components(g); const live = g.nodes.map((v, i) => i).filter(i => deg[i] > 0);
  if (new Set(live.map(i => comp[i])).size > 1) { R.line = 0; R.snap('The edges lie in more than one component, so no single walk can cover them all.' + note, { panel: cert('no', 'No covering walk', 'Euler circuits and postman tours need all edges in one component.') }, true); return { frames: R.frames }; }
  const total = g.edges.reduce((s, e) => s + e.w, 0);
  R.line = 0; R.snap(`${odd.length} vertices of odd degree${odd.length ? ': ' + odd.map(i => lab(g, i)).join(', ') : ''}. Every pass through a vertex uses two edges, so a closed walk using each edge once needs all degrees even.` + note, { panel: h4('Degrees') + table(['vertex', 'deg', 'parity'], g.nodes.map((v, i) => [lab(g, i), deg[i], deg[i] % 2 ? 'odd' : 'even']), 'compact') });
  const dups = []; // multigraph extra edges {u,v,w,orig}
  let start = live.length ? live[0] : 0, mode = 'circuit';
  if (odd.length === 2 && P.goal === 'open') { mode = 'trail'; start = odd[0]; }
  else if (odd.length > 0) {
    if (odd.length > 18) { R.snap('Too many odd vertices for exact pairing in the browser (limit 18).', { panel: '' }, true); return { frames: R.frames }; }
    const { D, path } = floydUnd(g); const [cost, pairs] = minPairing(odd, D);
    const pairEdges = [];
    pairs.forEach(([a, b]) => { for (const e of path(a, b)) { pairEdges.push(e); dups.push({ u: g.edges[e].u, v: g.edges[e].v, w: g.edges[e].w, orig: e }); } });
    R.ec = {}; pairEdges.forEach(e => R.ec[e] = 'path');
    R.line = 1; R.snap(`Chinese postman: pair the odd vertices so the total shortest-path distance is minimum. Best pairing ${pairs.map(([a, b]) => `${lab(g, a)}–${lab(g, b)} (${fmt(D[a][b])})`).join(', ')}, extra cost ${fmt(cost)}.`, { panel: h4('All pairings were compared') + `<p class="note">With ${odd.length} odd vertices there are ${[...Array(odd.length / 2).keys()].reduce((p, i) => p * (2 * i + 1), 1)} perfect pairings. Bitmask dynamic programming finds the cheapest. (In general this is a minimum-weight perfect matching.)</p>` + table(['pair', 'distance'], pairs.map(([a, b]) => [`${lab(g, a)}–${lab(g, b)}`, fmt(D[a][b])]), 'compact') });
    R.ec = {};
    R.line = 1; R.snap(`Duplicate the edges on those paths (dashed). Now every degree is even, so an Euler circuit exists in the multigraph.`, { overlay: dups.map(d => ({ u: d.u, v: d.v, cls: 'dup', label: fmt(d.w) })), panel: cert('info', `Tour length = ${fmt(total)} + ${fmt(cost)} = ${fmt(total + cost)}`, 'Each edge is walked once, plus the duplicated edges. Optimality: any closed covering walk must repeat a set of edges that makes all degrees even, and such a set contains paths pairing the odd vertices.') });
  }
  // Hierholzer on multigraph
  const ME = g.edges.map((e, i) => ({ u: e.u, v: e.v, base: i })).concat(dups.map((d, k) => ({ u: d.u, v: d.v, dup: k })));
  const inc = g.nodes.map(() => []); ME.forEach((e, i) => { inc[e.u].push(i); inc[e.v].push(i); });
  const used = Array(ME.length).fill(false), ptr = Array(n).fill(0); const dcls = dups.map(() => 'dup'), dlab = dups.map(d => fmt(d.w));
  const st = [{ v: start, e: -1 }], circ = [];
  const ov = () => dups.map((d, k) => ({ u: d.u, v: d.v, cls: dcls[k], label: dlab[k] }));
  const setCls = (i, c) => { if (ME[i].base !== undefined) R.ec[ME[i].base] = c; else dcls[ME[i].dup] = c === undefined ? 'dup' : c + ' dupc'; };
  const panel = () => h4('Stack (current walk)') + chips(st.map(x => lab(g, x.v))) + h4('Finished circuit (built from the end)') + chips(circ.map(x => lab(g, x)));
  R.nc = {}; R.nc[start] = 'cur';
  R.line = 2; R.snap(`Hierholzer: start at ${N(g, start)}. Walk along unused edges until stuck, then back up, splicing in detours.`, { overlay: ov(), panel: panel() });
  while (st.length) {
    const top = st[st.length - 1]; const v = top.v;
    while (ptr[v] < inc[v].length && used[inc[v][ptr[v]]]) ptr[v]++;
    if (ptr[v] < inc[v].length) {
      const ei = inc[v][ptr[v]]; used[ei] = true; const w = ME[ei].u === v ? ME[ei].v : ME[ei].u;
      st.push({ v: w, e: ei }); setCls(ei, 'cand'); R.nc = { [w]: 'cur' };
      R.line = 5; R.snap(`Walk ${lab(g, v)} → ${lab(g, w)}.`, { overlay: ov(), panel: panel() });
    } else {
      st.pop(); circ.unshift(v); if (top.e >= 0) setCls(top.e, 'tree');
      R.nc = st.length ? { [st[st.length - 1].v]: 'front' } : {};
      R.line = 6; R.snap(`${lab(g, v)} has no unused edges: move it to the circuit${st.length ? ' and back up to ' + lab(g, st[st.length - 1].v) : ''}.`, { overlay: ov(), panel: panel() });
    }
  }
  // order numbers
  const seq = []; { // recover edge order by replaying circuit through used edges
    const left = ME.map((e, i) => i); const avail = new Set(left);
    for (let k = 0; k + 1 < circ.length; k++) { const a = circ[k], b = circ[k + 1]; const ei = [...avail].find(i => (ME[i].u === a && ME[i].v === b) || (ME[i].u === b && ME[i].v === a)); avail.delete(ei); seq.push(ei); }
  }
  R.elab = {}; seq.forEach((ei, k) => { if (ME[ei].base !== undefined) R.elab[ME[ei].base] = `#${k + 1}`; else dlab[ME[ei].dup] = `#${k + 1}`; });
  R.nc = { [start]: 'cur' };
  const len = total + dups.reduce((s, d) => s + d.w, 0);
  R.line = 7; R.snap(`${mode === 'trail' ? 'Euler trail' : odd.length ? 'Postman tour' : 'Euler circuit'}: ${circ.map(i => lab(g, i)).join(' → ')}.`, { overlay: ov(), panel: cert('yes', `${mode === 'trail' ? 'Open trail' : 'Closed tour'}, length ${fmt(len)}`, `${seq.length} edge traversals; labels give the order.`) + h4('Walk') + `<p class="mono">${circ.map(i => lab(g, i)).join(' → ')}</p>` }, true);
  return { frames: R.frames, truncated: R.truncated };
}

function algHamilton(g, P) {
  const n = g.nodes.length, R = new Rec(); const S = simpleNbrSets(g); const A = S.map(s => [...s].sort((a, b) => a - b));
  const eid = (a, b) => g.edges.findIndex(e => (e.u === a && e.v === b) || (e.u === b && e.v === a));
  const path = [P.source], inP = Array(n).fill(false); inP[P.source] = true; let calls = 0, found = null; const LIMIT = 3e6;
  const show = (msg) => { R.nc = {}; R.ec = {}; path.forEach((v, k) => R.nc[v] = k === path.length - 1 ? 'cur' : 'done'); for (let k = 1; k < path.length; k++) R.ec[eid(path[k - 1], path[k])] = 'path'; R.snap(msg, { panel: h4('Current path') + chips(path.map(v => lab(g, v))) + `<p class="note">Recursive calls so far: ${calls.toLocaleString()}</p>` }); };
  R.line = 0; show(`Backtracking search for a Hamilton cycle from ${N(g, P.source)}. Unlike Euler, no simple degree test exists; the problem is NP-complete.`);
  function rec() {
    if (found || calls > LIMIT) return; calls++;
    const u = path[path.length - 1];
    if (path.length === n) { if (S[u].has(P.source)) found = path.slice(); else { R.line = 1; show(`All ${n} vertices used but ${lab(g, u)} is not adjacent to ${lab(g, P.source)}. Back up.`); } return; }
    for (const v of A[u]) { if (inP[v]) continue; inP[v] = true; path.push(v); R.line = 3; show(`Extend to ${lab(g, v)}.`); rec(); if (found) return; path.pop(); inP[v] = false; R.line = 4; show(`Dead end below ${lab(g, v)}: back up to ${lab(g, u)}.`); }
  }
  rec();
  if (found) { R.nc = {}; R.ec = {}; found.forEach(v => R.nc[v] = 'done'); for (let k = 0; k < n; k++) R.ec[eid(found[k], found[(k + 1) % n])] = 'tree'; R.line = 1; R.snap('Hamilton cycle found.', { panel: cert('yes', 'Hamiltonian', `${found.map(v => lab(g, v)).join(' → ')} → ${lab(g, found[0])}. Anyone can check this certificate in linear time.`) + `<p class="note">Found after ${calls.toLocaleString()} recursive calls.</p>` }, true); }
  else if (calls > LIMIT) { R.line = 1; R.snap('Search budget exhausted.', { panel: cert('info', 'Undecided', `Stopped after ${LIMIT.toLocaleString()} calls.`) }, true); }
  else { R.nc = {}; R.ec = {}; R.line = 1; R.snap('Every extension failed.', { panel: cert('no', 'Not Hamiltonian', `Exhaustive search (${calls.toLocaleString()} calls) found no Hamilton cycle. Note how a “no” answer has no short certificate in general, unlike Euler’s parity test.`) }, true); }
  return { frames: R.frames, truncated: R.truncated };
}

function algTSP(g, P) {
  const n = g.nodes.length, R = new Rec(); const { D } = floydUnd(g);
  if (D.some(r => r.some(x => x === Infinity))) { R.snap('The graph is disconnected, so no tour exists.', { panel: '' }, true); return { frames: R.frames }; }
  if (n > 13) { R.snap('Held–Karp is limited to 13 vertices here (it needs 2ⁿ·n² steps).', { panel: '' }, true); return { frames: R.frames }; }
  const metricNote = 'Distances are shortest-path distances (the metric closure), so a tour may pass through a vertex again on the way.';
  const tourOv = (t, cls) => t.map((v, k) => ({ u: v, v: t[(k + 1) % t.length], cls, label: fmt(D[v][t[(k + 1) % t.length]]) }));
  const len = t => t.reduce((s, v, k) => s + D[v][t[(k + 1) % t.length]], 0);
  // nearest neighbour
  const s = P.source, nn = [s], vis = Array(n).fill(false); vis[s] = true;
  R.ec = {}; g.edges.forEach((e, i) => R.ec[i] = 'faint');
  R.snap(`Nearest-neighbour heuristic from ${N(g, s)}: always go to the closest unvisited vertex. ${metricNote}`, { overlay: [], panel: '' });
  while (nn.length < n) { const u = nn[nn.length - 1]; let b = -1; for (let v = 0; v < n; v++) if (!vis[v] && (b < 0 || D[u][v] < D[u][b])) b = v; vis[b] = true; nn.push(b); R.nc = { [b]: 'cur' }; R.snap(`From ${lab(g, u)} the closest unvisited vertex is ${lab(g, b)} (${fmt(D[u][b])}).`, { overlay: tourOv(nn, 'cand').slice(0, -1), panel: chips(nn.map(v => lab(g, v))) }); }
  const nnLen = len(nn); R.nc = {};
  R.snap(`Close the tour back to ${lab(g, s)}. Nearest-neighbour length ${fmt(nnLen)}.`, { overlay: tourOv(nn, 'cand'), panel: chips(nn.map(v => lab(g, v))) });
  // Held–Karp
  const FULL = 1 << n, dp = new Float64Array(FULL * n).fill(Infinity), par = new Int8Array(FULL * n).fill(-1);
  dp[(1 << s) * n + s] = 0;
  for (let m = 0; m < FULL; m++) { if (!(m & (1 << s))) continue; for (let j = 0; j < n; j++) { const cur = dp[m * n + j]; if (cur === Infinity) continue; for (let k = 0; k < n; k++) { if (m & (1 << k)) continue; const nm = m | (1 << k), v = cur + D[j][k]; if (v < dp[nm * n + k]) { dp[nm * n + k] = v; par[nm * n + k] = j; } } } }
  let best = Infinity, last = -1; for (let j = 0; j < n; j++) if (j !== s && dp[(FULL - 1) * n + j] + D[j][s] < best) { best = dp[(FULL - 1) * n + j] + D[j][s]; last = j; }
  if (n === 1) { best = 0; last = s; }
  const opt = []; let m = FULL - 1, j = last; while (j >= 0) { opt.unshift(j); const p = par[m * n + j]; m &= ~(1 << j); j = p; }
  // MST lower bound on metric closure
  const inT = Array(n).fill(false), key = Array(n).fill(Infinity); key[0] = 0; let mst = 0; for (let it = 0; it < n; it++) { let u = -1; for (let v = 0; v < n; v++) if (!inT[v] && (u < 0 || key[v] < key[u])) u = v; inT[u] = true; mst += key[u]; for (let v = 0; v < n; v++) if (!inT[v] && D[u][v] < key[v]) key[v] = D[u][v]; }
  const gap = best > 0 ? ((nnLen - best) / best * 100) : 0;
  const ilp = `<pre class="ilp">min  Σ c(e)·x(e)
s.t. Σ x(e) over e ∋ v       = 2   for every vertex v
     Σ x(e) over e ∈ δ(S)    ≥ 2   for every S, 2 ≤ |S| ≤ n−2
     x(e) ∈ {0, 1}</pre><p class="note">Dantzig–Fulkerson–Johnson. Drop the middle family and the optimum can split into several small cycles (subtours); each subtour S violates its own cut constraint, which is how solvers add constraints lazily.</p>`;
  R.snap(`Held–Karp dynamic programming over subsets gives the optimum: ${fmt(best)}.`, { overlay: tourOv(opt, 'tree'), panel: cert(gap > 1e-9 ? 'no' : 'yes', `Optimal ${fmt(best)} vs nearest-neighbour ${fmt(nnLen)}`, `Gap ${gap.toFixed(1)}%. Lower bound: MST of the metric closure = ${fmt(mst)} ≤ OPT (delete one tour edge to get a spanning tree). Doubling the MST gives a tour ≤ 2·OPT.`) + h4('Optimal tour') + `<p class="mono">${opt.map(v => lab(g, v)).join(' → ')} → ${lab(g, opt[0])}</p>` + h4('The ILP behind TSP solvers') + ilp }, true);
  return { frames: R.frames };
}

/* ---------- flows ---------- */
function algFlow(g, P) {
  const n = g.nodes.length, R = new Rec(), s = P.source, t = P.sink;
  if (s === t) { R.snap('Source and sink must differ.', { panel: '' }, true); return { frames: R.frames }; }
  const E = g.edges, f = E.map(() => 0); let value = 0;
  const radj = g.nodes.map(() => []); E.forEach((e, i) => { radj[e.u].push({ e: i, dir: 1, to: e.v }); radj[e.v].push({ e: i, dir: -1, to: e.u }); });
  const resid = (a) => a.dir > 0 ? E[a.e].w - f[a.e] : f[a.e];
  const st = { [s]: 's', [t]: 't' };
  function frame(msg, pathArcs, Sset, panel, line = 2, ask = undefined) {
    const nc = {}, ntag = { ...st }, ec = {}, elab = {};
    if (Sset) g.nodes.forEach((v, i) => nc[i] = Sset.has(i) ? 'done' : 'k1');
    nc[s] = nc[s] || 'cur'; nc[t] = nc[t] || 'front';
    E.forEach((e, i) => { elab[i] = `${fmt(f[i])}/${fmt(e.w)}`; if (f[i] > 0) ec[i] = 'flow'; if (Sset && Sset.has(e.u) && !Sset.has(e.v)) ec[i] = 'cut'; });
    const pk = new Map((pathArcs || []).map(a => [a.e + ':' + a.dir, 1]));
    (pathArcs || []).forEach(a => ec[a.e] = a.dir > 0 ? 'path' : 'cancel');
    const overlay = []; E.forEach((e, i) => {
      if (e.w - f[i] > 0) overlay.push({ u: e.u, v: e.v, cls: pk.has(i + ':1') ? 'path' : 'res', label: fmt(e.w - f[i]), dir: true });
      if (f[i] > 0) overlay.push({ u: e.v, v: e.u, cls: pk.has(i + ':-1') ? 'path' : 'resb', label: fmt(f[i]), dir: true });
    });
    const fr = { msg, nc, ntag, ec, elab, panel, line, ask, alt: { nc, ntag, ec: {}, elab: {}, hideBase: true, overlay } };
    if (R.frames.length < MAXF || Sset) R.frames.push(fr); else R.truncated = true;
  }
  const panel = (extra = '') => extra + h4(`Flow value |f| = ${fmt(value)}`) + '<p class="note">Edge labels show flow/capacity. Switch to the residual view to see forward capacity left and backward arcs that let you cancel flow.</p>';
  frame(`Start with zero flow from ${N(g, s)} to ${N(g, t)}. Edmonds–Karp augments along a shortest path in the residual network.`, null, null, panel(), 1);
  let rounds = 0;
  while (rounds++ < 500) {
    const prev = Array(n).fill(null); const seen = Array(n).fill(false); seen[s] = true; const Q = [s];
    for (let h = 0; h < Q.length && !seen[t]; h++) { const u = Q[h]; for (const a of radj[u]) if (!seen[a.to] && resid(a) > 0) { seen[a.to] = true; prev[a.to] = a; Q.push(a.to); } }
    if (!seen[t]) { const S = new Set(g.nodes.map((v, i) => i).filter(i => seen[i])); let cap = 0; const cutE = []; E.forEach((e, i) => { if (S.has(e.u) && !S.has(e.v)) { cap += e.w; cutE.push(i); } });
      frame(`No augmenting path: the vertices reachable from ${lab(g, s)} in the residual network form the source side S.`, null, S, cert('yes', `Max flow = min cut = ${fmt(value)}`, `S = {${[...S].map(i => lab(g, i)).join(', ')}}. Cut edges ${cutE.map(i => edgeName(g, i)).join(', ')} have total capacity ${fmt(cap)}. Every s–t flow crosses this cut, so no flow exceeds ${fmt(cap)}, and ours reaches it. Edges entering S carry 0 flow.`) + panel(), 5); break; }
    const path = []; let x = t; while (x !== s) { const a = prev[x]; path.unshift(a); x = a.dir > 0 ? E[a.e].u : E[a.e].v; }
    const b = Math.min(...path.map(resid)); const verts = [s].concat(path.map(a => a.to));
    frame(`Augmenting path ${verts.map(v => lab(g, v)).join(' → ')} with bottleneck ${fmt(b)}${path.some(a => a.dir < 0) ? ' (it uses a backward arc: some flow gets cancelled)' : ''}.`, path, null, panel(h4('Residual capacities on the path') + chips(path.map(a => `${lab(g, a.dir > 0 ? E[a.e].u : E[a.e].v)}→${lab(g, a.to)}: ${fmt(resid(a))}`))), 3);
    for (const a of path) f[a.e] += a.dir * b; value += b;
    frame(`Push ${fmt(b)} units. |f| = ${fmt(value)}.`, null, null, panel(), 4, { type: 'number', answer: [b], prompt: 'How many units can be pushed along the highlighted path (its bottleneck)?' });
  }
  return { frames: R.frames, truncated: R.truncated };
}

/* ---------- matchings ---------- */
function algKuhn(g, P) {
  const n = g.nodes.length, R = new Rec(); const col = twoColoring(g);
  if (!col) { const r = algBFS(g, { source: 0 }); const last = r.frames[r.frames.length - 1]; last.msg = 'The graph is not bipartite (odd cycle shown). Augmenting-path matching for general graphs needs Edmonds’ blossoms.'; return { frames: [last] }; }
  const L = g.nodes.map((v, i) => i).filter(i => col[i] === 0), A = adjUnd(g);
  const mL = Array(n).fill(-1), mR = Array(n).fill(-1), mE = Array(n).fill(-1); let size = 0;
  g.nodes.forEach((v, i) => R.ntag[i] = col[i] ? 'R' : 'L');
  const recolor = () => { R.ec = {}; for (const u of L) if (mE[u] >= 0) R.ec[mE[u]] = 'match'; };
  const panel = () => h4(`Matching (size ${size})`) + chips(L.filter(u => mL[u] >= 0).map(u => `${lab(g, u)}–${lab(g, mL[u])}`)) + h4('Unmatched on the left') + chips(L.filter(u => mL[u] < 0).map(u => lab(g, u)));
  R.line = 0; R.snap(`Bipartite with sides L = {${L.map(i => lab(g, i)).join(', ')}} and R. Search for augmenting paths from each left vertex.`, { panel: panel() });
  function tryAug(u, vis, trail) {
    for (const { to: v, e } of A[u]) {
      if (vis[v]) continue; vis[v] = true; trail.push(e); R.ec[e] = R.ec[e] === 'match' ? 'match' : 'cand'; R.nc[v] = 'front';
      if (mR[v] < 0) { R.line = 5; R.snap(`${lab(g, v)} is free: augmenting path found.`, { panel: panel() }); mR[v] = u; mL[u] = v; mE[u] = e; return true; }
      const w = mR[v]; R.ec[mE[w]] = 'path'; R.nc[w] = 'cur';
      R.line = 4; R.snap(`${lab(g, v)} is taken by ${lab(g, w)}. Try to re-route ${lab(g, w)} along an alternating path.`, { panel: panel() });
      if (tryAug(w, vis, trail)) { mR[v] = u; mL[u] = v; mE[u] = e; return true; }
      R.ec[mE[w]] = 'match'; if (R.ec[e] === 'cand') delete R.ec[e]; trail.pop(); delete R.nc[v]; delete R.nc[w];
    }
    return false;
  }
  for (const u of L) {
    R.nc = { [u]: 'cur' }; R.line = 1; R.snap(`Try left vertex ${N(g, u)}.`, { panel: panel() });
    const vis = Array(n).fill(false);
    if (tryAug(u, vis, [])) { size++; recolor(); R.nc = {}; R.line = 5; R.snap(`Flip the path: matched and unmatched edges swap. Size is now ${size}.`, { panel: panel() }); }
    else { recolor(); R.nc = {}; R.line = 6; R.snap(`No augmenting path from ${lab(g, u)}.`, { panel: panel() }); }
  }
  // König: alternating reachability from unmatched left vertices
  const Z = new Set(); const Q = L.filter(u => mL[u] < 0); Q.forEach(u => Z.add(u));
  for (let h = 0; h < Q.length; h++) { const x = Q[h]; if (col[x] === 0) { for (const { to } of A[x]) if (to !== mL[x] && !Z.has(to)) { Z.add(to); Q.push(to); } } else if (mR[x] >= 0 && !Z.has(mR[x])) { Z.add(mR[x]); Q.push(mR[x]); } }
  const cover = g.nodes.map((v, i) => i).filter(i => (col[i] === 0 && !Z.has(i)) || (col[i] === 1 && Z.has(i)));
  recolor(); R.nc = {}; cover.forEach(i => R.nc[i] = 'cut');
  let c = cert('yes', `Maximum: |M| = |C| = ${size}`, `Vertex cover C = {${cover.map(i => lab(g, i)).join(', ')}} (red). Every edge has an end in C, and each matching edge needs its own cover vertex, so no matching beats ${cover.length} (König).`);
  const Sh = L.filter(u => Z.has(u));
  if (size < L.length) { const NS = g.nodes.map((v, i) => i).filter(i => col[i] === 1 && Z.has(i)); c += cert('no', 'Hall violator', `S = {${Sh.map(i => lab(g, i)).join(', ')}} has only ${NS.length} neighbour${NS.length === 1 ? '' : 's'} N(S) = {${NS.map(i => lab(g, i)).join(', ')}} &lt; |S| = ${Sh.length}. So L cannot be fully matched.`); }
  R.line = 7; R.snap('Done. Red vertices: a vertex cover of the same size as the matching.', { panel: c + panel() }, true);
  return { frames: R.frames, truncated: R.truncated };
}

function parsePrefs(text) {
  const blocks = text.split(/^\s*-{3,}\s*$/m); if (blocks.length !== 2) throw new Error('Write proposers, then a line ---, then receivers. Example: a: x y z');
  const parse = b => { const m = new Map(); for (const line of b.split('\n')) { const t = line.trim(); if (!t) continue; const [k, rest] = t.split(':'); if (rest === undefined) throw new Error(`Line “${t}” needs the form name: choice1 choice2 …`); m.set(k.trim(), rest.trim().split(/[\s,]+/).filter(Boolean)); } return m; };
  return [parse(blocks[0]), parse(blocks[1])];
}
function algGaleShapley(g0, P) {
  const [Pm, Rm] = parsePrefs(P.prefs); const g = newGraph(false); const R = new Rec();
  const props = [...Pm.keys()], recs = [...new Set([...Rm.keys(), ...[...Pm.values()].flat()])];
  props.forEach(p => addNode(g, '0|' + p, p)); recs.forEach(r => addNode(g, '1|' + r, r));
  const pi = new Map(props.map((p, i) => [p, i])), ri = new Map(recs.map((r, i) => [r, props.length + i]));
  columnsLayout(g, new Set(props.map((p, i) => i)));
  const eid = new Map(); for (const p of props) for (const r of Pm.get(p)) { if (!ri.has(r)) continue; eid.set(p + '|' + r, g.edges.length); g.edges.push({ u: pi.get(p), v: ri.get(r), w: 1 }); }
  const rank = r => new Map((Rm.get(r) || []).map((p, i) => [p, i]));
  const RK = new Map(recs.map(r => [r, rank(r)]));
  const next = new Map(props.map(p => [p, 0])), partnerP = new Map(), partnerR = new Map(); const free = props.slice();
  g.nodes.forEach((v, i) => R.ntag[i] = i < props.length ? 'proposer' : 'receiver');
  const panel = (hp, hr) => h4('Proposers’ lists (current partner in bold)') + table(['', 'preferences'], props.map(p => [esc(p), Pm.get(p).map((r, k) => `<span class="${partnerP.get(p) === r ? 'pk' : k < next.get(p) ? 'gone' : ''}${hp === p && hr === r ? ' now' : ''}">${esc(r)}</span>`).join(' ')]), 'compact')
    + h4('Receivers’ lists') + table(['', 'preferences'], recs.map(r => [esc(r), (Rm.get(r) || []).map(p => `<span class="${partnerR.get(r) === p ? 'pk' : ''}">${esc(p)}</span>`).join(' ')]), 'compact');
  R.line = 0; R.snap('Gale–Shapley: free proposers propose down their lists; each receiver holds the best offer so far.', { graph: g, panel: panel() });
  let guard = 0;
  while (free.length && guard++ < 1000) {
    const p = free[0]; const list = Pm.get(p);
    if (next.get(p) >= list.length) { free.shift(); R.line = 0; R.snap(`${esc(p)} has exhausted the list and stays single.`, { graph: g, panel: panel() }); continue; }
    const r = list[next.get(p)]; next.set(p, next.get(p) + 1); const e = eid.get(p + '|' + r);
    R.ec[e] = 'cand'; R.nc = { [pi.get(p)]: 'cur', [ri.get(r)]: 'front' };
    const cur = partnerR.get(r), rk = RK.get(r);
    R.line = 1; R.snap(`${esc(p)} proposes to ${esc(r)}.`, { graph: g, panel: panel(p, r), ask: { type: 'vertex', answer: [ri.get(r)], prompt: `${p} is the next free proposer. To whom does ${p} propose?` } });
    const pr = x => rk.has(x) ? rk.get(x) : Infinity;
    if (pr(p) === Infinity) { R.ec[e] = 'rej'; R.line = 4; R.snap(`${esc(r)} finds ${esc(p)} unacceptable and rejects.`, { graph: g, panel: panel() }); continue; }
    if (cur === undefined) { partnerR.set(r, p); partnerP.set(p, r); free.shift(); R.ec[e] = 'match'; R.line = 2; R.snap(`${esc(r)} is free and holds ${esc(p)}.`, { graph: g, panel: panel() }); }
    else if (pr(p) < pr(cur)) { partnerR.set(r, p); partnerP.set(p, r); partnerP.delete(cur); free.shift(); free.push(cur); R.ec[e] = 'match'; R.ec[eid.get(cur + '|' + r)] = 'rej'; R.line = 3; R.snap(`${esc(r)} prefers ${esc(p)} to ${esc(cur)}: trade up, ${esc(cur)} is free again.`, { graph: g, panel: panel() }); }
    else { R.ec[e] = 'rej'; R.line = 4; R.snap(`${esc(r)} prefers the current ${esc(cur)}. Rejected.`, { graph: g, panel: panel() }); }
  }
  // blocking pairs
  const blocking = [];
  for (const p of props) for (const r of Pm.get(p)) { const rk = RK.get(r); if (!rk || !rk.has(p)) continue; const mine = partnerP.get(p); const pPref = mine === undefined || Pm.get(p).indexOf(r) < Pm.get(p).indexOf(mine); const her = partnerR.get(r); const rPref = her === undefined || rk.get(p) < rk.get(her); if (pPref && rPref && mine !== r) blocking.push(`${p}–${r}`); }
  R.ec = {}; for (const [p, r] of partnerP) R.ec[eid.get(p + '|' + r)] = 'match'; R.nc = {};
  R.line = 5; R.snap('Everyone is matched or has run out of options.', { graph: g, panel: cert(blocking.length ? 'no' : 'yes', blocking.length ? 'Blocking pairs found' : 'Stable', blocking.length ? esc(blocking.join(', ')) : `Checked all ${g.edges.length} acceptable pairs: none prefers each other to their partners. This is the proposer-optimal stable matching.`) + panel() }, true);
  return { frames: R.frames, graph: g };
}
