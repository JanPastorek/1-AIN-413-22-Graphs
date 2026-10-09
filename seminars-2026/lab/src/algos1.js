/* ============================================================
   Algorithms, part 1: traversal, degrees, isomorphism, MST, shortest paths
   Each returns { frames, graph? } ; frames are snapshots for the player.
   ============================================================ */

function distTable(g, dist, extraCol) {
  const rows = g.nodes.map((v, i) => [lab(g, i), dist[i] < 0 || dist[i] === Infinity ? '∞' : fmt(dist[i])].concat(extraCol ? [extraCol(i)] : []));
  return table(['vertex', 'dist'].concat(extraCol ? ['pred'] : []), rows, 'compact');
}

function oddCycleFrom(g, par, pe, u, v, eUV) {
  // climb from u and v to their lowest common ancestor in the BFS tree
  const anc = new Map(); let x = u, d = 0; while (x >= 0) { anc.set(x, d++); x = par[x]; }
  let y = v; const pathV = []; while (!anc.has(y)) { pathV.push(pe[y]); y = par[y]; }
  const lca = y; const pathU = []; x = u; while (x !== lca) { pathU.push(pe[x]); x = par[x]; }
  const edges = pathU.concat(pathV, [eUV]);
  const nodes = new Set(); for (const e of edges) { nodes.add(g.edges[e].u); nodes.add(g.edges[e].v); }
  return { edges, nodes: [...nodes], len: edges.length };
}

function algBFS(g, P) {
  const s = P.source, n = g.nodes.length, A = adjOut(g), R = new Rec();
  const dist = Array(n).fill(-1), par = Array(n).fill(-1), pe = Array(n).fill(-1);
  const Q = [s]; let head = 0; dist[s] = 0; R.nc[s] = 'front'; R.ntag[s] = '0';
  const panel = () => h4('Queue (front → back)') + chips(Q.slice(head).map(i => lab(g, i))) + h4('Distance labels') + distTable(g, dist, i => par[i] >= 0 ? lab(g, par[i]) : '—');
  R.line = 1; R.snap(`Put ${N(g, s)} in the queue with distance 0. BFS will settle vertices layer by layer.`, { panel: panel() });
  while (head < Q.length) {
    const u = Q[head++]; R.nc[u] = 'cur';
    R.line = 3; R.snap(`Dequeue ${N(g, u)} (layer ${dist[u]}) and scan its ${g.directed ? 'out-' : ''}neighbours.`, { ask: { type: 'vertex', answer: [u], prompt: 'Which vertex leaves the queue next?' }, panel: panel() });
    for (const { to, e } of A[u]) {
      if (dist[to] < 0) {
        dist[to] = dist[u] + 1; par[to] = u; pe[to] = e; Q.push(to);
        R.nc[to] = 'front'; R.ec[e] = 'tree'; R.ntag[to] = String(dist[to]);
        R.line = 6; R.snap(`Discover ${N(g, to)} from ${N(g, u)}. It joins layer ${dist[to]}.`, { panel: panel() });
      } else if (R.ec[e] === undefined) R.ec[e] = 'nontree';
    }
    R.nc[u] = 'done';
  }
  const unreached = dist.filter(d => d < 0).length;
  let msg = `Queue empty. ${n - unreached} of ${n} vertices reached` + (unreached ? `; ${unreached} lie in other components.` : '.');
  let c = h4('Layers') + table(['layer', 'vertices'], [...new Set(dist.filter(d => d >= 0))].sort((a, b) => a - b).map(d => [d, g.nodes.map((v, i) => dist[i] === d ? lab(g, i) : null).filter(Boolean).join(', ')]), 'compact');
  if (!g.directed) {
    let odd = null;
    g.edges.forEach((e, i) => { if (!odd && dist[e.u] >= 0 && dist[e.u] === dist[e.v]) odd = oddCycleFrom(g, par, pe, e.u, e.v, i); });
    if (odd) {
      for (const e of odd.edges) R.ec[e] = 'cut'; for (const x of odd.nodes) R.nc[x] = 'cut';
      c = cert('no', 'Not bipartite', `Edge inside one BFS layer closes an odd cycle of length ${odd.len}: ${odd.nodes.map(i => lab(g, i)).join(', ')}. An odd cycle cannot be 2-coloured.`) + c;
    } else {
      g.nodes.forEach((v, i) => { if (dist[i] >= 0) R.nc[i] = dist[i] % 2 ? 'k1' : 'k0'; });
      c = cert('yes', 'Bipartite (this component)', 'No edge joins two vertices of the same layer, so colouring layers by parity is a proper 2-colouring.') + c;
    }
  }
  R.line = 7; R.snap(msg, { panel: c }, true);
  return { frames: R.frames, truncated: R.truncated };
}

