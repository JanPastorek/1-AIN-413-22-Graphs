'use strict';
/* ============================================================
   Graph Lab core: graph model, parsing, graph6, layouts, helpers
   Pure functions (no DOM) so they can be tested in Node.
   ============================================================ */

const MAXF = 700; // frame cap per run

function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function newGraph(directed = false) { return { directed, nodes: [], edges: [], parts: 1, weighted: false }; }
function addNode(g, id, label, part = 0) { g.nodes.push({ id, label: label ?? id, x: 0, y: 0, part }); return g.nodes.length - 1; }

function parseGraph(text) {
  const g = newGraph(false); let part = 0; const idx = new Map();
  const get = name => { const key = part + '|' + name; if (!idx.has(key)) idx.set(key, addNode(g, key, name, part)); return idx.get(key); };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim(); if (!line) continue;
    if (/^directed$/i.test(line)) { g.directed = true; continue; }
    if (/^undirected$/i.test(line)) { g.directed = false; continue; }
    if (/^-{3,}$/.test(line)) { part++; continue; }
    let toks = line.includes(';') ? line.split(';').map(s => s.trim()).filter(Boolean) : line.split(/[\s,]+/).filter(Boolean);
    toks = toks.filter(t => t !== '->' && t !== '--' && t !== '-');
    if (toks.length === 1) { get(toks[0]); continue; }
    const u = get(toks[0]), v = get(toks[1]); let w = 1;
    if (toks.length >= 3) {
      const x = Number(toks[2]);
      if (!Number.isFinite(x)) throw new Error(`Line “${raw.trim()}”: the weight “${toks[2]}” is not a number.`);
      w = x; g.weighted = true;
    }
    if (u === v) throw new Error(`Line “${raw.trim()}”: loops are not supported.`);
    g.edges.push({ u, v, w });
  }
  g.parts = part + 1;
  return g;
}

function graphToText(g) {
  const out = []; if (g.directed) out.push('directed');
  const lab = i => g.nodes[i].label;
  const parts = Math.max(1, g.parts || 1);
  for (let p = 0; p < parts; p++) {
    if (p > 0) out.push('---');
    const used = new Set();
    for (const e of g.edges) {
      if (g.nodes[e.u].part !== p) continue;
      used.add(e.u); used.add(e.v);
      const a = lab(e.u), b = lab(e.v), sp = /\s/.test(a) || /\s/.test(b);
      const wt = (g.weighted || e.w !== 1) ? e.w : null;
      out.push(sp ? [a, b].concat(wt === null ? [] : [wt]).join(' ; ') : [a, b].concat(wt === null ? [] : [wt]).join(' '));
    }
    g.nodes.forEach((v, i) => { if (v.part === p && !used.has(i)) out.push(v.label); });
  }
  return out.join('\n');
}

function cloneGraph(g) {
  return { directed: g.directed, parts: g.parts, weighted: g.weighted, nodes: g.nodes.map(v => ({ ...v })), edges: g.edges.map(e => ({ ...e })) };
}

/* ---------- graph6 ---------- */
function decodeGraph6(s) {
  s = s.trim().replace(/^>>graph6<</, '');
  if (!s) throw new Error('Empty graph6 string.');
  const b = [...s].map(c => c.charCodeAt(0) - 63);
  if (b.some(x => x < 0 || x > 63)) throw new Error('This is not a graph6 string (characters outside ASCII 63–126).');
  let n, pos;
  if (b[0] < 63) { n = b[0]; pos = 1; }
  else if (b[1] < 63) { n = (b[1] << 12) | (b[2] << 6) | b[3]; pos = 4; }
  else throw new Error('Graphs with more than 258047 vertices are not supported.');
  const bits = [];
  for (let k = pos; k < b.length; k++) for (let j = 5; j >= 0; j--) bits.push((b[k] >> j) & 1);
  const need = n * (n - 1) / 2;
  if (bits.length < need) throw new Error(`The string is too short for ${n} vertices.`);
  const g = newGraph(false);
  for (let i = 0; i < n; i++) addNode(g, '0|' + i, String(i));
  let k = 0;
  for (let j = 1; j < n; j++) for (let i = 0; i < j; i++) { if (bits[k++]) g.edges.push({ u: i, v: j, w: 1 }); }
  return g;
}
function encodeGraph6(g) {
  const n = g.nodes.length; const M = adjMatrix(g, true);
  const out = [];
  if (n < 63) out.push(n); else out.push(63, (n >> 12) & 63, (n >> 6) & 63, n & 63);
  const bits = []; for (let j = 1; j < n; j++) for (let i = 0; i < j; i++) bits.push(M[i][j] ? 1 : 0);
  while (bits.length % 6) bits.push(0);
  for (let k = 0; k < bits.length; k += 6) { let x = 0; for (let t = 0; t < 6; t++) x = (x << 1) | bits[k + t]; out.push(x); }
  return out.map(x => String.fromCharCode(x + 63)).join('');
}

