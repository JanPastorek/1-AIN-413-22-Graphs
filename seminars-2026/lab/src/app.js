/* ============================================================
   UI: state, rendering, player, modes (watch / predict / certificate / ticket),
   pseudocode + Python tabs, definitions strip, editor
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const ST = { mod: null, mods: {}, playing: null, residual: false, edit: false, editSel: -1, speed: 1, mode: 'watch', asking: null, feedback: null, tab: 'state', certRes: null };
const MANIM = { 'iso:Isomorphism': 'isomorphism', 'mst:Cut property': 'cut_property', 'match:Augmenting path': 'augmenting_path', 'flow:Residual network': 'residual_network', 'iso:Colour refinement (1-WL)': 'wl_refinement', 'match:Hall’s condition': 'hall_condition', 'color:Euler’s formula': 'euler_formula', 'color:Dual graph': 'planar_dual' };

function loadStore() { try { return JSON.parse(localStorage.getItem('graphlab') || '{}'); } catch (e) { return {}; } }
function saveStore(o) { try { localStorage.setItem('graphlab', JSON.stringify(Object.assign(loadStore(), o))); } catch (e) { } }

/* ---------- layouts by preset ---------- */
function applyLayout(g, kind, preset) {
  if (kind === 'pos' && preset && preset.pos) { g.nodes.forEach(v => { const p = preset.pos[v.label]; if (p) { v.x = p[0]; v.y = p[1]; } }); if (g.nodes.every(v => preset.pos[v.label])) return; }
  if (kind === 'petersen') { g.nodes.forEach(v => { const k = +v.label, a = -Math.PI / 2 + 2 * Math.PI * (k % 5) / 5, r = k < 5 ? 205 : 100; v.x = W / 2 + r * Math.cos(a); v.y = H / 2 + 10 + r * Math.sin(a); }); return; }
  if (kind === 'cube') { const P = { '000': [220, 400], '001': [580, 400], '010': [220, 120], '011': [580, 120], '100': [320, 330], '101': [480, 330], '110': [320, 190], '111': [480, 190] }; g.nodes.forEach(v => { const p = P[v.label]; if (p) [v.x, v.y] = p; }); if (g.nodes.some(v => !P[v.label])) forceLayout(g); return; }
  if (kind === 'grid') { const rows = Math.max(...g.nodes.map(v => v.label.charCodeAt(0) - 65)) + 1, cols = Math.max(...g.nodes.map(v => +v.label.slice(1))); const sx = Math.min(130, (W - 2 * PAD) / Math.max(1, cols - 1)), sy = Math.min(130, (H - 2 * PAD) / Math.max(1, rows - 1)); g.nodes.forEach(v => { const r = v.label.charCodeAt(0) - 65, c = +v.label.slice(1) - 1; v.x = W / 2 + (c - (cols - 1) / 2) * sx; v.y = H / 2 + (r - (rows - 1) / 2) * sy; }); return; }
  if (kind === 'wheel') { const others = g.nodes.filter(v => v.label !== 'h'); others.forEach((v, k) => { const a = -Math.PI / 2 + 2 * Math.PI * k / others.length; v.x = W / 2 + 200 * Math.cos(a); v.y = H / 2 + 200 * Math.sin(a); }); const h = g.nodes.find(v => v.label === 'h'); if (h) { h.x = W / 2; h.y = H / 2; } return; }
  if (kind === 'circle') return circleLayout(g);
  if (kind === 'columns') { const col = twoColoring(g); if (col) return columnsLayout(g, new Set(col.map((c, i) => c === 0 ? i : -1).filter(i => i >= 0))); }
  if ((g.parts || 1) > 1) return partsLayout(g);
  forceLayout(g);
}

/* ---------- module state ---------- */
function modState(m) {
  if (!ST.mods[m.key]) {
    const s = { algo: m.algos[0].key, params: {}, text: '', graph: null, frames: [], fi: 0, presetKey: m.preset, layout: null, answered: new Set(), score: { right: 0, total: 0 }, cert: { k: 0, sel: new Set(), col: {}, text: '' }, ticketSeed: 1 };
    if (m.preset) { const p = PRESETS[m.preset]; s.text = p.text; s.layout = p.layout; }
    ST.mods[m.key] = s;
  }
  return ST.mods[m.key];
}
function currentAlgo() { const m = ST.mod, s = modState(m); return m.algos.find(a => a.key === s.algo) || m.algos[0]; }
function ensureGraph(m, s) { if (s.graph || m.own) return; s.graph = parseGraph(s.text); if (m.weighted) s.graph.weighted = true; applyLayout(s.graph, s.layout, PRESETS[s.presetKey]); }

/* ---------- params ---------- */
function paramValue(spec, s, g) {
  const v = s.params[s.algo + '.' + spec.id];
  if (spec.type === 'vertex') { if (!g || !g.nodes.length) return 0; const want = v ?? spec.def; let i = want !== undefined ? g.nodes.findIndex(x => x.label === want) : -1; if (i < 0) i = spec.last ? g.nodes.length - 1 : 0; return i; }
  if (v !== undefined) return spec.type === 'int' || spec.type === 'num' ? +v : v;
  return spec.def;
}
function currentParams() { const s = modState(ST.mod), a = currentAlgo(); const P = {}; for (const p of a.params) P[p.id] = paramValue(p, s, s.graph); return P; }
function renderParams() {
  const m = ST.mod, s = modState(m), a = currentAlgo(), g = s.graph; const box = $('#params'); box.innerHTML = '';
  for (const p of a.params) {
    const id = `p-${m.key}-${a.key}-${p.id}`; const wrap = document.createElement('label'); wrap.className = 'field' + (p.type === 'area' ? ' wide' : '') + (p.type === 'text' ? ' grow' : ''); wrap.htmlFor = id;
    wrap.innerHTML = `<span>${p.label}</span>`; let el;
    if (p.type === 'vertex' || p.type === 'select') {
      el = document.createElement('select'); const opts = p.type === 'vertex' ? (g ? g.nodes.map(v => [v.label, v.label]) : []) : p.options;
      for (const [val, txt] of opts) { const o = document.createElement('option'); o.value = val; o.textContent = txt; el.appendChild(o); }
      const cur = paramValue(p, s, g); el.value = p.type === 'vertex' ? (g && g.nodes[cur] ? g.nodes[cur].label : '') : cur;
    } else if (p.type === 'area') { el = document.createElement('textarea'); el.rows = 7; el.value = paramValue(p, s, g); el.spellcheck = false; }
    else { el = document.createElement('input'); el.type = (p.type === 'int' || p.type === 'num') ? 'number' : 'text'; if (p.min !== undefined) { el.min = p.min; el.max = p.max; } if (p.type === 'num') el.step = '0.5'; el.value = paramValue(p, s, g); el.spellcheck = false; el.autocomplete = 'off'; }
    el.id = id;
    el.addEventListener('change', () => { s.params[s.algo + '.' + p.id] = el.value; if (p.type !== 'area' && p.type !== 'text') run(); });
    if (p.type === 'text') el.addEventListener('keydown', e => { if (e.key === 'Enter') { s.params[s.algo + '.' + p.id] = el.value; run(); } });
    wrap.appendChild(el); box.appendChild(wrap);
  }
}

