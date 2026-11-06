/* ============================================================
   Session 05: "Which shortest-path algorithm?" decision guide.
   Two flowcharts (one source / all pairs), answered by clicking or
   automatically for the graph on the board.
   ============================================================ */

const SP_LEAVES = {
  bfs: { name: 'BFS', time: 'O(n + m)', algo: 'hops', why: 'With equal weights a shortest path is a path with fewest edges, and BFS finds those layer by layer. With every weight equal to c, multiply the hop count by c.' },
  dag: { name: 'DAG shortest paths', time: 'O(n + m)', algo: 'dag', why: 'Relax the arcs out of each vertex once, in topological order. Negative weights are fine: there is no cycle that could be repeated.' },
  dijkstra: { name: 'Dijkstra', time: 'O((n + m) log n) with a binary heap', algo: 'dijkstra', why: 'With weights ≥ 0 the closest unsettled vertex is already final. For a single target with a good lower-bound estimate (straight-line distance), A* settles fewer vertices.' },
  reweight: { name: 'Transform, then Dijkstra', time: 'transform + O((n + m) log n)', algo: 'dijkstra', why: 'Valid transformations keep the order of path lengths: reweight with a potential, w′(u, v) = w(u, v) + h(u) − h(v) ≥ 0 (every u→v path changes by h(u) − h(v)), or for products of factors use −log. Adding the same constant to every weight is not valid: it penalises paths with more edges.' },
  bf: { name: 'Bellman–Ford', time: 'O(n·m)', algo: 'bf', why: 'Relaxes every edge n − 1 times; an extra round that still improves something proves a negative cycle reachable from the source.' },
  bfsall: { name: 'BFS from every vertex', time: 'n · O(n + m) = O(n² + nm)', algo: 'hops', why: 'One BFS per source. On a sparse graph this beats every weighted method.' },
  dagall: { name: 'DAG shortest paths from every vertex', time: 'n · O(n + m)', algo: 'dag', why: 'One topological order serves every source; relax once per source. Negative weights are fine.' },
  dijkstraall: { name: 'Dijkstra from every vertex', time: 'n · O((n + m) log n) = O(nm log n)', algo: 'dijkstra', why: 'On a sparse graph (m much smaller than n²) n runs of Dijkstra beat the O(n³) of Floyd–Warshall.' },
  fw: { name: 'Floyd–Warshall', time: 'O(n³)', algo: 'fw', why: 'Three nested loops over an n × n matrix, simple and fast on dense graphs. It allows negative weights and reports a negative cycle as a negative entry on the diagonal.' },
  johnson: { name: 'Johnson', time: 'O(nm) + n · O(m log n) = O(nm log n)', algo: 'johnson', why: 'One Bellman–Ford from an extra vertex gives potentials h; reweighting w + h(u) − h(v) makes every weight ≥ 0 without changing shortest paths; then Dijkstra from every vertex. It is the automatic version of “transform the graph”. (n runs of Bellman–Ford, O(n²m), are never the better choice.)' },
};

/* each step: a question; yes ends in a leaf (or a density split), no goes on to the next step (or to the final leaf) */
const SP_GUIDE = {
  sssp: {
    title: 'One source (SSSP)',
    steps: [
      { key: 'unw', q: 'Is the graph unweighted (all weights equal and positive)?', yes: 'bfs' },
      { key: 'dag', q: 'Is the graph a DAG (directed, no directed cycle)?', yes: 'dag' },
      { key: 'nonneg', q: 'Are all weights non-negative?', yes: 'dijkstra' },
      { key: 'transform', q: 'Can you remove the negative weights without changing which path is shortest?', yes: 'reweight', no: 'bf' },
    ],
  },
  apsp: {
    title: 'All pairs (APSP)',
    steps: [
      { key: 'unw', q: 'Is the graph unweighted (all weights equal and positive)?', yes: 'bfsall' },
      { key: 'dag', q: 'Is the graph a DAG (directed, no directed cycle)?', yes: 'dagall' },
      { key: 'nonneg', q: 'Are all weights non-negative?', yes: { split: 'dense', yes: 'fw', no: 'dijkstraall' } },
      { key: 'dense', q: 'Negative weights, no negative cycle. Is the graph dense (m close to n²)?', yes: 'fw', no: 'johnson' },
    ],
  },
};

