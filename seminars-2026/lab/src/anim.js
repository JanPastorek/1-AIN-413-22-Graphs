/* ============================================================
   Definition-card animation engine (Manim-like, on persistent SVG)
   def = { term, text, g: edge-list text, pos: {label:[x,y]}, directed?, weights?,
           steps: [ [caption, { n:{v:cls}, e:{'a-b':cls}, t:{v:tag}, el:{'a-b':label},
                                 p:{v:[x,y]}, blob:[[labels, cls]], poly:[[labels, cls]] }], ... ],
           gen?: (boardGraph) => { g, pos, steps } }
   Classes are the board's (.nd.cur, .ed.tree, …) plus 'hide' (invisible).
   ============================================================ */
const CW = 300, CH = 190;
function ringPos(labels, cx = 150, cy = 97, r = 68, start = -90) { const o = {}; labels.forEach((l, i) => { const a = (start + 360 * i / labels.length) * Math.PI / 180; o[l] = [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }); return o; }
function rowPos(labels, y = 97, x0 = 40, x1 = 260) { const o = {}; labels.forEach((l, i) => o[l] = [labels.length === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (labels.length - 1), y]); return o; }
function colsPos(L, R, xl = 95, xr = 205) { return Object.assign(rowPosV(L, xl), rowPosV(R, xr)); }
function rowPosV(labels, x, y0 = 28, y1 = 166) { const o = {}; labels.forEach((l, i) => o[l] = [x, labels.length === 1 ? (y0 + y1) / 2 : y0 + (y1 - y0) * i / (labels.length - 1)]); return o; }
const SVGNS = 'http://www.w3.org/2000/svg';
const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

class DefAnim {
  constructor(host, def) { this.host = host; this.def = def; this.timer = null; this.raf = 0; this.build(def.g, def.pos, def.steps, def.directed, def.weights); }
  el(tag, attrs = {}, parent) { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.appendChild(e); return e; }
  build(text, pos, steps, directed, weights) {
    this.stop(); this.steps = steps; const g = typeof text === 'string' ? parseGraph(text) : text; this.g = g; this.directed = directed ?? g.directed;
    const svg = this.host.querySelector('svg.defsvg'); svg.innerHTML = ''; this.svg = svg;
    this.gBlob = this.el('g', {}, svg); this.gPoly = this.el('g', {}, svg); this.gEdge = this.el('g', {}, svg); this.gLab = this.el('g', {}, svg); this.gNode = this.el('g', {}, svg);
    this.P = {}; g.nodes.forEach((v, i) => { const p = pos && pos[v.label]; this.P[v.label] = p ? p.slice() : [v.x * CW / W, v.y * CH / H]; });
    this.nodes = {}; g.nodes.forEach(v => { const G = this.el('g', { class: 'nd' }, this.gNode); this.el('circle', { r: 11 }, G); const t = this.el('text', { class: 'nl', y: 4, 'text-anchor': 'middle' }, G); t.textContent = v.label.length > 3 ? v.label.slice(0, 3) : v.label; const tg = this.el('text', { class: 'nt', x: 14, y: -9 }, G); this.nodes[v.label] = { G, tg }; });
    this.edges = {}; g.edges.forEach(e => { const a = g.nodes[e.u].label, b = g.nodes[e.v].label; const k = a + '-' + b; const line = this.el('line', { class: 'ed' }, this.gEdge); const ah = this.directed ? this.el('path', { class: 'ah' }, this.gEdge) : null; const lb = this.el('text', { class: 'el', 'text-anchor': 'middle' }, this.gLab); if (weights) lb.textContent = fmt(e.w); this.edges[k] = { a, b, line, ah, lb }; });
    for (const ed of Object.values(this.edges)) ed.off = this.directed && this.edges[ed.b + '-' + ed.a] ? 7 : 0;
    this.blobs = []; this.polys = []; this.state = { n: {}, e: {}, t: {}, el: {} }; this.i = -1;
    this.layout(); if (steps.length) this.apply(0, false);
  }
  key(k) { if (this.edges[k]) return k; const [a, b] = k.split('-'); return this.edges[b + '-' + a] ? b + '-' + a : null; }
  layout() {
    for (const [l, { G }] of Object.entries(this.nodes)) G.setAttribute('transform', `translate(${this.P[l][0].toFixed(1)},${this.P[l][1].toFixed(1)})`);
    for (const ed of Object.values(this.edges)) {
      let [x1, y1] = this.P[ed.a], [x2, y2] = this.P[ed.b]; const L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L; const r = 11;
      if (ed.off) { x1 -= uy * ed.off; y1 += ux * ed.off; x2 -= uy * ed.off; y2 += ux * ed.off; }
      const ex = x2 - ux * (r + (ed.ah ? 2 : 0)), ey = y2 - uy * (r + (ed.ah ? 2 : 0));
      ed.line.setAttribute('x1', (x1 + ux * r).toFixed(1)); ed.line.setAttribute('y1', (y1 + uy * r).toFixed(1)); ed.line.setAttribute('x2', ex.toFixed(1)); ed.line.setAttribute('y2', ey.toFixed(1));
      if (ed.ah) { const bx = ex - ux * 8, by = ey - uy * 8; ed.ah.setAttribute('d', `M${ex.toFixed(1)},${ey.toFixed(1)}L${(bx - uy * 4).toFixed(1)},${(by + ux * 4).toFixed(1)}L${(bx + uy * 4).toFixed(1)},${(by - ux * 4).toFixed(1)}Z`); }
      ed.lb.setAttribute('x', ((x1 + x2) / 2 - uy * 8).toFixed(1)); ed.lb.setAttribute('y', ((y1 + y2) / 2 + ux * 8 + 4).toFixed(1));
    }
    for (const b of this.blobs) b.el.setAttribute('d', b.v.map((l, i) => (i ? 'L' : 'M') + this.P[l][0].toFixed(1) + ',' + this.P[l][1].toFixed(1)).join('') + 'Z');
    for (const p of this.polys) p.el.setAttribute('points', p.v.map(l => this.P[l].map(x => x.toFixed(1)).join(',')).join(' '));
  }
  apply(i, animate = true) {
    const [cap, s] = this.steps[i]; this.i = i; const st = this.state;
    if (s.reset) { st.n = {}; st.e = {}; st.t = {}; st.el = {}; }
    Object.assign(st.n, s.n || {}); for (const [k, v] of Object.entries(s.e || {})) { const kk = this.key(k); if (kk) st.e[kk] = v; } Object.assign(st.t, s.t || {}); for (const [k, v] of Object.entries(s.el || {})) { const kk = this.key(k); if (kk) st.el[kk] = v; }
    for (const [l, { G, tg }] of Object.entries(this.nodes)) { G.setAttribute('class', 'nd ' + (st.n[l] || '')); tg.textContent = st.t[l] || ''; }
    for (const [k, ed] of Object.entries(this.edges)) { const c = st.e[k] || ''; ed.line.setAttribute('class', 'ed ' + c); if (ed.ah) ed.ah.setAttribute('class', 'ah ' + c); ed.lb.setAttribute('class', 'el ' + c); if (k in st.el) ed.lb.textContent = st.el[k]; else if (!this.def.weights) ed.lb.textContent = ''; }
    if (s.blob) { this.gBlob.innerHTML = ''; this.blobs = s.blob.map(([v, cls]) => ({ v, el: this.el('path', { class: 'blob ' + (cls || '') }, this.gBlob) })); }
    if (s.poly) { this.gPoly.innerHTML = ''; this.polys = s.poly.map(([v, cls]) => ({ v, el: this.el('polygon', { class: 'face ' + (cls || '') }, this.gPoly) })); }
    const capEl = this.host.querySelector('.dcap'); capEl.innerHTML = cap;
    this.host.querySelectorAll('.ddot').forEach((d, k) => d.classList.toggle('on', k === i));
    if (s.p) this.tween(s.p, animate && !reduceMotion() ? 750 : 0); else this.layout();
  }
  tween(target, ms) {
    cancelAnimationFrame(this.raf); const from = {}; for (const l of Object.keys(target)) from[l] = this.P[l].slice();
    if (!ms) { for (const [l, p] of Object.entries(target)) this.P[l] = p.slice(); this.layout(); return; }
    const t0 = performance.now(); const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const tick = now => { const t = Math.min(1, (now - t0) / ms), e = ease(t); for (const [l, p] of Object.entries(target)) this.P[l] = [from[l][0] + (p[0] - from[l][0]) * e, from[l][1] + (p[1] - from[l][1]) * e]; this.layout(); if (t < 1) this.raf = requestAnimationFrame(tick); };
    this.raf = requestAnimationFrame(tick);
  }
  play() {
    this.stop(); const startPos = this.def.pos; // replay from the original positions
    this.build(this.cur && this.cur.g || this.def.g, this.cur && this.cur.pos || startPos, this.steps, this.directed, this.def.weights);
    if (reduceMotion()) { this.apply(this.steps.length - 1, false); return; }
    let i = 0; const btn = this.host.querySelector('.dplay'); btn.textContent = 'Playing…';
    const next = () => { i++; if (i >= this.steps.length) { btn.textContent = 'Replay'; this.timer = null; return; } this.apply(i); this.timer = setTimeout(next, 1900); };
    this.timer = setTimeout(next, 1500);
  }
  stop() { if (this.timer) clearTimeout(this.timer); this.timer = null; cancelAnimationFrame(this.raf); }
  goto(i) { this.stop(); const b = this.host.querySelector('.dplay'); if (b) b.textContent = 'Replay'; if (i <= this.i) { this.build(this.cur && this.cur.g || this.def.g, this.cur && this.cur.pos || this.def.pos, this.steps, this.directed, this.def.weights); for (let k = 1; k <= i; k++) this.apply(k, false); } else for (let k = this.i + 1; k <= i; k++) this.apply(k, k === i); }
  useBoard(bg) {
    const r = this.def.gen(bg); if (!r || r.error) return r ? r.error : 'This graph does not suit the animation.';
    this.cur = r; this.steps = r.steps; this.renderDots(); this.build(r.g, r.pos, r.steps, r.g.directed, this.def.weights); this.play(); return null;
  }
  renderDots() { const d = this.host.querySelector('.ddots'); d.innerHTML = this.steps.map((s, k) => `<button type="button" class="ddot" aria-label="Step ${k + 1}"></button>`).join(''); d.querySelectorAll('.ddot').forEach((b, k) => b.onclick = () => this.goto(k)); }
}
/* scale a board graph into a card */
function boardToCard(g) { const xs = g.nodes.map(v => v.x), ys = g.nodes.map(v => v.y); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); const s = Math.min((CW - 40) / Math.max(1, x1 - x0), (CH - 40) / Math.max(1, y1 - y0)); const pos = {}; g.nodes.forEach(v => pos[v.label] = [20 + (CW - 40 - s * (x1 - x0)) / 2 + (v.x - x0) * s, 20 + (CH - 40 - s * (y1 - y0)) / 2 + (v.y - y0) * s]); return pos; }