function algDFS(g, P) {
  const n = g.nodes.length, A = adjOut(g), R = new Rec();
  const disc = Array(n).fill(0), fin = Array(n).fill(0), state = Array(n).fill(0); let time = 0; const stack = [];
  let back = 0; const finishOrder = [];
  const panel = () => h4('Recursion stack (bottom → top)') + chips(stack.map(i => lab(g, i))) + h4('Times d/f') + table(['vertex', 'd', 'f'], g.nodes.map((v, i) => [lab(g, i), disc[i] || '·', fin[i] || '·']), 'compact');
  function visit(u, via) {
    disc[u] = ++time; state[u] = 1; stack.push(u); R.nc[u] = 'front'; R.ntag[u] = `${disc[u]}/·`;
    R.line = 3; R.snap(`Enter ${N(g, u)} at time ${disc[u]}.`, { ask: { type: 'vertex', answer: [u], prompt: 'Which vertex does DFS enter next?' }, panel: panel() });
    for (const { to, e } of A[u]) {
      if (!g.directed && e === via) continue;
      if (state[to] === 0) { R.ec[e] = 'tree'; R.nc[u] = 'cur'; R.line = 5; R.snap(`Tree edge ${edgeName(g, e)}: go deeper.`, { panel: panel() }); visit(to, e); R.nc[u] = 'front'; }
      else if (state[to] === 1) { if (R.ec[e] === undefined) { R.ec[e] = 'back'; back++; R.line = 6; R.snap(`Back edge ${edgeName(g, e)} reaches an ancestor still on the stack: a cycle.`, { panel: panel() }); } }
      else if (g.directed && R.ec[e] === undefined) { R.ec[e] = disc[u] < disc[to] ? 'fwd' : 'cross'; R.line = 6; R.snap(`${disc[u] < disc[to] ? 'Forward' : 'Cross'} edge ${edgeName(g, e)}.`, { panel: panel() }); }
    }
    fin[u] = ++time; state[u] = 2; stack.pop(); R.nc[u] = 'done'; R.ntag[u] = `${disc[u]}/${fin[u]}`; finishOrder.push(u);
    R.line = 7; R.snap(`Finish ${N(g, u)} at time ${fin[u]}.`, { ask: { type: 'vertex', answer: [u], prompt: 'Which vertex finishes next?' }, panel: panel() });
  }
  const order = [P.source].concat(g.nodes.map((v, i) => i).filter(i => i !== P.source));
  let trees = 0; for (const s of order) if (state[s] === 0) { trees++; visit(s, -1); }
  let c;
  if (g.directed) {
    c = back ? cert('no', 'Directed cycle found', `There ${back === 1 ? 'is a back edge' : `are ${back} back edges`}. A digraph has a cycle exactly when DFS finds a back edge.`)
      : cert('yes', 'Acyclic: topological order', `Reverse finishing order: ${finishOrder.slice().reverse().map(i => lab(g, i)).join(' → ')}. Every edge points from an earlier to a later vertex.`);
  } else {
    c = cert('info', 'Cycle count check', `DFS forest has ${trees} tree${trees > 1 ? 's' : ''}; back edges = m − n + c = ${g.edges.length} − ${n} + ${trees} = ${back}. Each back edge closes one independent cycle.`);
  }
  R.line = 1; R.snap(`DFS complete: ${trees} tree${trees > 1 ? 's' : ''} in the forest.`, { panel: c + panel() }, true);
  return { frames: R.frames, truncated: R.truncated };
}

/* ---------- degrees ---------- */
function parseSeq(s) { const a = s.split(/[\s,;]+/).filter(Boolean).map(Number); if (!a.length || a.some(x => !Number.isInteger(x) || x < 0)) throw new Error('Enter non-negative integers separated by spaces, e.g. 3 3 2 2 2 1 1.'); return a; }

function erdosGallai(d) {
  const s = d.slice().sort((a, b) => b - a), n = s.length; const rows = []; let ok = true; let L = 0;
  for (let k = 1; k <= n; k++) { L += s[k - 1]; let Rr = k * (k - 1); for (let i = k; i < n; i++) Rr += Math.min(s[i], k); const good = L <= Rr; if (!good) ok = false; rows.push({ cells: [k, L, Rr, good ? '✓' : '✗'], cls: good ? '' : 'bad' }); }
  return { ok, html: table(['k', 'Σ top k', 'k(k−1)+Σ min(dᵢ,k)', ''], rows, 'compact') };
}

