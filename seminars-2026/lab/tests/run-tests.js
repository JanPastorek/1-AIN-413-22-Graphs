#!/usr/bin/env node
/* Graph Studio Lab test suite: node tests/run-tests.js  (no dependencies)
   Checks algorithms against known answers and brute force, and checks that every
   module, pseudocode line, prediction question, certificate, ticket and definition is consistent. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const SRC = path.join(__dirname, '..', 'src');
const ORDER = ['data', 'core', 'algos1', 'algos2', 'algos3', 'algos4', 'algos5', 'algos6', 'modules', 'pseudo', 'certs', 'tickets', 'anim', 'defs', 'motivation', 'sheets'];
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
for (const m of MODULES) { ok((DEFS[m.key] || []).length === 5, `five definitions for ${m.key}`); for (const d of DEFS[m.key] || []) { const g = parseGraph(d.g); const L = new Set(g.nodes.map(v => v.label)); const keys = new Set(g.edges.flatMap(e => [g.nodes[e.u].label + '-' + g.nodes[e.v].label, g.nodes[e.v].label + '-' + g.nodes[e.u].label])); for (const [, s] of d.steps) { for (const k of Object.keys(s.e || {})) ok(keys.has(k), `${d.term}: edge ${k}`); for (const k of [...Object.keys(s.n || {}), ...Object.keys(s.t || {})]) ok(L.has(k), `${d.term}: vertex ${k}`); } } }

/* --- every concept is motivated: a real problem on each definition, a motivating first task per session --- */
for (const m of MODULES) { ok(m.tasks[0] && m.tasks[0].tag === 'Motivation', `${m.key} opens with a motivating problem`); if (m.tasks[0].setup && m.tasks[0].setup.algo) ok(m.algos.some(a => a.key === m.tasks[0].setup.algo), `${m.key} motivation setup`); for (const d of DEFS[m.key]) ok(typeof d.why === 'string' && d.why.length > 40, `${m.key}: ${d.term} has a motivation`); }


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

/* --- the assembled page compiles: no clashing top-level names between source files --- */
{ const order = ORDER.concat(['app']); let err = null; try { new vm.Script(order.map(f => fs.readFileSync(path.join(SRC, f + '.js'), 'utf8')).join('\n')); } catch (e) { err = e.message; } ok(!err, 'all sources compile together' + (err ? ': ' + err : '')); }

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