/* facts about a graph that the questions depend on */
function spFacts(g) {
  const n = g.nodes.length, arcs = g.edges.length * (g.directed ? 1 : 2);
  const ws = g.edges.map(e => +e.w), w0 = ws[0];
  const unw = !g.weighted || (ws.length > 0 && w0 > 0 && ws.every(w => w === w0)) || ws.length === 0;
  const dag = !!topoOrder(g);
  const negEdges = g.edges.filter(e => e.w < 0);
  const nonneg = negEdges.length === 0;
  // negative cycle anywhere: Bellman–Ford from a virtual source joined to every vertex
  const h = Array(n).fill(0), A = []; g.edges.forEach(e => { A.push([e.u, e.v, e.w]); if (!g.directed) A.push([e.v, e.u, e.w]); });
  for (let k = 0; k < n; k++) { let ch = false; for (const [u, v, w] of A) if (h[u] + w < h[v]) { h[v] = h[u] + w; ch = true; } if (!ch) break; }
  const negCycle = A.some(([u, v, w]) => h[u] + w < h[v]);
  const dense = n > 1 && arcs * Math.log2(Math.max(2, n)) >= n * n;
  return { n, m: g.edges.length, arcs, directed: !!g.directed, unw, w0, dag, nonneg, negEdges, negCycle, dense, cyclic: g.directed && !dag };
}

/* the automatic answer and its reason for one question */
function spAnswer(key, F, g) {
  const name = e => `${g.nodes[e.u].label}${g.directed ? '→' : '–'}${g.nodes[e.v].label}`;
  switch (key) {
    case 'unw': return F.unw ? { a: true, why: F.m === 0 ? 'no edges' : !g.weighted ? 'no weights given' : `every weight is ${fmt(F.w0)}` } : { a: false, why: 'the weights differ' };
    case 'dag': return F.dag ? { a: true, why: F.m === 0 ? 'no edges' : 'directed and acyclic' } : { a: false, why: F.directed ? 'it has a directed cycle' : 'undirected: every edge goes both ways' };
    case 'nonneg': return F.nonneg ? { a: true, why: 'no negative weight' } : { a: false, why: `${F.negEdges.slice(0, 3).map(name).join(', ')}${F.negEdges.length > 3 ? ', …' : ''} ${F.negEdges.length > 1 ? 'are' : 'is'} negative` };
    case 'dense': return { a: F.dense, why: `m = ${F.m} ${F.directed ? 'arcs' : 'edges'} for n = ${F.n}: m·log n ${F.dense ? '≥' : '<'} n², so ${F.dense ? 'Floyd–Warshall’s n³ wins' : 'Johnson’s nm log n wins'}` };
    case 'transform': return { a: false, why: 'the lab knows no potential for this graph; finding one needs Bellman–Ford anyway' };
  }
  return null;
}

/* follow the answers; returns the visited steps and the leaf (or null while a question is open) */
function spWalk(kind, ans, F) {
  const T = SP_GUIDE[kind], path = [];
  for (let i = 0; i < T.steps.length; i++) {
    const st = T.steps[i], a = ans[st.key]; path.push(i);
    if (a === undefined) return { path, open: i, leaf: null };
    if (a) { let y = st.yes; if (typeof y === 'object') { const b = ans[y.split]; if (b === undefined) return { path, open: i, leaf: null, needs: y.split }; y = b ? y.yes : y.no; } return { path, leaf: y }; }
    if (st.no) return { path, leaf: st.no };
  }
  return { path, leaf: null };
}