function algHavelHakimi(g0, P) {
  const d = parseSeq(P.seq), n = d.length; const g = newGraph(false);
  for (let i = 0; i < n; i++) addNode(g, '0|v' + (i + 1), 'v' + (i + 1));
  circleLayout(g);
  const res = d.slice(); const R = new Rec(); R.ntag = {}; d.forEach((x, i) => R.ntag[i] = String(x));
  const sorted = () => g.nodes.map((v, i) => i).sort((a, b) => res[b] - res[a] || a - b);
  const panel = (hl = []) => h4('Residual sequence (sorted)') + chips(sorted().map(i => `${lab(g, i)}:${res[i]}`)) + h4('Rule') + '<p class="note">Remove the largest residual degree d, join that vertex to the next d largest, subtract 1 from each. Repeat.</p>';
  const sum = d.reduce((a, b) => a + b, 0);
  R.line = 0; R.snap(`Sequence (${d.join(', ')}), n = ${n}, sum = ${sum}.`, { panel: panel(), edgeLimit: 0 });
  let fail = null;
  if (sum % 2) fail = `The sum ${sum} is odd. Every edge adds 2 to the degree sum (handshake lemma).`;
  else if (Math.max(...d) > n - 1) fail = `A degree ${Math.max(...d)} exceeds n − 1 = ${n - 1}.`;
  while (!fail) {
    const ord = sorted(); const u = ord[0]; const k = res[u]; if (k === 0) break;
    const targets = ord.slice(1, k + 1);
    R.nc = {}; R.nc[u] = 'cur'; targets.forEach(t => R.nc[t] = 'front');
    if (targets.length < k || targets.some(t => res[t] <= 0)) { fail = `${lab(g, u)} needs ${k} partners, but only ${targets.filter(t => res[t] > 0).length} vertices have residual degree left.`; R.snap(fail, { panel: panel(), edgeLimit: g.edges.length }); break; }
    R.line = 3; R.snap(`Largest residual: ${N(g, u)} with ${k}. Join it to ${targets.map(t => N(g, t)).join(', ')}.`, { ask: { type: 'vertex', answer: g.nodes.map((v, i) => i).filter(i => res[i] === k), prompt: 'Havel–Hakimi: which vertex is processed next?' }, panel: panel(), edgeLimit: g.edges.length });
    for (const t of targets) { g.edges.push({ u, v: t, w: 1 }); R.ec[g.edges.length - 1] = 'hl'; res[t]--; }
    res[u] = 0;
    g.nodes.forEach((v, i) => R.ntag[i] = res[i] ? `${d[i]} (${res[i]} left)` : String(d[i]));
    R.line = 5; R.snap(`Added ${k} edge${k > 1 ? 's' : ''}; residual degrees updated.`, { panel: panel(), edgeLimit: g.edges.length });
    for (const key in R.ec) R.ec[key] = 'tree';
  }
  const eg = erdosGallai(d);
  R.nc = {};
  if (fail) {
    R.line = 4; R.snap(fail, { panel: cert('no', 'Not graphical', fail) + h4('Independent check: Erdős–Gallai') + eg.html, edgeLimit: g.edges.length }, true);
  } else {
    for (const key in R.ec) R.ec[key] = 'tree';
    g.nodes.forEach((v, i) => R.ntag[i] = String(d[i]));
    R.line = 6; R.snap(`Graphical. The edges added form a simple graph realising (${d.join(', ')}).`, { panel: cert('yes', 'Graphical', `Witness: the ${g.edges.length}-edge graph drawn here. Check every vertex label equals its degree.`) + h4('Independent check: Erdős–Gallai') + eg.html, edgeLimit: g.edges.length }, true);
  }
  return { frames: R.frames, graph: g };
}

function algBridges(g, P) {
  const n = g.nodes.length, A = adjUnd(g), R = new Rec();
  const disc = Array(n).fill(0), low = Array(n).fill(0); let time = 0; const bridges = [], art = new Set();
  const tag = i => R.ntag[i] = `${disc[i]}/${low[i]}`;
  const panel = () => h4('Discovery / low') + table(['vertex', 'disc', 'low'], g.nodes.map((v, i) => [lab(g, i), disc[i] || '·', disc[i] ? low[i] : '·']), 'compact') + '<p class="note">low(v) = smallest discovery time reachable from v’s subtree using at most one back edge.</p>';
  function dfs(u, via) {
    disc[u] = low[u] = ++time; tag(u); R.nc[u] = 'cur'; R.line = 1; R.snap(`Visit ${N(g, u)}: disc = low = ${disc[u]}.`, { panel: panel() });
    let children = 0;
    for (const { to, e } of A[u]) {
      if (e === via) continue;
      if (!disc[to]) {
        children++; R.ec[e] = 'tree'; R.nc[u] = 'front'; dfs(to, e); R.nc[u] = 'cur';
        if (low[to] < low[u]) { low[u] = low[to]; tag(u); }
        if (low[to] > disc[u]) { bridges.push(e); R.ec[e] = 'cut'; R.line = 4; R.snap(`low(${lab(g, to)}) = ${low[to]} > disc(${lab(g, u)}) = ${disc[u]}: nothing below ${lab(g, to)} climbs past this edge. ${edgeName(g, e)} is a bridge.`, { panel: panel() }); }
        if (via >= 0 && low[to] >= disc[u] && !art.has(u)) { art.add(u); R.line = 5; R.snap(`low(${lab(g, to)}) ≥ disc(${lab(g, u)}): removing ${N(g, u)} cuts off ${lab(g, to)}’s subtree. Articulation point.`, { panel: panel() }); }
        else { R.line = 3; R.snap(`Back at ${N(g, u)}: low = ${low[u]}.`, { panel: panel() }); }
      } else if (disc[to] < disc[u]) {
        if (R.ec[e] === undefined) R.ec[e] = 'back';
        if (disc[to] < low[u]) { low[u] = disc[to]; tag(u); }
        R.line = 6; R.snap(`Back edge ${edgeName(g, e)}: low(${lab(g, u)}) = ${low[u]}.`, { panel: panel() });
      }
    }
    if (via < 0 && children >= 2) art.add(u);
    R.nc[u] = 'done';
  }
  let comps = 0; for (let s = (P.source ?? 0), k = 0; k < n; k++, s = (s + 1) % n) if (!disc[s]) { comps++; dfs(s, -1); }
  for (const a of art) R.nc[a] = 'cut';
  const c = cert(bridges.length || art.size ? 'no' : 'yes', bridges.length || art.size ? 'Single points of failure' : '2-connected (and 2-edge-connected)',
    `Bridges: ${bridges.length ? bridges.map(e => edgeName(g, e)).join(', ') : 'none'}.<br>Articulation points: ${art.size ? [...art].map(i => lab(g, i)).join(', ') : 'none'}.` + (comps > 1 ? `<br>The graph already has ${comps} components.` : ''));
  R.line = 7; R.snap('Done. Red edges are bridges, red vertices are cut vertices.', { panel: c + panel() }, true);
  return { frames: R.frames, truncated: R.truncated };
}

