/* ============================================================
   Algorithms, part 5: planarity (DMP path addition), plane drawing,
   faces, Euler's formula, dual graph, Kuratowski certificate
   ============================================================ */

function simpleEdgeList(g) { const seen = new Set(), E = []; g.edges.forEach((e, i) => { const k = Math.min(e.u, e.v) + ',' + Math.max(e.u, e.v); if (!seen.has(k)) { seen.add(k); E.push([Math.min(e.u, e.v), Math.max(e.u, e.v), i]); } }); return E; }
function blocks(n, E) { // biconnected components as lists of edge indices into E
  const A = Array.from({ length: n }, () => []); E.forEach(([a, b], i) => { A[a].push([b, i]); A[b].push([a, i]); });
  const disc = Array(n).fill(0), low = Array(n).fill(0); let t = 0; const st = [], out = [];
  const dfs = (u, pe) => { disc[u] = low[u] = ++t; for (const [v, e] of A[u]) { if (e === pe) continue; if (!disc[v]) { st.push(e); dfs(v, e); low[u] = Math.min(low[u], low[v]); if (low[v] >= disc[u]) { const comp = []; let x; do { x = st.pop(); comp.push(x); } while (x !== e); out.push(comp); } } else if (disc[v] < disc[u]) { st.push(e); low[u] = Math.min(low[u], disc[v]); } } };
  for (let s = 0; s < n; s++) if (!disc[s]) dfs(s, -1);
  return out;
}
/* DMP on one biconnected block. Returns {planar, faces, steps} ; steps record the growing embedding. */
function dmp(E, edgeIdx, record = false) {
  const ed = edgeIdx.map(i => E[i]); const verts = [...new Set(ed.flatMap(([a, b]) => [a, b]))];
  if (ed.length === 1) return { planar: true, faces: [], steps: [] };
  const A = new Map(verts.map(v => [v, []])); ed.forEach(([a, b], k) => { A.get(a).push([b, k]); A.get(b).push([a, k]); });
  // initial cycle via DFS back edge
  const par = new Map(), depth = new Map(); let cyc = null;
  const dfs = (u, pk) => { for (const [v, k] of A.get(u)) { if (cyc) return; if (k === pk) continue; if (!depth.has(v)) { depth.set(v, depth.get(u) + 1); par.set(v, u); dfs(v, k); } else if (depth.get(v) < depth.get(u)) { const c = [u]; let x = u; while (x !== v) { x = par.get(x); c.push(x); } cyc = c; return; } } };
  depth.set(verts[0], 0); dfs(verts[0], -1);
  const key = (a, b) => Math.min(a, b) + ',' + Math.max(a, b);
  const Hv = new Set(cyc), He = new Set(); for (let i = 0; i < cyc.length; i++) He.add(key(cyc[i], cyc[(i + 1) % cyc.length]));
  let faces = [cyc.slice(), cyc.slice().reverse()]; const steps = [];
  if (record) steps.push({ path: cyc.concat([cyc[0]]), faces: faces.map(f => f.slice()), He: new Set(He), note: 'cycle' });
  while (He.size < ed.length) {
    const frags = [];
    ed.forEach(([a, b]) => { if (!He.has(key(a, b)) && Hv.has(a) && Hv.has(b)) frags.push({ contacts: [a, b], chord: [a, b] }); });
    const seen = new Set();
    for (const s of verts) {
      if (Hv.has(s) || seen.has(s)) continue; const comp = [s]; seen.add(s); const cont = new Set();
      for (let h = 0; h < comp.length; h++) for (const [v] of A.get(comp[h])) { if (Hv.has(v)) cont.add(v); else if (!seen.has(v)) { seen.add(v); comp.push(v); } }
      frags.push({ contacts: [...cont], comp: new Set(comp) });
    }
    for (const fr of frags) fr.adm = faces.map((f, i) => i).filter(i => fr.contacts.every(c => faces[i].includes(c)));
    const bad = frags.find(fr => fr.adm.length === 0);
    if (bad) return { planar: false, steps, faces, stuck: bad };
    const fr = frags.find(x => x.adm.length === 1) || frags[0]; const fi = fr.adm[0];
    let path;
    if (fr.chord) path = fr.chord.slice();
    else { // a - x ... y - b through the component
      const a = fr.contacts[0]; const x = A.get(a).map(([v]) => v).find(v => fr.comp.has(v));
      const prev = new Map([[x, null]]); const Q = [x]; let endY = null, b = null;
      for (let h = 0; h < Q.length && endY === null; h++) { const u = Q[h]; for (const [v] of A.get(u)) { if (Hv.has(v)) { if (v !== a) { endY = u; b = v; break; } } else if (fr.comp.has(v) && !prev.has(v)) { prev.set(v, u); Q.push(v); } } }
      const mid = []; let y = endY; while (y !== null) { mid.unshift(y); y = prev.get(y); }
      path = [a, ...mid, b];
    }
    const f = faces[fi]; const a = path[0], b = path[path.length - 1]; const ia = f.indexOf(a), ib = f.indexOf(b); const L = f.length;
    const seg = (i, j) => { const out = [f[i]]; while (i !== j) { i = (i + 1) % L; out.push(f[i]); } return out; };
    const inner = path.slice(1, -1);
    const f1 = seg(ia, ib).concat(inner.slice().reverse()), f2 = seg(ib, ia).concat(inner);
    faces.splice(fi, 1, f1, f2);
    for (const v of path) Hv.add(v); for (let i = 0; i + 1 < path.length; i++) He.add(key(path[i], path[i + 1]));
    if (record) steps.push({ path, faces: faces.map(x => x.slice()), He: new Set(He), split: fi, nfrag: frags.length, adm: fr.adm.length });
  }
  return { planar: true, faces, steps };
}
function isPlanarEdges(n, E) { return blocks(n, E).every(b => dmp(E, b).planar); }
function kuratowski(n, E) {
  let cur = E.slice();
  for (let i = 0; i < cur.length;) { const trial = cur.slice(0, i).concat(cur.slice(i + 1)); if (!isPlanarEdges(n, trial)) cur = trial; else i++; }
  const deg = Array(n).fill(0); cur.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  const branch = deg.map((d, i) => d >= 3 ? i : -1).filter(i => i >= 0);
  const type = branch.length === 5 && branch.every(i => deg[i] === 4) ? 'K₅' : branch.length === 6 && branch.every(i => deg[i] === 3) ? 'K₃,₃' : 'Kuratowski';
  return { edges: cur, branch, type };
}
/* Straight-line drawing of a 2-connected plane embedding: outer face on a circle,
   one hidden centre vertex per inner face, barycentric (Tutte) placement. */
