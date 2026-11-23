/* ============================================================
   Algorithms, part 3: colouring, random graphs, domination,
   computer-assisted search (simulated annealing, exhaustive enumeration)
   ============================================================ */

function maxClique(g) {
  const S = simpleNbrSets(g); let best = [];
  function bk(Rr, Pp, X) {
    if (!Pp.size && !X.size) { if (Rr.length > best.length) best = Rr.slice(); return; }
    if (Rr.length + Pp.size <= best.length) return;
    let piv = -1, pd = -1; for (const u of [...Pp, ...X]) { let c = 0; for (const v of Pp) if (S[u].has(v)) c++; if (c > pd) { pd = c; piv = u; } }
    for (const v of [...Pp]) { if (S[piv] && S[piv].has(v)) continue; bk(Rr.concat([v]), new Set([...Pp].filter(x => S[v].has(x))), new Set([...X].filter(x => S[v].has(x)))); Pp.delete(v); X.add(v); }
  }
  bk([], new Set(g.nodes.map((v, i) => i)), new Set()); return best;
}
function planarHints(g) {
  const n = g.nodes.length, m = new Set(g.edges.map(e => Math.min(e.u, e.v) + ',' + Math.max(e.u, e.v))).size; const tri = triangleCount(g);
  const out = [];
  if (n >= 3) out.push(m <= 3 * n - 6 ? `m = ${m} ≤ 3n − 6 = ${3 * n - 6} ✓` : `m = ${m} > 3n − 6 = ${3 * n - 6}: <b>not planar</b>`);
  if (n >= 3 && tri === 0) out.push(m <= 2 * n - 4 ? `triangle-free: m ≤ 2n − 4 = ${2 * n - 4} ✓` : `triangle-free but m > 2n − 4 = ${2 * n - 4}: <b>not planar</b>`);
  return out.join('<br>') + '<p class="note">These Euler-formula bounds are necessary, not sufficient. Passing them does not prove planarity.</p>';
}
function colorSummary(g, color, used) {
  const n = g.nodes.length; const clique = maxClique(g); const deg = Array(n).fill(0); g.edges.forEach(e => { deg[e.u]++; deg[e.v]++; });
  const D = Math.max(0, ...deg);
  return { clique, D, html: table(['bound', 'value'], [['colours used (upper bound on χ)', used], ['clique number ω (lower bound)', clique.length + ` <span class="note">{${clique.map(i => lab(g, i)).join(',')}}</span>`], ['Δ + 1 (greedy guarantee)', D + 1]], 'compact') + h4('Planarity quick test') + planarHints(g) };
}
function checkProper(g, color) { return g.edges.every(e => color[e.u] !== color[e.v]); }

function greedyOrder(g, mode, seed) {
  const n = g.nodes.length, ids = g.nodes.map((v, i) => i); const deg = Array(n).fill(0); g.edges.forEach(e => { deg[e.u]++; deg[e.v]++; });
  if (mode === 'largest') return ids.sort((a, b) => deg[b] - deg[a] || a - b);
  if (mode === 'random') { const r = rng(seed); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } return ids; }
  if (mode === 'smallestlast') { const S = simpleNbrSets(g), alive = new Set(ids), d = ids.map(i => S[i].size), out = []; while (alive.size) { let b = -1; for (const v of alive) if (b < 0 || d[v] < d[b]) b = v; alive.delete(b); out.unshift(b); for (const w of S[b]) if (alive.has(w)) d[w]--; } return out; }
  return ids;
}
function algGreedyColor(g, P) {
  const n = g.nodes.length, R = new Rec(), S = simpleNbrSets(g); const order = greedyOrder(g, P.order, P.seed); const color = Array(n).fill(-1); let used = 0;
  const names = { listed: 'the listed order', largest: 'largest degree first', smallestlast: 'smallest-last (degeneracy) order', random: 'a random order' };
  R.line = 0; R.snap(`Greedy colouring in ${names[P.order]}: give each vertex the smallest colour not used by an already coloured neighbour.`, { panel: h4('Order') + chips(order.map(i => lab(g, i))) });
  order.forEach((v, k) => {
    const forb = new Set([...S[v]].map(w => color[w]).filter(c => c >= 0)); let c = 0; while (forb.has(c)) c++; color[v] = c; used = Math.max(used, c + 1);
    R.nc[v] = 'k' + (c % 10); R.ntag[v] = String(c + 1);
    R.line = 1; R.snap(`${N(g, v)}: neighbours use {${[...forb].sort((a, b) => a - b).map(x => x + 1).join(', ')}}, so colour ${c + 1}.`, { ask: { type: 'number', answer: [c + 1], prompt: `Which colour number does ${g.nodes[v].label} get? (colours are 1, 2, 3, …)` }, panel: h4('Order') + chips(order.map((i, j) => j === k ? `<b>${lab(g, i)}</b>` : lab(g, i))) + h4(`Colours used: ${used}`) });
  });
  const s = colorSummary(g, color, used);
  R.line = 2; R.snap(`Greedy used ${used} colour${used > 1 ? 's' : ''}.`, { panel: cert(used === s.clique.length ? 'yes' : 'info', used === s.clique.length ? `Optimal: χ = ${used}` : `${s.clique.length} ≤ χ ≤ ${used}`, used === s.clique.length ? 'The colouring matches the clique lower bound.' : 'Greedy only certifies an upper bound. Try another order, DSatur, or the exact search.') + s.html }, true);
  return { frames: R.frames, truncated: R.truncated };
}
function algDSatur(g, P) {
  const n = g.nodes.length, R = new Rec(), S = simpleNbrSets(g); const color = Array(n).fill(-1); let used = 0;
  R.line = 0; R.snap('DSatur: repeatedly colour the vertex whose neighbours already show the most distinct colours (ties: higher degree).', { panel: '' });
  for (let k = 0; k < n; k++) {
    let best = -1, bs = -1, bd = -1;
    for (let v = 0; v < n; v++) { if (color[v] >= 0) continue; const sat = new Set([...S[v]].map(w => color[w]).filter(c => c >= 0)).size; const d = S[v].size; if (sat > bs || (sat === bs && d > bd)) { best = v; bs = sat; bd = d; } }
    const dsTies = g.nodes.map((v, i) => i).filter(v => color[v] < 0 && S[v].size === bd && new Set([...S[v]].map(w => color[w]).filter(c => c >= 0)).size === bs);
    const forb = new Set([...S[best]].map(w => color[w]).filter(c => c >= 0)); let c = 0; while (forb.has(c)) c++; color[best] = c; used = Math.max(used, c + 1);
    R.nc[best] = 'k' + (c % 10); R.ntag[best] = String(c + 1);
    R.line = 2; R.snap(`${N(g, best)} has saturation ${bs} (degree ${bd}): colour ${c + 1}.`, { ask: { type: 'vertex', answer: dsTies, prompt: 'Which vertex does DSatur colour next?' }, panel: h4(`Colours used: ${used}`) + table(['vertex', 'saturation'], g.nodes.map((v, i) => i).filter(i => color[i] < 0).map(i => [lab(g, i), new Set([...S[i]].map(w => color[w]).filter(c => c >= 0)).size]), 'compact') });
  }
  const s = colorSummary(g, color, used);
  R.line = 2; R.snap(`DSatur used ${used} colour${used > 1 ? 's' : ''}.`, { panel: cert(used === s.clique.length ? 'yes' : 'info', used === s.clique.length ? `Optimal: χ = ${used}` : `${s.clique.length} ≤ χ ≤ ${used}`, 'DSatur is exact on bipartite graphs, but still a heuristic in general.') + s.html }, true);
  return { frames: R.frames };
}
function exactColoring(g, k, budget = 3e6) {
  const n = g.nodes.length, S = simpleNbrSets(g).map(s => [...s]); const color = Array(n).fill(-1); let nodes = 0;
  function pick() { let b = -1, bs = -1, bd = -1; for (let v = 0; v < n; v++) { if (color[v] >= 0) continue; const sat = new Set(S[v].map(w => color[w]).filter(c => c >= 0)).size; if (sat > bs || (sat === bs && S[v].length > bd)) { b = v; bs = sat; bd = S[v].length; } } return b; }
  function rec(cnt, maxc) {
    if (++nodes > budget) return null; if (cnt === n) return true; const v = pick();
    for (let c = 0; c < Math.min(k, maxc + 2); c++) { if (S[v].some(w => color[w] === c)) continue; color[v] = c; const r = rec(cnt + 1, Math.max(maxc, c)); if (r) return true; if (r === null) return null; color[v] = -1; }
    return false;
  }
  const r = rec(0, -1); return { ok: r, color: color.slice(), nodes };
}
function algExactColor(g, P) {
  const n = g.nodes.length, R = new Rec(); const clique = maxClique(g); let ub = null;
  R.line = 0; R.snap(`Exact χ: lower bound ω = ${clique.length} from the clique {${clique.map(i => lab(g, i)).join(', ')}}. Try k = ω, ω+1, … until a k-colouring exists.`, { panel: '' });
  clique.forEach(i => R.nc[i] = 'cut');
  for (let k = Math.max(1, clique.length); k <= n; k++) {
    const r = exactColoring(g, k);
    if (r.ok === null) { R.snap(`k = ${k}: search budget exceeded.`, { panel: cert('info', 'Undecided', 'Too large for the in-browser search.') }, true); return { frames: R.frames }; }
    if (r.ok) { R.nc = {}; g.nodes.forEach((v, i) => { R.nc[i] = 'k' + (r.color[i] % 10); R.ntag[i] = String(r.color[i] + 1); }); R.line = 2; R.snap(`k = ${k} works.`, { panel: cert('yes', `χ = ${k}`, `${k > clique.length ? `Exhaustive search (${r.nodes.toLocaleString()} nodes) ruled out k = ${k - 1}. ` : ''}The colouring shown proves χ ≤ ${k}.` + (checkProper(g, r.color) ? '' : ' (check failed!)')) + colorSummary(g, r.color, k).html }, true); return { frames: R.frames }; }
    R.line = 2; R.snap(`k = ${k}: exhaustive backtracking (${r.nodes.toLocaleString()} nodes) finds no proper colouring, so χ > ${k}.`, { panel: '' });
  }
  return { frames: R.frames };
}