function degreeSummary(g) {
  const deg = g.nodes.map(() => 0); for (const e of g.edges) { deg[e.u]++; deg[e.v]++; }
  const di = diameterInfo(g);
  return { deg: deg.slice().sort((a, b) => b - a), tri: triangleCount(g), conn: di.conn, diam: di.diam };
}
function algSwaps(g0, P) {
  const R = new Rec(), rand = rng(P.seed); let g = cloneGraph(g0); g.directed = false;
  const has = (G, a, b) => G.edges.some(e => (e.u === a && e.v === b) || (e.u === b && e.v === a));
  const sumPanel = (G) => { const s = degreeSummary(G); return table(['invariant', 'value'], [['degree sequence', s.deg.join(' ')], ['triangles', s.tri], ['connected', s.conn ? 'yes' : 'no'], ['diameter', fmt(s.diam)]], 'compact'); };
  const first = degreeSummary(g);
  R.line = 0; R.snap('Starting graph. A double-edge swap replaces a–b, c–d by a–d, c–b: every degree stays the same.', { graph: g, panel: sumPanel(g) });
  let done = 0, tries = 0;
  while (done < P.k && tries < P.k * 60) {
    tries++; const m = g.edges.length; if (m < 2) break;
    const i = Math.floor(rand() * m), j = Math.floor(rand() * m); if (i === j) continue;
    let { u: a, v: b } = g.edges[i]; let { u: c, v: d } = g.edges[j]; if (rand() < 0.5) [c, d] = [d, c];
    if (new Set([a, b, c, d]).size < 4 || has(g, a, d) || has(g, c, b)) continue;
    const show = cloneGraph(g); show.nodes = g.nodes; // share positions
    show.edges.push({ u: a, v: d, w: 1 }, { u: c, v: b, w: 1 });
    R.ec = { [i]: 'rej', [j]: 'rej', [show.edges.length - 2]: 'hl', [show.edges.length - 1]: 'hl' }; R.nc = { [a]: 'cur', [b]: 'cur', [c]: 'cur', [d]: 'cur' };
    R.line = 3; R.snap(`Swap ${done + 1}: remove ${lab(g, a)}–${lab(g, b)} and ${lab(g, c)}–${lab(g, d)}, add ${lab(g, a)}–${lab(g, d)} and ${lab(g, c)}–${lab(g, b)}.`, { graph: show, panel: sumPanel(g) });
    const ng = cloneGraph(g); ng.nodes = g.nodes; ng.edges = g.edges.filter((e, k) => k !== i && k !== j).concat([{ u: a, v: d, w: 1 }, { u: c, v: b, w: 1 }]);
    g = ng; done++; R.ec = {}; R.nc = {};
    R.line = 3; R.snap(`After swap ${done}. Degrees unchanged; compare the other invariants.`, { graph: g, panel: sumPanel(g) });
  }
  const last = degreeSummary(g);
  const changed = [first.tri !== last.tri && 'triangle count', first.conn !== last.conn && 'connectivity', first.diam !== last.diam && 'diameter'].filter(Boolean);
  R.line = 0; R.snap(`${done} swaps performed.`, { graph: g, panel: cert('info', 'Same degrees, different network', changed.length ? `Degree sequence identical, but ${changed.join(', ')} changed. The degree sequence does not determine the graph.` : 'Degree sequence identical. These invariants happened not to change; run again with another seed.') + sumPanel(g) }, true);
  return { frames: R.frames };
}

/* ---------- isomorphism ---------- */
function wlRefine(g, init) {
  const n = g.nodes.length, A = adjUnd(g); let col = init ? init.slice() : Array(n).fill(0); const hist = [col.slice()];
  let classes = new Set(col).size;
  for (let it = 0; it < n + 1; it++) {
    const sig = col.map((c, i) => c + '|' + A[i].map(x => col[x.to]).sort((a, b) => a - b).join(','));
    const keys = [...new Set(sig)].sort(); const id = new Map(keys.map((k, i) => [k, i]));
    const nc = sig.map(s => id.get(s)); const k2 = new Set(nc).size;
    if (k2 === classes) break; col = nc; classes = k2; hist.push(col.slice());
  }
  return hist;
}
function colorHist(g, col, part) {
  const h = new Map(); g.nodes.forEach((v, i) => { if (v.part === part) h.set(col[i], (h.get(col[i]) || 0) + 1); });
  return [...h.entries()].sort((a, b) => a[0] - b[0]);
}
const swatch = c => `<span class="sw k${c % 10}"></span>`;
function algWL(g, P) {
  const R = new Rec(); const hist = wlRefine(g); const parts = g.parts || 1;
  let decided = -1;
  hist.forEach((col, it) => {
    g.nodes.forEach((v, i) => { R.nc[i] = 'k' + (col[i] % 10); R.ntag[i] = String(col[i]); });
    let p = '';
    const H = []; for (let q = 0; q < parts; q++) { H.push(colorHist(g, col, q)); p += h4(parts > 1 ? `Graph ${q + 1} colour histogram` : 'Colour histogram') + `<div class="hist">${H[q].map(([c, k]) => `<span class="hb">${swatch(c)}${c}<b>×${k}</b></span>`).join('')}</div>`; }
    let msg = it === 0 ? 'Round 0: every vertex gets the same colour.' : `Round ${it}: new colour = (old colour, multiset of neighbours’ colours). ${new Set(col).size} classes now.`;
    if (parts === 2 && decided < 0 && JSON.stringify(H[0]) !== JSON.stringify(H[1])) { decided = it; msg += ' The histograms differ.'; p = cert('no', 'Not isomorphic', `After round ${it} the two graphs have different colour histograms. An isomorphism would preserve every colour count, so none exists.`) + p; }
    R.line = it === 0 ? 1 : 4;
    R.snap(msg, it === 0 ? { panel: p } : { panel: p, ask: { type: 'number', answer: [new Set(col).size], prompt: 'After this refinement round, how many colour classes are there in total?' } });
  });
  const last = hist[hist.length - 1];
  let fin;
  if (parts === 2) fin = decided >= 0 ? cert('no', 'Not isomorphic', `Distinguished in round ${decided}. The certificate is the colour class whose sizes differ.`)
    : cert('info', 'WL cannot tell them apart', 'The stable colourings have identical histograms. This is not a proof of isomorphism: C₆ and two triangles look identical to 1-WL. Find a bijection, or an invariant WL misses (triangles, cycles).');
  else fin = cert('info', 'Stable partition', `${new Set(last).size} colour classes after ${hist.length - 1} round${hist.length === 2 ? '' : 's'}. Vertices in different classes cannot be swapped by any automorphism.`);
  R.line = 6; R.snap('Refinement stable: another round would not split any class.', { panel: fin + R.frames[R.frames.length - 1].panel }, true);
  return { frames: R.frames };
}