/* ---------- run ---------- */
function run(keepIndex = false) {
  const m = ST.mod, s = modState(m), a = currentAlgo(); stopPlay(); hideError(); ST.asking = null; ST.feedback = null;
  try {
    ensureGraph(m, s);
    for (const p of a.params) { const ui = document.getElementById(`p-${m.key}-${a.key}-${p.id}`); if (ui) s.params[s.algo + '.' + p.id] = ui.value; }
    const P = currentParams();
    if (!a.own && (!s.graph || !s.graph.nodes.length)) throw new Error('The graph is empty. Add edges in the graph box below, or pick an example.');
    const busy = (a.key === 'conj' && P.n >= 8) || (a.key === 'planar' && s.graph && s.graph.edges.length > 40);
    const exec = () => {
      try {
        const r = a.run(s.graph, P); s.frames = r.frames; s.truncated = r.truncated; s.ownGraph = r.graph || null; s.answered = new Set(); s.score = { right: 0, total: 0 };
        s.fi = keepIndex ? Math.min(s.fi, s.frames.length - 1) : 0;
        if (a.key === 'gnp') s.fi = Math.min(14, s.frames.length - 1); else if (a.key === 'sa') s.fi = s.frames.length - 1;
        $('#narr').classList.remove('busy'); draw();
      } catch (e) { showError(e); }
    };
    if (busy) { $('#narr').classList.add('busy'); $('#msg').textContent = a.key === 'conj' ? 'Generating all graphs on 8 vertices (12 346 of them)…' : 'Testing planarity…'; setTimeout(exec, 30); } else exec();
  } catch (e) { showError(e); }
}
function showError(e) { console.error(e); const b = $('#err'); b.hidden = false; b.textContent = e.message || String(e); }
function hideError() { $('#err').hidden = true; }