/* ---------- random graphs ---------- */
function giantTheory(c) { if (c <= 1) return 0; let S = 1; for (let i = 0; i < 200; i++) S = 1 - Math.exp(-c * S); return S; }
function sparkChart(points, theory, xmax, xlab, ylab, marks = []) {
  const w = 300, h = 150, l = 34, b = 26, t = 10, r = 10; const X = x => l + (w - l - r) * x / xmax, Y = y => t + (h - t - b) * (1 - y);
  let s = `<svg class="mini" viewBox="0 0 ${w} ${h}" role="img" aria-label="${ylab} against ${xlab}">`;
  for (let y = 0; y <= 1.0001; y += 0.5) s += `<line class="gl" x1="${l}" x2="${w - r}" y1="${Y(y)}" y2="${Y(y)}"/><text class="tk" x="${l - 4}" y="${Y(y) + 3}" text-anchor="end">${y}</text>`;
  for (let x = 0; x <= xmax + 1e-9; x += Math.max(1, Math.round(xmax / 5))) s += `<text class="tk" x="${X(x)}" y="${h - b + 13}" text-anchor="middle">${x}</text>`;
  for (const m of marks) if (m.x <= xmax) s += `<line class="mk" x1="${X(m.x)}" x2="${X(m.x)}" y1="${t}" y2="${h - b}"/><text class="tk" x="${X(m.x) + 3}" y="${t + 9}">${m.label}</text>`;
  if (theory) { let d = ''; for (let i = 0; i <= 120; i++) { const x = xmax * i / 120; d += (i ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(theory(x)).toFixed(1); } s += `<path class="th" d="${d}"/>`; }
  if (points.length) { s += `<path class="ob" d="${points.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('')}"/>`; const p = points[points.length - 1]; s += `<circle class="obp" cx="${X(p[0])}" cy="${Y(p[1])}" r="3.5"/>`; }
  s += `<text class="tk" x="${(l + w - r) / 2}" y="${h - 2}" text-anchor="middle">${xlab}</text></svg>`; return s;
}
function degreeHistogram(deg, c) {
  const mx = Math.max(8, ...deg); const cnt = Array(mx + 1).fill(0); deg.forEach(d => cnt[d]++); const n = deg.length;
  const pois = k => { let p = Math.exp(-c); for (let i = 1; i <= k; i++) p *= c / i; return p; };
  const top = Math.max(...cnt.map(x => x / n), ...cnt.map((x, k) => pois(k))) || 1;
  const w = 300, h = 120, l = 10, b = 18, bw = (w - 2 * l) / (mx + 1);
  let s = `<svg class="mini" viewBox="0 0 ${w} ${h}" role="img" aria-label="degree histogram with Poisson curve">`;
  cnt.forEach((x, k) => { const bh = (h - b - 8) * (x / n) / top; s += `<rect class="bar" x="${l + k * bw + 1}" y="${h - b - bh}" width="${Math.max(1, bw - 2)}" height="${bh}"/>`; if (mx <= 20 || k % 2 === 0) s += `<text class="tk" x="${l + k * bw + bw / 2}" y="${h - 5}" text-anchor="middle">${k}</text>`; });
  let d = ''; cnt.forEach((x, k) => { const y = h - b - (h - b - 8) * pois(k) / top; d += (k ? 'L' : 'M') + (l + k * bw + bw / 2).toFixed(1) + ',' + y.toFixed(1); }); s += `<path class="th" d="${d}"/></svg>`;
  return s;
}
function algRandom(g0, P) {
  const n = Math.max(2, Math.min(300, P.n | 0)), cmax = P.cmax, R = new Rec(), rand = rng(P.seed);
  const g = newGraph(false); for (let i = 0; i < n; i++) addNode(g, '0|' + i, String(i));
  const pmax = Math.min(1, cmax / (n - 1)); const pairs = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const r = rand(); if (r < pmax) pairs.push([r, i, j]); }
  pairs.sort((a, b) => a[0] - b[0]); g.edges = pairs.map(([r, u, v]) => ({ u, v, w: 1 }));
  forceLayout(g, undefined, n > 150 ? 160 : 260, 7, false);
  const parent = g.nodes.map((v, i) => i), size = Array(n).fill(1); const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  let k = 0; const pts = []; const steps = 28; const deg = Array(n).fill(0); const S = g.nodes.map(() => new Set()); let tri = 0;
  for (let s = 0; s <= steps; s++) {
    const c = cmax * s / steps, p = Math.min(1, c / (n - 1));
    while (k < pairs.length && pairs[k][0] < p) { const [, u, v] = pairs[k]; for (const w of S[u]) if (S[v].has(w)) tri++; S[u].add(v); S[v].add(u); deg[u]++; deg[v]++; const a = find(u), b = find(v); if (a !== b) { if (size[a] < size[b]) { parent[a] = b; size[b] += size[a]; } else { parent[b] = a; size[a] += size[b]; } } k++; }
    const roots = new Map(); for (let i = 0; i < n; i++) { const r = find(i); roots.set(r, (roots.get(r) || 0) + 1); }
    const sizes = [...roots.entries()].sort((a, b) => b[1] - a[1]); const giant = sizes[0][0]; const frac = sizes[0][1] / n; const second = sizes[1] ? sizes[1][1] : 0;
    pts.push([c, frac]);
    const nc = {}; for (let i = 0; i < n; i++) { const r = find(i); nc[i] = r === giant && sizes[0][1] > 1 ? 'giant' : size[r] === 1 && deg[i] === 0 ? 'iso' : 'small'; }
    let wedges = 0; deg.forEach(d => wedges += d * (d - 1) / 2); const trans = wedges ? 3 * tri / wedges : 0;
    const iso = deg.filter(d => d === 0).length;
    const panel = table(['', 'observed', 'G(n,p) prediction'], [['average degree c = (n−1)p', fmt(2 * k / n), fmt(c)], ['largest component / n', fmt(frac), fmt(giantTheory(c))], ['second-largest component', second, c < 1 ? 'O(log n)' : c > 1 ? 'O(log n)' : 'Θ(n^{2/3})'], ['isolated vertices', iso, fmt(n * Math.pow(1 - p, n - 1))], ['triangles', tri, fmt(n * (n - 1) * (n - 2) / 6 * p * p * p)], ['transitivity (clustering)', fmt(trans), fmt(p)]], 'compact')
      + h4('Giant component: observed (line) vs theory') + sparkChart(pts, giantTheory, cmax, 'average degree c', 'fraction', [{ x: 1, label: 'c = 1' }, { x: Math.log(n), label: 'ln n' }])
      + h4('Degree distribution vs Poisson(c)') + degreeHistogram(deg, 2 * k / n);
    const phase = c < 0.9 ? 'Subcritical: only small tree-like components.' : c < 1.15 ? 'Near the critical point c = 1: components merge rapidly.' : c < Math.log(n) ? 'Supercritical: one giant component, still some isolated vertices.' : 'Past c = ln n: isolated vertices disappear and the graph becomes connected with high probability.';
    R.line = s === 0 ? 0 : 1; R.snap(`p = ${p.toFixed(4)}, c = ${c.toFixed(2)}. ${phase}`, { graph: g, edgeLimit: k, nc, panel });
  }
  return { frames: R.frames, graph: g };
}

