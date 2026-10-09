/* ============================================================
   Algorithms, part 6: a real network (US airports, course data) vs G(n, m)
   ============================================================ */
function airportGraph() {
  const g = newGraph(false); const idx = new Map(); const seen = new Set();
  const get = a => { if (!idx.has(a)) idx.set(a, addNode(g, '0|' + a, a)); return idx.get(a); };
  for (const pair of AIRPORTS.split('|')) { const [a, b] = pair.split(' '); if (!a || !b || a === b) continue; const k = a < b ? a + ' ' + b : b + ' ' + a; if (seen.has(k)) continue; seen.add(k); g.edges.push({ u: get(a), v: get(b), w: 1 }); }
  return g;
}
function gnm(n, m, seed) {
  const g = newGraph(false); for (let i = 0; i < n; i++) addNode(g, '0|' + i, String(i)); const r = rng(seed); const seen = new Set();
  while (g.edges.length < m) { const a = Math.floor(r() * n), b = Math.floor(r() * n); if (a === b) continue; const k = Math.min(a, b) * n + Math.max(a, b); if (seen.has(k)) continue; seen.add(k); g.edges.push({ u: a, v: b, w: 1 }); }
  return g;
}
function netSummary(g, seed = 1) {
  const n = g.nodes.length, A = adjUnd(g); const deg = A.map(a => a.length);
  const S = A.map(a => new Set(a.map(x => x.to))); let tri = 0, wedges = 0;
  for (let u = 0; u < n; u++) { wedges += deg[u] * (deg[u] - 1) / 2; for (const v of S[u]) if (v > u) for (const w of S[v]) if (w > v && S[u].has(w)) tri++; }
  const { comp } = components(g); const cs = new Map(); comp.forEach(c => cs.set(c, (cs.get(c) || 0) + 1)); const giant = Math.max(...cs.values());
  const gc = [...cs.entries()].sort((a, b) => b[1] - a[1])[0][0]; const members = g.nodes.map((v, i) => i).filter(i => comp[i] === gc);
  const r = rng(seed); let tot = 0, cnt = 0; const srcs = members.length <= 150 ? members : Array.from({ length: 150 }, () => members[Math.floor(r() * members.length)]);
  for (const s of srcs) { const d = bfsDist(A, s, n); for (const i of members) if (i !== s && d[i] > 0) { tot += d[i]; cnt++; } }
  return { n, m: g.edges.length, deg, dmax: Math.max(...deg), avg: 2 * g.edges.length / n, trans: wedges ? 3 * tri / wedges : 0, tri, giant, L: cnt ? tot / cnt : 0 };
}
function ccdfChart(series) {
  const w = 300, h = 210, l = 38, b = 30, t = 10, rr = 12; let kmax = 1; series.forEach(s => kmax = Math.max(kmax, ...s.deg));
  const lx0 = 0, lx1 = Math.log10(kmax + 1), n0 = Math.min(...series.map(s => s.deg.length)); const ly0 = Math.log10(1 / Math.max(...series.map(s => s.deg.length))), ly1 = 0;
  const X = k => l + (w - l - rr) * (Math.log10(k) - lx0) / (lx1 - lx0), Y = p => t + (h - t - b) * (1 - (Math.log10(p) - ly0) / (ly1 - ly0));
  let s = `<svg class="mini" viewBox="0 0 ${w} ${h}" role="img" aria-label="Degree distribution, log-log">`;
  for (const k of [1, 10, 100]) if (k <= kmax) s += `<line class="gl" x1="${X(k)}" x2="${X(k)}" y1="${t}" y2="${h - b}"/><text class="tk" x="${X(k)}" y="${h - b + 13}" text-anchor="middle">${k}</text>`;
  for (const p of [1, 0.1, 0.01, 0.001]) if (Math.log10(p) >= ly0) s += `<line class="gl" x1="${l}" x2="${w - rr}" y1="${Y(p)}" y2="${Y(p)}"/><text class="tk" x="${l - 4}" y="${Y(p) + 3}" text-anchor="end">${p}</text>`;
  series.forEach((ser, si) => { const n = ser.deg.length; const cnt = new Map(); ser.deg.forEach(d => cnt.set(d, (cnt.get(d) || 0) + 1)); const ks = [...cnt.keys()].filter(k => k > 0).sort((a, b) => a - b); let tail = ser.deg.filter(d => d > 0).length; let d = ''; ks.forEach((k, i) => { const p = tail / n; d += (i ? 'L' : 'M') + X(k).toFixed(1) + ',' + Y(p).toFixed(1); tail -= cnt.get(k); }); s += `<path class="${si ? 'th' : 'ob'}" d="${d}"/>`; });
  s += `<text class="tk" x="${(l + w - rr) / 2}" y="${h - 2}" text-anchor="middle">degree k (log)</text><text class="tk" transform="translate(9 ${(t + h - b) / 2}) rotate(-90)" text-anchor="middle">P(deg ≥ k) (log)</text></svg>`;
  return s;
}
function hubView(g, deg, k = 45) {
  const top = g.nodes.map((v, i) => i).sort((a, b) => deg[b] - deg[a]).slice(0, k); const pos = new Map(top.map((v, i) => [v, i]));
  const h = newGraph(false); top.forEach(i => addNode(h, g.nodes[i].id, g.nodes[i].label)); g.edges.forEach(e => { if (pos.has(e.u) && pos.has(e.v)) h.edges.push({ u: pos.get(e.u), v: pos.get(e.v), w: 1 }); });
  forceLayout(h); const ntag = {}; top.forEach((v, i) => ntag[i] = String(deg[v])); return { h, ntag };
}
function algRealVsRandom(g0, P) {
  const R = new Rec(); const real = airportGraph(); const sr = netSummary(real); const rnd = gnm(sr.n, sr.m, P.seed); const sg = netSummary(rnd);
  const rows = [['vertices n', sr.n, sg.n], ['edges m', sr.m, sg.m], ['average degree', sr.avg.toFixed(2), sg.avg.toFixed(2)], ['maximum degree', sr.dmax, sg.dmax], ['transitivity (clustering)', sr.trans.toFixed(3), sg.trans.toFixed(3)], ['triangles', sr.tri.toLocaleString(), sg.tri.toLocaleString()], ['largest component', sr.giant, sg.giant], ['average distance (giant)', sr.L.toFixed(2), sg.L.toFixed(2)]];
  const panel = table(['', 'US airports', `G(n, m), seed ${P.seed}`], rows, 'compact num') + h4('Degree distribution, log–log') + ccdfChart([sr, sg]) + '<p class="note">Solid: airports. Dashed: G(n, m). A straight-ish airport curve over two decades is a heavy tail; the random graph’s tail falls off a cliff (Poisson). Same n and m, very different structure.</p>';
  const a = hubView(real, sr.deg); const b = hubView(rnd, sg.deg);
  R.line = 0;
  R.snap(`US airports (course data: 546 airports, 2 781 routes). The board shows the 45 busiest airports and the routes among them; tags are degrees in the whole network. Hubs connect to each other densely.`, { graph: a.h, ntag: a.ntag, panel });
  R.line = 1;
  R.snap(`A G(n, m) with the same n and m: the 45 highest-degree vertices barely touch each other. No hubs, almost no triangles, and the maximum degree is ${sg.dmax} instead of ${sr.dmax}.`, { graph: b.h, ntag: b.ntag, panel }, true);
  return { frames: R.frames, graph: a.h };
}