function autSearch(g, colInit, cap = 40000) {
  const n = g.nodes.length, M = adjMatrix(g, true), col = colInit;
  // BFS order so adjacency constraints bite early
  const A = adjUnd(g), seen = Array(n).fill(false), order = [];
  const starts = g.nodes.map((v, i) => i).sort((a, b) => A[b].length - A[a].length);
  for (const s of starts) { if (seen[s]) continue; seen[s] = true; const Q = [s]; for (let h = 0; h < Q.length; h++) { const u = Q[h]; order.push(u); for (const { to } of A[u]) if (!seen[to]) { seen[to] = true; Q.push(to); } } }
  const map = Array(n).fill(-1), used = Array(n).fill(false); let count = 0; const examples = [];
  const parent = g.nodes.map((v, i) => i); const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
  let stop = false;
  function rec(i) {
    if (stop) return;
    if (i === n) { count++; for (let v = 0; v < n; v++) { const a = find(v), b = find(map[v]); if (a !== b) parent[a] = b; } if (examples.length < 6 && map.some((w, v) => w !== v)) examples.push(map.slice()); if (count >= cap) stop = true; return; }
    const v = order[i];
    for (let w = 0; w < n; w++) {
      if (used[w] || col[w] !== col[v]) continue;
      let ok = true; for (let j = 0; j < i; j++) { const u = order[j]; if (M[v][u] !== M[w][map[u]]) { ok = false; break; } }
      if (!ok) continue; map[v] = w; used[w] = true; rec(i + 1); used[w] = false; map[v] = -1; if (stop) return;
    }
  }
  rec(0);
  const orbitId = g.nodes.map((v, i) => find(i)); const ids = [...new Set(orbitId)]; const orbit = orbitId.map(x => ids.indexOf(x));
  return { count, capped: stop, orbit, examples };
}
function cycleNotation(g, p) { const n = p.length, seen = Array(n).fill(false), out = []; for (let i = 0; i < n; i++) { if (seen[i] || p[i] === i) { seen[i] = true; continue; } const c = []; let j = i; while (!seen[j]) { seen[j] = true; c.push(lab(g, j)); j = p[j]; } out.push('(' + c.join(' ') + ')'); } return out.join('') || 'id'; }
function algAut(g, P) {
  const R = new Rec(); const n = g.nodes.length;
  if (n > 16) { R.snap('Automorphism search is limited to 16 vertices in the browser.', { panel: cert('info', 'Too large', 'Use nauty/Traces (via SageMath or networkx) for larger graphs.') }, true); return { frames: R.frames }; }
  const wl = wlRefine(g); const stable = wl[wl.length - 1];
  g.nodes.forEach((v, i) => { R.nc[i] = 'k' + (stable[i] % 10); R.ntag[i] = ''; });
  R.line = 0; R.snap('Step 1: colour refinement. An automorphism can only map a vertex to one of the same stable colour, which prunes the search.', { panel: h4('Stable colours') + chips(stable.map((c, i) => `${swatch(c)}${lab(g, i)}`)) });
  const res = autSearch(g, stable);
  g.nodes.forEach((v, i) => { R.nc[i] = 'k' + (res.orbit[i] % 10); });
  const orbits = []; res.orbit.forEach((o, i) => { (orbits[o] ||= []).push(lab(g, i)); });
  const sz = (res.capped ? '≥ ' : '') + res.count;
  const ex = res.examples.map(p => `<code>${cycleNotation(g, p)}</code>`).join(' ');
  R.line = 3; R.snap(`Step 2: backtracking found |Aut(G)| = ${sz}. Colours now show orbits.`, { panel: cert('info', `|Aut(G)| = ${sz}`, `${orbits.length} orbit${orbits.length > 1 ? 's' : ''}: ${orbits.map(o => '{' + o.join(', ') + '}').join(' ')}`) + h4('Some automorphisms (cycle notation)') + `<p class="mono">${ex || 'only the identity'}</p>` + (res.capped ? '<p class="note">Search stopped at 40 000 automorphisms; orbits shown are those seen so far.</p>' : '') });
  // greedy fixing set
  const fixed = []; let cur = res; let guard = 0;
  while (cur.count > 1 && guard++ < n) {
    const sizes = cur.orbit.map(o => cur.orbit.filter(x => x === o).length);
    let best = -1; g.nodes.forEach((v, i) => { if (!fixed.includes(i) && (best < 0 || sizes[i] > sizes[best])) best = i; });
    fixed.push(best);
    const c2 = stable.map((c, i) => fixed.includes(i) ? 1000 + fixed.indexOf(i) : c);
    const refined = wlRefine(g, c2); cur = autSearch(g, refined[refined.length - 1]);
    g.nodes.forEach((v, i) => { R.nc[i] = fixed.includes(i) ? 'cur' : 'k' + (cur.orbit[i] % 10); R.ntag[i] = fixed.includes(i) ? 'fixed' : ''; });
    R.line = 4; R.snap(`Fix ${N(g, best)} (it had the largest orbit). Automorphisms fixing {${fixed.map(i => lab(g, i)).join(', ')}}: ${cur.capped ? '≥ ' : ''}${cur.count}.`, { panel: h4('Fixing set so far') + chips(fixed.map(i => lab(g, i))) + `<p class="note">Remaining symmetries: ${cur.count}.</p>` });
  }
  R.line = 4; R.snap(`Only the identity fixes {${fixed.map(i => lab(g, i)).join(', ')}}.`, { panel: cert('yes', `Fixing set of size ${fixed.length}`, `Every non-trivial automorphism moves at least one of ${fixed.map(i => lab(g, i)).join(', ')}. Greedy gives an upper bound on the fixing number; it need not be optimal.`) }, true);
  return { frames: R.frames };
}