function planeDrawing(n, E, faces, outerIdx) {
  const outer = faces[outerIdx]; const P = Array.from({ length: n }, () => [W / 2, H / 2]); const fixed = Array(n).fill(false);
  const r = Math.min(220, 70 + outer.length * 14);
  outer.forEach((v, k) => { const a = -Math.PI / 2 + 2 * Math.PI * k / outer.length; P[v] = [W / 2 + r * Math.cos(a) * 1.35, H / 2 + r * Math.sin(a)]; fixed[v] = true; });
  const inner = faces.map((f, i) => i).filter(i => i !== outerIdx);
  const N = n + inner.length; const adj = Array.from({ length: N }, () => []);
  E.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  inner.forEach((fi, k) => { const c = n + k; for (const v of faces[fi]) { adj[c].push(v); adj[v].push(c); } P.push([W / 2, H / 2]); fixed.push(false); });
  for (let it = 0; it < 3000; it++) { let mv = 0; for (let v = 0; v < N; v++) { if (fixed[v] || !adj[v].length) continue; let x = 0, y = 0; for (const w of adj[v]) { x += P[w][0]; y += P[w][1]; } x /= adj[v].length; y /= adj[v].length; mv = Math.max(mv, Math.abs(x - P[v][0]) + Math.abs(y - P[v][1])); P[v] = [x, y]; } if (mv < 1e-4) break; }
  const centers = inner.map((fi, k) => P[n + k]);
  return { P: P.slice(0, n), centers, inner };
}
function segCross(p1, p2, p3, p4) {
  const o = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = o(p3, p4, p1), d2 = o(p3, p4, p2), d3 = o(p1, p2, p3), d4 = o(p1, p2, p4);
  return ((d1 > 1e-6 && d2 < -1e-6) || (d1 < -1e-6 && d2 > 1e-6)) && ((d3 > 1e-6 && d4 < -1e-6) || (d3 < -1e-6 && d4 > 1e-6));
}
function crossings(P, E) { let c = 0; for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) { const [a, b] = E[i], [x, y] = E[j]; if (a === x || a === y || b === x || b === y) continue; if (segCross(P[a], P[b], P[x], P[y])) c++; } return c; }