/* ---------- adjacency ---------- */
function adjOut(g) {
  const A = g.nodes.map(() => []);
  g.edges.forEach((e, i) => { A[e.u].push({ to: e.v, w: e.w, e: i }); if (!g.directed) A[e.v].push({ to: e.u, w: e.w, e: i }); });
  return A;
}
function adjUnd(g) {
  const A = g.nodes.map(() => []);
  g.edges.forEach((e, i) => { A[e.u].push({ to: e.v, w: e.w, e: i }); A[e.v].push({ to: e.u, w: e.w, e: i }); });
  return A;
}
function adjMatrix(g, sym = true) {
  const n = g.nodes.length; const M = Array.from({ length: n }, () => new Uint8Array(n));
  for (const e of g.edges) { M[e.u][e.v] = 1; if (sym || !g.directed) M[e.v][e.u] = 1; }
  return M;
}
function simpleNbrSets(g) { const S = g.nodes.map(() => new Set()); for (const e of g.edges) { S[e.u].add(e.v); S[e.v].add(e.u); } return S; }

function components(g) {
  const n = g.nodes.length, comp = Array(n).fill(-1), A = adjUnd(g); let c = 0;
  for (let s = 0; s < n; s++) { if (comp[s] >= 0) continue; const st = [s]; comp[s] = c; while (st.length) { const u = st.pop(); for (const { to } of A[u]) if (comp[to] < 0) { comp[to] = c; st.push(to); } } c++; }
  return { comp, count: c };
}
function bfsDist(A, s, n) { const d = Array(n).fill(-1); d[s] = 0; const Q = [s]; for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (const { to } of A[u]) if (d[to] < 0) { d[to] = d[u] + 1; Q.push(to); } } return d; }
function triangleCount(g) { const S = simpleNbrSets(g); let t = 0; const n = g.nodes.length; for (let u = 0; u < n; u++) for (const v of S[u]) if (v > u) for (const w of S[v]) if (w > v && S[u].has(w)) t++; return t; }
function diameterInfo(g) {
  const n = g.nodes.length, A = adjUnd(g); let diam = 0, rad = Infinity, conn = true;
  for (let s = 0; s < n; s++) { const d = bfsDist(A, s, n); if (d.some(x => x < 0)) { conn = false; } const ecc = Math.max(...d); diam = Math.max(diam, ecc); rad = Math.min(rad, ecc); }
  return conn ? { diam, rad, conn } : { diam: Infinity, rad: Infinity, conn };
}