/* ---------- MST ---------- */
function treePathMax(g, treeEdges, a, b) {
  const A = g.nodes.map(() => []); for (const e of treeEdges) { const E = g.edges[e]; A[E.u].push([E.v, e]); A[E.v].push([E.u, e]); }
  const prev = new Map([[a, -1]]); const Q = [a];
  for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (const [v, e] of A[u]) if (!prev.has(v)) { prev.set(v, [u, e]); Q.push(v); } }
  if (!prev.has(b)) return null; let mx = -Infinity, x = b; while (x !== a) { const [p, e] = prev.get(x); mx = Math.max(mx, g.edges[e].w); x = p; } return mx;
}
function mstCertificate(g, tree) {
  const T = new Set(tree); const rows = []; let ok = true;
  g.edges.forEach((e, i) => { if (T.has(i)) return; const mx = treePathMax(g, tree, e.u, e.v); const good = mx === null || e.w >= mx; if (!good) ok = false; rows.push({ cells: [edgeName(g, i), fmt(e.w), mx === null ? '—' : fmt(mx), good ? '✓' : '✗'], cls: good ? '' : 'bad' }); });
  const total = tree.reduce((s, e) => s + g.edges[e].w, 0);
  return cert(ok ? 'yes' : 'no', `Spanning ${tree.length === g.nodes.length - 1 ? 'tree' : 'forest'}, weight ${fmt(total)}`, 'Cycle-property check: each non-tree edge must be at least as heavy as every tree edge on the cycle it closes. If all rows pass, no exchange can lower the weight.') + (rows.length ? table(['non-tree edge', 'w', 'max on tree path', ''], rows, 'compact') : '');
}
function algKruskal(g, P) {
  const n = g.nodes.length, R = new Rec(); const parent = g.nodes.map((v, i) => i), rank = Array(n).fill(0);
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const order = g.edges.map((e, i) => i).sort((a, b) => g.edges[a].w - g.edges[b].w || a - b); const tree = []; const status = {};
  const sets = () => { const m = new Map(); g.nodes.forEach((v, i) => { const r = find(i); (m.get(r) || m.set(r, []).get(r)).push(lab(g, i)); }); return [...m.values()].map(s => '{' + s.join(',') + '}'); };
  const panel = () => h4('Union–find sets') + chips(sets()) + h4('parent[]') + `<p class="mono">${g.nodes.map((v, i) => `${lab(g, i)}→${lab(g, parent[i])}`).join('  ')}</p>` + h4('Edges by weight') + `<div class="elist">${order.map(e => `<span class="ei ${status[e] || ''}">${edgeName(g, e)} <b>${fmt(g.edges[e].w)}</b></span>`).join('')}</div>`;
  R.line = 1; R.snap('Sort edges by weight. Each vertex starts in its own set.', { panel: panel() });
  for (const e of order) {
    const { u, v } = g.edges[e]; R.ec[e] = 'cand'; status[e] = 'now';
    const ru = find(u), rv = find(v);
    R.line = 3; R.snap(`Consider ${edgeName(g, e)} (w = ${fmt(g.edges[e].w)}): find(${lab(g, u)}) = ${lab(g, ru)}, find(${lab(g, v)}) = ${lab(g, rv)}.`, { ask: { type: 'edge', answer: order.filter(x => (!status[x] || x === e) && g.edges[x].w === g.edges[e].w), prompt: 'Which edge does Kruskal consider next?' }, panel: panel() });
    if (ru === rv) { R.ec[e] = 'rej'; status[e] = 'no'; R.line = 5; R.snap(`Same set: this edge would close a cycle. Reject.`, { panel: panel() }); }
    else { if (rank[ru] < rank[rv]) parent[ru] = rv; else if (rank[ru] > rank[rv]) parent[rv] = ru; else { parent[rv] = ru; rank[ru]++; } R.ec[e] = 'tree'; status[e] = 'yes'; tree.push(e); g.nodes.forEach((x, i) => R.nc[i] = 'done'); R.line = 4; R.snap(`Different sets: accept and union them. It is the lightest edge leaving its component (cut property).`, { panel: panel() }); if (tree.length === n - 1) break; }
  }
  R.line = 6; R.snap(`Kruskal finished with ${tree.length} edges.`, { panel: mstCertificate(g, tree) + panel() }, true);
  return { frames: R.frames };
}
function algPrim(g, P) {
  const n = g.nodes.length, A = adjUnd(g), R = new Rec(); const inT = Array(n).fill(false); const tree = [];
  const starts = [P.source].concat(g.nodes.map((v, i) => i));
  for (const s of starts) {
    if (inT[s]) continue; inT[s] = true; R.nc[s] = 'done';
    R.line = 1; R.snap(`Start a tree at ${N(g, s)}.`, { panel: '' });
    while (true) {
      const cross = []; for (let u = 0; u < n; u++) if (inT[u]) for (const { to, e } of A[u]) if (!inT[to]) cross.push(e);
      for (const k in R.ec) if (R.ec[k] === 'cand') delete R.ec[k];
      if (!cross.length) break;
      cross.sort((a, b) => g.edges[a].w - g.edges[b].w || a - b); cross.forEach(e => R.ec[e] = 'cand');
      const panel = h4('Edges crossing the cut (T, V∖T)') + `<div class="elist">${[...new Set(cross)].map((e, k) => `<span class="ei ${k === 0 ? 'now' : ''}">${edgeName(g, e)} <b>${fmt(g.edges[e].w)}</b></span>`).join('')}</div>`;
      R.line = 2; R.snap(`Cut around the tree: ${new Set(cross).size} crossing edge${cross.length > 1 ? 's' : ''}. The lightest is safe to add.`, { panel });
      const e = cross[0]; const E = g.edges[e]; const v = inT[E.u] ? E.v : E.u; inT[v] = true; tree.push(e); R.ec[e] = 'tree'; R.nc[v] = 'done';
      R.line = 4; R.snap(`Add ${edgeName(g, e)} (w = ${fmt(E.w)}); ${N(g, v)} joins the tree.`, { ask: { type: 'edge', answer: cross.filter(x => g.edges[x].w === E.w), prompt: 'Which edge does Prim add next?' }, panel });
    }
  }
  R.line = 5; R.snap(`Prim finished with ${tree.length} edges.`, { panel: mstCertificate(g, tree) }, true);
  return { frames: R.frames };
}