/* ---------- domination ---------- */
function closedNbhd(g) { const S = simpleNbrSets(g); return S.map((s, i) => [i, ...s]); }
function algDomGreedy(g, P) {
  const n = g.nodes.length, R = new Rec(), Nc = closedNbhd(g); const dom = Array(n).fill(false); const D = []; let left = n;
  const panel = () => h4(`Chosen (${D.length})`) + chips(D.map(i => lab(g, i))) + `<p class="note">${left} vertices still undominated.</p>`;
  R.line = 0; R.snap('Greedy: repeatedly pick the vertex whose closed neighbourhood covers the most undominated vertices.', { panel: panel() });
  while (left > 0) {
    let b = -1, bc = -1; for (let v = 0; v < n; v++) { const c = Nc[v].filter(x => !dom[x]).length; if (c > bc) { bc = c; b = v; } }
    const domTies = g.nodes.map((v, i) => i).filter(v => Nc[v].filter(x => !dom[x]).length === bc);
    D.push(b); for (const x of Nc[b]) if (!dom[x]) { dom[x] = true; left--; R.nc[x] = 'done'; } R.nc[b] = 'sel'; R.ntag[b] = '+' + bc;
    R.line = 3; R.snap(`Pick ${N(g, b)}: it newly dominates ${bc} vertices.`, { ask: { type: 'vertex', answer: domTies, prompt: 'Which vertex does greedy pick next?' }, panel: panel() });
  }
  const ex = exactDomination(g); const deg = Array(n).fill(0); g.edges.forEach(e => { deg[e.u]++; deg[e.v]++; }); const Dl = Math.max(0, ...deg);
  R.line = 4; R.snap(`Greedy dominating set of size ${D.length}.`, { panel: domCert(g, D, ex, Dl) }, true);
  return { frames: R.frames };
}
function exactDomination(g, budget = 2e6) {
  const n = g.nodes.length, Nc = closedNbhd(g); const cov = Array(n).fill(0); let undom = n, nodes = 0; const chosen = []; const deg1 = Math.max(...Nc.map(x => x.length));
  // greedy start
  let best = (() => { const d = Array(n).fill(false), out = []; let l = n; while (l) { let b = -1, bc = -1; for (let v = 0; v < n; v++) { const c = Nc[v].filter(x => !d[x]).length; if (c > bc) { bc = c; b = v; } } out.push(b); for (const x of Nc[b]) if (!d[x]) { d[x] = true; l--; } } return out; })();
  let aborted = false;
  function rec() {
    if (++nodes > budget) { aborted = true; return; }
    if (undom === 0) { if (chosen.length < best.length) best = chosen.slice(); return; }
    if (chosen.length + Math.ceil(undom / deg1) >= best.length) return;
    let u = 0; while (cov[u] > 0) u++;
    const opts = Nc[u].slice().sort((a, b) => Nc[b].filter(x => !cov[x]).length - Nc[a].filter(x => !cov[x]).length);
    for (const w of opts) { chosen.push(w); for (const x of Nc[w]) if (cov[x]++ === 0) undom--; rec(); for (const x of Nc[w]) if (--cov[x] === 0) undom++; chosen.pop(); if (aborted) return; }
  }
  if (n) rec(); return { set: best, exact: !aborted, nodes };
}
function domCert(g, D, ex, Dl) {
  const n = g.nodes.length; const lb = Math.ceil(n / (Dl + 1));
  const x = g.nodes.map((v, i) => ex.set.includes(i) ? 1 : 0);
  return cert(ex.exact && D.length === ex.set.length ? 'yes' : 'info', ex.exact ? `γ(G) = ${ex.set.length}` : `γ(G) ≤ ${ex.set.length}`, `This set: ${D.length}. ${ex.exact ? `Branch and bound (${ex.nodes.toLocaleString()} nodes) proves no set of size ${ex.set.length - 1} works.` : 'Exact search hit its budget.'} Counting bound: each vertex dominates at most Δ + 1 = ${Dl + 1}, so γ ≥ ⌈${n}/${Dl + 1}⌉ = ${lb}.`)
    + h4('As an integer program') + `<pre class="ilp">min  Σ x(v)
s.t. x(v) + Σ x(u) over u ∈ N(v)  ≥ 1   for every v
     x(v) ∈ {0, 1}</pre><p class="note">An optimal x: ${x.map((b, i) => b ? `x(${lab(g, i)})=1` : null).filter(Boolean).join(', ')}, all others 0. Relaxing to 0 ≤ x ≤ 1 gives a lower bound on γ. Its dual is a packing: vertices whose closed neighbourhoods are pairwise disjoint each need their own dominator.</p>`;
}
function algDomExact(g, P) {
  const n = g.nodes.length, R = new Rec(); const ex = exactDomination(g); const deg = Array(n).fill(0); g.edges.forEach(e => { deg[e.u]++; deg[e.v]++; }); const Dl = Math.max(0, ...deg);
  const Nc = closedNbhd(g); ex.set.forEach(v => { R.nc[v] = 'sel'; }); g.nodes.forEach((v, i) => { if (!ex.set.includes(i)) R.nc[i] = 'done'; });
  R.line = 0; R.snap(`Minimum dominating set: ${ex.set.map(i => lab(g, i)).join(', ')}.`, { panel: domCert(g, ex.set, ex, Dl) }, true);
  return { frames: R.frames };
}

/* ---------- simulated annealing for extremal problems ---------- */
const EXTREMAL = {
  tri: { name: 'triangle', known: n => Math.floor(n * n / 4), thm: 'Mantel: ex(n, K₃) = ⌊n²/4⌋, attained only by the balanced complete bipartite graph.' },
  c4: { name: '4-cycle', known: n => [0, 0, 1, 3, 4, 6, 7, 9, 11, 13, 16, 18, 21, 24, 27, 30, 33, 36, 39, 42, 46, 50][n], thm: 'ex(n, C₄) is known exactly only for small n (OEIS A006855); asymptotically it is ½·n^{3/2}.' },
  k4: { name: 'K₄', known: n => Math.floor(n * n / 3), thm: 'Turán: ex(n, K₄) = ⌊n²/3⌋, attained by the balanced complete 3-partite graph.' },
};
function violationsThrough(M, n, u, v, kind) {
  if (kind === 'tri') { let c = 0; for (let w = 0; w < n; w++) if (M[u][w] && M[v][w]) c++; return c; }
  if (kind === 'k4') { const C = []; for (let w = 0; w < n; w++) if (M[u][w] && M[v][w]) C.push(w); let c = 0; for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) if (M[C[i]][C[j]]) c++; return c; }
  let c = 0; for (let a = 0; a < n; a++) { if (a === v || !M[u][a]) continue; for (let b = 0; b < n; b++) if (b !== u && b !== a && M[v][b] && M[a][b]) c++; } return c;
}
function algAnneal(g0, P) {
  const n = Math.max(3, Math.min(20, P.n | 0)), kind = P.forbid, iters = Math.max(1000, P.iters | 0), rand = rng(P.seed), R = new Rec(), info = EXTREMAL[kind];
  const M = Array.from({ length: n }, () => new Uint8Array(n)); let m = 0, viol = 0; const lam = 1.6;
  const base = newGraph(false); for (let i = 0; i < n; i++) addNode(base, '0|' + i, String(i)); circleLayout(base);
  const snapG = (Mx) => { const g = { directed: false, parts: 1, weighted: false, nodes: base.nodes, edges: [] }; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Mx[i][j]) g.edges.push({ u: i, v: j, w: 1 }); return g; };
  let best = -1, bestM = null; const hist = [];
  const T0 = 1.5, T1 = 0.03; const every = Math.floor(iters / 60);
  const markBad = (g) => { const ec = {}; g.edges.forEach((e, i) => { if (violationsThrough(M, n, e.u, e.v, kind) > 0) ec[i] = 'cut'; }); return ec; };
  const panel = (T) => table(['', 'value'], [['edges', m], [`${info.name}s through edges`, viol], ['temperature', T.toFixed(3)], ['best feasible so far', best < 0 ? '—' : best], [`known ex(${n}, ${info.name})`, info.known(n) ?? '?']], 'compact') + h4('Energy = −edges + λ·violations') + sparkChart(hist.map(([i, e]) => [i / iters * 10, e]), null, 10, 'progress', 'energy');
  for (let it = 0; it <= iters; it++) {
    const T = T0 * Math.pow(T1 / T0, it / iters);
    const u = Math.floor(rand() * n); let v = Math.floor(rand() * (n - 1)); if (v >= u) v++;
    const dv = violationsThrough(M, n, u, v, kind); const add = !M[u][v];
    const dE = add ? (-1 + lam * dv) : (1 - lam * dv);
    if (dE <= 0 || rand() < Math.exp(-dE / T)) { M[u][v] = M[v][u] = add ? 1 : 0; m += add ? 1 : -1; viol += add ? dv : -dv; }
    if (viol === 0 && m > best) { best = m; bestM = M.map(r => r.slice()); }
    if (it % every === 0) { const e = -m + lam * viol; hist.push([it, e]); const g = snapG(M); R.ec = markBad(g); R.line = 2; R.snap(`Step ${it.toLocaleString()} of ${iters.toLocaleString()}: toggle random pairs; accept worse moves with probability e^(−ΔE/T).`, { graph: g, panel: panel(T) }); }
  }
  // normalise energy chart to 0..1
  const es = hist.map(h => h[1]), lo = Math.min(...es), hi = Math.max(...es); R.frames.forEach(f => { f.panel = f.panel.replace(/<svg class="mini"[\s\S]*<\/svg>/, sparkChart(hist.filter(h => true).map(([i, e]) => [i / iters * 10, hi > lo ? (e - lo) / (hi - lo) : 0]), null, 10, 'progress (energy scaled to 0–1)', 'energy')); });
  const g = snapG(bestM || M); const known = info.known(n);
  const col = twoColoring(g); const nc = {}; if (col) g.nodes.forEach((v, i) => nc[i] = 'k' + col[i]);
  const degs = g.nodes.map(() => 0); g.edges.forEach(e => { degs[e.u]++; degs[e.v]++; });
  R.ec = {}; R.line = 5; R.snap(`Best ${info.name}-free graph found: ${best} edges.`, { graph: g, nc, panel: cert(best === known ? 'yes' : 'info', best === known ? 'Matches the known extremal number' : `Found ${best}, known value ${known}`, `${info.thm} ${best < known ? 'Annealing is a heuristic: a miss is not evidence against the theorem. Rerun with more steps or another seed.' : ''}`) + `<p class="note">Degree sequence: ${degs.sort((a, b) => b - a).join(' ')}${col ? '. The graph is bipartite (colour classes shown).' : ''}</p>` }, true);
  return { frames: R.frames };
}