function algPlanarity(g, P) {
  const n = g.nodes.length, R = new Rec(); const E = simpleEdgeList(g); const m = E.length;
  const bl = blocks(n, E); const big = bl.filter(b => b.length > 1);
  const { count: comps } = components(g);
  const allPlanar = bl.every(b => dmp(E, b).planar);
  const quick = n >= 3 && m > 3 * n - 6;
  R.line = 0;
  R.snap(`n = ${n}, m = ${m}. ${n >= 3 ? (quick ? `m > 3n − 6 = ${3 * n - 6}, so not planar by Euler’s formula alone. We still run the full test to find a Kuratowski subgraph.` : `m ≤ 3n − 6 = ${3 * n - 6}: the counting test is inconclusive, so run a real planarity test.`) : ''} The graph has ${bl.length} block${bl.length === 1 ? '' : 's'} (2-connected pieces); it is planar exactly when every block is.`, { panel: h4('Blocks') + chips(bl.map(b => `{${[...new Set(b.flatMap(i => [E[i][0], E[i][1]]))].map(v => lab(g, v)).join(',')}}`)) });
  // which block to animate: the largest
  const main = bl.slice().sort((a, b) => b.length - a.length)[0] || [];
  const res = main.length ? dmp(E, main, true) : { planar: true, faces: [], steps: [] };
  // positions: plane drawing if the whole graph is a single 2-connected planar block
  const single = allPlanar && bl.length === 1 && main.length >= 3 && main.length === m && new Set(E.flatMap(([a, b]) => [a, b])).size === n;
  let draw = null;
  if (single) {
    const faces = res.faces; let outer = 0; faces.forEach((f, i) => { if (f.length > faces[outer].length) outer = i; });
    draw = planeDrawing(n, E, faces, outer); const X = crossings(draw.P, E);
    if (X === 0) { g.nodes.forEach((v, i) => { v.x = draw.P[i][0]; v.y = draw.P[i][1]; }); draw.outer = outer; } else draw = null;
  }
  const eIndex = new Map(E.map(([a, b, i]) => [a + ',' + b, i])); const eid = (a, b) => eIndex.get(Math.min(a, b) + ',' + Math.max(a, b));
  const faceList = fs => fs.map((f, i) => `<span class="chip">F${i + 1}: ${f.map(v => lab(g, v)).join('')}</span>`).join('');
  res.steps.forEach((st, k) => {
    R.ec = {}; E.forEach(([a, b, i]) => { R.ec[i] = st.He.has(a + ',' + b) ? 'tree' : 'faint'; });
    for (let i = 0; i + 1 < st.path.length; i++) R.ec[eid(st.path[i], st.path[i + 1])] = 'path';
    R.nc = {}; st.path.forEach(v => R.nc[v] = 'front');
    R.line = k === 0 ? 1 : 3;
    R.snap(k === 0 ? `Start with a cycle ${st.path.map(v => lab(g, v)).join('–')}. It splits the plane into an inside and an outside face.`
      : `Embed a path ${st.path.map(v => lab(g, v)).join('–')} into face F${st.split + 1}${st.adm === 1 ? ' (its only admissible face, so this choice is forced)' : ''}. That face splits in two: ${st.faces.length} faces now.`,
      { panel: h4(`Faces (${st.faces.length})`) + `<div class="chips">${faceList(st.faces)}</div>` + (k ? `<p class="note">${st.nfrag} fragment${st.nfrag === 1 ? '' : 's'} were waiting. A fragment may only go into a face containing all its attachment vertices.</p>` : '') });
  });
  if (!allPlanar) {
    const K = kuratowski(n, E); R.ec = {}; E.forEach(([a, b, i]) => R.ec[i] = 'faint'); K.edges.forEach(([a, b, i]) => R.ec[i] = 'cut'); R.nc = {}; K.branch.forEach(v => R.nc[v] = 'cut');
    R.line = 4;
    if (!res.planar && res.stuck) R.snap(`Stuck: a fragment attached at {${res.stuck.contacts.map(v => lab(g, v)).join(', ')}} fits in no face. The graph is not planar.`, { panel: '' });
    R.snap(`Not planar. Deleting edges while the rest stays non-planar leaves a subdivision of ${K.type}.`, { panel: cert('no', `Contains a subdivision of ${K.type}`, `Branch vertices ${K.branch.map(v => lab(g, v)).join(', ')} (red); the red edges form ${K.type === 'K₅' ? 'ten' : 'nine'} internally disjoint paths between them. By Kuratowski’s theorem this proves non-planarity, and anyone can check it by tracing the paths.`) }, true);
    return { frames: R.frames, truncated: R.truncated };
  }
  const fTot = m - n + 1 + comps; // Euler for planar graphs with c components
  if (!draw) {
    R.ec = {}; R.nc = {}; R.line = 5;
    R.snap(`Planar. ${bl.length > 1 || main.length !== m ? 'The graph is not 2-connected, so its faces are counted block by block; the drawing keeps the stress layout.' : 'Drawing skipped.'}`, { panel: cert('yes', 'Planar', `Every block admits a plane embedding. Euler’s formula for ${comps} component${comps > 1 ? 's' : ''}: n − m + f = 1 + c gives f = ${m} − ${n} + 1 + ${comps} = ${fTot} faces.`) }, true);
    return { frames: R.frames };
  }
  // faces shaded
  const polys = res.faces.map((f, i) => ({ pts: f.map(v => [g.nodes[v].x, g.nodes[v].y]), cls: i === draw.outer ? 'outer' : 'fc' + (i % 8) }));
  R.ec = {}; R.nc = {}; R.line = 5;
  const faceDeg = res.faces.map(f => f.length);
  R.snap(`Planar. A crossing-free drawing of this embedding: ${res.faces.length} faces, including the outer face F${draw.outer + 1}.`, {
    polys, ask: { type: 'number', answer: [res.faces.length], prompt: `This graph has n = ${n} and m = ${m}. How many faces does a plane drawing have (count the outer face)?` },
    panel: cert('yes', `n − m + f = ${n} − ${m} + ${res.faces.length} = ${n - m + res.faces.length}`, 'Euler’s formula for a connected plane graph. The face lengths add up to 2m, because every edge borders two faces (or one face twice).') + h4('Face lengths') + `<div class="chips">${faceList(res.faces)}</div><p class="note">Σ lengths = ${faceDeg.reduce((a, b) => a + b, 0)} = 2m = ${2 * m}.</p>`
  });
  // dual graph
  const dual = cloneGraph(g); dual.nodes = g.nodes.slice(); const fpos = res.faces.map((f, i) => i === draw.outer ? [W - 34, 30] : draw.centers[draw.inner.indexOf(i)]);
  const fid = res.faces.map((f, i) => { const idx = dual.nodes.length; dual.nodes.push({ id: '9|F' + (i + 1), label: 'F' + (i + 1), x: fpos[i][0], y: fpos[i][1], part: 0 }); return idx; });
  const sideOf = new Map(); res.faces.forEach((f, i) => { for (let k = 0; k < f.length; k++) { const kk = Math.min(f[k], f[(k + 1) % f.length]) + ',' + Math.max(f[k], f[(k + 1) % f.length]); (sideOf.get(kk) || sideOf.set(kk, []).get(kk)).push(i); } });
  const overlay = []; const ddeg = res.faces.map(() => 0);
  const nc = {}; const cx = g.nodes.reduce((a, v) => a + v.x, 0) / n, cy = g.nodes.reduce((a, v) => a + v.y, 0) / n;
  for (const [a, b] of E) {
    const fs = sideOf.get(a + ',' + b) || []; if (fs.length < 2) continue; const [f1, f2] = fs; ddeg[f1]++; ddeg[f2]++;
    const mid = [(g.nodes[a].x + g.nodes[b].x) / 2, (g.nodes[a].y + g.nodes[b].y) / 2];
    if (f1 !== draw.outer && f2 !== draw.outer) { overlay.push({ u: fid[f1], v: fid[f2], cls: 'dual', label: '', via: mid }); continue; }
    // an edge to the outer face: draw a stub leaving the drawing through this edge
    const inner = f1 === draw.outer ? f2 : f1; let ox = mid[0] - cx, oy = mid[1] - cy; const L = Math.hypot(ox, oy) || 1; ox /= L; oy /= L;
    const stub = dual.nodes.length; dual.nodes.push({ id: '9|s' + stub, label: '', x: Math.max(14, Math.min(W - 14, mid[0] + ox * 46)), y: Math.max(14, Math.min(H - 14, mid[1] + oy * 46)), part: 0 }); nc[stub] = 'hide';
    overlay.push({ u: fid[inner], v: stub, cls: 'dual', label: '', via: mid, dir: true });
  }
  fid.forEach(i => nc[i] = 'dualv'); const ec = {}; g.edges.forEach((e, i) => ec[i] = 'faint');
  R.line = 6;
  R.frames.push({ msg: `The dual graph: one vertex per face, one dual edge crossing each original edge. Arrows leaving the drawing all end at F${draw.outer + 1}, the vertex of the outer face (shown in the corner).`, graph: dual, nc, ec, ntag: {}, elab: {}, overlay, polys, line: R.line,
    panel: cert('info', `Dual: ${res.faces.length} vertices, ${m} edges`, `Each face of G becomes a vertex of G*, and its length becomes that vertex’s degree. G* is planar again, its faces correspond to the ${n} vertices of G, and (G*)* = G for connected plane graphs.`) + table(['face', 'length = dual degree'], res.faces.map((f, i) => [`F${i + 1}`, `${f.length} = ${ddeg[i]}`]), 'compact') + '<p class="note">Colouring the faces of a map is the same as colouring the vertices of its dual: this is how the four colour theorem for maps becomes a statement about planar graphs.</p>' });
  return { frames: R.frames };
}
