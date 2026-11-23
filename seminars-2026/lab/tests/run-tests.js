#!/usr/bin/env node
/* Graph Studio Lab test suite: node tests/run-tests.js  (no dependencies)
   Checks algorithms against known answers and brute force, and checks that every
   module, pseudocode line, prediction question, certificate, ticket and definition is consistent. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const SRC = path.join(__dirname, '..', 'src');
const ORDER = ['data', 'core', 'algos1', 'algos2', 'algos3', 'algos4', 'algos5', 'algos6', 'modules', 'pseudo', 'certs', 'tickets', 'anim', 'defs', 'motivation', 'sheets', 'guide'];
vm.runInThisContext(ORDER.map(f => fs.readFileSync(path.join(SRC, f + '.js'), 'utf8')).join('\n'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const last = r => r.frames[r.frames.length - 1];
const txt = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const P = k => { const g = parseGraph(PRESETS[k].text); return g; };

/* --- known answers --- */
ok(JSON.stringify([1, 2, 3, 4, 5, 6, 7].map(n => graphsOfOrder(n).length)) === '[1,2,4,11,34,156,1044]', 'graph counts up to n = 7');
const pet = P('petersen'); ok(encodeGraph6(decodeGraph6('IheA@GUAo')) === 'IheA@GUAo', 'graph6 round trip');
ok(/weight 13/.test(txt(last(algKruskal(P('studio_fiber'), {})).panel)), 'Kruskal fiber = 13');
ok(/weight 13/.test(txt(last(algPrim(P('studio_fiber'), { source: 0 })).panel)), 'Prim fiber = 13');
ok(/verified/.test(txt(last(algDijkstra(P('studio_transit'), { source: 0 })).panel)), 'Dijkstra transit verified');
ok(/wrong here/.test(txt(last(algDijkstra(P('rebate'), { source: 0 })).panel)), 'Dijkstra fails on rebate');
ok(/Negative cycle/.test(txt(last(algBellmanFord(P('arbitrage'), { source: 0 })).panel)), 'Bellman–Ford finds negative cycle');
{ const g = P('clrs'); ok(/= 23/.test(txt(last(algFlow(g, { source: 0, sink: g.nodes.findIndex(v => v.label === 't') })).panel)), 'CLRS max flow 23'); }
ok(/\|M\| = \|C\| = 3/.test(txt(last(algKuhn(P('hall'), {})).panel)), 'Kuhn on placement shortfall');
ok(/Hall violator/.test(txt(last(algKuhn(P('hall'), {})).panel)), 'Hall violator found');
ok(/\|Aut\(G\)\| = 120/.test(txt(algAut(pet, {}).frames[1].panel)), '|Aut(Petersen)| = 120');
ok(/Not Hamiltonian/.test(txt(last(algHamilton(pet, { source: 0 })).panel)), 'Petersen not Hamiltonian');
ok(/χ = 3/.test(txt(last(algExactColor(pet, {})).panel)), 'χ(Petersen) = 3');
ok(/γ\(G\) = 3/.test(txt(last(algDomExact(pet, {})).panel)), 'γ(Petersen) = 3');
ok(/γ\(G\) = 4/.test(txt(last(algDomExact(P('grid44'), {})).panel)), 'γ(4×4 grid) = 4');
ok(/cannot tell/.test(txt(last(algWL(P('pair_c6'), {})).panel)), 'WL fails on C6 vs 2K3');
ok(/Not isomorphic/.test(txt(last(algWL(P('pair_trees'), {})).panel)), 'WL separates the two trees');
ok(/2,000/.test(txt(algRaceFlow(P('zigzag'), { source: 0, sink: 3 }).frames[0].panel)), 'unlucky Ford–Fulkerson takes 2000 augmentations');
{ const r = algTSPCompare(P('courier'), { source: 0 }); const t = txt(last(r).panel); ok(/OPT = 245/.test(t) || /OPT =/.test(t), 'TSP runs on courier'); }
for (const n of [3, 4, 5]) ok(new RegExp(`${[0, 0, 0, 4, 11, 34][n]} isomorphism classes`).test(last(algGenWalk(null, { n })).msg), `generator walk n = ${n}`);
{ const r = algRealVsRandom(null, { seed: 1 }); ok(/546/.test(txt(r.frames[0].panel)) && /153/.test(txt(r.frames[0].panel)), 'airports n = 546, max degree 153'); }

/* --- cross-checks against brute force --- */
const perm = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perm(a.slice(0, i).concat(a.slice(i + 1))).map(p => [x, ...p]));
for (let s = 1; s <= 40; s++) { const R = rng(s); const n = 2 + s % 4; const C = Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(R() * 20))); const r = algHungarian(null, { cost: C.map((row, i) => `r${i}: ` + row.join(' ')).join('\n') }); const m = +txt(last(r).panel).match(/Minimum cost (\S+)/)[1]; let best = 1e9; for (const p of perm([...Array(n).keys()])) best = Math.min(best, p.reduce((a, j, i) => a + C[i][j], 0)); ok(m === best && /cert yes/.test(last(r).panel), `Hungarian seed ${s}`); }
for (let s = 1; s <= 30; s++) { const R = rng(s); let t = ''; for (let i = 0; i < 8; i++) t += `L${i}\nR${i}\n`; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (R() < 0.25) t += `L${i} R${j}\n`; const G = parseGraph(t); ok(kuhnCount(G).size === algHopcroftKarp(G, {}).stats.size, `Hopcroft–Karp = Kuhn seed ${s}`); }
{ const counts = { 5: 33, 6: 142, 7: 822 }; for (const n of [5, 6, 7]) { let c = 0, drawn = 0, two = 0; for (const a of graphsOfOrder(n)) { const E = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (a[i] >> j & 1) E.push([i, j, E.length]); const bl = blocks(n, E); const pl = bl.every(b => dmp(E, b).planar); if (pl) c++; if (pl && bl.length === 1 && bl[0].length === E.length && E.length >= 3 && new Set(E.flatMap(e => [e[0], e[1]])).size === n) { two++; const r = dmp(E, bl[0]); ok(r.faces.length === E.length - n + 2, 'Euler formula on embedding'); let o = 0; r.faces.forEach((f, i) => { if (f.length > r.faces[o].length) o = i; }); if (crossings(planeDrawing(n, E, r.faces, o).P, E) === 0) drawn++; } } ok(c === counts[n], `planar graphs on ${n} vertices = ${counts[n]} (got ${c})`); ok(drawn === two, `all ${two} 2-connected planar graphs on ${n} vertices drawn without crossings`); } }
ok(/K₃,₃/.test(txt(last(algPlanarity(pet, {})).panel)), 'Petersen contains a K3,3 subdivision');
ok(/Dual: 20 vertices, 30 edges/.test(txt(last(algPlanarity(P('planar_ico'), {})).panel)), 'icosahedron dual has 20 vertices');