/* ---------- exhaustive generation + conjecture testing (mini-PHOEG) ---------- */
function popcnt(x) { let c = 0; while (x) { x &= x - 1; c++; } return c; }
function invKey(adj, n) {
  const deg = adj.map(popcnt); const tri = adj.map((a, i) => { let t = 0; for (let j = 0; j < n; j++) if (a >> j & 1) t += popcnt(a & adj[j]); return t / 2; });
  const vk = adj.map((a, i) => { const nd = []; for (let j = 0; j < n; j++) if (a >> j & 1) nd.push(deg[j]); nd.sort((x, y) => x - y); return deg[i] + ':' + tri[i] + ':' + nd.join('.'); });
  return { key: vk.slice().sort().join('|'), vk };
}
function isoCheck(a1, a2, n, vk1, vk2) {
  const map = Array(n).fill(-1), used = Array(n).fill(false);
  const order = [...Array(n).keys()].sort((x, y) => popcnt(a1[y]) - popcnt(a1[x]));
  function rec(k) {
    if (k === n) return true; const v = order[k];
    for (let w = 0; w < n; w++) { if (used[w] || vk1[v] !== vk2[w]) continue; let ok = true; for (let j = 0; j < k; j++) { const u = order[j]; if (((a1[v] >> u) & 1) !== ((a2[w] >> map[u]) & 1)) { ok = false; break; } } if (!ok) continue; map[v] = w; used[w] = true; if (rec(k + 1)) return true; used[w] = false; map[v] = -1; }
    return false;
  }
  return rec(0);
}
const GEN_CACHE = [[[]], [[0]]];
function graphsOfOrder(n) {
  // vertex augmentation: every graph on n vertices is G' + a vertex for some G' on n−1 vertices
  for (let k = GEN_CACHE.length; k <= n; k++) {
    const buckets = new Map(), out = [];
    for (const adj of GEN_CACHE[k - 1]) for (let S = 0; S < (1 << (k - 1)); S++) {
      const a = adj.slice(); for (let j = 0; j < k - 1; j++) if (S >> j & 1) a[j] |= 1 << (k - 1); a.push(S);
      const { key, vk } = invKey(a, k); let list = buckets.get(key); if (!list) buckets.set(key, list = []);
      if (list.some(b => isoCheck(a, b.a, k, vk, b.vk))) continue; list.push({ a, vk }); out.push(a);
    }
    GEN_CACHE.push(out);
  }
  return GEN_CACHE[n];
}
function invariantsOf(adj, n) {
  const deg = adj.map(popcnt); const m = deg.reduce((s, x) => s + x, 0) / 2;
  let alpha = 0, omega = 0; for (let S = 0; S < (1 << n); S++) { const c = popcnt(S); if (c <= alpha && c <= omega) continue; let ind = true, cl = true; for (let i = 0; i < n && (ind || cl); i++) if (S >> i & 1) { const nb = adj[i] & S; if (nb) ind = false; if ((nb | (1 << i)) !== S) cl = false; } if (ind && c > alpha) alpha = c; if (cl && c > omega) omega = c; }
  // chromatic number
  let chi = n ? 1 : 0; if (m > 0) { for (let k = 2; k <= n; k++) { const col = Array(n).fill(-1); const rec = i => { if (i === n) return true; for (let c = 0; c < k; c++) { let ok = true; for (let j = 0; j < i; j++) if ((adj[i] >> j & 1) && col[j] === c) { ok = false; break; } if (ok) { col[i] = c; if (rec(i + 1)) return true; } } col[i] = -1; return false; }; if (rec(0)) { chi = k; break; } } }
  let diam = 0, rad = Infinity, conn = 1; for (let s = 0; s < n; s++) { const d = Array(n).fill(-1); d[s] = 0; const Q = [s]; for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (let v = 0; v < n; v++) if ((adj[u] >> v & 1) && d[v] < 0) { d[v] = d[u] + 1; Q.push(v); } } if (d.includes(-1)) conn = 0; const e = Math.max(...d); diam = Math.max(diam, e); rad = Math.min(rad, e); }
  if (!conn) { diam = Infinity; rad = Infinity; }
  let tri = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (adj[i] >> j & 1) tri += popcnt(adj[i] & adj[j] & ~((2 << j) - 1));
  let girth = Infinity; for (let s = 0; s < n; s++) { const d = Array(n).fill(-1), p = Array(n).fill(-1); d[s] = 0; const Q = [s]; for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (let v = 0; v < n; v++) if (adj[u] >> v & 1) { if (d[v] < 0) { d[v] = d[u] + 1; p[v] = u; Q.push(v); } else if (p[u] !== v) girth = Math.min(girth, d[u] + d[v] + 1); } } }
  // components, bipartite, matching number ν, domination number γ, vertex connectivity κ (exhaustive; n ≤ 8)
  let comp = 0; { const seen = Array(n).fill(false); for (let s0 = 0; s0 < n; s0++) if (!seen[s0]) { comp++; const Q = [s0]; seen[s0] = true; for (let h = 0; h < Q.length; h++) for (let v = 0; v < n; v++) if ((adj[Q[h]] >> v & 1) && !seen[v]) { seen[v] = true; Q.push(v); } } }
  let bip = 1; { const c = Array(n).fill(-1); for (let s0 = 0; s0 < n && bip; s0++) if (c[s0] < 0) { c[s0] = 0; const Q = [s0]; for (let h = 0; h < Q.length && bip; h++) { const u = Q[h]; for (let v = 0; v < n; v++) if (adj[u] >> v & 1) { if (c[v] < 0) { c[v] = 1 - c[u]; Q.push(v); } else if (c[v] === c[u]) { bip = 0; break; } } } } }
  const memo = new Map(); const nuRec = mask => { if (!mask) return 0; if (memo.has(mask)) return memo.get(mask); let i = 0; while (!(mask >> i & 1)) i++; const rest = mask & ~(1 << i); let best = nuRec(rest); let nb = adj[i] & rest; while (nb) { const j = 31 - Math.clz32(nb & -nb); nb &= nb - 1; best = Math.max(best, 1 + nuRec(rest & ~(1 << j))); } memo.set(mask, best); return best; };
  const nu = nuRec((1 << n) - 1);
  let gamma = n; for (let S = 0; S < (1 << n); S++) { const c = popcnt(S); if (c >= gamma) continue; let dom = S; for (let i = 0; i < n; i++) if (S >> i & 1) dom |= adj[i]; if (dom === (1 << n) - 1) gamma = c; }
  const connectedWithout = X => { const keep = [...Array(n).keys()].filter(i => !(X >> i & 1)); if (keep.length <= 1) return true; const seen = new Set([keep[0]]), Q = [keep[0]]; for (let h = 0; h < Q.length; h++) for (const v of keep) if ((adj[Q[h]] >> v & 1) && !seen.has(v)) { seen.add(v); Q.push(v); } return seen.size === keep.length; };
  let kappa = 0; if (n && conn) { const complete = deg.every(d => d === n - 1); if (complete) kappa = n - 1; else { kappa = n - 2; for (let S = 1; S < (1 << n); S++) { const c = popcnt(S); if (c < kappa && c <= n - 2 && !connectedWithout(S)) kappa = c; } } }
  return { n, m, dmin: n ? Math.min(...deg) : 0, dmax: n ? Math.max(...deg) : 0, alpha, omega, chi, diam, rad, conn, tri, girth, comp, bip, nu, gamma, kappa };
}
const INV_NAMES = { n: 'order n', m: 'size m', dmin: 'minimum degree δ', dmax: 'maximum degree Δ', alpha: 'independence number α', omega: 'clique number ω', chi: 'chromatic number χ', diam: 'diameter', rad: 'radius', tri: 'triangles', girth: 'girth', conn: 'connected (0/1)', comp: 'components', bip: 'bipartite (0/1)', nu: 'matching number ν', gamma: 'domination number γ', kappa: 'connectivity κ' };