/* ---------- SVG rendering (shared by board and tickets) ---------- */
function renderGraph(F, g, opt = {}) {
  const n = g.nodes.length; const big = n > 40; const r = big ? 7 : (n > 20 ? 13 : 17); const dir = g.directed; const out = [];
  if (F.polys) out.push(`<g class="faces">${F.polys.map(p => `<polygon class="face ${p.cls || ''}" points="${p.pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')}"/>`).join('')}</g>`);
  const items = [];
  if (!F.hideBase) g.edges.forEach((e, i) => { if (F.edgeLimit !== undefined && i >= F.edgeLimit) return; const c = (F.ec && F.ec[i]) || ''; if (c === 'hide') return; items.push({ u: e.u, v: e.v, cls: c, label: (F.elab && F.elab[i]) ?? (opt.weighted && !big ? fmt(e.w) : ''), dir, key: 'e' + i, base: i }); });
  (F.overlay || []).forEach((o, i) => items.push({ u: o.u, v: o.v, cls: (o.cls || '') + ' ov', label: o.label ?? '', dir: !!o.dir, key: 'o' + i, via: o.via }));
  const groups = new Map(); items.forEach((it, k) => { const key = it.via ? 'via' + k : Math.min(it.u, it.v) + ',' + Math.max(it.u, it.v); (groups.get(key) || groups.set(key, []).get(key)).push(it); });
  const edgeSvg = [], labSvg = [], arrowSvg = [], hitSvg = [];
  for (const [, arr] of groups) arr.forEach((it, k) => {
    const A = g.nodes[it.u], B = g.nodes[it.v]; if (!A || !B) return;
    let mx, my, cx, cy, off;
    if (it.via) { mx = it.via[0]; my = it.via[1]; cx = 2 * mx - (A.x + B.x) / 2; cy = 2 * my - (A.y + B.y) / 2; off = 1; }
    else { const cnt = arr.length; off = (k - (cnt - 1) / 2) * 30; const [P0, P1] = it.u < it.v ? [A, B] : [B, A]; const dx = P1.x - P0.x, dy = P1.y - P0.y; const L = Math.hypot(dx, dy) || 1; const nx = -dy / L, ny = dx / L; mx = (A.x + B.x) / 2 + nx * off; my = (A.y + B.y) / 2 + ny * off; cx = 2 * mx - (A.x + B.x) / 2; cy = 2 * my - (A.y + B.y) / 2; }
    const ra = it.via ? 7 : r;
    const t1x = cx - A.x, t1y = cy - A.y, l1 = Math.hypot(t1x, t1y) || 1; const t2x = B.x - cx, t2y = B.y - cy, l2 = Math.hypot(t2x, t2y) || 1;
    const sx = A.x + t1x / l1 * ra, sy = A.y + t1y / l1 * ra; const ex = B.x - t2x / l2 * (ra + (it.dir ? 2 : 0)), ey = B.y - t2y / l2 * (ra + (it.dir ? 2 : 0));
    const d = off === 0 ? `M${sx.toFixed(1)},${sy.toFixed(1)}L${ex.toFixed(1)},${ey.toFixed(1)}` : `M${sx.toFixed(1)},${sy.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
    edgeSvg.push(`<path class="ed ${it.cls}" d="${d}"/>`);
    if (opt.hits && it.base !== undefined) hitSvg.push(`<path class="hit" data-e="${it.base}" d="${d}"><title>${esc(g.nodes[it.u].label)}–${esc(g.nodes[it.v].label)}</title></path>`);
    if (it.dir) { const ux = t2x / l2, uy = t2y / l2, s2 = 10; const bx = ex - ux * s2, by = ey - uy * s2; arrowSvg.push(`<path class="ah ${it.cls}" d="M${ex.toFixed(1)},${ey.toFixed(1)}L${(bx - uy * 5).toFixed(1)},${(by + ux * 5).toFixed(1)}L${(bx + uy * 5).toFixed(1)},${(by - ux * 5).toFixed(1)}Z"/>`); }
    if (it.label !== '' && it.label !== undefined) labSvg.push(`<text class="el ${it.cls}" x="${mx.toFixed(1)}" y="${(my + 4).toFixed(1)}" text-anchor="middle">${esc(it.label)}</text>`);
  });
  out.push(`<g class="edges">${edgeSvg.join('')}${arrowSvg.join('')}</g><g class="elabels">${labSvg.join('')}</g><g class="hits">${hitSvg.join('')}</g>`);
  const pins = opt.pins || new Map();
  const nodeOne = (v, i) => {
    const c = (F.nc && F.nc[i]) || ''; const tag = F.ntag && F.ntag[i]; const sel = opt.editSel === i ? ' esel' : ''; const pin = pins.get(i); const outerLab = big && (pin || c === 'cur');
    const rr = c === 'dualv' ? 9 : r;
    return `<g class="nd ${c}${sel}${pin ? ' pinned' : ''}" data-i="${i}" transform="translate(${v.x.toFixed(1)},${v.y.toFixed(1)})"><title>${esc(v.label)}${tag ? ' · ' + esc(tag) : ''}</title>${pin ? `<circle class="pinring" r="${rr + 6}"/>` : ''}<circle r="${rr}"/>${!big ? `<text class="nl" y="4" text-anchor="middle" style="font-size:${c === 'dualv' ? 9 : v.label.length > 3 ? 10 : 13}px">${esc(v.label.length > 6 ? v.label.slice(0, 5) + '…' : v.label)}</text>` : ''}${tag && !big ? `<text class="nt" x="${rr + 3}" y="${-rr + 2}">${esc(tag)}</text>` : ''}${outerLab ? `<text class="ol" x="${rr + 5}" y="4">${esc(v.label)}${tag ? ' · ' + esc(tag) : ''}</text>` : ''}${pin ? `<text class="pl" y="${-(rr + 10)}" text-anchor="middle">${esc(pin)}</text>` : ''}</g>`;
  };
  const order = g.nodes.map((v, i) => i).sort((a, b) => (pins.has(a) || (F.nc && F.nc[a] === 'cur') ? 1 : 0) - (pins.has(b) || (F.nc && F.nc[b] === 'cur') ? 1 : 0));
  out.push(`<g class="nodes">${order.map(i => nodeOne(g.nodes[i], i)).join('')}</g>`);
  return out.join('');
}

function certSpec() { const list = CERTS[ST.mod.key] || []; const s = modState(ST.mod); return list[Math.min(s.cert.k, list.length - 1)]; }
function certFrame() {
  const s = modState(ST.mod), spec = certSpec(); const F = { msg: '', nc: {}, ec: {}, ntag: {}, elab: {} };
  if (!spec) return F;
  if (spec.sel === 'v') s.cert.sel.forEach(i => F.nc[i] = 'sel');
  if (spec.sel === 'e') s.cert.sel.forEach(i => F.ec[i] = 'match');
  if (spec.sel === 'col') Object.entries(s.cert.col).forEach(([i, c]) => { if (c) { F.nc[i] = 'k' + ((c - 1) % 10); F.ntag[i] = String(c); } });
  if (ST.certRes) { Object.assign(F.nc, ST.certRes.nc || {}); Object.assign(F.ec, ST.certRes.ec || {}); }
  return F;
}
function draw() {
  const m = ST.mod, s = modState(m);
  const certMode = ST.mode === 'cert';
  let F, g;
  if (certMode) { F = certFrame(); g = s.graph; if (!g) { $('#svg').innerHTML = ''; return; } }
  else { const idx = ST.asking !== null ? s.fi : s.fi; const F0 = s.frames[idx]; if (!F0) { $('#svg').innerHTML = ''; return; } F = (ST.residual && F0.alt) ? Object.assign({}, F0, F0.alt) : F0; g = F.graph || s.ownGraph || s.graph; }
  const pins = new Map();
  if (g === s.graph && !certMode) for (const p of currentAlgo().params) if (p.type === 'vertex') { const i = paramValue(p, s, g); if (g.nodes[i]) pins.set(i, (pins.has(i) ? pins.get(i) + ' / ' : '') + p.label); }
  const ask = ST.asking !== null ? s.frames[ST.asking].ask : null;
  $('#svg').innerHTML = renderGraph(F, g, { pins, weighted: m.weighted || g.weighted, editSel: ST.edit ? ST.editSel : -1, hits: certMode || (ask && ask.type === 'edge') });
  $('#svg').classList.toggle('editing', ST.edit); $('#svg').classList.toggle('picking', certMode || !!(ask && (ask.type === 'vertex' || ask.type === 'edge')));
  // narration + player
  $('#player').hidden = certMode; $('#certbar').hidden = !certMode; $('#askbar').hidden = !(ST.asking !== null || ST.feedback);
  if (certMode) { renderCertBar(); $('#msg').innerHTML = certSpec() ? esc(certSpec().hint) : 'No certificate checks for this session.'; }
  else {
    $('#msg').innerHTML = F.msg || '';
    const total = s.frames.length; $('#scrub').max = total - 1; $('#scrub').value = s.fi; $('#pos').textContent = `${s.fi + 1} / ${total}${s.truncated ? '+' : ''}`;
    $('#prev').disabled = $('#first').disabled = s.fi === 0; $('#next').disabled = $('#last').disabled = s.fi === total - 1;
    renderAskBar();
  }
  $('#zstart').hidden = !(g === s.graph && currentAlgo().params.some(p => p.type === 'vertex'));
  $('#resid').hidden = !m.residual || certMode; $('#resid').setAttribute('aria-pressed', ST.residual);
  $('#score').textContent = ST.mode === 'predict' ? `Predictions: ${s.score.right} / ${s.score.total}` : '';
  renderTabs(F);
}

/* ---------- state / pseudocode / python tabs ---------- */
function renderTabs(F) {
  const m = ST.mod, s = modState(m), a = currentAlgo();
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === ST.tab));
  const box = $('#state');
  if (ST.tab === 'state') { box.innerHTML = ST.mode === 'cert' ? (ST.certRes ? cert(ST.certRes.ok ? 'yes' : 'no', ST.certRes.ok ? 'Certificate accepted' : 'Not accepted', ST.certRes.msg) : '<p class="note">Select, then press Check.</p>') : (F.panel || '<p class="note">Nothing to show for this step.</p>'); return; }
  if (ST.tab === 'code') {
    const lines = PSEUDO[m.key + '.' + a.key]; if (!lines) { box.innerHTML = '<p class="note">This view compares algorithms or runs a search; it has no single pseudocode.</p>'; return; }
    const cur = ST.mode === 'cert' ? -1 : F.line;
    box.innerHTML = `<ol class="pseudo" start="0">${lines.map((l, i) => `<li class="${i === cur ? 'on' : ''}"><code>${esc(l)}</code></li>`).join('')}</ol><p class="note">${cur !== undefined && cur >= 0 ? 'The highlighted line produced this step.' : 'Step through the run to follow the highlighted line.'}</p>`;
    return;
  }
  let code; try { code = pythonSnippet(m.key, a.key, s.ownGraph || s.graph, currentParams()); } catch (e) { code = '# ' + e.message; }
  box.innerHTML = `<div class="pyhead"><span class="note">networkx code for the graph on the board</span><button type="button" id="copypy">Copy</button></div><pre class="py"><code>${esc(code)}</code></pre>`;
  $('#copypy').onclick = async () => { const b = $('#copypy'); try { await navigator.clipboard.writeText(code); b.textContent = 'Copied'; } catch (e) { const r = document.createRange(); r.selectNodeContents($('pre.py')); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); b.textContent = 'Selected'; } setTimeout(() => b.textContent = 'Copy', 1400); };
}

/* ---------- prediction mode ---------- */
function answerText(F, g) {
  const a = F.ask; if (a.type === 'vertex') return a.answer.map(i => g.nodes[i] ? g.nodes[i].label : i).join(' or ');
  if (a.type === 'edge') return a.answer.map(i => edgeName(g, i).replace(/<[^>]+>/g, '')).join(' or ');
  return a.answer.join(' or ');
}
function renderAskBar() {
  const bar = $('#askbar'); const s = modState(ST.mod);
  if (ST.asking !== null) {
    const F = s.frames[ST.asking], a = F.ask; let ctl = '';
    if (a.type === 'number') ctl = `<input id="askin" type="number" step="any" aria-label="Your answer"><button type="button" id="asksub" class="primary">Check</button>`;
    else if (a.type === 'choice') ctl = a.options.map((o, k) => `<button type="button" class="askopt" data-k="${k}">${esc(o)}</button>`).join('');
    else ctl = `<span class="note">Click ${a.type === 'vertex' ? 'a vertex' : 'an edge'} on the board.</span>`;
    bar.className = 'askbar'; bar.innerHTML = `<b>Predict:</b> ${esc(a.prompt)} <span class="askctl">${ctl}<button type="button" id="askskip">Show me</button></span>`;
    if (a.type === 'number') { const go2 = () => submitAnswer(+$('#askin').value); $('#asksub').onclick = go2; $('#askin').onkeydown = e => { if (e.key === 'Enter') go2(); }; setTimeout(() => $('#askin') && $('#askin').focus(), 0); }
    bar.querySelectorAll('.askopt').forEach(b => b.onclick = () => submitAnswer(a.options[+b.dataset.k]));
    $('#askskip').onclick = () => submitAnswer(null);
  } else if (ST.feedback) {
    bar.className = 'askbar ' + (ST.feedback.ok ? 'good' : ST.feedback.skip ? '' : 'bad'); bar.innerHTML = ST.feedback.html;
  }
}
function submitAnswer(val) {
  const s = modState(ST.mod); const i = ST.asking; const F = s.frames[i]; const g = F.graph || s.ownGraph || s.graph;
  const ok = val !== null && F.ask.answer.some(x => typeof x === 'number' && typeof val === 'number' ? Math.abs(x - val) < 1e-9 : String(x) === String(val));
  s.answered.add(i); if (val !== null) { s.score.total++; if (ok) s.score.right++; }
  const shown = F.ask.type === 'vertex' && val !== null ? (g.nodes[val] ? g.nodes[val].label : val) : F.ask.type === 'edge' && val !== null ? edgeName(g, val).replace(/<[^>]+>/g, '') : val;
  ST.feedback = val === null ? { skip: true, html: `Answer: <b>${esc(answerText(F, g))}</b>.` } : ok ? { ok: true, html: `<b>Right.</b> ${F.ask.answer.length > 1 ? `Any of ${esc(answerText(F, g))} was correct (a tie).` : ''}` } : { ok: false, html: `<b>Not quite:</b> you chose ${esc(String(shown))}, the answer is <b>${esc(answerText(F, g))}</b>. Read the step below to see why.` };
  ST.asking = null; s.fi = i; draw();
}

/* ---------- certificate mode ---------- */
function renderCertBar() {
  const list = CERTS[ST.mod.key] || []; const s = modState(ST.mod); const spec = certSpec(); const bar = $('#certbar');
  if (!list.length) { bar.innerHTML = '<p class="note">This session has no certificate checks. Try another session.</p>'; return; }
  bar.innerHTML = `<label class="field"><span>Certificate</span><select id="certkind">${list.map((c, k) => `<option value="${k}" ${k === s.cert.k ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>${spec.sel === 'text' ? `<label class="field grow"><span>Your answer</span><input id="certtext" type="text" spellcheck="false" autocomplete="off" value="${esc(s.cert.text)}"></label>` : ''}<button type="button" id="certcheck" class="primary">Check</button><button type="button" id="certclear">Clear</button>`;
  $('#certkind').onchange = e => { s.cert.k = +e.target.value; s.cert.sel = new Set(); s.cert.col = {}; ST.certRes = null; draw(); };
  $('#certcheck').onclick = () => { const sp = certSpec(); const t = $('#certtext'); if (t) s.cert.text = t.value; const val = sp.sel === 'text' ? s.cert.text : sp.sel === 'col' ? s.cert.col : s.cert.sel; try { ST.certRes = sp.check(s.graph, val, { P: currentParams() }); } catch (e) { ST.certRes = { ok: false, msg: esc(e.message) }; } ST.tab = 'state'; draw(); };
  $('#certclear').onclick = () => { s.cert.sel = new Set(); s.cert.col = {}; s.cert.text = ''; ST.certRes = null; draw(); };
  const t = $('#certtext'); if (t) t.onkeydown = e => { if (e.key === 'Enter') $('#certcheck').click(); };
}
function certClick(kind, i) {
  const s = modState(ST.mod), spec = certSpec(); if (!spec) return; ST.certRes = null;
  if (kind === 'v' && spec.sel === 'v') { s.cert.sel.has(i) ? s.cert.sel.delete(i) : s.cert.sel.add(i); }
  else if (kind === 'v' && spec.sel === 'col') { s.cert.col[i] = ((s.cert.col[i] || 0) + 1) % ((spec.colors || 10) + 1); }
  else if (kind === 'e' && spec.sel === 'e') { s.cert.sel.has(i) ? s.cert.sel.delete(i) : s.cert.sel.add(i); }
  else return;
  draw();
}

/* ---------- exit tickets ---------- */
const SHOW_KEYS = !(typeof window !== 'undefined' && window.GRAPHLAB_PUBLIC);
function renderTicket() {
  const m = ST.mod, s = modState(m); const gen = TICKETS[m.key]; const box = $('#ticket');
  if (!gen) { box.innerHTML = '<p class="note">No exit ticket for this session.</p>'; return; }
  let t; try { t = gen(s.ticketSeed); } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  let fig = '';
  if (t.text) { const g = parseGraph(t.text); if (m.weighted) g.weighted = true; applyLayout(g, t.layout || 'force'); fig = `<svg class="tsvg" viewBox="0 0 800 520" role="img" aria-label="Ticket graph">${renderGraph({ nc: {}, ec: {}, ntag: {}, elab: {} }, g, { weighted: g.weighted })}</svg>`; }
  else if (t.seq) fig = `<p class="tseq">( ${esc(t.seq.split(' ').join(', '))} )</p>`;
  box.innerHTML = `<div class="trow"><label class="field"><span>Seed (e.g. the student’s number)</span><input id="tseed" type="number" min="1" max="99999" value="${s.ticketSeed}"></label><button type="button" id="tgen" class="primary">Generate</button><button type="button" id="tnext">Next seed</button>${t.text ? '<button type="button" id="tload">Open in the lab</button>' : ''}${SHOW_KEYS ? '<button type="button" id="tkeys">Copy answer keys for seeds 1–30</button>' : ''}</div>
    <div class="tbody"><div class="tfig">${fig}</div><div class="ttext"><h3>Exit ticket · seed ${s.ticketSeed}</h3><p>${t.task}</p><p class="note">Work on paper with the lab closed. The same seed always gives the same instance.</p>${SHOW_KEYS ? `<details><summary>Answer key (for the teacher)</summary><p class="mono">${esc(t.answer)}</p></details>` : '<p class="note">Answer keys are only in the teacher’s copy of the lab.</p>'}</div></div>`;
  $('#tgen').onclick = () => { s.ticketSeed = Math.max(1, +$('#tseed').value || 1); renderTicket(); };
  $('#tseed').onkeydown = e => { if (e.key === 'Enter') $('#tgen').click(); };
  $('#tnext').onclick = () => { s.ticketSeed++; renderTicket(); };
  if ($('#tload')) $('#tload').onclick = () => { setMode('watch'); s.graph = null; s.presetKey = null; setGraphText(t.text, t.layout || 'force'); };
  if ($('#tkeys')) $('#tkeys').onclick = async () => { const lines = []; for (let k = 1; k <= 30; k++) { try { const x = gen(k); lines.push(`Seed ${k}: ${x.answer}`); } catch (e) { lines.push(`Seed ${k}: (error)`); } } const txt = `${m.title}: exit-ticket answer keys\n\n` + lines.join('\n'); const b = $('#tkeys'); try { await navigator.clipboard.writeText(txt); b.textContent = 'Copied 30 keys'; } catch (e) { $('#ticket').insertAdjacentHTML('beforeend', `<textarea class="keys" readonly>${esc(txt)}</textarea>`); b.textContent = 'Shown below'; } setTimeout(() => b.textContent = 'Copy answer keys for seeds 1–30', 1800); };
}

/* ---------- modes ---------- */
function setMode(mode) {
  ST.mode = mode; ST.asking = null; ST.feedback = null; ST.certRes = null; stopPlay();
  document.querySelectorAll('#modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === mode));
  $('#stage').hidden = mode === 'ticket'; $('#ticket').hidden = mode !== 'ticket'; $('.controls').classList.toggle('dim', mode === 'ticket');
  if (mode === 'ticket') renderTicket(); else draw();
}

/* ---------- player ---------- */
function go(i) {
  const s = modState(ST.mod); i = Math.max(0, Math.min(s.frames.length - 1, i)); ST.feedback = null;
  if (ST.mode === 'predict' && i === s.fi + 1 && i > 0 && s.frames[i] && s.frames[i].ask && !s.answered.has(i)) { ST.asking = i; stopPlay(); draw(); return; }
  ST.asking = null; s.fi = i; draw();
}
function stopPlay() { if (ST.playing) { clearInterval(ST.playing); ST.playing = null; } $('#play').textContent = 'Play'; $('#play').setAttribute('aria-pressed', 'false'); }
function togglePlay() {
  const s = modState(ST.mod); if (ST.playing) return stopPlay(); if (ST.asking !== null) return;
  if (s.fi >= s.frames.length - 1) { s.fi = 0; s.answered = new Set(); }
  $('#play').textContent = 'Pause'; $('#play').setAttribute('aria-pressed', 'true');
  ST.playing = setInterval(() => { if (s.fi >= s.frames.length - 1 || ST.asking !== null) return stopPlay(); go(s.fi + 1); }, 900 / ST.speed);
}

/* ---------- editor ---------- */
function syncEditor() {
  const m = ST.mod, s = modState(m); const a = currentAlgo();
  $('#editor').hidden = !!m.own; $('#ownnote').hidden = !(a.own && !m.own);
  if (m.own) return;
  $('#gtext').value = s.text;
  const sel = $('#preset'); sel.innerHTML = '<option value="">Load an example…</option>';
  const groups = {}; for (const [k, p] of Object.entries(PRESETS)) (groups[p.group || 'Other'] ||= []).push([k, p]);
  for (const [gname, arr] of Object.entries(groups)) { const og = document.createElement('optgroup'); og.label = gname; for (const [k, p] of arr) { const o = document.createElement('option'); o.value = k; o.textContent = p.name; og.appendChild(o); } sel.appendChild(og); }
  $('#g6').value = ''; $('#editbtn').disabled = !!a.own; $('#editbtn').setAttribute('aria-pressed', ST.edit && !a.own);
}
function setGraphText(text, layout) {
  const m = ST.mod, s = modState(m);
  const g = parseGraph(text); if (m.weighted) g.weighted = true;
  const old = s.graph ? new Map(s.graph.nodes.map(v => [v.id, v])) : new Map();
  const keep = !layout && g.nodes.length && g.nodes.every(v => old.has(v.id));
  if (keep) g.nodes.forEach(v => { const o = old.get(v.id); v.x = o.x; v.y = o.y; }); else { applyLayout(g, layout, PRESETS[s.presetKey]); setView(null); }
  s.text = text; s.graph = g; s.layout = layout || s.layout; $('#gtext').value = text; s.cert.sel = new Set(); s.cert.col = {}; ST.certRes = null;
  renderParams(); run();
}
function loadPreset(key) { const p = PRESETS[key]; if (!p) return; const s = modState(ST.mod); s.presetKey = key; s.graph = null; setGraphText(p.text, p.layout || 'force'); }

/* ---------- definitions strip ---------- */
const ANIMS = [];
function renderDefs(m) {
  ANIMS.forEach(a => a.stop()); ANIMS.length = 0;
  const defs = DEFS[m.key] || []; const box = $('#defcards');
  box.innerHTML = defs.map((d, k) => { const vid = MANIM[m.key + ':' + d.term]; return `<article class="dcard" data-k="${k}"><h3>${esc(d.term)}</h3>${d.why ? `<p class="dwhy"><b>Why we need it.</b> ${d.why}</p>` : ''}<p class="dtext">${d.text}</p><div class="dfig"><svg class="defsvg" viewBox="0 0 300 190" role="img" aria-label="Animation: ${esc(d.term)}"></svg>${vid ? `<video class="dvideo" hidden controls playsinline preload="none" aria-label="Manim animation: ${esc(d.term)}"><source src="media/${vid}.webm" type="video/webm"><source src="media/${vid}.mp4" type="video/mp4"></video>` : ''}</div><p class="dcap" aria-live="polite"></p><div class="dctl"><button type="button" class="dplay">Play</button><span class="ddots"></span>${d.gen ? '<button type="button" class="dboard">Use the board’s graph</button>' : ''}${vid ? '<button type="button" class="dvid">Manim version</button>' : ''}</div><p class="dmsg note" hidden></p></article>`; }).join('');
  box.querySelectorAll('.dcard').forEach(card => {
    const d = defs[+card.dataset.k]; let A;
    try { A = new DefAnim(card, d); } catch (e) { card.querySelector('.dcap').textContent = 'Animation failed: ' + e.message; return; }
    ANIMS.push(A); A.renderDots(); A.apply(0, false);
    card.querySelector('.dplay').onclick = () => A.play();
    const vb = card.querySelector('.dvid'); if (vb) vb.onclick = () => { const v = card.querySelector('video'), sv = card.querySelector('svg'); const show = v.hidden; v.hidden = !show; sv.style.display = show ? 'none' : ''; vb.textContent = show ? 'Back to the animation' : 'Manim version'; if (show) { A.stop(); v.play().catch(() => { }); } else v.pause(); };
    const bb = card.querySelector('.dboard'); if (bb) bb.onclick = () => { const s = modState(ST.mod); const err = A.useBoard(s.ownGraph || s.graph); const msg = card.querySelector('.dmsg'); msg.hidden = !err; msg.textContent = err || ''; };
  });
}

/* ---------- module switch ---------- */
function openModule(key) {
  const m = MODULES.find(x => x.key === key) || MODULES[0]; ST.mod = m; ST.edit = false; ST.editSel = -1; ST.residual = false; stopPlay(); setView(null);
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.key === key ? 'page' : 'false'));
  $('#mnum').textContent = String(m.num).padStart(2, '0'); $('#mtitle').textContent = m.title; $('#mstudio').textContent = `Studio: ${m.studio}`; $('#manchor').textContent = m.anchor;
  const s = modState(m);
  const tabs = $('#algos'); tabs.innerHTML = '';
  m.algos.forEach(a => { const b = document.createElement('button'); b.type = 'button'; b.textContent = a.name; b.setAttribute('aria-pressed', a.key === s.algo); b.onclick = () => { s.algo = a.key; tabs.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); renderParams(); syncEditor(); run(); }; tabs.appendChild(b); });
  $('#legend').innerHTML = m.legend.map(([kind, cls, txt]) => txt ? `<span class="lg"><svg width="${kind === 'n' ? 16 : 26}" height="16" aria-hidden="true">${kind === 'n' ? `<g class="nd ${cls}" transform="translate(8,8)"><circle r="6"/></g>` : `<path class="ed ${cls}" d="M2,8L24,8"/>`}</svg>${txt}</span>` : '').join('');
  $('#modes [data-mode="cert"]').disabled = !(CERTS[m.key] || []).length; $('#modes [data-mode="ticket"]').disabled = !TICKETS[m.key];
  renderTasks(m); renderDefs(m);
  try { ensureGraph(m, s); } catch (e) { }
  renderParams(); syncEditor();
  if ((ST.mode === 'cert' && !(CERTS[m.key] || []).length) || (ST.mode === 'ticket' && !TICKETS[m.key])) ST.mode = 'watch';
  run(true); setMode(ST.mode);
  saveStore({ mod: key });
  if (location.hash.slice(1) !== key) history.replaceState(null, '', '#' + key);
}
function renderTasks(m) {
  $('#tasks').innerHTML = m.tasks.map((t, i) => `<li><span class="tag">${t.tag}</span><div class="tt"><p>${t.text}</p>${t.setup ? `<button type="button" class="setup" data-t="${i}">Set up in the lab</button>` : ''}</div></li>`).join('');
  $('#refs').innerHTML = m.refs.map(([b, s]) => `<li>${BOOKS[b]}: ${s}</li>`).join('');
  $('#netstats').hidden = m.key !== 'random';
  if (m.key === 'random') $('#netstats').innerHTML = `<h3>Real networks from the course data folder</h3><div class="tw"><table class="compact num"><thead><tr><th>network</th><th>n</th><th>m</th><th>avg deg</th><th>clustering C</th><th>density p</th><th>C / p</th><th>avg path</th></tr></thead><tbody>${NETSTATS.map(r => `<tr><td>${esc(r.name)}${r.type ? ` <span class="note">(${r.type.includes('D') ? 'directed' : ''}${r.type.includes('D') && r.type.includes('W') ? ', ' : ''}${r.type.includes('W') ? 'weighted' : ''})</span>` : ''}</td><td>${r.n.toLocaleString()}</td><td>${r.m.toLocaleString()}</td><td>${r.k.toFixed(1)}</td><td>${r.C.toFixed(3)}</td><td>${r.p.toExponential(1)}</td><td>${Math.round(r.C / r.p).toLocaleString()}</td><td>${r.L.toFixed(1)}</td></tr>`).join('')}</tbody></table></div><p class="note">From <code>data/summary_statistics.csv</code>. G(n, p) with the same n and m has C ≈ p, so C/p ≈ 1, and average path length ≈ ln n / ln(avg deg).</p>`;
  document.querySelectorAll('#tasks .setup').forEach(b => b.onclick = () => applySetup(m.tasks[+b.dataset.t].setup));
}
function applySetup(su) {
  const m = ST.mod, s = modState(m); if (ST.mode === 'ticket' || ST.mode === 'cert') setMode('watch');
  if (su.algo) { s.algo = su.algo; document.querySelectorAll('#algos button').forEach((b, i) => b.setAttribute('aria-pressed', m.algos[i].key === su.algo)); }
  if (su.params) for (const [k, v] of Object.entries(su.params)) s.params[s.algo + '.' + k] = String(v);
  if (su.preset) { const p = PRESETS[su.preset]; s.presetKey = su.preset; s.graph = null; s.text = p.text; s.layout = p.layout || 'force'; ensureGraph(m, s); setView(null); }
  renderParams(); syncEditor(); run();
  $('#stage').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

/* ---------- pointer: drag, edit, pick ---------- */
function svgPoint(evt) { const svg = $('#svg'); const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
function displayedGraph() { const s = modState(ST.mod); if (ST.mode === 'cert') return s.graph; const F = s.frames[s.fi]; return (F && F.graph) || s.ownGraph || s.graph; }
function setView(v) { ST.view = v || [0, 0, W, H]; $('#svg').setAttribute('viewBox', ST.view.map(x => x.toFixed(1)).join(' ')); $('#zfit').disabled = !v; }
function zoomAt(px, py, f) { const [x, y, w, h] = ST.view || [0, 0, W, H]; const nw = Math.max(W / 8, Math.min(W, w * f)), k = nw / w; if (nw >= W - 0.5) return setView(null); setView([px - (px - x) * k, py - (py - y) * k, nw, h * k]); }
function initPointer() {
  const svg = $('#svg'); let drag = null, moved = false, raf = 0, pan = null;
  svg.addEventListener('wheel', e => { e.preventDefault(); const p = svgPoint(e); zoomAt(p.x, p.y, e.deltaY < 0 ? 0.85 : 1 / 0.85); }, { passive: false });
  svg.addEventListener('pointerdown', e => {
    const nd = e.target.closest('.nd'); const g = displayedGraph(); if (!g) return;
    if (nd) { drag = { i: +nd.dataset.i, g }; moved = false; svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    const hit = e.target.closest('.hit');
    if (hit) { const i = +hit.dataset.e; if (ST.mode === 'cert') { certClick('e', i); return; } const s = modState(ST.mod); if (ST.asking !== null && s.frames[ST.asking].ask.type === 'edge') { submitAnswer(i); return; } }
    if (!ST.edit && ST.view) { pan = { x: e.clientX, y: e.clientY, v: ST.view.slice() }; svg.setPointerCapture(e.pointerId); svg.classList.add('panning'); return; }
    if (ST.edit && ST.mode !== 'cert') { const s = modState(ST.mod); if (s.ownGraph || currentAlgo().own) return; const p = svgPoint(e); let k = 1; const labels = new Set(s.graph.nodes.map(v => v.label)); while (labels.has('v' + k)) k++; const name = 'v' + k; s.graph.nodes.push({ id: '0|' + name, label: name, x: p.x, y: p.y, part: 0 }); s.text = graphToText(s.graph); $('#gtext').value = s.text; renderParams(); run(true); }
  });
  svg.addEventListener('pointermove', e => {
    if (pan) { const s = pan.v[2] / svg.clientWidth; setView([pan.v[0] - (e.clientX - pan.x) * s, pan.v[1] - (e.clientY - pan.y) * s, pan.v[2], pan.v[3]]); return; }
    if (!drag) return; const p = svgPoint(e); const v = drag.g.nodes[drag.i]; if (Math.abs(p.x - v.x) + Math.abs(p.y - v.y) < 3 && !moved) return; v.x = Math.max(12, Math.min(W - 12, p.x)); v.y = Math.max(12, Math.min(H - 12, p.y)); moved = true; if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); });
  });
  const end = () => {
    if (drag && !moved) {
      const s = modState(ST.mod), i = drag.i;
      if (ST.mode === 'cert') certClick('v', i);
      else if (ST.asking !== null && s.frames[ST.asking].ask.type === 'vertex') submitAnswer(i);
      else if (ST.edit && !s.ownGraph && !currentAlgo().own && drag.g === s.graph) {
        if (ST.editSel < 0) { ST.editSel = i; draw(); } else if (ST.editSel === i) { ST.editSel = -1; draw(); }
        else { const a = ST.editSel, b = i; const k = s.graph.edges.findIndex(e => (e.u === a && e.v === b) || (!s.graph.directed && e.u === b && e.v === a)); if (k >= 0) s.graph.edges.splice(k, 1); else s.graph.edges.push({ u: a, v: b, w: 1 }); ST.editSel = -1; s.text = graphToText(s.graph); $('#gtext').value = s.text; run(true); }
      }
    }
    drag = null; if (pan) { pan = null; svg.classList.remove('panning'); }
  };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', () => { drag = null; pan = null; svg.classList.remove('panning'); });
}

/* ---------- boot ---------- */
function boot() {
  const nav = $('#nav'); nav.innerHTML = MODULES.map(m => `<button type="button" data-key="${m.key}"><span class="nn">${String(m.num).padStart(2, '0')}</span><span class="nt2">${m.title}</span></button>`).join('');
  nav.querySelectorAll('button').forEach(b => b.onclick = () => openModule(b.dataset.key));
  $('#first').onclick = () => { stopPlay(); ST.asking = null; const s = modState(ST.mod); s.fi = 0; ST.feedback = null; draw(); }; $('#prev').onclick = () => { stopPlay(); ST.asking = null; const s = modState(ST.mod); s.fi = Math.max(0, s.fi - 1); ST.feedback = null; draw(); };
  $('#next').onclick = () => { stopPlay(); if (ST.asking === null) go(modState(ST.mod).fi + 1); }; $('#last').onclick = () => { stopPlay(); ST.asking = null; const s = modState(ST.mod); s.fi = s.frames.length - 1; ST.feedback = null; draw(); };
  $('#play').onclick = togglePlay; $('#scrub').oninput = e => { stopPlay(); ST.asking = null; ST.feedback = null; modState(ST.mod).fi = +e.target.value; draw(); };
  $('#speed').onchange = e => { ST.speed = +e.target.value; if (ST.playing) { stopPlay(); togglePlay(); } };
  $('#rerun').onclick = () => run();
  $('#resid').onclick = () => { ST.residual = !ST.residual; draw(); };
  document.querySelectorAll('#modes button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { ST.tab = b.dataset.tab; draw(); });
  $('#applyg').onclick = () => { try { hideError(); setGraphText($('#gtext').value, null); } catch (e) { showError(e); } };
  $('#preset').onchange = e => { if (e.target.value) { try { hideError(); loadPreset(e.target.value); } catch (er) { showError(er); } e.target.value = ''; } };
  $('#g6in').onclick = () => { try { hideError(); const g = decodeGraph6($('#g6').value); const s = modState(ST.mod); s.graph = null; s.presetKey = null; setGraphText(graphToText(g), 'force'); } catch (e) { showError(e); } };
  $('#g6out').onclick = async () => { const g = displayedGraph(); if (!g) return; const code = encodeGraph6(g); $('#g6').value = code; const btn = $('#g6out'); try { await navigator.clipboard.writeText(code); btn.textContent = 'Copied'; } catch (e) { $('#g6').select(); btn.textContent = 'Selected'; } setTimeout(() => btn.textContent = 'Export and copy', 1400); };
  $('#lay-force').onclick = () => { const g = displayedGraph(); if (!g) return; (g.parts || 1) > 1 ? partsLayout(g) : forceLayout(g, undefined, 350, Math.floor(Math.random() * 1e6)); draw(); };
  $('#lay-circle').onclick = () => { const g = displayedGraph(); if (g) { circleLayout(g); draw(); } };
  $('#lay-cols').onclick = () => { const g = displayedGraph(); if (!g) return; const col = twoColoring(g); if (!col) return showError(new Error('Not bipartite, so there is no two-column layout.')); hideError(); columnsLayout(g, new Set(col.map((c, i) => c === 0 ? i : -1).filter(i => i >= 0))); draw(); };
  $('#zin').onclick = () => { const [x, y, w, h] = ST.view || [0, 0, W, H]; zoomAt(x + w / 2, y + h / 2, 0.7); };
  $('#zout').onclick = () => { const [x, y, w, h] = ST.view || [0, 0, W, H]; zoomAt(x + w / 2, y + h / 2, 1 / 0.7); };
  $('#zfit').onclick = () => setView(null);
  $('#zstart').onclick = () => { const s = modState(ST.mod), g = displayedGraph(); const p = currentAlgo().params.find(q => q.type === 'vertex'); const i = p && g === s.graph ? paramValue(p, s, g) : -1; const v = g && g.nodes[i]; if (!v) return; const w = W / 2.6, h = H / 2.6; setView([v.x - w / 2, v.y - h / 2, w, h]); };
  $('#editbtn').onclick = () => { ST.edit = !ST.edit; ST.editSel = -1; $('#editbtn').setAttribute('aria-pressed', ST.edit); $('#edithint').hidden = !ST.edit; draw(); };
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select')) return;
    if (ST.mode === 'cert' || ST.mode === 'ticket') return;
    if (e.key === 'ArrowRight') { stopPlay(); if (ST.asking === null) go(modState(ST.mod).fi + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { stopPlay(); ST.asking = null; ST.feedback = null; const s = modState(ST.mod); s.fi = Math.max(0, s.fi - 1); draw(); e.preventDefault(); }
    else if (e.key === ' ' && !e.target.closest('button')) { togglePlay(); e.preventDefault(); }
  });
  initPointer();
  const start = location.hash.slice(1) || loadStore().mod || 'traverse';
  openModule(MODULES.some(m => m.key === start) ? start : 'traverse');
  window.addEventListener('hashchange', () => { const k = location.hash.slice(1); if (k && k !== ST.mod.key && MODULES.some(m => m.key === k)) openModule(k); });
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