/* ---------- the panel ---------- */
const GUIDE = { kind: 'sssp', ans: {}, autoOn: false, more: false };
function spAutoAll() {
  const s = modState(ST.mod), g = s.graph; if (!g) return null;
  const F = spFacts(g), out = { _F: F };
  for (const k of ['unw', 'dag', 'nonneg', 'dense', 'transform']) out[k] = spAnswer(k, F, g);
  return out;
}
function renderGuide(m) {
  const box = $('#guide'); if (!box) return;
  box.hidden = m.key !== 'sp'; if (box.hidden) return;
  const auto = GUIDE.autoOn ? spAutoAll() : null;
  if (auto) { GUIDE.ans = {}; for (const st of SP_GUIDE[GUIDE.kind].steps) GUIDE.ans[st.key] = auto[st.key].a; GUIDE.ans.dense = auto.dense.a; }
  const T = SP_GUIDE[GUIDE.kind], W = spWalk(GUIDE.kind, GUIDE.ans), last = W.path[W.path.length - 1];
  const leafBox = (k, on, label = '') => { const L = SP_LEAVES[k]; return `<div class="gleaf${on ? ' on' : ''}">${label ? `<span class="glab">${label}</span>` : ''}<b>${L.name}</b><span>${L.time}</span></div>`; };
  const rows = T.steps.map((st, i) => {
    const a = GUIDE.ans[st.key], onPath = W.path.includes(i), au = auto && auto[st.key], endsHere = W.leaf && last === i && a === true;
    const yes = typeof st.yes === 'object'
      ? `<div class="gsplit">${leafBox(st.yes.yes, endsHere && W.leaf === st.yes.yes, 'dense')}${leafBox(st.yes.no, endsHere && W.leaf === st.yes.no, 'sparse')}</div>`
      : leafBox(st.yes, endsHere);
    return `<li class="gstep${onPath ? ' path' : ''}${W.open === i ? ' open' : ''}${a === true ? ' yes' : a === false ? ' no' : ''}">
      <div class="gq"><p>${st.q}</p>${au ? `<p class="gwhy">${au.a ? 'Yes' : 'No'}: ${esc(au.why)}</p>` : ''}
        <div class="gbtns" role="group" aria-label="Answer"><button type="button" data-k="${st.key}" data-a="1" aria-pressed="${a === true}">Yes</button><button type="button" data-k="${st.key}" data-a="0" aria-pressed="${a === false}">No</button></div></div>
      <div class="garrow" aria-hidden="true">Yes</div>${yes}
    </li>`;
  }).join('');
  const lastSt = T.steps[T.steps.length - 1];
  const endRow = lastSt.no ? `<li class="gstep gend${W.leaf === lastSt.no && GUIDE.ans[lastSt.key] === false ? ' path' : ''}"><div class="gq gnone"></div><div class="garrow" aria-hidden="true"></div>${leafBox(lastSt.no, W.leaf === lastSt.no && GUIDE.ans[lastSt.key] === false, 'no')}</li>` : '';
  const needs = W.needs ? `<div class="gneed"><p>Weights ≥ 0. Is the graph dense (m close to n²)?</p><div class="gbtns" role="group" aria-label="Answer"><button type="button" data-k="dense" data-a="1">Dense</button><button type="button" data-k="dense" data-a="0">Sparse</button></div></div>` : '';
  const L = W.leaf && SP_LEAVES[W.leaf], algo = L && ST.mod.algos.find(a => a.key === L.algo);
  const perSource = L && GUIDE.kind === 'apsp' && !['fw', 'johnson'].includes(L.algo);
  const result = L ? `<div class="gresult"><h3>Use: ${L.name} <span class="gtime">${L.time}</span></h3><p>${L.why}</p>${algo ? `<button type="button" class="setup" id="grun">Run ${esc(algo.name)} on the board</button>${perSource ? ' <span class="note">The lab runs it from one source; all pairs repeats it from every vertex.</span>' : ''}` : ''}${auto && auto.dense && GUIDE.kind === 'apsp' && /fw|johnson|dijkstraall/.test(W.leaf) ? `<p class="gwhy">${esc(auto.dense.why)}</p>` : ''}</div>`
    : `<p class="note gprompt">${W.needs ? 'One more question, below the chart.' : 'Answer the questions from the top, or let the lab answer them for the graph on the board.'}</p>`;
  const F = auto && auto._F;
  const warn = F && F.negCycle ? `<div class="gwarn"><b>This graph has a negative cycle.</b> Going round it lowers the cost without bound, so shortest paths through it are undefined. ${GUIDE.kind === 'sssp' ? 'Bellman–Ford finds the cycle if the source reaches it.' : 'Floyd–Warshall shows it as a negative diagonal entry; Johnson stops at its Bellman–Ford step.'}${!F.directed ? ' In an undirected graph every negative edge is such a cycle: walk it back and forth.' : ''}</div>` : '';
  box.innerHTML = `<div class="ghead"><h2>Which shortest-path algorithm?</h2>
      <div class="gseg" role="tablist" aria-label="Question">${['sssp', 'apsp'].map(k => `<button type="button" role="tab" data-kind="${k}" aria-selected="${GUIDE.kind === k}">${SP_GUIDE[k].title}</button>`).join('')}</div>
      <button type="button" id="gauto" class="gbtn${GUIDE.autoOn ? ' on' : ''}" aria-pressed="${GUIDE.autoOn}" title="Answer every question for the graph on the board, and keep the answers up to date when the graph changes">Answer for the graph on the board</button><button type="button" id="gclear" class="gbtn">Clear</button></div>
    <p class="note">Each question assumes <b>no negative cycle</b> (a cycle of negative total weight): with one, shortest paths through it do not exist.${F ? ` Board graph: n = ${F.n}, m = ${F.m}${F.directed ? ', directed' : ', undirected'}.` : ''}</p>
    ${warn}<ol class="gflow">${rows}${endRow}</ol>${needs}${result}
    <details class="gmore"${GUIDE.more ? ' open' : ''}><summary>Why these rules</summary><ul>
      <li><b>Equal weights:</b> a shortest path is a path with fewest edges; BFS finds those layer by layer, with no priority queue.</li>
      <li><b>DAG:</b> in a topological order every arc points forward, so a vertex is final before anything after it is looked at. One pass suffices and negative weights do no harm.</li>
      <li><b>Dijkstra needs w ≥ 0:</b> it settles the closest vertex for good; a negative edge found later could still shorten a settled path (run it on the rebate network).</li>
      <li><b>Transforming:</b> a potential h with w(u, v) + h(u) − h(v) ≥ 0 shifts every u→v path by the same h(u) − h(v), so shortest paths are preserved; Johnson computes such an h with one Bellman–Ford. Adding a constant c to every edge is <i>not</i> such a transform: a path with k edges grows by k·c.</li>
      <li><b>Dense or sparse (all pairs):</b> Floyd–Warshall costs n³; n runs of Dijkstra or Johnson cost about n·m·log n. With m near n² the matrix method wins, with m near n the repeated searches win. The lab calls a graph dense when m·log₂n ≥ n² (m counts arcs).</li>
      <li><b>Negative cycles:</b> Bellman–Ford (one source) and Floyd–Warshall (all pairs) detect them; Dijkstra and DAG shortest paths do not.</li>
    </ul></details>`;
  box.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { GUIDE.kind = b.dataset.kind; if (!GUIDE.autoOn) GUIDE.ans = {}; renderGuide(m); });
  box.querySelectorAll('.gbtns button').forEach(b => b.onclick = () => {
    const k = b.dataset.k, v = b.dataset.a === '1', steps = SP_GUIDE[GUIDE.kind].steps, i = steps.findIndex(st => st.key === k);
    GUIDE.autoOn = false; if (i >= 0) steps.slice(i + 1).forEach(st => delete GUIDE.ans[st.key]); if (k !== 'dense' || i >= 0) delete GUIDE.ans.dense;
    GUIDE.ans[k] = v; renderGuide(m);
  });
  $('#gauto').onclick = () => { GUIDE.autoOn = !GUIDE.autoOn; if (!GUIDE.autoOn) GUIDE.ans = {}; renderGuide(m); };
  $('#gclear').onclick = () => { GUIDE.ans = {}; GUIDE.autoOn = false; renderGuide(m); };
  box.querySelector('.gmore').ontoggle = e => { GUIDE.more = e.target.open; };
  const run = $('#grun'); if (run) run.onclick = () => applySetup({ algo: L.algo });
}