/* tiny safe expression evaluator: numbers, variables, + − * / ^, comparisons, && ||, !, ( ), floor ceil sqrt min max abs */
function compileExpr(src) {
  const toks = []; const re = /\s*(\d+(?:\.\d+)?|[A-Za-z_]\w*|<=|>=|==|!=|&&|\|\||[-+*/^()<>!,])/y; let i = 0;
  while (i < src.length) { re.lastIndex = i; const m = re.exec(src); if (!m) { if (/^\s*$/.test(src.slice(i))) break; throw new Error(`Cannot read the expression near “${src.slice(i, i + 8)}”.`); } toks.push(m[1]); i = re.lastIndex; }
  let p = 0; const peek = () => toks[p], next = () => toks[p++];
  const FN = { floor: Math.floor, ceil: Math.ceil, sqrt: Math.sqrt, abs: Math.abs, min: Math.min, max: Math.max };
  function primary() {
    const t = next(); if (t === undefined) throw new Error('The expression ends too early.');
    if (t === '(') { const e = or(); if (next() !== ')') throw new Error('Missing “)”.'); return e; }
    if (t === '-') { const e = unary(); return v => -e(v); }
    if (t === '!') { const e = unary(); return v => e(v) ? 0 : 1; }
    if (/^\d/.test(t)) { const x = +t; return () => x; }
    if (FN[t]) { if (next() !== '(') throw new Error(`${t} needs parentheses.`); const args = [or()]; while (peek() === ',') { next(); args.push(or()); } if (next() !== ')') throw new Error('Missing “)”.'); return v => FN[t](...args.map(a => a(v))); }
    if (t in INV_NAMES) return v => v[t];
    throw new Error(`Unknown name “${t}”. Use ${Object.keys(INV_NAMES).join(', ')}.`);
  }
  function unary() { return primary(); }
  function pow() { let a = unary(); while (peek() === '^') { next(); const b = unary(); const A = a; a = v => Math.pow(A(v), b(v)); } return a; }
  function mul() { let a = pow(); while (peek() === '*' || peek() === '/') { const o = next(), b = pow(), A = a; a = o === '*' ? v => A(v) * b(v) : v => A(v) / b(v); } return a; }
  function add() { let a = mul(); while (peek() === '+' || peek() === '-') { const o = next(), b = mul(), A = a; a = o === '+' ? v => A(v) + b(v) : v => A(v) - b(v); } return a; }
  function cmp() { let a = add(); while (['<', '>', '<=', '>=', '==', '!='].includes(peek())) { const o = next(), b = add(), A = a; a = { '<': v => +(A(v) < b(v)), '>': v => +(A(v) > b(v)), '<=': v => +(A(v) <= b(v)), '>=': v => +(A(v) >= b(v)), '==': v => +(A(v) === b(v)), '!=': v => +(A(v) !== b(v)) }[o]; } return a; }
  function and() { let a = cmp(); while (peek() === '&&') { next(); const b = cmp(), A = a; a = v => +(A(v) && b(v)); } return a; }
  function or() { let a = and(); while (peek() === '||') { next(); const b = and(), A = a; a = v => +(A(v) || b(v)); } return a; }
  const f = or(); if (p < toks.length) throw new Error(`Unexpected “${toks[p]}”.`); return f;
}
function convexHull(pts) {
  const P = [...new Map(pts.map(p => [p[0] + ',' + p[1], p])).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (P.length < 3) return P;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of P.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function scatterPlot(data, xk, yk, isBad) {
  const pts = data.filter(d => Number.isFinite(d.inv[xk]) && Number.isFinite(d.inv[yk]));
  if (!pts.length) return '<p class="note">No finite values to plot.</p>';
  const agg = new Map(); for (const d of pts) { const k = d.inv[xk] + ',' + d.inv[yk]; const a = agg.get(k) || { x: d.inv[xk], y: d.inv[yk], c: 0, bad: 0 }; a.c++; if (isBad(d)) a.bad++; agg.set(k, a); }
  const A = [...agg.values()]; const x0 = Math.min(...A.map(a => a.x)), x1 = Math.max(...A.map(a => a.x)), y0 = Math.min(...A.map(a => a.y)), y1 = Math.max(...A.map(a => a.y));
  const w = 300, h = 220, l = 30, b = 30, t = 10, r = 12; const X = x => l + (w - l - r) * (x1 > x0 ? (x - x0) / (x1 - x0) : 0.5), Y = y => t + (h - t - b) * (1 - (y1 > y0 ? (y - y0) / (y1 - y0) : 0.5));
  const cmax = Math.max(...A.map(a => a.c));
  let s = `<svg class="mini scatter" viewBox="0 0 ${w} ${h}" role="img" aria-label="${INV_NAMES[yk]} against ${INV_NAMES[xk]}">`;
  const hull = convexHull(A.map(a => [a.x, a.y])); if (hull.length >= 3) s += `<polygon class="hull" points="${hull.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
  const ticks = (lo, hi) => { const st = Math.max(1, Math.ceil((hi - lo) / 6)); const o = []; for (let v = lo; v <= hi; v += st) o.push(v); return o; };
  for (const v of ticks(x0, x1)) s += `<text class="tk" x="${X(v)}" y="${h - b + 13}" text-anchor="middle">${v}</text>`;
  for (const v of ticks(y0, y1)) s += `<text class="tk" x="${l - 5}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`;
  for (const a of A) s += `<circle class="${a.bad ? 'bad' : 'pt'}" cx="${X(a.x).toFixed(1)}" cy="${Y(a.y).toFixed(1)}" r="${(2.5 + 4 * Math.log1p(a.c) / Math.log1p(cmax)).toFixed(1)}"><title>(${a.x}, ${a.y}): ${a.c} graph${a.c > 1 ? 's' : ''}${a.bad ? `, ${a.bad} counterexample${a.bad > 1 ? 's' : ''}` : ''}</title></circle>`;
  s += `<text class="tk" x="${(l + w - r) / 2}" y="${h - 3}" text-anchor="middle">${INV_NAMES[xk]}</text><text class="tk" transform="translate(9 ${(t + h - b) / 2}) rotate(-90)" text-anchor="middle">${INV_NAMES[yk]}</text></svg>`;
  return s;
}
const INV_CACHE = [];
function invariantsAll(k) { return INV_CACHE[k] || (INV_CACHE[k] = graphsOfOrder(k).map(a => ({ a, inv: invariantsOf(a, k) }))); }
/* ---------- extremal search over all small graphs (max or min of an expression under a condition) ---------- */
function extremalTable(P) {
  const nmax = Math.max(1, Math.min(8, P.n | 0)), nmin = Math.max(1, Math.min(nmax, (P.from | 0) || 1));
  const obj = compileExpr(P.obj || 'm'), cond = (P.cond || '').trim() ? compileExpr(P.cond) : () => 1, guess = (P.guess || '').trim() ? compileExpr(P.guess) : null;
  const max = P.goal !== 'min', rows = [];
  for (let k = nmin; k <= nmax; k++) {
    const data = invariantsAll(k).filter(d => (P.scope !== 'connected' || d.inv.conn) && cond(d.inv));
    const vals = data.map(d => obj(d.inv)).map(v => (typeof v === 'number' && Number.isFinite(v)) ? v : null);
    const fin = vals.filter(v => v !== null); let best = null, ext = [];
    if (fin.length) { best = max ? Math.max(...fin) : Math.min(...fin); ext = data.filter((d, i) => vals[i] === best); }
    const gv = guess ? guess({ n: k }) : null;
    rows.push({ k, count: data.length, best, ext, data, guess: gv, match: guess ? (best === null ? null : Math.abs(gv - best) < 1e-9) : null });
  }
  return { rows, max, nmax, nmin };
}
/* ---------- extremal search, method 2: an integer linear program solved by branch and bound ---------- */
function kSubsets(n, k) { const out = [], c = []; (function r(s) { if (c.length === k) { out.push(c.slice()); return; } for (let i = s; i < n; i++) { c.push(i); r(i + 1); c.pop(); } })(0); return out; }
/* Reads a condition such as "tri == 0 && dmax <= 3" into linear constraints on the edge variables x_uv.
   Returns { atoms: [{kind, k, text}], bad: [unsupported pieces] }. */
function ilpParseCond(src) {
  const atoms = [], bad = [];
  for (const raw of (src || '').split('&&').map(t => t.trim()).filter(Boolean)) {
    const m = raw.match(/^\(?\s*([a-z]+)\s*(<=|<|==|>=|>)\s*(\d+)\s*\)?$/);
    if (!m) { bad.push(raw); continue; }
    let [, v, op, num] = m; let k = +num;
    const up = op === '<' ? k - 1 : k, lo = op === '>' ? k + 1 : k;
    if (v === 'tri' && (op === '==' || op === '<=' || op === '<') && (op === '<' ? k <= 1 : k === 0)) atoms.push({ kind: 'clique', k: 3, text: raw });
    else if (v === 'omega' && (op === '<=' || op === '<') && up >= 1 && up <= 4) atoms.push({ kind: 'clique', k: up + 1, text: raw });
    else if (v === 'girth' && (op === '>=' || op === '>') && lo <= 6) { for (let c = 3; c < lo; c++) atoms.push({ kind: 'cycle', k: c, text: raw }); }
    else if (v === 'alpha' && (op === '<=' || op === '<') && up >= 1 && up <= 4) atoms.push({ kind: 'indep', k: up + 1, text: raw });
    else if (v === 'dmax' && (op === '<=' || op === '<')) atoms.push({ kind: 'dmax', k: up, text: raw });
    else if (v === 'dmin' && (op === '>=' || op === '>')) atoms.push({ kind: 'dmin', k: lo, text: raw });
    else if (v === 'm' && (op === '<=' || op === '<' || op === '>=' || op === '>' || op === '==')) atoms.push({ kind: 'size', op: op === '==' ? '=' : op[0] === '<' ? '<=' : '>=', k: op[0] === '<' ? up : op[0] === '>' ? lo : k, text: raw });
    else bad.push(raw);
  }
  return { atoms, bad };
}
function ilpModel(n, atoms) {
  const V = [], id = []; for (let i = 0; i < n; i++) id.push([]); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { id[i][j] = id[j][i] = V.length; V.push([i, j]); }
  const C = [], seen = new Set();
  const add = (vars, sense, rhs, tag) => { const key = vars.slice().sort((a, b) => a - b).join(',') + sense + rhs; if (seen.has(key)) return; seen.add(key); C.push({ vars, sense, rhs, tag }); };
  const cyclesOf = S => { const [a, ...rest] = S, out = []; const perm = (arr, k) => { if (k === arr.length) { if (arr[0] < arr[arr.length - 1]) out.push([a, ...arr]); return; } for (let i = k; i < arr.length; i++) { [arr[k], arr[i]] = [arr[i], arr[k]]; perm(arr, k + 1); [arr[k], arr[i]] = [arr[i], arr[k]]; } }; perm(rest.slice(), 0); return out; };
  for (const at of atoms) {
    if (at.kind === 'clique' || at.kind === 'indep') for (const S of kSubsets(n, at.k)) { const vs = []; for (let a = 0; a < S.length; a++) for (let b = a + 1; b < S.length; b++) vs.push(id[S[a]][S[b]]); if (at.kind === 'clique') add(vs, '<=', vs.length - 1, `no K${at.k}`); else add(vs, '>=', 1, `no independent ${at.k}-set`); }
    if (at.kind === 'cycle') for (const S of kSubsets(n, at.k)) for (const cyc of cyclesOf(S)) add(cyc.map((u, i) => id[u][cyc[(i + 1) % cyc.length]]), '<=', at.k - 1, `no C${at.k}`);
    if (at.kind === 'dmax' || at.kind === 'dmin') for (let v = 0; v < n; v++) add([...Array(n).keys()].filter(w => w !== v).map(w => id[v][w]), at.kind === 'dmax' ? '<=' : '>=', at.k, `degree of ${v}`);
    if (at.kind === 'size') add(V.map((_, i) => i), at.op, at.k, 'size');
  }
  return { V, C, id };
}
function ilpSolve(n, M, max, limit = 4e6) {
  const { V, C } = M, nv = V.length;
  const S = C.map(c => ({ vars: c.vars, sense: c.sense, rhs: c.rhs, one: 0, und: c.vars.length }));
  const byVar = V.map(() => []); S.forEach((c, ci) => c.vars.forEach(v => byVar[v].push(ci)));
  const x = new Int8Array(nv).fill(-1); let best = max ? -1 : Infinity, bestX = null, nodes = 0, m = 0, aborted = false;
  if (S.some(c => (c.sense === '>=' || c.sense === '=') && c.und < c.rhs)) return { best: null, nodes: 0, aborted: false };
  const okC = c => !((c.sense === '<=' || c.sense === '=') && c.one > c.rhs) && !((c.sense === '>=' || c.sense === '=') && c.one + c.und < c.rhs);
  (function rec(k) {
    if (++nodes > limit) { aborted = true; return; }
    if (max ? m + (nv - k) <= best : m >= best) return;
    if (k === nv) { best = m; bestX = Array.from(x); return; }
    for (const val of (max ? [1, 0] : [0, 1])) {
      const T = byVar[k]; for (const ci of T) { S[ci].und--; if (val) S[ci].one++; }
      if (T.every(ci => okC(S[ci]))) { x[k] = val; m += val; rec(k + 1); m -= val; x[k] = -1; }
      for (const ci of T) { S[ci].und++; if (val) S[ci].one--; }
      if (aborted) return;
    }
  })(0);
  if (bestX === null) return { best: null, nodes, aborted };
  const adj = Array(n).fill(0); bestX.forEach((b, i) => { if (b) { const [u, v] = V[i]; adj[u] |= 1 << v; adj[v] |= 1 << u; } });
  return { best, nodes, aborted, adj };
}
function ilpText(n, M, max) {
  const xv = i => `x${M.V[i][0]}${n > 10 ? '_' : ''}${M.V[i][1]}`;
  const wrap = (terms, lead, width = 34) => { const out = []; let cur = lead; terms.forEach((t, k) => { const piece = (k ? ' + ' : '') + t; if (cur.length + piece.length > width && k) { out.push(cur); cur = ' '.repeat(lead.length) + '+ ' + t; } else cur += piece; }); out.push(cur); return out.join('\n'); };
  const groups = new Map(); M.C.forEach(c => { if (!groups.has(c.tag)) groups.set(c.tag, []); groups.get(c.tag).push(c); });
  const lines = [wrap(M.V.map((_, i) => xv(i)), max ? 'max  ' : 'min  '), 's.t.'];
  for (const [tag, cs] of groups) { cs.slice(0, 3).forEach(c => lines.push(wrap(c.vars.map(xv), '     ') + ` ${c.sense === '<=' ? '≤' : c.sense === '>=' ? '≥' : '='} ${c.rhs}`)); if (cs.length > 3) lines.push(`     … ${cs.length} constraints “${tag}” in total`); }
  lines.push(`     x ∈ {0, 1}   (${M.V.length} variables, one per vertex pair)`);
  const L = ['\\ extremal ILP on ' + n + ' vertices', max ? 'Maximize' : 'Minimize', ' obj: ' + M.V.map((_, i) => xv(i)).join(' + '), 'Subject To'];
  M.C.forEach((c, k) => L.push(` c${k + 1}: ${c.vars.map(xv).join(' + ')} ${c.sense === '=' ? '=' : c.sense} ${c.rhs}`));
  L.push('Binary', ' ' + M.V.map((_, i) => xv(i)).join(' '), 'End');
  return { text: lines.join('\n'), lpFile: L.join('\n') };
}
/* ---------- extremal search, method 3: simulated annealing on one order at a time ---------- */
function extremalAnneal(k, P, obj, cond, steps, rand) {
  const max = P.goal !== 'min', sg = max ? 1 : -1, lam = 2 * k + 2, conn = P.scope === 'connected';
  const a = Array(k).fill(0); let inv = invariantsOf(a, k);
  const feas = v => cond(v) && (!conn || v.conn);
  const val = v => { const o = obj(v); return Number.isFinite(o) ? o : (max ? -1e6 : 1e6); };
  const score = v => sg * val(v) - (feas(v) ? 0 : lam);
  let cur = score(inv), best = feas(inv) ? val(inv) : null, bestA = feas(inv) ? a.slice() : null; const snaps = [];
  if (k < 2) return { best, bestA, snaps };
  for (let it = 1; it <= steps; it++) {
    const T = 1.5 * Math.pow(0.02 / 1.5, it / steps);
    const u = Math.floor(rand() * k); let w = Math.floor(rand() * (k - 1)); if (w >= u) w++;
    a[u] ^= 1 << w; a[w] ^= 1 << u; const ni = invariantsOf(a, k), ns = score(ni);
    if (ns >= cur || rand() < Math.exp((ns - cur) / T)) { cur = ns; inv = ni; if (feas(ni) && (best === null || (max ? val(ni) > best : val(ni) < best))) { best = val(ni); bestA = a.slice(); } }
    else { a[u] ^= 1 << w; a[w] ^= 1 << u; }
    if (it % Math.max(1, Math.floor(steps / 12)) === 0) snaps.push({ it, T, a: a.slice(), val: val(inv), feas: feas(inv), best });
  }
  return { best, bestA, snaps };
}
function algExtremalILP(P) {
  const R = new Rec(), max = P.goal !== 'min', word = max ? 'maximum' : 'minimum';
  const nmax = Math.max(1, Math.min(9, P.n | 0)), nmin = Math.max(2, Math.min(nmax, (P.from | 0) || 1));
  const box = { x0: 150, x1: 650, y0: 70, y1: 450 };
  const toGraph = (a, k) => { const g = newGraph(false); for (let i = 0; i < k; i++) addNode(g, '0|' + i, String(i)); for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) if (a[i] >> j & 1) g.edges.push({ u: i, v: j, w: 1 }); if (!(g.edges.length && twoColoring(g) && layoutGraph(g, 'columns', box))) forceLayout(g, box, 300, 5); return g; };
  const nc = g => { const c = g.edges.length ? twoColoring(g) : null, o = {}; if (c) g.nodes.forEach((v, i) => { o[i] = 'k' + c[i]; }); return o; };
  const why = [];
  if ((P.obj || 'm').trim() !== 'm') why.push(`the objective must be linear in the edge variables; this solver handles <code>m</code> (the number of edges), not <code>${esc(P.obj)}</code>`);
  if (P.scope === 'connected') why.push('connectivity needs exponentially many cut constraints; choose “all” graphs, or use the exhaustive method');
  const { atoms, bad } = ilpParseCond(P.cond);
  if (bad.length) why.push(`these conditions have no linear form here: <code>${bad.map(esc).join('</code>, <code>')}</code>. Supported: <code>tri == 0</code>, <code>omega &lt;= k</code>, <code>girth &gt;= g</code> (g ≤ 6), <code>alpha &lt;= k</code>, <code>dmax &lt;= k</code>, <code>dmin &gt;= k</code>, <code>m &gt;= k</code>, joined by <code>&amp;&amp;</code>`);
  if (why.length) { R.line = 7; R.snap('This question cannot be written as the integer program used here.', { graph: toGraph([0, 0, 0], 3), panel: cert('info', 'Not an ILP of this form', why.map(w => '• ' + w).join('<br>') + '<br>Switch the method to exhaustive search (exact up to 8 vertices) or simulated annealing (any expression, heuristic).') }, true); return { frames: R.frames }; }
  const M0 = ilpModel(nmax, atoms), Tx = ilpText(nmax, M0, max);
  const intro = fold('ext-ilp-model', `The ILP for n = ${nmax}: ${M0.V.length} variables, ${M0.C.length} constraints`, `<pre class="ilp model">${esc(Tx.text)}</pre><p class="note">Each forbidden subgraph gives one linear constraint: a triangle on {a, b, c} becomes x<sub>ab</sub> + x<sub>ac</sub> + x<sub>bc</sub> ≤ 2, an independent 3-set {a, b, c} becomes x<sub>ab</sub> + x<sub>ac</sub> + x<sub>bc</sub> ≥ 1, a degree bound sums the pairs at one vertex.</p><details class="lpfile"><summary>As an LP file for a solver (CPLEX format)</summary><button type="button" class="copybtn" data-copy="ilpfile">Copy ILP file</button><pre class="ilp lpsrc" data-kind="ilpfile">${esc(Tx.lpFile)}</pre></details>`);
  const cap = (P.n | 0) > 9 ? '<p class="note">The browser solver stops at 9 vertices; the Python tab writes the same ILP for SciPy (HiGHS), which handles larger n.</p>' : '';
  R.line = 7; R.snap(`One 0/1 variable x<sub>uv</sub> per pair of vertices: x<sub>uv</sub> = 1 means uv is an edge. The objective is m = Σ x<sub>uv</sub>; every condition becomes linear constraints.`, { graph: toGraph(Array(nmax).fill(0), nmax), panel: cap + intro });
  const T = nmax <= 8 ? extremalTable(Object.assign({}, P, { from: nmin, n: nmax, obj: 'm' })) : null;
  const rows = []; let lastRes = null;
  for (let k = nmin; k <= nmax; k++) {
    const M = ilpModel(k, atoms), t0 = Date.now(), r = ilpSolve(k, M, max), ms = Date.now() - t0;
    const ex = T ? T.rows.find(x => x.k === k) : null;
    rows.push([k, M.C.length.toLocaleString(), r.best === null ? (r.aborted ? 'stopped' : 'infeasible') : (r.aborted ? `≥ ${r.best}` : r.best), r.nodes.toLocaleString(), ms + ' ms', ex ? (ex.best === null ? (r.best === null ? '— ✓' : '— ✗') : `${ex.best} ${!r.aborted && ex.best === r.best ? '✓' : '✗'}`) : 'n > 8']);
    lastRes = { k, r, M };
    R.line = 8;
    if (r.adj) R.snap(`n = ${k}: branch and bound fixes x<sub>uv</sub> = ${max ? '1, then 0' : '0, then 1'} pair by pair, abandons a branch as soon as a constraint is violated or the ${max ? 'edges still possible cannot beat' : 'edges already chosen cannot improve on'} the best graph found. ${r.aborted ? 'Node limit reached: the value is only a bound.' : `Optimum m = ${r.best} after ${r.nodes.toLocaleString()} nodes.`}`, { graph: toGraph(r.adj, k), nc: nc(toGraph(r.adj, k)), panel: table(['n', 'constraints', `${word} m`, 'B&B nodes', 'time', 'exhaustive'], rows.slice(), 'compact') });
    else R.snap(`n = ${k}: ${r.aborted ? 'node limit reached before a feasible graph was found' : 'the ILP is infeasible: no graph on ' + k + ' vertices satisfies the conditions'}.`, { graph: toGraph(Array(k).fill(0), k), panel: table(['n', 'constraints', `${word} m`, 'B&B nodes', 'time', 'exhaustive'], rows.slice(), 'compact') });
  }
  const allOk = rows.every(r => !/✗|stopped|≥/.test(String(r[2]) + r[5]));
  const verdict = cert(allOk ? 'yes' : 'info', allOk ? `Branch and bound proves the ${word} for n = ${nmin} … ${nmax}` : 'Some orders are not settled', allOk ? `Every branch was either explored or cut off by a bound, so each value is exact. ${T ? 'The exhaustive search over all graphs agrees on every order (✓): two independent methods, one answer.' : ''}` : 'A node limit or a disagreement is marked in the table; treat those values as bounds only.');
  R.line = 8; R.snap(`Summary: ${word} of m under <code>${esc(P.cond || 'no condition')}</code>, solved as an ILP for each order.`, lastRes.r.adj ? { graph: toGraph(lastRes.r.adj, lastRes.k), nc: nc(toGraph(lastRes.r.adj, lastRes.k)), panel: verdict + table(['n', 'constraints', `${word} m`, 'B&B nodes', 'time', 'exhaustive'], rows, 'compact') + intro } : { panel: verdict + table(['n', 'constraints', `${word} m`, 'B&B nodes', 'time', 'exhaustive'], rows, 'compact') + intro }, true);
  return { frames: R.frames, rows };
}
function algExtremalAnneal(P) {
  const R = new Rec(), max = P.goal !== 'min', word = max ? 'maximum' : 'minimum';
  const nmax = Math.max(2, Math.min(12, P.n | 0)), nmin = Math.max(2, Math.min(nmax, (P.from | 0) || 1));
  const steps = Math.max(200, Math.min(20000, (P.steps | 0) || 3000)), rand = rng(P.seed || 1);
  const obj = compileExpr(P.obj || 'm'), cond = (P.cond || '').trim() ? compileExpr(P.cond) : () => 1;
  const box = { x0: 150, x1: 650, y0: 70, y1: 450 };
  const toGraph = (a, k) => { const g = newGraph(false); for (let i = 0; i < k; i++) addNode(g, '0|' + i, String(i)); for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) if (a[i] >> j & 1) g.edges.push({ u: i, v: j, w: 1 }); if (!(g.edges.length && twoColoring(g) && layoutGraph(g, 'columns', box))) forceLayout(g, box, 300, 5); return g; };
  const nc = g => { const c = g.edges.length ? twoColoring(g) : null, o = {}; if (c) g.nodes.forEach((v, i) => { o[i] = 'k' + c[i]; }); return o; };
  const T = extremalTable(Object.assign({}, P, { from: nmin, n: Math.min(8, nmax) }));
  const rows = [], head = ['n', `best ${word} found`, 'exhaustive (exact)', 'verdict'];
  let lastRun = null;
  for (let k = nmin; k <= nmax; k++) {
    const run = extremalAnneal(k, P, obj, cond, steps, rand); lastRun = { k, run };
    const ex = k <= 8 ? T.rows.find(x => x.k === k) : null;
    const v = run.best === null ? '—' : fmt(run.best);
    const verdict = !ex ? 'only a bound' : ex.best === null ? (run.best === null ? '✓ none exists' : '✗') : run.best === ex.best ? '✓ found the optimum' : `missed by ${fmt(Math.abs(ex.best - (run.best ?? ex.best)))}`;
    rows.push([k, v, ex ? (ex.best === null ? '—' : fmt(ex.best)) : 'n > 8', verdict]);
  }
  const { k, run } = lastRun;
  R.line = 5;
  run.snaps.forEach(s => { const g = toGraph(s.a, k); R.snap(`n = ${k}, step ${s.it.toLocaleString()} of ${steps.toLocaleString()} (temperature ${s.T.toFixed(2)}): toggle one random pair; keep the change if the score does not drop, otherwise only with probability e<sup>−drop/T</sup>. Current ${esc(P.obj || 'm')} = ${fmt(s.val)}${s.feas ? '' : ', condition violated'}; best feasible ${s.best === null ? '—' : fmt(s.best)}.`, { graph: g, nc: nc(g), panel: h4('Score = objective − λ·[condition fails]') + `<p class="note">λ = ${2 * k + 2}. Infeasible graphs are allowed but penalised, so the walk can cross them while it is hot.</p>` + table(head, rows.slice(0, rows.length), 'compact') }); });
  const miss = rows.some(r => /missed|✗/.test(r[3]));
  R.line = 6;
  const g = run.bestA ? toGraph(run.bestA, k) : toGraph(Array(k).fill(0), k);
  R.snap(`Best feasible graph found on ${k} vertices: ${esc(P.obj || 'm')} = ${run.best === null ? '— (none found)' : fmt(run.best)}.`, { graph: g, nc: nc(g), panel: cert(miss ? 'no' : 'info', miss ? 'Annealing missed the optimum on some order' : `Annealing found ${nmax > 8 ? 'values for every order; beyond 8 vertices they are only bounds' : 'the exhaustive optimum on every order'}`, `A heuristic only proves what it finds: each graph it returns is a valid example, so its value is a ${max ? 'lower' : 'upper'} bound on the ${word}. A miss is not evidence against a conjecture; rerun with more steps or another seed, or switch to the exhaustive or ILP method for a proof.`) + table(head, rows, 'compact') + (run.bestA ? `<p class="note mono">graph6: ${esc(encodeGraph6(g))}</p>` : '') }, true);
  return { frames: R.frames, rows };
}
function algExtremal(g0, P) {
  if (P.method === 'ilp') return algExtremalILP(P);
  if (P.method === 'anneal') return algExtremalAnneal(P);
  const R = new Rec(), T = extremalTable(P), last = T.rows[T.rows.length - 1], word = T.max ? 'maximum' : 'minimum';
  const box = { x0: 150, x1: 650, y0: 70, y1: 450 };
  const toGraph = (a, k) => { const g = newGraph(false); for (let i = 0; i < k; i++) addNode(g, '0|' + i, String(i)); for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) if (a[i] >> j & 1) g.edges.push({ u: i, v: j, w: 1 }); if (!(g.edges.length && twoColoring(g) && layoutGraph(g, 'columns', box))) forceLayout(g, box, 300, 5); return g; };
  const sides = g => { const c = g.edges.length ? twoColoring(g) : null, nc = {}; if (c) g.nodes.forEach((v, i) => { nc[i] = 'k' + c[i]; }); return nc; };
  const snapG = (msg, gg, extra, last) => R.snap(msg, Object.assign({ graph: gg, nc: sides(gg) }, extra), last);
  const q = `${word} of ${esc(P.obj || 'm')}${(P.cond || '').trim() ? ` over graphs with ${esc(P.cond)}` : ''}${P.scope === 'connected' ? ', connected only' : ''}`;
  const head = ['n', 'graphs satisfying the condition', `${word} value`, 'extremal graphs'].concat((P.guess || '').trim() ? [`guess ${esc(P.guess)}`] : []);
  const rows = T.rows.map(r => [r.k, r.count.toLocaleString(), r.best === null ? '—' : fmt(r.best), r.ext.length.toLocaleString()].concat((P.guess || '').trim() ? [r.best === null ? fmt(r.guess) : `${fmt(r.guess)} ${r.match ? '✓' : '✗'}`] : []));
  const miss = T.rows.find(r => r.match === false);
  const verdict = !(P.guess || '').trim() ? cert('info', `Extremal values for n = ${T.nmin} … ${T.nmax}`, 'Guess a formula in n from the column of values, enter it as “Guess f(n)”, and the lab compares it on every order. Matching small orders is evidence, not a proof; look at the extremal graphs to find the construction, then prove the bound.')
    : miss ? cert('no', `Guess fails at n = ${miss.k}`, `${esc(P.guess)} gives ${fmt(miss.guess)}, the true ${word} is ${fmt(miss.best)}.`)
      : cert('yes', `Guess matches for n = ${T.nmin} … ${T.nmax}`, `${esc(P.guess)} equals the ${word} on every order checked. That is finite evidence: prove it (an extremal construction for one direction, a counting or structural argument for the other).`);
  const xk = P.x in INV_NAMES ? P.x : 'm', fo = compileExpr(P.obj || 'm');
  const plot = last.data.length ? h4(`${esc(P.obj || 'm')} against ${INV_NAMES[xk]} (n = ${last.k})`) + scatterPlot(last.data.map(d => { const v = fo(d.inv); return { a: d.a, inv: Object.assign({}, d.inv, { __obj: Number.isFinite(v) ? v : NaN }) }; }), xk, '__obj', d => d.inv.__obj === last.best).replace(/aria-label="[^"]*"/, `aria-label="objective against ${INV_NAMES[xk]}"`).replace('>undefined<', `>${esc(P.obj || 'm')}<`) + '<p class="note">Red points are the extremal graphs of the largest order; the shaded hull shows the region all graphs fill.</p>' : '';
  const invTable = (d) => table(Object.keys(INV_NAMES).filter(k => k !== 'n'), [Object.keys(INV_NAMES).filter(k => k !== 'n').map(k => fmt(d.inv[k]))], 'compact wide');
  const capNote = (P.n | 0) > 8 ? `<p class="note">Exhaustive search stops at 8 vertices (12 346 graphs; 9 vertices would be 274 668). For larger n switch the method to ILP (exact, up to 9) or simulated annealing (heuristic, up to 12).</p>` : '';
  const summary = capNote + `<p class="exq">The ${q.replace(/of (.*?)( over graphs with )(.*?)(, connected only)?$/, (m0, o, w, c, k) => `of <code>${o}</code>${w}<code>${c}</code>${k || ''}`)}</p>` + verdict + table(head, rows, 'compact');
  R.line = 1;
  if (last.best === null) { snapG(`No graph on ${last.k} vertices satisfies the condition (or the expression is not finite on them).`, toGraph(graphsOfOrder(last.k)[0], last.k), { panel: summary }, true); return { frames: R.frames, table: T }; }
  snapG(`The ${word} of ${esc(P.obj || 'm')} for n = ${T.nmin} … ${T.nmax}: ${T.rows.map(r => r.best === null ? '—' : fmt(r.best)).join(', ')}. Shown: an extremal graph on ${last.k} vertices; step on to see all of them and one per smaller order.`, toGraph(last.ext[0].a, last.k), { panel: summary + plot });
  R.line = 2;
  last.ext.slice(0, 40).forEach((d, i) => snapG(`Extremal graph ${i + 1} of ${last.ext.length} on ${last.k} vertices: ${esc(P.obj || 'm')} = ${fmt(last.best)}.${last.ext.length > 40 && i === 39 ? ' (first 40 shown)' : ''}`, toGraph(d.a, last.k), { panel: h4('Invariants of this graph') + invTable(d) + `<p class="note mono">graph6: ${esc(encodeGraph6(toGraph(d.a, last.k)))}</p>` }));
  R.line = 3;
  T.rows.slice(0, -1).reverse().forEach(r => { if (r.ext.length) snapG(`n = ${r.k}: ${word} ${fmt(r.best)}, attained by ${r.ext.length} graph${r.ext.length > 1 ? 's' : ''}; one of them.`, toGraph(r.ext[0].a, r.k), { panel: h4('Invariants of this graph') + invTable(r.ext[0]) + `<p class="note mono">graph6: ${esc(encodeGraph6(toGraph(r.ext[0].a, r.k)))}</p>` }); });
  R.line = 4; snapG(`Compare the extremal graphs across orders: what structure do they share? That is the conjectured construction.`, toGraph(last.ext[0].a, last.k), { panel: summary }, true);
  return { frames: R.frames, table: T };
}
function algConjecture(g0, P) {
  const n = Math.max(1, Math.min(8, P.n | 0)), R = new Rec(); const f = compileExpr(P.expr);
  const t0 = Date.now(); const data = invariantsAll(n); const ms = Date.now() - t0;
  const scope = P.scope === 'connected' ? data.filter(d => d.inv.conn) : data;
  const bad = scope.filter(d => !f(d.inv)); const badSet = new Set(bad);
  const toGraph = (a) => { const g = newGraph(false); for (let i = 0; i < n; i++) addNode(g, '0|' + i, String(i)); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (a[i] >> j & 1) g.edges.push({ u: i, v: j, w: 1 }); forceLayout(g, { x0: 150, x1: 650, y0: 70, y1: 450 }); return g; };
  const counts = [1, 1, 2, 4, 11, 34, 156, 1044, 12346], ccounts = [1, 1, 1, 2, 6, 21, 112, 853, 11117];
  const invTable = d => table(Object.keys(INV_NAMES).filter(k => k !== 'n').map(k => k), [Object.keys(INV_NAMES).filter(k => k !== 'n').map(k => fmt(d.inv[k]))], 'compact wide');
  const plot = h4(`${INV_NAMES[P.y]} vs ${INV_NAMES[P.x]} (n = ${n}, ${P.scope === 'connected' ? 'connected' : 'all'})`) + scatterPlot(scope, P.x, P.y, d => badSet.has(d)) + '<p class="note">Point size grows with the number of graphs at that spot; red points contain counterexamples. The shaded polygon is the convex hull, as in PHOEG.</p>';
  const summary = cert(bad.length ? 'no' : 'yes', bad.length ? `${bad.length} counterexample${bad.length > 1 ? 's' : ''} on ${n} vertices` : `True for every ${P.scope === 'connected' ? 'connected ' : ''}graph on ${n} vertices`,
    `Checked ${scope.length.toLocaleString()} graphs up to isomorphism (expected ${(P.scope === 'connected' ? ccounts : counts)[n].toLocaleString()}). Generated in ${ms} ms by adding a vertex to each graph on ${n - 1} vertices in all ways and discarding isomorphic copies.` + (bad.length ? '' : ' This is finite evidence, not a proof for all n.'));
  R.line = 2;
  if (!bad.length) { const ex = scope[scope.length - 1]; R.snap(`Statement “${esc(P.expr)}” holds for all ${scope.length.toLocaleString()} graphs checked. Shown: one of them.`, { graph: toGraph(ex.a), panel: summary + plot }, true); }
  bad.slice(0, 60).forEach((d, k) => R.snap(`Counterexample ${k + 1} of ${bad.length}: ${d.inv.m} edges.`, { graph: toGraph(d.a), panel: (k === 0 ? summary : '') + h4('Invariants of this graph') + invTable(d) + `<p class="note mono">graph6: ${esc(encodeGraph6(toGraph(d.a)))}</p>` + plot }));
  return { frames: R.frames };
}