/* ---------- layouts ---------- */
const W = 800, H = 520, PAD = 46;
function circleLayout(g, cx = W / 2, cy = H / 2, r) {
  const n = g.nodes.length; r = r ?? Math.min(210, 40 + n * 14);
  g.nodes.forEach((v, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / Math.max(1, n); v.x = cx + r * Math.cos(a); v.y = cy + r * Math.sin(a); });
}
function partsLayout(g) {
  // multiple parts (e.g. two graphs to compare) side by side, each circle or force
  const P = g.parts || 1; if (P === 1) return forceLayout(g);
  const span = W / P;
  for (let p = 0; p < P; p++) {
    const idx = g.nodes.map((v, i) => v.part === p ? i : -1).filter(i => i >= 0);
    const sub = { directed: g.directed, nodes: idx.map(i => g.nodes[i]), edges: [] };
    const pos = new Map(idx.map((i, k) => [i, k]));
    for (const e of g.edges) if (pos.has(e.u) && pos.has(e.v)) sub.edges.push({ u: pos.get(e.u), v: pos.get(e.v), w: e.w });
    forceLayout(sub, { x0: p * span + 18, x1: (p + 1) * span - 18, y0: PAD, y1: H - PAD });
  }
}
function forceLayout(g, box = { x0: PAD, x1: W - PAD, y0: PAD, y1: H - PAD }, iters = 350, seed = 7, stress = true) {
  const n = g.nodes.length; if (n === 0) return;
  if (n === 1) { g.nodes[0].x = (box.x0 + box.x1) / 2; g.nodes[0].y = (box.y0 + box.y1) / 2; return; }
  const R = rng(seed);
  const P = g.nodes.map((v, i) => { const a = 2 * Math.PI * i / n; return [Math.cos(a) + 0.05 * R(), Math.sin(a) + 0.05 * R()]; });
  const E = []; const seen = new Set();
  for (const e of g.edges) { const k = Math.min(e.u, e.v) + ',' + Math.max(e.u, e.v); if (!seen.has(k)) { seen.add(k); E.push([e.u, e.v]); } }
  if (stress && n > 12 && E.length) { // classical MDS start, then stress majorization
    const Q = mdsInit(n, E, seed); stressRefine(n, E, Q, 300); fitInto(g, Q, box, false); return;
  }
  const k = Math.sqrt(4 / n); let t = 0.25;
  for (let it = 0; it < iters; it++) {
    const D = P.map(() => [0, 0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; let d2 = dx * dx + dy * dy; if (d2 < 1e-6) { dx = 0.01 * (R() - 0.5); dy = 0.01; d2 = 1e-4; }
      const d = Math.sqrt(d2), f = k * k / d; dx /= d; dy /= d; D[i][0] += dx * f; D[i][1] += dy * f; D[j][0] -= dx * f; D[j][1] -= dy * f;
    }
    for (const [a, b] of E) { let dx = P[a][0] - P[b][0], dy = P[a][1] - P[b][1]; const d = Math.sqrt(dx * dx + dy * dy) || 1e-3; const f = d * d / k; dx /= d; dy /= d; D[a][0] -= dx * f; D[a][1] -= dy * f; D[b][0] += dx * f; D[b][1] += dy * f; }
    for (let i = 0; i < n; i++) { // gravity keeps components together
      D[i][0] -= P[i][0] * 0.08 * k; D[i][1] -= P[i][1] * 0.08 * k;
      const d = Math.hypot(D[i][0], D[i][1]) || 1; const s = Math.min(d, t) / d; P[i][0] += D[i][0] * s; P[i][1] += D[i][1] * s;
    }
    t = Math.max(0.005, t * 0.985);
  }
  fitInto(g, P, box);
}
/* Classical multidimensional scaling of hop distances (power iteration, 2 eigenvectors). */
function mdsInit(n, E, seed = 7) {
  const A = Array.from({ length: n }, () => []); for (const [a, b] of E) { A[a].push(b); A[b].push(a); }
  const D = []; let mx = 0;
  for (let s = 0; s < n; s++) { const d = new Float64Array(n).fill(-1); d[s] = 0; const Q = [s]; for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (const v of A[u]) if (d[v] < 0) { d[v] = d[u] + 1; Q.push(v); } } D.push(d); for (const x of d) mx = Math.max(mx, x); }
  const B = D.map(r => Array.from(r, d => { d = d < 0 ? mx + 1 : d; return -0.5 * d * d; }));
  const rm = B.map(r => r.reduce((a, b) => a + b, 0) / n), tm = rm.reduce((a, b) => a + b, 0) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) B[i][j] += tm - rm[i] - rm[j];
  const R = rng(seed), vecs = [];
  for (let k = 0; k < 2; k++) {
    let v = Array.from({ length: n }, () => R() - 0.5), lam = 0;
    for (let it = 0; it < 150; it++) {
      let w = B.map(r => { let s = 0; for (let j = 0; j < n; j++) s += r[j] * v[j]; return s; });
      for (const [ev] of vecs) { let d = 0; for (let i = 0; i < n; i++) d += w[i] * ev[i]; for (let i = 0; i < n; i++) w[i] -= d * ev[i]; }
      const nr = Math.hypot(...w) || 1; lam = nr; v = w.map(x => x / nr);
    }
    vecs.push([v, lam]);
  }
  return Array.from({ length: n }, (_, i) => [vecs[0][0][i] * Math.sqrt(vecs[0][1]), vecs[1][0][i] * Math.sqrt(vecs[1][1]) + 1e-3 * (R() - 0.5)]);
}
/* Stress majorization (SMACOF, localized updates): place vertices so that drawn distances
   match graph distances. Spreads out long sparse networks (metro lines, trees) far better
   than pure springs, which crowd them into a ball. */