/* --- module consistency: pseudocode lines, questions, Python export --- */
for (const m of MODULES) for (const a of m.algos) {
  let g = null; if (!m.own && !a.own) { g = parseGraph(PRESETS[m.preset].text); if (m.weighted) g.weighted = true; circleLayout(g); }
  const Pm = {}; for (const p of a.params) { if (p.type === 'vertex') { let i = g.nodes.findIndex(v => v.label === p.def); if (i < 0) i = p.last ? g.nodes.length - 1 : 0; Pm[p.id] = i; } else Pm[p.id] = p.def; }
  let r; try { r = a.run(g, Pm); } catch (e) { ok(false, `${m.key}.${a.key} throws ${e.message}`); continue; }
  ok(r.frames.length > 0, `${m.key}.${a.key} has frames`);
  const ps = PSEUDO[m.key + '.' + a.key];
  r.frames.forEach((f, i) => { if (ps && f.line !== undefined) ok(f.line >= 0 && f.line < ps.length, `${m.key}.${a.key} frame ${i} line ${f.line}`); if (f.ask) ok(Array.isArray(f.ask.answer) && f.ask.answer.length > 0 && f.ask.answer.every(x => x !== undefined && !Number.isNaN(x)), `${m.key}.${a.key} frame ${i} question`); });
  ok(typeof IDEAS[m.key + '.' + a.key] === 'string' && IDEAS[m.key + '.' + a.key].length > 60 && /Idea:/.test(IDEAS[m.key + '.' + a.key]), `${m.key}.${a.key} has an intuitive summary`);
  let py = ''; try { py = pythonSnippet(m.key, a.key, r.graph || g, Pm); } catch (e) { } ok(py.length > 20, `${m.key}.${a.key} python export`);
  for (const t of m.tasks) if (t.setup && t.setup.preset) ok(!!PRESETS[t.setup.preset], `task preset ${t.setup.preset} exists`);
  for (const t of m.tasks) if (t.setup && t.setup.algo) ok(m.algos.some(x => x.key === t.setup.algo), `task algo ${m.key}.${t.setup.algo} exists`);
}

