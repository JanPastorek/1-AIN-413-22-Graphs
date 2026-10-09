/* ============================================================
   Algorithms, part 4: Floyd–Warshall, A*, Hopcroft–Karp, Hungarian,
   TSP approximations, races (operation counts), generation walkthrough
   ============================================================ */

function matrixHTML(g, D, cls) {
  const n = g.nodes.length;
  return `<div class="tw"><table class="compact mat"><thead><tr><th></th>${g.nodes.map((v, j) => `<th>${lab(g, j)}</th>`).join('')}</tr></thead><tbody>${D.map((row, i) => `<tr><th>${lab(g, i)}</th>${row.map((x, j) => `<td class="${cls ? cls(i, j) : ''}">${fmt(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

/* ---------- Floyd–Warshall ---------- */
function algFloyd(g, P) {
  const n = g.nodes.length, R = new Rec();
  if (n > 14) { R.snap('Floyd–Warshall display is limited to 14 vertices.', { panel: '' }, true); return { frames: R.frames }; }
  const D = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity));
  g.edges.forEach(e => { D[e.u][e.v] = Math.min(D[e.u][e.v], e.w); if (!g.directed) D[e.v][e.u] = Math.min(D[e.v][e.u], e.w); });
  R.line = 0;
  R.snap('Start with direct edge weights: D⁽⁰⁾[i][j] = w(i,j), 0 on the diagonal, ∞ otherwise.', { panel: h4('D⁽⁰⁾') + matrixHTML(g, D) });
  for (let k = 0; k < n; k++) {
    const upd = new Set(); R.line = 2;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][k] + D[k][j] < D[i][j]) { D[i][j] = D[i][k] + D[k][j]; upd.add(i + ',' + j); }
    R.nc = { [k]: 'cur' }; for (let i = 0; i < k; i++) R.nc[i] = 'done';
    R.line = 4;
    R.snap(`Allow ${N(g, k)} as an intermediate vertex: ${upd.size} entr${upd.size === 1 ? 'y' : 'ies'} improve via D[i][${lab(g, k)}] + D[${lab(g, k)}][j].`,
      { panel: h4(`D⁽${k + 1}⁾: paths using intermediates among the first ${k + 1}`) + matrixHTML(g, D, (i, j) => (upd.has(i + ',' + j) ? 'upd' : '') + (i === k || j === k ? ' piv' : '')) + '<p class="note">Highlighted cells changed this round; the pivot row and column are shaded.</p>' });
  }
  const neg = D.map((r, i) => r[i]).some(x => x < 0); R.nc = {}; R.line = 5;
  R.snap(neg ? 'A diagonal entry is negative.' : 'All-pairs distances complete after n rounds: Θ(n³) work.', { panel: (neg ? cert('no', 'Negative cycle', `D[v][v] < 0 for ${g.nodes.map((v, i) => i).filter(i => D[i][i] < 0).map(i => lab(g, i)).join(', ')}: those vertices lie on a negative cycle.`) : cert('yes', 'All-pairs distances', 'Invariant: after round k, D[i][j] is the shortest i→j distance using only the first k vertices as intermediates. With k = n every path is allowed.')) + matrixHTML(g, D) }, true);
  return { frames: R.frames };
}

/* ---------- A* ---------- */
function astarHeuristic(g, t) {
  let alpha = Infinity;
  for (const e of g.edges) { const d = Math.hypot(g.nodes[e.u].x - g.nodes[e.v].x, g.nodes[e.u].y - g.nodes[e.v].y); if (d > 1e-9) alpha = Math.min(alpha, e.w / d); else if (e.w < alpha * 1e9) alpha = 0; }
  if (!Number.isFinite(alpha) || alpha < 0) alpha = 0;
  return { alpha, h: v => alpha * Math.hypot(g.nodes[v].x - g.nodes[t].x, g.nodes[v].y - g.nodes[t].y) };
}
function dijkstraSettledUntil(g, s, t) {
  const n = g.nodes.length, A = adjOut(g), d = Array(n).fill(Infinity), done = Array(n).fill(false); d[s] = 0; let settled = 0, relax = 0;
  for (let it = 0; it < n; it++) { let u = -1; for (let i = 0; i < n; i++) if (!done[i] && d[i] < Infinity && (u < 0 || d[i] < d[u])) u = i; if (u < 0) break; done[u] = true; settled++; if (u === t) break; for (const { to, w } of A[u]) { relax++; if (d[u] + w < d[to]) d[to] = d[u] + w; } }
  return { settled, relax, dist: d[t] };
}
function algAStar(g, P) {
  const n = g.nodes.length, A = adjOut(g), R = new Rec(), s = P.source, t = P.target;
  if (g.edges.some(e => e.w < 0)) { R.snap('A* needs non-negative weights.', { panel: '' }, true); return { frames: R.frames }; }
  const { alpha, h } = astarHeuristic(g, t);
  const d = Array(n).fill(Infinity), pred = Array(n).fill(-1), pe = Array(n).fill(-1), done = Array(n).fill(false); d[s] = 0; let settled = 0;
  g.nodes.forEach((v, i) => R.ntag[i] = `h=${fmt(+h(i).toFixed(1))}`);
  const panel = () => h4('Open set by f = g + h') + chips(g.nodes.map((v, i) => i).filter(i => !done[i] && d[i] < Infinity).sort((a, b) => d[a] + h(a) - d[b] - h(b)).map(i => `${lab(g, i)}: ${fmt(+d[i].toFixed(2))}+${fmt(+h(i).toFixed(1))}`));
  R.line = 0;
  R.snap(`A* from ${N(g, s)} to ${N(g, t)}. Heuristic h(v) = ${alpha.toFixed(4)} × straight-line distance on the board, where the factor is the smallest weight-per-pixel over all edges. That makes h a lower bound on the true remaining cost (admissible), so A* stays exact. Drag vertices and rerun: h changes, the answer does not.`, { panel: panel() });
  while (true) {
    let u = -1; for (let i = 0; i < n; i++) if (!done[i] && d[i] < Infinity && (u < 0 || d[i] + h(i) < d[u] + h(u))) u = i; if (u < 0) break;
    const best = g.nodes.map((v, i) => i).filter(i => !done[i] && d[i] < Infinity && Math.abs(d[i] + h(i) - (d[u] + h(u))) < 1e-9);
    done[u] = true; settled++; R.nc[u] = 'cur'; R.line = 2;
    R.snap(`Settle ${N(g, u)}: f = ${fmt(+d[u].toFixed(2))} + ${fmt(+h(u).toFixed(1))} is smallest.`, { panel: panel(), ask: { type: 'vertex', answer: best, prompt: 'Which vertex does A* settle next (smallest g + h)?' } });
    if (u === t) break;
    for (const { to, w, e } of A[u]) { R.line = 4; if (!done[to] && d[u] + w < d[to]) { if (pe[to] >= 0) delete R.ec[pe[to]]; d[to] = d[u] + w; pred[to] = u; pe[to] = e; R.ec[e] = 'tree'; R.nc[to] = 'front'; R.snap(`Relax ${edgeName(g, e)}: g(${lab(g, to)}) = ${fmt(d[to])}.`, { panel: panel() }); } }
    R.nc[u] = 'done';
  }
  const dj = dijkstraSettledUntil(g, s, t);
  R.ec = {}; let x = t; while (pred[x] >= 0) { R.ec[pe[x]] = 'path'; x = pred[x]; }
  R.line = 5;
  R.snap(`Reached ${lab(g, t)} with cost ${fmt(d[t])}.`, { panel: cert(Math.abs(dj.dist - d[t]) < 1e-9 ? 'yes' : 'no', `Shortest ${lab(g, s)}→${lab(g, t)}: ${fmt(d[t])}`, `A* settled ${settled} vertices; Dijkstra, stopped at the same target, settles ${dj.settled}. Same distance, ${dj.settled > settled ? `${dj.settled - settled} fewer` : 'no fewer'} vertices settled thanks to the heuristic.`) + raceBars([{ name: 'A*', v: settled }, { name: 'Dijkstra', v: dj.settled }], 'vertices settled') }, true);
  return { frames: R.frames };
}

/* ---------- races ---------- */
function raceBars(rows, unit) {
  const mx = Math.max(1, ...rows.map(r => r.v));
  return `<div class="race">${rows.map(r => `<div class="rr"><span class="rn">${esc(r.name)}</span><span class="rb"><span style="width:${(100 * r.v / mx).toFixed(1)}%"></span></span><span class="rv">${r.v.toLocaleString()}</span></div>`).join('')}<p class="note">${esc(unit)}</p></div>`;
}
function countSP(g, s) {
  const n = g.nodes.length, A = adjOut(g); const out = [];
  { const d = Array(n).fill(Infinity), done = Array(n).fill(false); d[s] = 0; let rel = 0, scans = 0; for (let it = 0; it < n; it++) { let u = -1; for (let i = 0; i < n; i++) { scans++; if (!done[i] && d[i] < Infinity && (u < 0 || d[i] < d[u])) u = i; } if (u < 0) break; done[u] = true; for (const { to, w } of A[u]) { rel++; if (d[u] + w < d[to]) d[to] = d[u] + w; } } out.push({ name: 'Dijkstra (array queue)', rel, extra: scans, extraName: 'queue scans' }); }
  { const d = Array(n).fill(Infinity); d[s] = 0; let rel = 0, passes = 0; const arcs = []; g.edges.forEach(e => { arcs.push([e.u, e.v, e.w]); if (!g.directed) arcs.push([e.v, e.u, e.w]); }); for (let k = 0; k < n - 1; k++) { passes++; let ch = false; for (const [u, v, w] of arcs) { rel++; if (d[u] + w < d[v]) { d[v] = d[u] + w; ch = true; } } if (!ch) break; } out.push({ name: 'Bellman–Ford (early stop)', rel, extra: passes, extraName: 'passes' }); }
  { const d = Array(n).fill(-1); d[s] = 0; const Q = [s]; let rel = 0; for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (const { to } of A[u]) { rel++; if (d[to] < 0) { d[to] = d[u] + 1; Q.push(to); } } } out.push({ name: 'BFS (ignores weights)', rel, extra: 0, extraName: '' }); }
  return out;
}
function algRaceSP(g, P) {
  const R = new Rec(); const rows = countSP(g, P.source); const neg = g.edges.some(e => e.w < 0);
  R.snap(`Same source ${N(g, P.source)}, three algorithms. Count every edge relaxation attempted.`, { panel: raceBars(rows.map(r => ({ name: r.name, v: r.rel })), 'edge relaxations') + table(['algorithm', 'relaxations', 'other work'], rows.map(r => [esc(r.name), r.rel, r.extraName ? `${r.extra} ${r.extraName}` : '—']), 'compact') + `<p class="note">${neg ? 'With negative weights only Bellman–Ford is correct here.' : 'BFS is only correct when all weights are equal.'} Dijkstra relaxes each edge once; Bellman–Ford may need up to n − 1 passes over all edges.</p>` }, true);
  return { frames: R.frames };
}
function algRaceMST(g, P) {
  const n = g.nodes.length, R = new Rec(); const m = g.edges.length;
  let hops = 0, finds = 0; { const parent = g.nodes.map((v, i) => i), rank = Array(n).fill(0); const find = x => { finds++; while (parent[x] !== x) { hops++; parent[x] = parent[parent[x]]; x = parent[x]; } return x; }; const order = g.edges.map((e, i) => i).sort((a, b) => g.edges[a].w - g.edges[b].w); let k = 0; for (const e of order) { const a = find(g.edges[e].u), b = find(g.edges[e].v); if (a !== b) { if (rank[a] < rank[b]) parent[a] = b; else if (rank[a] > rank[b]) parent[b] = a; else { parent[b] = a; rank[a]++; } if (++k === n - 1) break; } } }
  let scans = 0; { const A = adjUnd(g), inT = Array(n).fill(false), key = Array(n).fill(Infinity); key[0] = 0; for (let it = 0; it < n; it++) { let u = -1; for (let v = 0; v < n; v++) { scans++; if (!inT[v] && (u < 0 || key[v] < key[u])) u = v; } inT[u] = true; for (const { to, w } of A[u]) { scans++; if (!inT[to] && w < key[to]) key[to] = w; } } }
  const sortCmp = Math.ceil(m * Math.log2(Math.max(2, m)));
  R.snap('Kruskal pays for sorting plus near-constant union–find; array-based Prim pays Θ(n²) scans regardless of m.', { panel: raceBars([{ name: 'Kruskal: sort (≈ m log m)', v: sortCmp }, { name: 'Kruskal: find pointer hops', v: hops }, { name: 'Prim (array): scans', v: scans }], 'basic operations') + table(['', 'value'], [['n, m', `${n}, ${m}`], ['Kruskal find calls', finds], ['pointer hops (with compression)', hops], ['Prim array scans', scans]], 'compact') + '<p class="note">On dense graphs (m ≈ n²/2) array Prim wins; on sparse ones Kruskal or heap-based Prim (O(m log n)) wins.</p>' }, true);
  return { frames: R.frames };
}
function flowRun(g, s, t, mode, cap = 5000) {
  const E = g.edges, f = E.map(() => 0); let value = 0, aug = 0, scans = 0; const n = g.nodes.length;
  const radj = g.nodes.map(() => []); E.forEach((e, i) => { radj[e.u].push({ e: i, dir: 1, to: e.v }); radj[e.v].push({ e: i, dir: -1, to: e.u }); });
  const res = a => a.dir > 0 ? E[a.e].w - f[a.e] : f[a.e]; const paths = [];
  while (aug < cap) {
    let path = null;
    if (mode === 'bfs') { const prev = Array(n).fill(null), seen = Array(n).fill(false); seen[s] = true; const Q = [s]; for (let h = 0; h < Q.length && !seen[t]; h++) for (const a of radj[Q[h]]) { scans++; if (!seen[a.to] && res(a) > 0) { seen[a.to] = true; prev[a.to] = a; Q.push(a.to); } } if (seen[t]) { path = []; let x = t; while (x !== s) { path.unshift(prev[x]); x = prev[x].dir > 0 ? E[prev[x].e].u : E[prev[x].e].v; } } }
    else if (mode === 'dfs') { const seen = Array(n).fill(false); const st = []; const dfs = u => { if (u === t) return true; seen[u] = true; for (const a of radj[u]) { scans++; if (!seen[a.to] && res(a) > 0) { st.push(a); if (dfs(a.to)) return true; st.pop(); } } return false; }; if (dfs(s)) path = st.slice(); }
    else { // longest simple augmenting path (ties: more backward arcs): the unlucky choice
      let best = null; const seen = Array(n).fill(false); const st = [];
      const rec = u => { if (u === t) { const back = st.filter(a => a.dir < 0).length; if (!best || st.length > best.len || (st.length === best.len && back > best.back)) best = { p: st.slice(), len: st.length, back }; return; } seen[u] = true; for (const a of radj[u]) { scans++; if (!seen[a.to] && res(a) > 0) { st.push(a); rec(a.to); st.pop(); } } seen[u] = false; };
      rec(s); if (best) path = best.p;
    }
    if (!path) break;
    const b = Math.min(...path.map(res)); for (const a of path) f[a.e] += a.dir * b; value += b; aug++; if (paths.length < 40) paths.push({ path, b, f: f.slice() });
  }
  return { value, aug, scans, capped: aug >= cap, paths, f };
}
function algRaceFlow(g, P) {
  const R = new Rec(); const s = P.source, t = P.sink; const n = g.nodes.length;
  const rows = [['bfs', 'Edmonds–Karp (shortest path)'], ['dfs', 'Ford–Fulkerson, DFS order'], ['longest', 'Ford–Fulkerson, unlucky (longest path)']];
  const out = rows.map(([k, name]) => (k === 'longest' && n > 11) ? { name, skip: true } : Object.assign({ name }, flowRun(g, s, t, k)));
  const ok = out.filter(r => !r.skip);
  R.snap('Same network, three rules for choosing the augmenting path. All three reach the same maximum flow value; the number of augmentations differs.', { panel: raceBars(ok.map(r => ({ name: r.name, v: r.aug })), 'augmenting paths (capped at 5000)') + table(['rule', 'value', 'augmentations', 'arc scans'], out.map(r => r.skip ? [esc(r.name), '—', 'skipped (n > 11)', '—'] : [esc(r.name), fmt(r.value), r.aug + (r.capped ? '+' : ''), r.scans.toLocaleString()]), 'compact') + '<p class="note">Edmonds–Karp needs O(nm) augmentations whatever the capacities. Ford–Fulkerson with integer capacities needs at most |f*| augmentations, and an unlucky choice can use all of them.</p>' }, true);
  const L = out.find(r => r.name.includes('unlucky'));
  if (L && !L.skip) L.paths.slice(0, 12).forEach((p, k) => { const ec = {}, elab = {}; g.edges.forEach((e, i) => { elab[i] = `${fmt(p.f[i])}/${fmt(e.w)}`; if (p.f[i] > 0) ec[i] = 'flow'; }); p.path.forEach(a => ec[a.e] = a.dir > 0 ? 'path' : 'cancel'); R.frames.push({ msg: `Unlucky rule, augmentation ${k + 1}: path ${[s].concat(p.path.map(a => a.to)).map(v => lab(g, v)).join(' → ')}, bottleneck ${fmt(p.b)}.`, nc: { [s]: 'cur', [t]: 'front' }, ntag: { [s]: 's', [t]: 't' }, ec, elab, panel: raceBars(ok.map(r => ({ name: r.name, v: r.aug })), 'augmenting paths') }); });
  return { frames: R.frames };
}

/* ---------- Hopcroft–Karp ---------- */
function konig(g, col, L, mL, mR, A) {
  const Z = new Set(); const Q = L.filter(u => mL[u] < 0); Q.forEach(u => Z.add(u));
  for (let h = 0; h < Q.length; h++) { const x = Q[h]; if (col[x] === 0) { for (const { to } of A[x]) if (to !== mL[x] && !Z.has(to)) { Z.add(to); Q.push(to); } } else if (mR[x] >= 0 && !Z.has(mR[x])) { Z.add(mR[x]); Q.push(mR[x]); } }
  const cover = g.nodes.map((v, i) => i).filter(i => (col[i] === 0 && !Z.has(i)) || (col[i] === 1 && Z.has(i)));
  return { Z, cover };
}
function algHopcroftKarp(g, P) {
  const n = g.nodes.length, R = new Rec(); const col = twoColoring(g);
  if (!col) { R.snap('Not bipartite. Hopcroft–Karp needs a bipartite graph.', { panel: '' }, true); return { frames: R.frames }; }
  const L = g.nodes.map((v, i) => i).filter(i => col[i] === 0), A = adjUnd(g); const mL = Array(n).fill(-1), mR = Array(n).fill(-1), mE = Array(n).fill(-1);
  let size = 0, phase = 0, scans = 0;
  const recolor = () => { R.ec = {}; for (const u of L) if (mE[u] >= 0) R.ec[mE[u]] = 'match'; };
  R.line = 0; R.snap(`Hopcroft–Karp: in each phase, find a maximal set of vertex-disjoint shortest augmenting paths at once. At most O(√n) phases.`, { panel: h4('Matching size 0') });
  while (true) {
    phase++; const dist = Array(n).fill(Infinity); const Q = [];
    for (const u of L) if (mL[u] < 0) { dist[u] = 0; Q.push(u); }
    let found = Infinity;
    for (let h = 0; h < Q.length; h++) { const u = Q[h]; if (dist[u] >= found) continue; for (const { to: v } of A[u]) { scans++; const w = mR[v]; if (w < 0) { if (found === Infinity) found = dist[u] + 1; } else if (dist[w] === Infinity) { dist[w] = dist[u] + 1; Q.push(w); } } }
    R.nc = {}; R.ntag = {}; g.nodes.forEach((v, i) => { if (col[i] === 0 && dist[i] < Infinity) { R.ntag[i] = 'L' + dist[i]; R.nc[i] = 'k' + (dist[i] % 10); } });
    R.line = 1;
    if (found === Infinity) { R.snap(`Phase ${phase}: BFS from the free left vertices reaches no free right vertex. No augmenting path remains.`, { panel: h4(`Matching size ${size}`) }); break; }
    R.snap(`Phase ${phase}: BFS layers from all free left vertices at once. Shortest augmenting paths have ${2 * found - 1} edge${found > 1 ? 's' : ''}.`, { panel: h4('Layer of each left vertex') + chips(L.filter(u => dist[u] < Infinity).map(u => `${lab(g, u)}: ${dist[u]}`)) });
    // DFS for vertex-disjoint shortest paths along the layering
    const pathsFound = []; const oldE = mE.slice(); const freeAtStart = L.filter(u => mL[u] < 0);
    const dfs = (u, trail) => {
      for (const { to: v, e } of A[u]) {
        scans++; const w = mR[v];
        if ((w < 0 && dist[u] + 1 === found) || (w >= 0 && dist[w] === dist[u] + 1)) {
          trail.push(e); if (w < 0 || dfs(w, trail)) { mR[v] = u; mL[u] = v; mE[u] = e; return true; } trail.pop();
        }
      }
      dist[u] = Infinity; return false;
    };
    for (const u of freeAtStart) { const trail = []; if (dfs(u, trail)) { pathsFound.push([u, trail]); size++; } }
    R.line = 2; R.ec = {}; for (const u of L) if (oldE[u] >= 0) R.ec[oldE[u]] = 'match';
    pathsFound.forEach(([, p]) => p.forEach(e => { if (R.ec[e] !== 'match') R.ec[e] = 'path'; }));
    const oldR = new Map(); for (const u of L) if (oldE[u] >= 0) { const E = g.edges[oldE[u]]; oldR.set(E.u === u ? E.v : E.u, u); }
    const pathText = ([u, p]) => { let x = u; const vs = [x]; for (const e of p) { const E = g.edges[e]; const v = E.u === x ? E.v : E.u; vs.push(v); if (oldR.has(v)) { x = oldR.get(v); vs.push(x); } } return vs.map(v => lab(g, v)).join(' → '); };
    R.snap(`Phase ${phase}: ${pathsFound.length} vertex-disjoint shortest augmenting path${pathsFound.length === 1 ? '' : 's'} found (orange; blue edges were matched before).`, { panel: h4('Paths this phase') + pathsFound.map(pp => `<p class="mono">${pathText(pp)}</p>`).join('') });
    R.line = 3; recolor(); R.snap(`Augment along all of them: |M| = ${size}.`, { panel: h4(`Matching size ${size}`) + chips(L.filter(u => mL[u] >= 0).map(u => `${lab(g, u)}–${lab(g, mL[u])}`)) });
  }
  const { cover } = konig(g, col, L, mL, mR, A); recolor(); R.nc = {}; R.ntag = {}; cover.forEach(i => R.nc[i] = 'cut');
  R.line = 4;
  R.snap(`Done after ${phase} phases.`, { panel: cert('yes', `Maximum: |M| = |C| = ${size}`, `Vertex cover C = {${cover.map(i => lab(g, i)).join(', ')}} (red) has the same size as the matching (König). ${scans} edge scans in total.`) }, true);
  return { frames: R.frames, stats: { phases: phase, scans, size } };
}
function kuhnCount(g) {
  const n = g.nodes.length; const col = twoColoring(g); if (!col) return null; const L = g.nodes.map((v, i) => i).filter(i => col[i] === 0), A = adjUnd(g); const mR = Array(n).fill(-1); let scans = 0, size = 0, tries = 0;
  const tr = (u, vis) => { for (const { to: v } of A[u]) { scans++; if (vis[v]) continue; vis[v] = true; if (mR[v] < 0 || tr(mR[v], vis)) { mR[v] = u; return true; } } return false; };
  for (const u of L) { tries++; if (tr(u, Array(n).fill(false))) size++; } return { scans, size, tries };
}
function algRaceMatch(g, P) {
  const R = new Rec(); const k = kuhnCount(g); if (!k) { R.snap('Not bipartite.', { panel: '' }, true); return { frames: R.frames }; }
  const hk = algHopcroftKarp(g, P).stats;
  R.snap('Same bipartite graph, two augmenting-path algorithms.', { panel: raceBars([{ name: 'Augment one path at a time', v: k.scans }, { name: 'Hopcroft–Karp', v: hk.scans }], 'edge scans') + table(['', 'one at a time', 'Hopcroft–Karp'], [['matching size', k.size, hk.size], ['searches / phases', `${k.tries} searches`, `${hk.phases} phases`], ['edge scans', k.scans, hk.scans]], 'compact') + '<p class="note">One-at-a-time augmenting is O(nm). Hopcroft–Karp is O(√n · m): on small graphs the difference is modest, on large sparse ones it is large.</p>' }, true);
  return { frames: R.frames };
}

/* ---------- Hungarian method ---------- */
function parseCost(text) {
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean); if (!lines.length) throw new Error('Enter a cost matrix.');
  let cols = null, rows = [];
  for (const l of lines) { const [k, rest] = l.split(':'); if (rest === undefined) throw new Error(`Line “${l}” needs the form name: numbers.`); if (/^jobs$/i.test(k.trim())) { cols = rest.trim().split(/[\s,]+/); continue; } const nums = rest.trim().split(/[\s,]+/).map(Number); if (nums.some(x => !Number.isFinite(x))) throw new Error(`Row “${k.trim()}” contains something that is not a number.`); rows.push([k.trim(), nums]); }
  const m = rows[0][1].length; if (rows.some(r => r[1].length !== m)) throw new Error('Every row needs the same number of costs.');
  if (rows.length !== m) throw new Error(`The matrix must be square: ${rows.length} rows but ${m} columns. Add dummy rows or columns with cost 0.`);
  cols = cols && cols.length === m ? cols : Array.from({ length: m }, (_, j) => 'j' + (j + 1));
  return { rows: rows.map(r => r[0]), cols, C: rows.map(r => r[1]) };
}
function algHungarian(g0, P) {
  const { rows, cols, C } = parseCost(P.cost); const n = rows.length; const R = new Rec();
  const g = newGraph(false); rows.forEach(r => addNode(g, '0|' + r, r)); cols.forEach(c => addNode(g, '1|' + c, c)); g.weighted = true;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g.edges.push({ u: i, v: n + j, w: C[i][j] });
  columnsLayout(g, new Set(rows.map((r, i) => i)));
  const eid = (i, j) => i * n + j; const INF = Infinity;
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0), p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  const a = (i, j) => C[i - 1][j - 1];
  const assign = () => { const out = []; for (let j = 1; j <= n; j++) if (p[j]) out.push([p[j] - 1, j - 1]); return out; };
  const frame = (msg, extraHL = []) => {
    const ec = {}; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const red = C[i][j] - u[i + 1] - v[j + 1]; ec[eid(i, j)] = Math.abs(red) < 1e-9 ? 'cand' : 'faint'; }
    for (const [i, j] of assign()) ec[eid(i, j)] = 'match'; for (const [i, j] of extraHL) ec[eid(i, j)] = 'path';
    const ntag = {}; for (let i = 0; i < n; i++) ntag[i] = `u=${fmt(u[i + 1])}`; for (let j = 0; j < n; j++) ntag[n + j] = `v=${fmt(v[j + 1])}`;
    const red = `<div class="tw"><table class="compact mat"><thead><tr><th></th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr><th>${esc(r)}</th>${cols.map((c, j) => { const x = C[i][j] - u[i + 1] - v[j + 1]; const asg = p[j + 1] === i + 1; return `<td class="${asg ? 'asg' : Math.abs(x) < 1e-9 ? 'zero' : ''}">${fmt(+x.toFixed(6))}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
    R.frames.push({ msg, nc: {}, ntag, ec, elab: {}, line: R.line, panel: h4('Reduced costs c(i,j) − u(i) − v(j)') + red + '<p class="note">Zeros (highlighted) form the equality subgraph, drawn in amber. Assigned pairs are boxed.</p>' });
  };
  R.line = 0; frame('Start with potentials u = v = 0. Edges with reduced cost 0 are “tight”; we only ever assign tight edges.');
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0; const minv = Array(n + 1).fill(INF), used = Array(n + 1).fill(false);
    do {
      used[j0] = true; const i0 = p[j0]; let delta = INF, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) { const cur = a(i0, j) - u[i0] - v[j]; if (cur < minv[j]) { minv[j] = cur; way[j] = j0; } if (minv[j] < delta) { delta = minv[j]; j1 = j; } }
      for (let j = 0; j <= n; j++) { if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta; }
      j0 = j1; R.line = 2;
      if (delta > 1e-12) frame(`Row ${esc(rows[i - 1])}: no tight edge leads to a free job yet, so shift potentials by δ = ${fmt(+delta.toFixed(6))}. A new edge becomes tight; all reduced costs stay ≥ 0.`);
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
    R.line = 3; frame(`Row ${esc(rows[i - 1])} assigned along an alternating path of tight edges. ${i} of ${n} rows done.`);
  }
  const A = assign(); const cost = A.reduce((s, [i, j]) => s + C[i][j], 0); const dual = u.slice(1).reduce((s, x) => s + x, 0) + v.slice(1).reduce((s, x) => s + x, 0);
  const feasible = C.every((r, i) => r.every((c, j) => c - u[i + 1] - v[j + 1] > -1e-9));
  R.line = 4;
  const last = R.frames[R.frames.length - 1]; R.frames.push(Object.assign({}, last, { msg: `Optimal assignment: ${A.map(([i, j]) => `${esc(rows[i])}→${esc(cols[j])}`).join(', ')}.`, panel: cert(feasible && Math.abs(dual - cost) < 1e-6 ? 'yes' : 'no', `Minimum cost ${fmt(cost)}`, `Dual certificate: u(i) + v(j) ≤ c(i,j) for every pair (all reduced costs ≥ 0), and Σu + Σv = ${fmt(+dual.toFixed(6))} = cost. Any assignment costs at least Σu + Σv, so this one is optimal (LP duality).`) + last.panel }));
  return { frames: R.frames, graph: g };
}

/* ---------- TSP: heuristics and approximations vs optimum ---------- */
function eulerOnMulti(n, edges, start) {
  const inc = Array.from({ length: n }, () => []); edges.forEach(([a, b], i) => { inc[a].push(i); inc[b].push(i); });
  const used = Array(edges.length).fill(false), ptr = Array(n).fill(0), st = [start], circ = [];
  while (st.length) { const v = st[st.length - 1]; while (ptr[v] < inc[v].length && used[inc[v][ptr[v]]]) ptr[v]++; if (ptr[v] < inc[v].length) { const e = inc[v][ptr[v]]; used[e] = true; const [a, b] = edges[e]; st.push(a === v ? b : a); } else circ.push(st.pop()); }
  return circ.reverse();
}
function algTSPCompare(g, P) {
  const n = g.nodes.length, R = new Rec(); const { D } = floydUnd(g);
  if (D.some(r => r.some(x => x === Infinity))) { R.snap('The graph is disconnected, so no tour exists.', { panel: '' }, true); return { frames: R.frames }; }
  if (n > 13) { R.snap('Held–Karp is limited to 13 vertices here (it needs 2ⁿ·n² steps).', { panel: '' }, true); return { frames: R.frames }; }
  const s = P.source; const len = t => t.reduce((a, v, k) => a + D[v][t[(k + 1) % t.length]], 0);
  const tourOv = (t, cls, closed = true) => t.slice(0, closed ? t.length : t.length - 1).map((v, k) => ({ u: v, v: t[(k + 1) % t.length], cls, label: fmt(D[v][t[(k + 1) % t.length]]) }));
  const faint = {}; g.edges.forEach((e, i) => faint[i] = 'faint');
  const shortcut = walk => { const seen = new Set(), t = []; for (const v of walk) if (!seen.has(v)) { seen.add(v); t.push(v); } return t; };
  // 1. nearest neighbour
  R.ec = faint; R.line = 0;
  const nn = [s], vis = Array(n).fill(false); vis[s] = true;
  while (nn.length < n) { const u = nn[nn.length - 1]; let b = -1; for (let v = 0; v < n; v++) if (!vis[v] && (b < 0 || D[u][v] < D[u][b])) b = v; vis[b] = true; nn.push(b); }
  R.snap(`Nearest neighbour from ${N(g, s)}: always walk to the closest unvisited vertex. Length ${fmt(len(nn))}. No constant-factor guarantee.`, { overlay: tourOv(nn, 'cand'), panel: '' });
  // MST of metric closure
  const inT = Array(n).fill(false), key = Array(n).fill(Infinity), par = Array(n).fill(-1); key[s] = 0; const mstE = [];
  for (let it = 0; it < n; it++) { let u = -1; for (let v = 0; v < n; v++) if (!inT[v] && (u < 0 || key[v] < key[u])) u = v; inT[u] = true; if (par[u] >= 0) mstE.push([par[u], u]); for (let v = 0; v < n; v++) if (!inT[v] && D[u][v] < key[v]) { key[v] = D[u][v]; par[v] = u; } }
  const mstW = mstE.reduce((a, [x, y]) => a + D[x][y], 0);
  R.line = 1; R.snap(`Minimum spanning tree of the distances: weight ${fmt(mstW)}. Deleting one edge of any tour leaves a spanning tree, so OPT ≥ ${fmt(mstW)}.`, { overlay: mstE.map(([a, b]) => ({ u: a, v: b, cls: 'tree', label: fmt(D[a][b]) })), panel: '' });
  // 2. double tree
  const ch = Array.from({ length: n }, () => []); mstE.forEach(([a, b]) => { ch[a].push(b); ch[b].push(a); });
  const pre = []; const dfs = (u, p) => { pre.push(u); for (const v of ch[u]) if (v !== p) dfs(v, u); }; dfs(s, -1);
  R.line = 2; R.snap(`Double-tree: walk around the tree (each edge twice, length ${fmt(2 * mstW)}) and skip repeated vertices. With the triangle inequality, shortcuts never cost more: tour ≤ 2·MST ≤ 2·OPT. Length ${fmt(len(pre))}.`, { overlay: tourOv(pre, 'path'), panel: h4('Preorder') + `<p class="mono">${pre.map(v => lab(g, v)).join(' → ')}</p>` });
  // 3. Christofides
  const deg = Array(n).fill(0); mstE.forEach(([a, b]) => { deg[a]++; deg[b]++; }); const odd = g.nodes.map((v, i) => i).filter(i => deg[i] % 2);
  let chris = null, mCost = 0, pairs = [];
  if (odd.length <= 18) {
    [mCost, pairs] = minPairing(odd, D);
    R.nc = {}; odd.forEach(i => R.nc[i] = 'cut');
    R.line = 3; R.snap(`Christofides: the tree has ${odd.length} odd-degree vertices. Add a minimum-weight perfect matching on them (cost ${fmt(mCost)} ≤ OPT/2).`, { overlay: mstE.map(([a, b]) => ({ u: a, v: b, cls: 'tree', label: fmt(D[a][b]) })).concat(pairs.map(([a, b]) => ({ u: a, v: b, cls: 'dup', label: fmt(D[a][b]) }))), panel: '' });
    const walk = eulerOnMulti(n, mstE.concat(pairs), s); chris = shortcut(walk); R.nc = {};
    R.line = 4; R.snap(`All degrees are now even: take an Euler circuit and shortcut repeated vertices. Tour ≤ MST + matching ≤ 1.5·OPT. Length ${fmt(len(chris))}.`, { overlay: tourOv(chris, 'path'), panel: h4('Euler circuit before shortcuts') + `<p class="mono">${walk.map(v => lab(g, v)).join(' → ')}</p>` });
  }
  // 4. optimum
  const FULL = 1 << n, dp = new Float64Array(FULL * n).fill(Infinity), pr = new Int8Array(FULL * n).fill(-1); dp[(1 << s) * n + s] = 0;
  for (let m = 0; m < FULL; m++) { if (!(m & (1 << s))) continue; for (let j = 0; j < n; j++) { const c = dp[m * n + j]; if (c === Infinity) continue; for (let k = 0; k < n; k++) { if (m & (1 << k)) continue; const nm = m | (1 << k), v = c + D[j][k]; if (v < dp[nm * n + k]) { dp[nm * n + k] = v; pr[nm * n + k] = j; } } } }
  let best = n === 1 ? 0 : Infinity, last = s; for (let j = 0; j < n; j++) if (j !== s && dp[(FULL - 1) * n + j] + D[j][s] < best) { best = dp[(FULL - 1) * n + j] + D[j][s]; last = j; }
  const opt = []; { let m = FULL - 1, j = last; while (j >= 0) { opt.unshift(j); const q = pr[m * n + j]; m &= ~(1 << j); j = q; } }
  const rowsT = [['Nearest neighbour', len(nn), 'none'], ['Double tree', len(pre), '2'], ...(chris ? [['Christofides', len(chris), '1.5']] : []), ['Held–Karp (exact)', best, '1']];
  const ilp = `<pre class="ilp">min  Σ c(e)·x(e)
s.t. Σ x(e) over e ∋ v       = 2   for every vertex v
     Σ x(e) over e ∈ δ(S)    ≥ 2   for every S, 2 ≤ |S| ≤ n−2
     x(e) ∈ {0, 1}</pre><p class="note">Dantzig–Fulkerson–Johnson. Without the middle family the optimum can split into subtours; each violates its own cut constraint, which is how solvers add constraints lazily.</p>`;
  R.line = 5;
  R.snap(`Held–Karp dynamic programming over subsets: optimum ${fmt(best)}.`, { overlay: tourOv(opt, 'tree'), panel: cert('yes', `OPT = ${fmt(best)}`, `Lower bound from the MST: ${fmt(mstW)} ≤ OPT. Distances are shortest-path distances, so the triangle inequality holds and the guarantees apply.`) + table(['method', 'length', 'ratio to OPT', 'guarantee'], rowsT.map(([nm, l, gu]) => [nm, fmt(l), (l / best).toFixed(3), gu === 'none' ? '—' : '≤ ' + gu]), 'compact') + h4('Optimal tour') + `<p class="mono">${opt.map(v => lab(g, v)).join(' → ')} → ${lab(g, opt[0])}</p>` + h4('The ILP behind TSP solvers') + ilp }, true);
  return { frames: R.frames };
}

/* ---------- isomorph-free generation, step by step ---------- */
function isoMap(a1, a2, n, vk1, vk2) {
  const map = Array(n).fill(-1), used = Array(n).fill(false); const order = [...Array(n).keys()].sort((x, y) => popcnt(a1[y]) - popcnt(a1[x]));
  const rec = k => { if (k === n) return true; const v = order[k]; for (let w = 0; w < n; w++) { if (used[w] || vk1[v] !== vk2[w]) continue; let ok = true; for (let j = 0; j < k; j++) { const u = order[j]; if (((a1[v] >> u) & 1) !== ((a2[w] >> map[u]) & 1)) { ok = false; break; } } if (!ok) continue; map[v] = w; used[w] = true; if (rec(k + 1)) return true; used[w] = false; map[v] = -1; } return false; };
  return rec(0) ? map : null;
}
function algGenWalk(g0, P) {
  const n = Math.max(2, Math.min(5, P.n | 0)); const R = new Rec(); const parents = graphsOfOrder(n - 1);
  const classes = []; const buckets = new Map(); let cand = 0;
  const toG = a => { const g = newGraph(false); for (let i = 0; i < n; i++) addNode(g, '0|' + i, String(i)); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (a[i] >> j & 1) g.edges.push({ u: i, v: j, w: 1 }); circleLayout(g, W / 2, H / 2, 170); return g; };
  const counts = [1, 1, 2, 4, 11, 34];
  R.snap(`Generate all graphs on ${n} vertices: take each of the ${parents.length} graphs on ${n - 1} vertices, add vertex ${n - 1} joined to every subset S of the old vertices (${1 << (n - 1)} choices), and keep a candidate only if it is not isomorphic to one already kept.`, { graph: toG(Array(n).fill(0)), panel: '' });
  parents.forEach((par, pi) => {
    for (let S = 0; S < (1 << (n - 1)); S++) {
      cand++; const a = par.slice(); for (let j = 0; j < n - 1; j++) if (S >> j & 1) a[j] |= 1 << (n - 1); a.push(S);
      const { key, vk } = invKey(a, n); const list = buckets.get(key) || []; let hit = -1, map = null;
      for (const c of list) { map = isoMap(a, classes[c].a, n, vk, classes[c].vk); if (map) { hit = c; break; } }
      const g = toG(a); const ec = {}; g.edges.forEach((e, i) => { if (e.u === n - 1 || e.v === n - 1) ec[i] = 'hl'; });
      const Sset = [...Array(n - 1).keys()].filter(j => S >> j & 1);
      if (hit < 0) { classes.push({ a, vk }); list.push(classes.length - 1); buckets.set(key, list); }
      R.frames.push({ line: 3, ask: { type: 'choice', options: ['new class', 'duplicate'], answer: [hit < 0 ? 'new class' : 'duplicate'], prompt: `Parent #${pi + 1} plus a vertex joined to {${Sset.join(', ')}}: is this a new isomorphism class or a duplicate of one already kept?` }, msg: `Candidate ${cand}: parent #${pi + 1}, new vertex ${n - 1} joined to {${Sset.join(', ')}}. ` + (hit < 0 ? `<b>New</b>: class #${classes.length}.` : `Isomorphic to class #${hit + 1}: discard.`), nc: { [n - 1]: hit < 0 ? 'done' : 'cut' }, ec, ntag: {}, elab: {}, graph: g,
        panel: (hit >= 0 ? cert('info', `Duplicate of #${hit + 1}`, `Bijection: ${map.map((w, v) => `${v}→${w}`).join(', ')}. Edges map to edges, so this candidate adds nothing new.`) : cert('yes', `Class #${classes.length}`, `No earlier graph with the same invariant fingerprint is isomorphic to it.`)) + table(['', 'value'], [['candidates examined', cand], ['classes kept', classes.length], ['fingerprint', `<span class="mono">${esc(key.length > 40 ? key.slice(0, 40) + '…' : key)}</span>`]], 'compact') });
    }
  });
  R.frames.push(Object.assign({}, R.frames[R.frames.length - 1], { msg: `Done: ${cand} candidates, ${classes.length} isomorphism classes (the known count is ${counts[n]}).`, panel: cert('yes', `${classes.length} graphs on ${n} vertices`, `Completeness: deleting vertex ${n - 1} from any graph on ${n} vertices gives a graph on ${n - 1} vertices, isomorphic to some parent, so every class appears among the candidates. Soundness: duplicates are only discarded when an explicit isomorphism is found.`) }));
  return { frames: R.frames };
}
