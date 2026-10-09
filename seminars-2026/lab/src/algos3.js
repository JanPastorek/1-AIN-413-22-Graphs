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
  return { n, m, dmin: n ? Math.min(...deg) : 0, dmax: n ? Math.max(...deg) : 0, alpha, omega, chi, diam, rad, conn, tri, girth };
}
const INV_NAMES = { n: 'order n', m: 'size m', dmin: 'minimum degree δ', dmax: 'maximum degree Δ', alpha: 'independence number α', omega: 'clique number ω', chi: 'chromatic number χ', diam: 'diameter', rad: 'radius', tri: 'triangles', girth: 'girth', conn: 'connected (0/1)' };

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
function algConjecture(g0, P) {
  const n = Math.max(1, Math.min(8, P.n | 0)), R = new Rec(); const f = compileExpr(P.expr);
  const t0 = Date.now(); const all = graphsOfOrder(n); const data = all.map(a => ({ a, inv: invariantsOf(a, n) })); const ms = Date.now() - t0;
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