/* --- certificates --- */
const C = (mod, key) => CERTS[mod].find(c => c.key === key);
const Es = (g, ...pairs) => new Set(pairs.map(([a, b]) => g.edges.findIndex(e => (g.nodes[e.u].label === a && g.nodes[e.v].label === b) || (g.nodes[e.u].label === b && g.nodes[e.v].label === a))));
const Vs = (g, ...ls) => new Set(ls.map(l => g.nodes.findIndex(v => v.label === l)));
{ const g = P('studio_coloring'); ok(C('traverse', 'odd').check(g, Es(g, ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A'])).ok, 'odd cycle accepted'); }
{ const g = P('studio_fiber'); ok(C('mst', 'st').check(g, Es(g, ['B', 'C'], ['A', 'C'], ['D', 'E'], ['E', 'F'], ['B', 'D'])).ok, 'MST accepted'); ok(!C('mst', 'st').check(g, Es(g, ['B', 'C'], ['A', 'C'], ['D', 'E'], ['E', 'F'], ['C', 'D'])).ok, 'non-minimum tree rejected'); }
{ const g = P('clrs'); const t = g.nodes.findIndex(v => v.label === 't'); ok(C('flow', 'cut').check(g, Vs(g, 's', 'v1', 'v2', 'v4'), { P: { source: 0, sink: t } }).ok, 'min cut accepted'); ok(!C('flow', 'cut').check(g, Vs(g, 's'), { P: { source: 0, sink: t } }).ok, 'non-min cut rejected'); }
{ const g = P('hall'); ok(C('match', 'hall').check(g, Vs(g, 'Ana', 'Ben', 'Cid', 'Eva')).ok, 'Hall violator accepted'); ok(C('match', 'cover').check(g, Vs(g, 'Bank', 'Lab', 'Dan')).ok, 'cover accepted'); }
{ const K = kuratowski(10, simpleEdgeList(pet)); ok(C('color', 'kur').check(pet, new Set(K.edges.map(e => e[2]))).ok, 'Kuratowski subgraph accepted'); }
{ const g = P('grid44'); ok(C('dom', 'packing').check(g, Vs(g, 'A1', 'A4', 'D1', 'D4')).ok, 'packing accepted'); ok(/optimal/.test(C('dom', 'domset').check(g, Vs(g, 'A2', 'C1', 'B4', 'D3')).msg), 'optimal dominating set'); }
{ const g = P('pair_c6'); ok(!C('iso', 'bij').check(g, 'a->a, b->b, c->c, d->d, e->e, f->f').ok, 'false isomorphism rejected'); }

/* --- tickets: deterministic, varied, no errors --- */
for (const k of Object.keys(TICKETS)) { let err = 0; for (let s = 1; s <= 20; s++) { try { const t = TICKETS[k](s); if (!t.task || !t.answer) err++; if (t.text) parseGraph(t.text); } catch (e) { err++; } } ok(err === 0, `tickets ${k}`); ok(TICKETS[k](7).answer === TICKETS[k](7).answer, `ticket ${k} deterministic`); }

/* --- definitions refer only to existing vertices and edges --- */
for (const m of MODULES) { ok((DEFS[m.key] || []).length >= 5, `at least five definitions for ${m.key}`); for (const d of DEFS[m.key] || []) { const g = parseGraph(d.g); const L = new Set(g.nodes.map(v => v.label)); const keys = new Set(g.edges.flatMap(e => [g.nodes[e.u].label + '-' + g.nodes[e.v].label, g.nodes[e.v].label + '-' + g.nodes[e.u].label])); for (const [, s] of d.steps) { for (const k of Object.keys(s.e || {})) ok(keys.has(k), `${d.term}: edge ${k}`); for (const k of [...Object.keys(s.n || {}), ...Object.keys(s.t || {})]) ok(L.has(k), `${d.term}: vertex ${k}`); } } }

/* --- every concept is motivated: a real problem on each definition, a motivating first task per session --- */
for (const m of MODULES) { ok(m.tasks[0] && m.tasks[0].tag === 'Motivation', `${m.key} opens with a motivating problem`); if (m.tasks[0].setup && m.tasks[0].setup.algo) ok(m.algos.some(a => a.key === m.tasks[0].setup.algo), `${m.key} motivation setup`); for (const d of DEFS[m.key]) ok(typeof d.why === 'string' && d.why.length > 40, `${m.key}: ${d.term} has a motivation`); }


/* --- ILP for Hamilton cycles and TSP (session 6): lazy subtour constraints agree with exhaustive search --- */
{
  const bruteTour = g => { const n = g.nodes.length, W = Array.from({ length: n }, () => Array(n).fill(Infinity)); g.edges.forEach(e => { W[e.u][e.v] = Math.min(W[e.u][e.v], e.w); if (!g.directed) W[e.v][e.u] = Math.min(W[e.v][e.u], e.w); });
    let best = Infinity; const used = Array(n).fill(false); used[0] = true; const go = (v, k, c) => { if (c >= best) return; if (k === n) { if (W[v][0] < Infinity) best = Math.min(best, c + W[v][0]); return; } for (let u = 1; u < n; u++) if (!used[u] && W[v][u] < Infinity) { used[u] = true; go(u, k + 1, c + W[v][u]); used[u] = false; } }; go(0, 1, 0); return best; };
  let agreeT = true, agreeH = true, cases = 0;
  for (let s = 1; s <= 60; s++) { const R = rng(1000 + s); const n = 4 + s % 5; let text = ''; for (let i = 0; i < n; i++) text += `v${i}\n`; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (R() < 0.55) text += `v${i} v${j} ${1 + Math.floor(R() * 9)}\n`;
    const g = parseGraph(text); g.weighted = true; const b = bruteTour(g); cases++;
    const rt = algTourILP(g, { goal: 'tsp' }), rh = algTourILP(g, { goal: 'ham' });
    if (b === Infinity ? rt.tour !== null : !(rt.tour && Math.abs(rt.cost - b) < 1e-9 && rt.tour.length === n)) agreeT = false;
    if ((b === Infinity) !== (rh.tour === null)) agreeH = false; }
  ok(agreeT, `ILP TSP optimum equals exhaustive search on ${cases} random graphs`);
  ok(agreeH, 'ILP Hamilton answer equals exhaustive search on the same graphs');
  { const r = algTourILP(P('petersen'), { goal: 'ham' }); ok(r.tour === null && /No Hamilton cycle/.test(txt(last(r).panel)), `ILP proves Petersen non-Hamiltonian (${r.cuts} subtour constraints)`); }
  { const g = P('courier'); g.weighted = true; const r = algTourILP(g, { goal: 'tsp' }); ok(r.tour && r.tour.length === 10 && Math.abs(r.cost - bruteTour(g)) < 1e-9, `ILP solves the courier TSP on the road graph (weight ${r.cost}, ${r.cuts} cuts)`); }
  { const g = parseGraph('directed\na b 1\nb c 1\nc a 1\na c 5\nc b 5\nb a 5'); g.weighted = true; const r = algTourILP(g, { goal: 'tsp' }); ok(r.tour && r.cost === 3, 'ILP respects arc directions in a digraph'); }
}

/* --- Fleury (session 6, PS 5 P1.8): a valid Euler trail on every small graph that has one --- */
{
  const checkTrail = (g, r, startSet) => { const t = r.trail, o = r.order; if (!t || o.length !== g.edges.length || new Set(o).size !== o.length) return false;
    for (let k = 0; k < o.length; k++) { const e = g.edges[o[k]]; if (!((e.u === t[k] && e.v === t[k + 1]) || (e.v === t[k] && e.u === t[k + 1]))) return false; }
    return !startSet || startSet.includes(t[0]); };
  let tested = 0, okAll = true, asksOk = true, rejectOk = true;
  for (let n = 2; n <= 6; n++) for (const a of graphsOfOrder(n)) {
    let text = ''; for (let i = 0; i < n; i++) { text += `v${i}\n`; for (let j = i + 1; j < n; j++) if (a[i] >> j & 1) text += `v${i} v${j}\n`; }
    const g = parseGraph(text); if (!g.edges.length) continue;
    const deg = g.nodes.map((v, i) => g.edges.filter(e => e.u === i || e.v === i).length), odd = deg.map((d, i) => d % 2 ? i : -1).filter(i => i >= 0);
    const { comp } = components(g); const one = new Set(g.nodes.map((v, i) => i).filter(i => deg[i]).map(i => comp[i])).size === 1;
    for (const src of [0, n - 1]) { const r = algFleury(g, { source: src });
      if (one && odd.length <= 2) { tested++; if (!checkTrail(g, r, odd.length ? odd : null)) okAll = false;
        r.frames.forEach((f, i) => { if (f.ask && r.frames[i + 1]) { const taken = r.order.find(e => r.frames[i + 1].ec[e] === 'tree' && f.ec[e] !== 'tree'); if (!f.ask.answer.includes(taken)) asksOk = false; } }); }
      else if (!/No Euler trail/.test(txt(last(r).panel))) rejectOk = false; }
  }
  ok(tested > 100 && okAll, `Fleury gives a valid Euler trail or circuit on all ${tested} small cases`);
  ok(asksOk, 'Fleury: every Predict answer set contains the edge actually taken');
  ok(rejectOk, 'Fleury rejects graphs with more than two odd vertices or disconnected edges');
  { const g = P('barbell'), c = g.nodes.findIndex(v => v.label === 'c'); const r = algFleury(g, { source: c }); const bridge = g.edges.findIndex(e => [e.u, e.v].map(i => g.nodes[i].label).sort().join() === 'c,d');
    ok(checkTrail(g, r) && r.order.indexOf(bridge) > 0 && r.order.indexOf(bridge) === 3, 'Fleury on the barbell finishes the triangle before crossing the bridge c–d'); }
  { const g = parseGraph('a b\na b\nb c\nc a'); const r = algFleury(g, { source: 0 }); ok(checkTrail(g, r), 'Fleury handles parallel edges'); }
}

/* --- the teacher's problem sets: links, presets transcribed from the PDFs, and every "load in the lab" button --- */
{
  const REPO = path.join(__dirname, '..', '..', '..');
  for (let n = 1; n <= 11; n++) {
    ok(fs.existsSync(path.join(REPO, 'exercises and projects', SHEET_FILE(n))), `problem set ${n} PDF exists in the repository`);
    ok(decodeURIComponent(sheetURL(n)).endsWith('/blob/main/exercises and projects/' + SHEET_FILE(n)), `problem set ${n} URL points at that file`);
  }
  const used = new Set();
  for (const [key, blocks] of Object.entries(SHEETS)) {
    const m = MODULES.find(x => x.key === key); ok(!!m, `SHEETS.${key} is a session`); if (!m) continue;
    for (const b of blocks) { ok(b.ps >= 1 && b.ps <= 11, `${key}: problem set ${b.ps}`); used.add(b.ps);
      for (const it of b.items) { ok(it.p && it.title && it.page, `${key} PS ${b.ps} ${it.p} has number, title, page`);
        for (const [label, su] of it.runs || []) {
          const where = `${key} PS ${b.ps} ${it.p} “${label}”`;
          const a = m.algos.find(x => x.key === (su.algo || m.algos[0].key)); ok(!!a, `${where}: algorithm ${su.algo} is in the session`); if (!a) continue;
          if (su.preset) ok(!!PRESETS[su.preset], `${where}: preset ${su.preset}`);
          const g = su.preset && PRESETS[su.preset] ? parseGraph(PRESETS[su.preset].text) : null; if (g && m.weighted) g.weighted = true;
          const P = {};
          for (const spec of a.params) { const v = (su.params || {})[spec.id] ?? spec.def;
            if (spec.type === 'vertex') { const i = g ? g.nodes.findIndex(x => x.label === String(v)) : -1; ok(!g || a.own || i >= 0, `${where}: vertex ${spec.id} = ${v} exists`); P[spec.id] = i < 0 ? 0 : i; }
            else P[spec.id] = spec.type === 'int' || spec.type === 'num' ? +v : v; }
          let r = null; try { r = a.run(a.own ? null : g, P); } catch (e) { console.log(e); }
          ok(r && r.frames && r.frames.length > 0, `${where}: runs to a result`);
        } } }
  }
  for (let n = 1; n <= 11; n++) ok(used.has(n), `problem set ${n} is linked from some session`);
  for (const [k, p] of Object.entries(SHEET_PRESETS)) {
    const g = parseGraph(p.text); ok(g.nodes.length > 0 && g.edges.length > 0, `${k} parses`);
    if (p.pos) { ok(g.nodes.every(v => p.pos[v.id] || p.pos[v.label]), `${k}: every vertex has a sheet position`); ok(Object.values(p.pos).every(([x, y]) => x >= 12 && x <= W - 12 && y >= 12 && y <= H - 12), `${k}: positions on the board`); }
  }
  for (const [key, D] of Object.entries(SHEET_DEFS)) for (const term of Object.keys(D)) ok((DEFS[key] || []).some(d => d.term === term && d.practice), `${key}: practice link on “${term}”`);
  for (const key of Object.keys(SHEET_MOTIV)) ok(/sheetref/.test(MODULES.find(m => m.key === key).tasks[0].text), `${key}: motivating task points to its problem set`);
  /* structural checks on the transcriptions (counts read off the drawings) */
  const deg = (g, part) => g.nodes.map((v, i) => [v, i]).filter(([v]) => part === undefined || v.part === part).map(([, i]) => g.edges.filter(e => e.u === i || e.v === i).length);
  const shape = (k, part) => { const g = parseGraph(SHEET_PRESETS[k].text); const d = deg(g, part); return [d.length, d.reduce((a, b) => a + b, 0) / 2, Math.min(...d), Math.max(...d)].join(','); };
  for (const k of ['ps2_2a', 'ps2_2b', 'ps2_2c']) ok(shape(k) === '10,15,3,3', `${k}: cubic on 10 vertices`);
  for (const q of [0, 1, 2]) ok(shape('ps3_2f', q) === '8,12,3,3', `PS 3 (f) graph ${q + 1}: cubic on 8 vertices`);
  for (const q of [0, 1, 2, 3]) ok(shape('ps3_2g', q) === '7,14,4,4', `PS 3 (g) graph ${q + 1}: 4-regular on 7 vertices`);
  for (const q of [0, 1, 2, 3]) ok(shape('ps3_2i', q) === '8,12,3,3', `PS 3 (i) graph ${q + 1}: cubic on 8 vertices`);
  ok(shape('ps3_2b', 0).startsWith('8,7,') && shape('ps3_2b', 1).startsWith('7,6,'), 'PS 3 (b): trees of orders 8 and 7');
  ok(shape('ps3_2c', 0).startsWith('8,7,') && shape('ps3_2c', 1).startsWith('8,7,'), 'PS 3 (c): two trees of order 8');
  for (const k of ['ps5_1b1', 'ps5_1b2', 'ps9_3']) { const g = parseGraph(SHEET_PRESETS[k].text); ok(g.nodes.length === 11 && g.edges.length === 20 && triangleCount(g) === 0, `${k}: 11 vertices, 20 edges, triangle-free`); ok(/χ = 4/.test(txt(last(algExactColor(g, {})).panel)), `${k}: χ = 4`); }
  ok(SHEETS.degrees[1].items[1].runs.map(r => r[1].params.seq).join('|') === '2 2 2 1 1|2 2|2 2 2 2|3 3 5 1 7 9 1|3 3 3 3 3 3 3 3|6 5 5 4 3 3 3 2 2|3 3 2 2 1 1|7 6 4 3 3 2|3 3 1 1|5 4 3 3 2 2 2 1 1 1', 'PS 2 P3: the ten sequences as printed');
  { const g = parseGraph(SHEET_PRESETS.ps7_n1323.text); ok(g.directed && g.edges.length === 28, 'Fig. 13.23: 16 arcs + 6 two-way lines as 12 arcs'); }
  { const g = parseGraph(SHEET_PRESETS.ps3_2j.text); ok(g.directed && g.parts === 2, 'PS 3 (j) is a pair of digraphs'); }
  /* digraph refinement and automorphisms respect direction */
  { const g = parseGraph('directed\na b\nb c\n---\nx y\nz y'); ok(/Not isomorphic/.test(txt(last(algWL(g, {})).panel)), 'WL separates a directed path from an in-star'); }
  { const g = parseGraph('directed\na b\nb c\nc a'); ok(autSearch(g, Array(3).fill(0)).count === 3, '|Aut| of a directed 3-cycle is 3'); }
}

/* --- layout menu, rotation and mirroring --- */
{
  const box = { x0: 46, x1: 754, y0: 46, y1: 474 }, inBox = g => g.nodes.every(v => Number.isFinite(v.x) && Number.isFinite(v.y) && v.x >= box.x0 - 1e-6 && v.x <= box.x1 + 1e-6 && v.y >= box.y0 - 1e-6 && v.y <= box.y1 + 1e-6);
  const graphs = ['a b\nb c\nc d\nd a\na c\ne f', 'r a\nr b\na c\na d\nb e\nb f\nc g', 'a b\nb c\nc d\nd e\ne a\na f\nb g\nc h\nd i\ne j\nf h\nh j\nj g\ng i\ni f', 'x', 'a b\n---\nc d\nd e'];
  for (const t of graphs) for (const k of Object.keys(LAYOUTS)) {
    const g = parseGraph(t), done = layoutGraph(g, k, box, { seed: 5 });
    if (k === 'columns' && !twoColoring(g)) { ok(!done, `columns refuses a non-bipartite graph (${t.split('\n').length} lines)`); continue; }
    ok(done && inBox(g), `${k} layout stays in the box (${t.slice(0, 12)}…)`);
  }
  { const g = parseGraph('r a\nr b\na c\na d\nb e\nb f'); layoutGraph(g, 'layered', box, { root: 0 }); const y = l => g.nodes.find(v => v.label === l).y, x = l => g.nodes.find(v => v.label === l).x;
    ok(y('r') < y('a') && y('a') === y('b') && y('a') < y('c'), 'layered: one row per BFS level from the start');
    ok(Math.abs(x('a') - (x('c') + x('d')) / 2) < 1 && Math.abs(x('r') - (x('a') + x('b')) / 2) < 1, 'layered: parents sit above the middle of their children'); }
  { const g = parseGraph('a b\nb c\nc d\nd a\na c\ne f'); layoutGraph(g, 'shells', box, { root: 0 }); const c = g.nodes[0], d = v => Math.hypot(v.x - c.x, v.y - c.y);
    ok(d(g.nodes[1]) > 1 && d(g.nodes[4]) > d(g.nodes[1]), 'shells: start in the middle, other components further out'); }
  { const g = parseGraph('a b\nb c\nc d\nd e\ne f\nf g\ng h'); layoutGraph(g, 'stress', box); const len = () => { const e = g.edges[0], a = g.nodes[e.u], b = g.nodes[e.v]; return Math.hypot(a.x - b.x, a.y - b.y); }, L0 = len();
    for (let k = 0; k < 4; k++) rotateGraph(g, 90, box); ok(inBox(g) && Math.abs(len() - L0) < 1e-6, 'four quarter turns: back in the box at the original size');
    const before = g.nodes.map(v => [v.x, v.y]); rotateGraph(g, 0, box, true); rotateGraph(g, 0, box, true); ok(g.nodes.every((v, i) => Math.abs(v.x - before[i][0]) < 1e-6 && Math.abs(v.y - before[i][1]) < 1e-6), 'mirroring twice is the identity');
    rotateGraph(g, 15, box); const p = g.nodes.map(v => [v.x, v.y]); const d01 = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); ok(inBox(g) && d01 <= L0 + 1e-6, 'a 15° turn keeps the drawing in the box and never enlarges it'); }
}

/* --- the tour ILP written out for the graph on the board --- */
{
  const g = parseGraph('a b 3\nb c 4\nc a 5\nc d 1\nd a 2'); g.weighted = true;
  const r = algTourILP(g, { goal: 'tsp' }), f = r.frames.find(x => x.panel && x.panel.includes('ILP of this graph'));
  ok(!!f && /x<sub>a,?b<\/sub>/.test(f.panel) && f.panel.includes('3·x') && f.panel.includes('out d') && f.panel.includes('0 ≤ x<sub>ij</sub> ≤ 1') && /\n {7}\+ \d·x/.test(f.panel), 'model frame lists this graph\'s variables, weights, degree rows and the LP bounds');
  ok(r.frames[0].panel.includes('ILP of the graph on the board') && r.frames[0].panel.includes('data-kind="ilpfile"'), 'the first ILP step already shows this graph\'s model');
  const M = tourModel(g, [{ i: 0, j: 1, w: 3 }, { i: 1, j: 0, w: 3 }], true, [[0]]);
  ok(/^Minimize$/m.test(M.ilpFile) && /^Subject To$/m.test(M.ilpFile) && /^Binary$/m.test(M.ilpFile) && !/^Binary$/m.test(M.lpFile) && /sec1: +x_a_b >= 1/.test(M.ilpFile), 'LP file has the CPLEX sections; Binary only in the ILP version');
  const last = r.frames[r.frames.length - 1].panel, rows = (last.match(/data-kind="ilpfile">([\s\S]*?)<\/pre>/) || ['', ''])[1];
  ok((rows.match(/^ (out|in)_/gm) || []).length === 8 && (rows.match(/^ sec\d+:/gm) || []).length === r.cuts, 'final LP file: 2n degree rows and one row per subtour constraint added');
  const odd = parseGraph('1 x\n2 x'); const m2 = tourModel(odd, [{ i: 0, j: 1, w: 1 }, { i: 1, j: 0, w: 1 }], false); ok(/out_v1:/.test(m2.ilpFile) && /obj: 0/.test(m2.ilpFile), 'labels starting with a digit become valid LP names; Hamilton objective is 0');
}

/* --- session 05: DAG shortest paths, Johnson, and the "which algorithm" guide --- */
{
  const R = rng(11), rnd = k => Math.floor(R() * k);
  const fwAll = g => { const n = g.nodes.length, F = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity)); g.edges.forEach(e => { F[e.u][e.v] = Math.min(F[e.u][e.v], e.w); if (!g.directed) F[e.v][e.u] = Math.min(F[e.v][e.u], e.w); }); for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (F[i][k] + F[k][j] < F[i][j]) F[i][j] = F[i][k] + F[k][j]; return F; };
  let dagOk = 0, johOk = 0, johN = 0;
  for (let t = 0; t < 40; t++) { // random DAGs with negative weights: one pass equals Bellman–Ford
    const n = 3 + rnd(8), lines = ['directed']; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (R() < 0.35) lines.push(`v${i} v${j} ${rnd(13) - 4}`);
    if (lines.length < 2) continue; const g = parseGraph(lines.join('\n')); g.weighted = true;
    const r = algDagSP(g, { source: 0 }), bf = bellmanFordPlain(g, 0); if (r.d && bf && r.d.every((x, i) => x === bf[i])) dagOk++; else dagOk -= 100;
  }
  ok(dagOk > 30, 'DAG shortest paths matches Bellman–Ford on random DAGs with negative weights');
  for (let t = 0; t < 40; t++) { // random digraphs whose negative arcs only go "forward" (no negative cycle): Johnson equals Floyd–Warshall
    const n = 3 + rnd(7), lines = ['directed']; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && R() < 0.3) lines.push(`v${i} v${j} ${i < j ? rnd(12) - 4 : rnd(9) + 4}`);
    if (lines.length < 2) continue; const g = parseGraph(lines.join('\n')); g.weighted = true; if (!bellmanFordPlain(g, 0)) continue; const F = fwAll(g); if (F.some((r, i) => r[i] < 0)) continue;
    johN++; const r = algJohnson(g, {}); if (r.D && r.D.every((row, i) => row.every((x, j) => x === F[i][j]))) johOk++;
  }
  ok(johN > 15 && johOk === johN, `Johnson matches Floyd–Warshall (${johOk}/${johN})`);
  { const g = parseGraph(PRESETS.arbitrage.text); g.weighted = true; const r = algJohnson(g, {}); ok(!r.D && /negative cycle/.test(r.frames.at(-1).msg), 'Johnson stops on the currency loop'); }
  { const g = parseGraph('a b 2\nb c 1'); g.weighted = true; ok(!algDagSP(g, { source: 0 }).d, 'an undirected graph is not a DAG'); }
  { const g = parseGraph('directed\na b 1\nb a 1'); g.weighted = true; ok(!algDagSP(g, { source: 0 }).d, 'a directed 2-cycle is not a DAG'); }
  const walk = (kind, text, weighted = true) => { const g = parseGraph(text); g.weighted = weighted; const F = spFacts(g), ans = {}; for (const k of ['unw', 'dag', 'nonneg', 'dense', 'transform']) ans[k] = spAnswer(k, F, g).a; return { F, leaf: spWalk(kind, ans).leaf }; };
  ok(walk('sssp', 'a b 2\nb c 2\nc a 2').leaf === 'bfs' && walk('apsp', 'a b\nb c', false).leaf === 'bfsall', 'guide: equal weights → BFS');
  ok(walk('sssp', PRESETS.rebate.text).leaf === 'dag' && walk('apsp', PRESETS.rebate.text).leaf === 'dagall', 'guide: the rebate network is a DAG → DAG shortest paths');
  ok(walk('sssp', 'a b 2\nb c 5\nc a 1').leaf === 'dijkstra', 'guide: undirected, weights ≥ 0 → Dijkstra');
  { const r = walk('sssp', PRESETS.arbitrage.text); ok(r.leaf === 'bf' && r.F.negCycle, 'guide: currency loop → Bellman–Ford, negative cycle flagged'); }
  { const k = Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => i < j ? `v${i} v${j} ${i + j + 1}` : '')).flat().filter(Boolean).join('\n');
    ok(walk('apsp', k).leaf === 'fw' && walk('apsp', 'a b 1\nb c 2\nc d 3\nd e 4\ne f 5\nf g 6\ng h 1\nh a 2').leaf === 'dijkstraall', 'guide APSP, weights ≥ 0: K6 is dense → Floyd–Warshall, a cycle C8 is sparse → Dijkstra from every vertex'); }
  ok(walk('apsp', 'directed\na b 4\nb c -2\nc a 3\nc d 1\nd e 2\ne a 1').leaf === 'johnson', 'guide APSP: sparse with negative arcs → Johnson');
  ok(walk('sssp', 'a b 2\nb c -1').F.negCycle, 'guide: an undirected negative edge counts as a negative cycle');
  ok(spWalk('sssp', { unw: false, dag: false, nonneg: false, transform: true }).leaf === 'reweight' && spWalk('apsp', { unw: false, dag: false, nonneg: true }).needs === 'dense', 'guide: manual answers (transform → reweight; APSP w ≥ 0 asks dense or sparse)');
}