function stressRefine(n, E, P, iters = 220) {
  const A = Array.from({ length: n }, () => []); for (const [a, b] of E) { A[a].push(b); A[b].push(a); }
  const D = []; for (let s = 0; s < n; s++) { const d = new Int16Array(n).fill(-1); d[s] = 0; const Q = [s]; for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (const v of A[u]) if (d[v] < 0) { d[v] = d[u] + 1; Q.push(v); } } D.push(d); }
  const lens = E.map(([a, b]) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1])).sort((x, y) => x - y);
  const L = lens.length ? lens[Math.floor(lens.length / 2)] || 0.1 : 0.1;
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < n; i++) {
      let sx = 0, sy = 0, sw = 0;
      for (let j = 0; j < n; j++) {
        const dij = D[i][j]; if (j === i || dij <= 0) continue;
        const w = 1 / (dij * dij), t = dij * L; let dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; const d = Math.hypot(dx, dy) || 1e-6;
        sx += w * (P[j][0] + t * dx / d); sy += w * (P[j][1] + t * dy / d); sw += w;
      }
      if (sw > 0) { P[i][0] = sx / sw; P[i][1] = sy / sw; }
    }
  }
}
function fitInto(g, P, box, clamp = true) {
  if (clamp && P.length > 12) { // pull far-flung outliers (e.g. isolated vertices) back toward the drawing
    const cx = P.reduce((a, p) => a + p[0], 0) / P.length, cy = P.reduce((a, p) => a + p[1], 0) / P.length;
    const d = P.map(p => Math.hypot(p[0] - cx, p[1] - cy)); const cap = 1.25 * d.slice().sort((a, b) => a - b)[Math.floor(0.85 * (d.length - 1))];
    P.forEach((p, i) => { if (d[i] > cap && d[i] > 0) { const f = cap / d[i]; p[0] = cx + (p[0] - cx) * f; p[1] = cy + (p[1] - cy) * f; } });
  }
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const sx = (box.x1 - box.x0) / Math.max(1e-6, x1 - x0), sy = (box.y1 - box.y0) / Math.max(1e-6, y1 - y0); const s = Math.min(sx, sy);
  const ox = box.x0 + ((box.x1 - box.x0) - s * (x1 - x0)) / 2, oy = box.y0 + ((box.y1 - box.y0) - s * (y1 - y0)) / 2;
  g.nodes.forEach((v, i) => { v.x = ox + (P[i][0] - x0) * s; v.y = oy + (P[i][1] - y0) * s; });
}
function columnsLayout(g, leftSet) {
  const L = [], Rr = []; g.nodes.forEach((v, i) => (leftSet.has(i) ? L : Rr).push(i));
  const place = (arr, x) => arr.forEach((i, k) => { g.nodes[i].x = x; g.nodes[i].y = arr.length === 1 ? H / 2 : PAD + 10 + (H - 2 * PAD - 20) * k / (arr.length - 1); });
  place(L, 230); place(Rr, 570);
}
function twoColoring(g) {
  const n = g.nodes.length, A = adjUnd(g), col = Array(n).fill(-1);
  for (let s = 0; s < n; s++) { if (col[s] >= 0) continue; col[s] = 0; const Q = [s]; for (let h = 0; h < Q.length; h++) { const u = Q[h]; for (const { to } of A[u]) { if (col[to] < 0) { col[to] = 1 - col[u]; Q.push(to); } else if (col[to] === col[u]) return null; } } }
  return col;
}

/* ---------- frame recorder & panel helpers ---------- */
class Rec {
  constructor() { this.frames = []; this.nc = {}; this.ec = {}; this.ntag = {}; this.elab = {}; this.truncated = false; }
  snap(msg, extra = {}, force = false) {
    if (this.frames.length >= MAXF && !force) { this.truncated = true; return; }
    this.frames.push(Object.assign({ msg, nc: { ...this.nc }, ec: { ...this.ec }, ntag: { ...this.ntag }, elab: { ...this.elab }, line: this.line }, extra));
  }
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lab = (g, i) => esc(g.nodes[i].label);
const N = (g, i) => `<b class="vn">${lab(g, i)}</b>`;
const chips = (arr, cls = '') => arr.length ? `<div class="chips">${arr.map(x => `<span class="chip ${cls}">${x}</span>`).join('')}</div>` : '<div class="chips"><span class="empty">empty</span></div>';
function table(head, rows, cls = '') { return `<div class="tw"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ''}>${(r.cells || r).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
const cert = (kind, title, body) => `<div class="cert ${kind}"><div class="cert-h">${title}</div>${body}</div>`;
const h4 = t => `<h4>${t}</h4>`;
const fmt = x => x === Infinity ? '∞' : x === -Infinity ? '−∞' : (Number.isInteger(x) ? String(x).replace('-', '−') : (+x.toFixed(3)).toString().replace('-', '−'));
function edgeName(g, i) { const e = g.edges[i]; return `${lab(g, e.u)}${g.directed ? '→' : '–'}${lab(g, e.v)}`; }

if (typeof module !== 'undefined') Object.assign(globalThis, { MAXF, rng, newGraph, addNode, parseGraph, graphToText, cloneGraph, decodeGraph6, encodeGraph6, adjOut, adjUnd, adjMatrix, simpleNbrSets, components, bfsDist, triangleCount, diameterInfo, circleLayout, partsLayout, forceLayout, fitInto, columnsLayout, twoColoring, Rec, esc, lab, N, chips, table, cert, h4, fmt, edgeName, W, H, PAD });