/* ---------- shortest paths ---------- */
function bellmanFordPlain(g, s) {
  const n = g.nodes.length, d = Array(n).fill(Infinity); d[s] = 0; const arcs = [];
  g.edges.forEach((e, i) => { arcs.push([e.u, e.v, e.w, i]); if (!g.directed) arcs.push([e.v, e.u, e.w, i]); });
  for (let k = 0; k < n - 1; k++) { let ch = false; for (const [u, v, w] of arcs) if (d[u] + w < d[v]) { d[v] = d[u] + w; ch = true; } if (!ch) break; }
  for (const [u, v, w] of arcs) if (d[u] + w < d[v]) return null; return d;
}
function algDijkstra(g, P) {
  const n = g.nodes.length, A = adjOut(g), R = new Rec(), s = P.source;
  const d = Array(n).fill(Infinity), pred = Array(n).fill(-1), pe = Array(n).fill(-1), done = Array(n).fill(false); d[s] = 0;
  const neg = g.edges.filter(e => e.w < 0).length;
  g.nodes.forEach((v, i) => R.ntag[i] = i === s ? '0' : '∞');
  const panel = () => h4('Priority queue (unsettled, finite)') + chips(g.nodes.map((v, i) => i).filter(i => !done[i] && d[i] < Infinity).sort((a, b) => d[a] - d[b]).map(i => `${lab(g, i)}:${fmt(d[i])}`)) + h4('Labels') + distTable(g, d, i => pred[i] >= 0 ? lab(g, pred[i]) : '—');
  R.line = 1; R.snap(`d(${lab(g, s)}) = 0, all others ∞.` + (neg ? ` Warning: ${neg} negative edge${neg > 1 ? 's' : ''}. Dijkstra’s settling invariant assumes w ≥ 0.` : ''), { panel: panel() });
  for (let it = 0; it < n; it++) {
    let u = -1; for (let i = 0; i < n; i++) if (!done[i] && d[i] < Infinity && (u < 0 || d[i] < d[u])) u = i; if (u < 0) break;
    done[u] = true; R.nc[u] = 'cur';
    R.line = 3; R.snap(`Extract min: settle ${N(g, u)} with d = ${fmt(d[u])}. With non-negative weights no later path can be shorter.`, { ask: { type: 'vertex', answer: g.nodes.map((v, i) => i).filter(i => (!done[i] || i === u) && d[i] === d[u]), prompt: 'Which vertex does Dijkstra settle next?' }, panel: panel() });
    for (const { to, w, e } of A[u]) {
      const nd = d[u] + w; R.ec[e] = R.ec[e] === 'tree' ? 'tree' : 'cand';
      if (done[to]) { R.line = 4; R.snap(`${edgeName(g, e)}: ${lab(g, to)} is already settled, skip.` + (nd < d[to] ? ` (It would improve to ${fmt(nd)}! The invariant just broke.)` : ''), { panel: panel() }); if (R.ec[e] === 'cand') delete R.ec[e]; continue; }
      if (nd < d[to]) { if (pe[to] >= 0) delete R.ec[pe[to]]; d[to] = nd; pred[to] = u; pe[to] = e; R.ec[e] = 'tree'; R.ntag[to] = fmt(nd); R.nc[to] = 'front'; R.line = 6; R.snap(`Relax ${edgeName(g, e)}: ${fmt(d[u])} + ${fmt(w)} = ${fmt(nd)} improves ${lab(g, to)}.`, { panel: panel() }); }
      else { delete R.ec[e]; R.line = 5; R.snap(`Relax ${edgeName(g, e)}: ${fmt(nd)} ≥ ${fmt(d[to])}, no change.`, { panel: panel() }); }
    }
    R.nc[u] = 'done';
  }
  const bf = bellmanFordPlain(g, s); let c;
  if (!bf) c = cert('no', 'Negative cycle reachable', 'Shortest distances are undefined. Run Bellman–Ford to see the cycle.');
  else { const bad = g.nodes.map((v, i) => i).filter(i => bf[i] !== d[i]); c = bad.length ? cert('no', 'Dijkstra is wrong here', `Bellman–Ford disagrees at ${bad.map(i => `${lab(g, i)} (true ${fmt(bf[i])}, Dijkstra ${fmt(d[i])})`).join(', ')}. A negative edge reached a settled vertex.`) : cert('yes', 'Distances verified', 'Bellman–Ford returns the same labels. Optimality certificate: for every edge u→v, d(v) ≤ d(u) + w(u,v), with equality on the red tree edges.'); }
  R.line = 7; R.snap('All reachable vertices settled. Red edges form the shortest-path tree.', { panel: c + panel() }, true);
  return { frames: R.frames };
}
function algBellmanFord(g, P) {
  const n = g.nodes.length, R = new Rec(), s = P.source; const d = Array(n).fill(Infinity), pred = Array(n).fill(-1), pe = Array(n).fill(-1); d[s] = 0;
  const arcs = []; g.edges.forEach((e, i) => { arcs.push([e.u, e.v, e.w, i]); if (!g.directed) arcs.push([e.v, e.u, e.w, i]); });
  g.nodes.forEach((v, i) => R.ntag[i] = i === s ? '0' : '∞');
  const panel = (pass) => h4(`Pass ${pass} of at most ${n - 1}`) + distTable(g, d, i => pred[i] >= 0 ? lab(g, pred[i]) : '—');
  R.line = 1; R.snap(`Bellman–Ford relaxes every edge, n − 1 = ${n - 1} times. After pass k, d(v) is optimal for paths of ≤ k edges.` + (!g.directed && g.edges.some(e => e.w < 0) ? ' In an undirected graph a negative edge is itself a negative cycle (walk it back and forth).' : ''), { panel: panel(0) });
  let pass = 0;
  for (pass = 1; pass <= n - 1; pass++) {
    let ch = false;
    for (const [u, v, w, e] of arcs) if (d[u] + w < d[v]) { if (pe[v] >= 0) delete R.ec[pe[v]]; d[v] = d[u] + w; pred[v] = u; pe[v] = e; R.ec[e] = 'tree'; R.ntag[v] = fmt(d[v]); R.nc = { [v]: 'cur', [u]: 'front' }; ch = true; R.line = 4; R.snap(`Pass ${pass}: ${lab(g, u)}→${lab(g, v)} improves d(${lab(g, v)}) to ${fmt(d[v])}.`, { panel: panel(pass) }); }
    R.nc = {}; R.line = 2; R.snap(`End of pass ${pass}${ch ? '' : ': nothing changed, so labels are final'}.`, { panel: panel(pass) });
    if (!ch) break;
  }
  let neg = null; for (const [u, v, w] of arcs) if (d[u] + w < d[v]) { neg = v; pred[v] = u; break; }
  if (neg !== null) {
    let x = neg; for (let i = 0; i < n; i++) x = pred[x];
    const cyc = [x]; let y = pred[x]; while (y !== x && cyc.length <= n) { cyc.push(y); y = pred[y]; }
    cyc.reverse(); R.ec = {}; R.nc = {}; cyc.forEach(v => R.nc[v] = 'cut');
    for (let i = 0; i < cyc.length; i++) { const a = cyc[i], b = cyc[(i + 1) % cyc.length]; const e = g.edges.findIndex(E => (E.u === a && E.v === b) || (!g.directed && E.u === b && E.v === a)); if (e >= 0) R.ec[e] = 'cut'; }
    R.line = 5; R.snap('An extra pass still improves a label: a negative cycle is reachable.', { panel: cert('no', 'Negative cycle', `${cyc.map(v => lab(g, v)).join(' → ')} → ${lab(g, cyc[0])}. Going around it lowers the cost without bound.`) }, true);
  } else { R.line = 5; R.snap('No edge can be relaxed further.', { panel: cert('yes', 'Distances certified', 'Every edge satisfies d(v) ≤ d(u) + w(u,v). Together with the tree paths realising each d(v), this proves optimality.') + panel(pass) }, true); }
  return { frames: R.frames, truncated: R.truncated };
}