/* --- session 08: Edmonds' blossom algorithm and the Tutte–Berge certificate --- */
{
  const brute = g => { const E = g.edges.filter(e => e.u !== e.v); let best = 0; const used = new Set(); (function go(i, k) { best = Math.max(best, k); for (let j = i; j < E.length; j++) { const e = E[j]; if (used.has(e.u) || used.has(e.v)) continue; used.add(e.u); used.add(e.v); go(j + 1, k + 1); used.delete(e.u); used.delete(e.v); } })(0, 0); return best; };
  const R = rng(23); let same = 0, certs = 0, tb = 0, total = 0, blossoms = 0, asks = 0, asksOk = 0;
  for (let t = 0; t < 250; t++) {
    const n = 2 + Math.floor(R() * 10), p = 0.15 + R() * 0.5, L = []; for (let i = 0; i < n; i++) L.push('v' + i);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (R() < p) L.push(`v${i} v${j}`);
    const g = parseGraph(L.join('\n')), r = algBlossom(g, {}), b = brute(g); total++; blossoms += r.blossoms;
    if (r.size === b) same++;
    if (r.frames[r.frames.length - 1].panel.includes('cert yes')) certs++;
    const T = tutteBerge(g), U = new Set(T.U), chk = CERTS.match.find(c => c.key === 'tutte').check(g, U); if (T.bound === b && chk.ok) tb++;
    const M = new Set(); r.match.forEach((w, v) => { if (w > v) M.add(g.edges.findIndex(e => (e.u === v && e.v === w) || (e.u === w && e.v === v))); });
    if (!CERTS.match.find(c => c.key === 'matching').check(g, M).ok) same -= 1000;
    for (const f of r.frames) if (f.ask) { asks++; if (f.ask.answer.length && f.ask.answer.every(x => x !== undefined && x !== null)) asksOk++; }
  }
  ok(same === total, `blossom: maximum matching size equals brute force on ${total} random graphs, and passes the matching certificate`);
  ok(certs === total, 'blossom: every run ends with a Tutte–Berge certificate');
  ok(tb === total, 'Tutte–Berge set from Gallai–Edmonds is tight and accepted by the certificate checker');
  ok(blossoms > 50 && asks > 0 && asks === asksOk, `blossoms were shrunk (${blossoms}) and every prediction has an answer`);
  { const g = parseGraph(PRESETS.roommates.text), r = algBlossom(g, {}); ok(r.size === 4 && r.U.length === 1 && g.nodes[r.U[0]].label === 'Hana' && r.blossoms > 0, 'roommates: 4 pairs, U = {Hana}, at least one blossom'); ok(!twoColoring(g), 'roommates is not bipartite'); }
  { const g = parseGraph(PRESETS.ps8_19g.text), r = algBlossom(g, {}); ok(r.size === 3 && r.blossoms > 0, 'PS 8 graph G: ν = 3, found through blossoms'); }
  { const g = parseGraph(PRESETS.petersen.text); ok(algBlossom(g, {}).size === 5, 'Petersen has a perfect matching'); }
  { const g = parseGraph('a b\nb c\nc a'); const c = CERTS.match.find(x => x.key === 'tutte').check(g, new Set()); ok(c.ok && /≤ \(3 \+ 0 − 1\) \/ 2 = 1/.test(c.msg), 'triangle: U = ∅ leaves one odd component, bound 1 is tight'); }
  { const g = parseGraph('h x\nh y\nh z'); const c = CERTS.match.find(x => x.key === 'tutte').check(g, new Set()); ok(!c.ok, 'claw: U = ∅ is a valid but loose bound'); }
}

/* --- session 12: extremal search over all small graphs, and the new invariants --- */
{
  const adjOf = (n, E) => { const a = Array(n).fill(0); E.forEach(([u, v]) => { a[u] |= 1 << v; a[v] |= 1 << u; }); return a; };
  const k4 = invariantsOf(adjOf(4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]), 4), c5 = invariantsOf(adjOf(5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]), 5), two = invariantsOf(adjOf(5, [[0, 1], [2, 3], [3, 4]]), 5), star = invariantsOf(adjOf(5, [[0, 1], [0, 2], [0, 3], [0, 4]]), 5);
  ok(k4.kappa === 3 && k4.gamma === 1 && k4.nu === 2 && k4.bip === 0 && k4.comp === 1, 'K₄: κ = 3, γ = 1, ν = 2, not bipartite');
  ok(c5.kappa === 2 && c5.gamma === 2 && c5.nu === 2 && c5.bip === 0, 'C₅: κ = 2, γ = 2, ν = 2, not bipartite');
  ok(two.comp === 2 && two.kappa === 0 && two.nu === 2 && two.bip === 1 && two.gamma === 2, 'K₂ + P₃: two components, κ = 0, ν = 2, γ = 2, bipartite');
  ok(star.kappa === 1 && star.gamma === 1 && star.nu === 1 && star.bip === 1, 'star K₁,₄: κ = 1, γ = 1, ν = 1');
  const vals = P => extremalTable(Object.assign({ from: 1, n: 8, scope: 'all' }, P)).rows.map(r => r.best);
  ok(vals({ goal: 'max', obj: 'm', cond: 'tri == 0' }).join() === '0,1,2,4,6,9,12,16', 'Mantel: max edges of a triangle-free graph is ⌊n²/4⌋ for n ≤ 8');
  { const T = extremalTable({ goal: 'max', obj: 'm', cond: 'tri == 0', from: 1, n: 8, scope: 'all', guess: 'floor(n^2/4)' }); ok(T.rows.every(r => r.match) && T.rows.every(r => r.ext.length === 1), 'Mantel guess matches and K⌊n/2⌋,⌈n/2⌉ is the unique extremal graph'); }
  ok(vals({ goal: 'max', obj: 'm', cond: 'girth >= 5' }).join() === '0,1,2,3,5,6,8,10', 'no C₃ or C₄: OEIS A006855 for n ≤ 8');
  ok(vals({ goal: 'min', obj: 'alpha', cond: 'tri == 0' }).join() === '1,1,2,2,2,3,3,3', 'triangle-free graphs on 6 vertices have α ≥ 3: R(3, 3) = 6');
  ok(vals({ goal: 'max', obj: 'gamma', cond: 'dmin >= 1', from: 2 }).every((v, i) => v === Math.floor((i + 2) / 2)), 'Ore: without isolated vertices γ ≤ ⌊n/2⌋, attained');
  { const T = extremalTable({ goal: 'min', obj: 'm', cond: 'conn', from: 1, n: 7, scope: 'all' }); ok(T.rows.every(r => r.best === r.k - 1 && r.ext.every(d => d.inv.m === r.k - 1 && d.inv.conn)), 'fewest edges of a connected graph: n − 1, attained only by trees'); ok(T.rows[6].ext.length === 11, '11 trees on 7 vertices'); }
  { const T = extremalTable({ goal: 'max', obj: 'm', cond: 'tri == 0', from: 3, n: 6, scope: 'all', guess: 'n^2/4' }); ok(T.rows.find(r => r.match === false).k === 3, 'a wrong guess is caught at the first order where it fails'); }
  /* extremal methods: ILP by branch and bound and simulated annealing, cross-checked with the exhaustive table */
  for (const [goal, cond, n] of [['max', 'tri == 0', 8], ['max', 'girth >= 5', 7], ['max', 'tri == 0 && alpha <= 2', 6], ['min', 'alpha <= 2', 7], ['max', 'omega <= 3 && dmax <= 3', 7], ['min', 'dmin >= 2', 7], ['max', 'girth >= 6', 7]]) {
    const r = algExtremal(null, { method: 'ilp', goal, obj: 'm', cond, from: 2, n, scope: 'all' }), T = extremalTable({ goal, obj: 'm', cond, from: 2, n, scope: 'all' });
    ok(r.rows.length === T.rows.length && r.rows.every((row, i) => (T.rows[i].best === null ? row[2] === 'infeasible' : row[2] === T.rows[i].best) && /✓/.test(row[5])), `ILP = exhaustive: ${goal} m with ${cond}, n ≤ ${n}`);
  }
  { const r = algExtremal(null, { method: 'ilp', goal: 'max', obj: 'm', cond: 'tri == 0 && alpha <= 2', from: 2, n: 6 }); ok(r.rows.at(-1)[2] === 'infeasible', 'ILP: no graph on 6 vertices without triangle and independent triple (R(3,3) = 6)'); }
  { const r = algExtremal(null, { method: 'ilp', goal: 'max', obj: 'gamma', cond: 'conn', from: 2, n: 5 }); ok(r.frames.length === 1 && /Not an ILP/.test(r.frames[0].panel) && /gamma/.test(r.frames[0].panel) && /conn/.test(r.frames[0].panel), 'ILP explains what it cannot model'); }
  { const p = ilpParseCond('girth >= 5 && dmax <= 3 && alpha < 3 && bip == 1'); ok(p.atoms.filter(a => a.kind === 'cycle').length === 2 && p.atoms.some(a => a.kind === 'indep' && a.k === 3) && p.bad.length === 1, 'ILP condition parser: girth → C3, C4; alpha < 3 → no independent 3-set; bip rejected'); }
  { const M = ilpModel(5, ilpParseCond('girth >= 5').atoms); ok(M.V.length === 10 && M.C.length === 10 + 15, 'ILP model on 5 vertices: 10 triangle and 15 four-cycle constraints'); }
  { const r = algExtremal(null, { method: 'anneal', goal: 'max', obj: 'm', cond: 'tri == 0', from: 2, n: 7, steps: 2500, seed: 1 }); ok(r.rows.every(row => row[1] === row[2]), 'annealing finds the Mantel optimum for n ≤ 7 (seed 1)'); ok(r.frames.length >= 5 && r.frames.every(f => f.line === 5 || f.line === 6), 'annealing frames point at its pseudocode lines'); }
  { const r = algExtremal(null, { method: 'anneal', goal: 'max', obj: 'm', cond: 'tri == 0', from: 9, n: 10, steps: 1500, seed: 1 }); ok(r.rows.every(row => row[2] === 'n > 8' && row[3] === 'only a bound'), 'annealing beyond 8 vertices is reported as a bound'); }
  { const a = algExtremal(null, { method: 'anneal', goal: 'max', obj: 'gamma', cond: 'dmin >= 1', from: 4, n: 6, steps: 800, seed: 5 }), b = algExtremal(null, { method: 'anneal', goal: 'max', obj: 'gamma', cond: 'dmin >= 1', from: 4, n: 6, steps: 800, seed: 5 }); ok(JSON.stringify(a.rows) === JSON.stringify(b.rows), 'annealing is deterministic for a fixed seed'); }
  ok(PSEUDO['cagt.ext'].length === 9, 'extremal pseudocode covers the three methods');
  { const r = algExtremal(null, { goal: 'max', obj: 'm', cond: 'tri == 0', from: 1, n: 6, scope: 'all', guess: 'floor(n^2/4)', x: 'alpha' }); ok(r.frames.length >= 3 && r.frames[0].panel.includes('cert yes') && r.frames[0].panel.includes('<svg class="mini scatter"'), 'extremal search: summary with verdict and scatter, then the extremal graphs'); }
  { const r = algExtremal(null, { goal: 'max', obj: 'm', cond: 'm > 100', from: 1, n: 5, scope: 'all', guess: '', x: 'n' }); ok(r.frames.length === 1 && /No graph/.test(r.frames[0].msg), 'an impossible condition is reported, not crashed on'); }
}

/* --- the assembled page compiles: no clashing top-level names between source files --- */
{ const order = ORDER.concat(['app']); let err = null; try { new vm.Script(order.map(f => fs.readFileSync(path.join(SRC, f + '.js'), 'utf8')).join('\n')); } catch (e) { err = e.message; } ok(!err, 'all sources compile together' + (err ? ': ' + err : '')); }

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
