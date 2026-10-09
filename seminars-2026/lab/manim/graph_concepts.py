"""Eight short Manim scenes for 1-AIN-413 (Graphs, Graph Algorithms and Optimization).

Render one scene:   manim -qm graph_concepts.py Isomorphism
Render all:         manim -qm -a graph_concepts.py
Colours follow the Graph Studio Lab dark palette. Formulas use Unicode text,
so no LaTeX installation is needed.
"""
from manim import *
import numpy as np

BG, INK, MUTED, EDGE = "#15202a", "#e4ebee", "#8696a0", "#8c9ca6"
ACCENT, HOT, TEAL, MAG, AMBER = "#91a7ff", "#ff8a52", "#4fc9a1", "#f26ea2", "#f0bf4c"
FONT = "DejaVu Sans"
config.background_color = BG


def T(s, size=30, color=INK, **kw):
    return Text(s, font=FONT, font_size=size, color=color, **kw)


class Net:
    """Tiny graph helper: dots + labels + straight or arced edges that follow their endpoints."""

    def __init__(self, scene, pos, edges, r=0.22, label_size=22, directed=False, arcs=None):
        self.scene, self.pos, self.directed = scene, {k: np.array([*v, 0.0]) for k, v in pos.items()}, directed
        self.v, self.lab, self.e = {}, {}, {}
        arcs = arcs or {}
        for k, p in self.pos.items():
            d = Circle(radius=r, color=INK, stroke_width=3).set_fill(BG, 1).move_to(p)
            t = T(str(k), label_size).move_to(p)
            t.add_updater(lambda m, d=d: m.move_to(d.get_center()))
            self.v[k], self.lab[k] = d, t
        for e in edges:
            a, b = e[0], e[1]
            ang = arcs.get((a, b), 0)
            self.e[(a, b)] = self._edge(a, b, ang)

    def _edge(self, a, b, ang=0, color=EDGE, width=4):
        da, db = self.v[a], self.v[b]

        def make():
            p, q = da.get_center(), db.get_center()
            if np.linalg.norm(q - p) < 1e-3:
                return VMobject()
            u = (q - p) / np.linalg.norm(q - p)
            p2, q2 = p + u * da.width / 2, q - u * db.width / 2
            if ang:
                m = ArcBetweenPoints(p2, q2, angle=ang, color=color, stroke_width=width)
            elif self.directed:
                m = Arrow(p2, q2, buff=0, color=color, stroke_width=width, max_tip_length_to_length_ratio=0.12)
            else:
                m = Line(p2, q2, color=color, stroke_width=width)
            return m

        line = always_redraw(make)
        line.meta = dict(color=color, width=width, make=make)
        return line

    def recolor(self, key, color, width=None):
        a, b = key
        old = self.e[key]
        new = self._edge(a, b, 0, color, width or old.meta["width"])
        self.e[key] = new
        return old, new

    def mobjects(self):
        return [*self.e.values(), *self.v.values(), *self.lab.values()]

    def edge_key(self, a, b):
        return (a, b) if (a, b) in self.e else (b, a)


def color_edges(net, keys, color, width=7):
    """Return an AnimationGroup that recolours edges (straight lines only)."""
    anims = []
    for k in keys:
        k = net.edge_key(*k)
        p, q = net.v[k[0]].get_center(), net.v[k[1]].get_center()
        u = (q - p) / np.linalg.norm(q - p)
        seg = Line(p + u * 0.22, q - u * 0.22, color=color, stroke_width=width)
        anims.append(Create(seg))
        net.scene.add_foreground_mobjects(*net.v.values(), *net.lab.values())
        net.__dict__.setdefault("over", {})[k] = seg
    return anims


def ring(labels, r=2.2, cx=0, cy=0, start=90):
    out = {}
    for i, l in enumerate(labels):
        a = np.deg2rad(start - 360 * i / len(labels))
        out[l] = (cx + r * np.cos(a), cy + r * np.sin(a))
    return out


class Isomorphism(Scene):
    def construct(self):
        title = T("Isomorphism", 40).to_edge(UP)
        self.play(Write(title))
        labels = list("abcde")
        net = Net(self, ring(labels, 2.3, 0, -0.4), [(labels[i], labels[(i + 1) % 5]) for i in range(5)])
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(net.v[k]) for k in labels], *[FadeIn(net.lab[k]) for k in labels])
        cap = T("A 5-cycle drawn as a pentagon.", 26, MUTED).to_edge(DOWN)
        self.play(FadeIn(cap))
        self.wait(1)
        star = ring(["a", "c", "e", "b", "d"], 2.3, 0, -0.4)
        self.play(*[net.v[k].animate.move_to(np.array([*star[k], 0])) for k in labels], run_time=2.5)
        self.play(Transform(cap, T("Same vertices, same adjacencies: now it looks like a pentagram.", 26, MUTED).to_edge(DOWN)))
        self.wait(1)
        right = ring(list("12345"), 1.5, 4.2, -0.4)
        net2 = Net(self, right, [(str(i), str(i % 5 + 1)) for i in range(1, 6)])
        self.play(*[m.animate.shift(LEFT * 2.6) for m in [*net.v.values()]], run_time=1)
        self.play(*[Create(m) for m in net2.e.values()], *[FadeIn(net2.v[k]) for k in net2.v], *[FadeIn(net2.lab[k]) for k in net2.lab])
        mapping = {"a": "1", "b": "2", "c": "3", "d": "4", "e": "5"}
        arrows = VGroup(*[CurvedArrow(net.v[k].get_center() + RIGHT * 0.25, net2.v[mapping[k]].get_center() + LEFT * 0.25, color=AMBER, stroke_width=2, angle=-0.4) for k in labels])
        self.play(Transform(cap, T("f: a→1, b→2, c→3, d→4, e→5 sends every edge to an edge.", 26, MUTED).to_edge(DOWN)))
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.2), run_time=2)
        rule = T("G ≅ H  ⇔  there is a bijection f with uv ∈ E(G) ⇔ f(u)f(v) ∈ E(H)", 26, ACCENT).next_to(title, DOWN)
        self.play(FadeIn(rule))
        self.wait(2.5)


class CutProperty(Scene):
    def construct(self):
        title = T("Cut property of minimum spanning trees", 36).to_edge(UP)
        self.play(Write(title))
        pos = {"a": (-4, 1), "b": (-3, -1.6), "c": (-1.2, 0.6), "d": (1.4, -1.2), "e": (3.6, 0.8), "f": (4, -1.8)}
        W = {("a", "b"): 4, ("a", "c"): 2, ("b", "c"): 5, ("b", "d"): 7, ("c", "d"): 3, ("c", "e"): 8, ("d", "e"): 1, ("d", "f"): 6, ("e", "f"): 9}
        net = Net(self, pos, list(W))
        wl = VGroup(*[T(str(w), 22, AMBER).move_to((net.v[a].get_center() + net.v[b].get_center()) / 2 + UP * 0.25) for (a, b), w in W.items()])
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(m) for m in net.v.values()], *[FadeIn(m) for m in net.lab.values()], FadeIn(wl))
        S = ["a", "b", "c"]
        blob = SurroundingRectangle(VGroup(*[net.v[k] for k in S]), color=ACCENT, buff=0.35, corner_radius=0.3).set_fill(ACCENT, 0.12)
        cap = T("A cut: S = {a, b, c} versus the rest.", 26, MUTED).to_edge(DOWN)
        self.play(Create(blob), FadeIn(cap))
        crossing = [("b", "d"), ("c", "d"), ("c", "e")]
        self.play(*color_edges(net, crossing, AMBER, 6))
        self.play(Transform(cap, T("Three edges cross the cut: weights 7, 3, 8.", 26, MUTED).to_edge(DOWN)))
        self.wait(1)
        self.play(*color_edges(net, [("c", "d")], TEAL, 9))
        self.play(Transform(cap, T("The lightest crossing edge, c–d (3), belongs to some MST.", 26, MUTED).to_edge(DOWN)))
        self.wait(1.2)
        self.play(Transform(cap, T("Why: take a spanning tree T that uses b–d (7) instead …", 26, MUTED).to_edge(DOWN)))
        self.play(*color_edges(net, [("b", "d")], MAG, 9))
        self.wait(1)
        self.play(Transform(cap, T("… swap b–d out and c–d in: still a spanning tree, 4 lighter.", 26, MUTED).to_edge(DOWN)))
        self.play(FadeOut(net.over[("b", "d")]))
        eq = T("w(T − bd + cd) = w(T) − 7 + 3 < w(T)", 28, ACCENT).next_to(title, DOWN)
        self.play(FadeIn(eq))
        self.wait(2.5)


class AugmentingPath(Scene):
    def construct(self):
        title = T("Augmenting paths and Berge’s theorem", 36).to_edge(UP)
        self.play(Write(title))
        L, R = ["a", "b", "c", "d"], ["w", "x", "y", "z"]
        pos = {**{k: (-2.5, 2 - 1.3 * i) for i, k in enumerate(L)}, **{k: (2.5, 2 - 1.3 * i) for i, k in enumerate(R)}}
        E = [("a", "w"), ("a", "x"), ("b", "x"), ("b", "y"), ("c", "y"), ("c", "z"), ("d", "z")]
        net = Net(self, pos, E)
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(m) for m in net.v.values()], *[FadeIn(m) for m in net.lab.values()])
        M = [("a", "x"), ("b", "y"), ("c", "z")]
        self.play(*color_edges(net, M, ACCENT, 9))
        size = T("|M| = 3", 30, ACCENT).to_corner(UL).shift(DOWN * 1.4)
        cap = T("A matching M (blue). w and d are unmatched.", 26, MUTED).to_edge(DOWN)
        self.play(FadeIn(size), FadeIn(cap), net.v["w"].animate.set_stroke(MAG, 5), net.v["d"].animate.set_stroke(MAG, 5))
        self.wait(1)
        path = [("w", "a"), ("a", "x"), ("x", "b"), ("b", "y"), ("y", "c"), ("c", "z"), ("z", "d")]
        self.play(Transform(cap, T("w – a – x – b – y – c – z – d alternates: out, in, out, …", 26, MUTED).to_edge(DOWN)))
        outs = [p for i, p in enumerate(path) if i % 2 == 0]
        self.play(LaggedStart(*color_edges(net, outs, HOT, 7), lag_ratio=0.25), run_time=2)
        self.wait(1)
        self.play(Transform(cap, T("Flip it: the in-edges leave M, the out-edges enter M.", 26, MUTED).to_edge(DOWN)))
        anims = []
        for k in M:
            anims.append(FadeOut(net.over[net.edge_key(*k)]))
        for k in outs:
            anims.append(net.over[net.edge_key(*k)].animate.set_color(ACCENT).set_stroke(width=9))
        self.play(*anims, Transform(size, T("|M| = 4", 30, ACCENT).to_corner(UL).shift(DOWN * 1.4)), net.v["w"].animate.set_stroke(INK, 3), net.v["d"].animate.set_stroke(INK, 3), run_time=1.5)
        rule = T("Berge: M is maximum  ⇔  there is no M-augmenting path", 28, ACCENT).next_to(title, DOWN)
        self.play(FadeIn(rule))
        self.wait(2.5)


class ResidualNetwork(Scene):
    def construct(self):
        title = T("Residual networks", 40).to_edge(UP)
        self.play(Write(title))
        pos = {"s": (-6.2, -0.5), "a": (-3.8, 1.5), "b": (-3.8, -2.5), "t": (-1.4, -0.5)}
        caps = {("s", "a"): (2, 3), ("s", "b"): (2, 2), ("a", "b"): (0, 1), ("a", "t"): (2, 2), ("b", "t"): (2, 3)}
        net = Net(self, pos, list(caps), directed=True)
        fl = VGroup(*[T(f"{f}/{c}", 22, TEAL if f else MUTED).move_to((net.v[a].get_center() + net.v[b].get_center()) / 2 + UP * 0.28 + RIGHT * 0.2) for (a, b), (f, c) in caps.items()])
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(m) for m in net.v.values()], *[FadeIn(m) for m in net.lab.values()], FadeIn(fl))
        cap = T("A flow of value 4. Labels show flow / capacity.", 26, MUTED).to_edge(DOWN)
        self.play(FadeIn(cap))
        self.wait(1)
        # residual arcs, drawn to the right
        rp = {k: np.array([v[0] + 7.4, v[1], 0]) for k, v in pos.items()}
        dots = {k: Circle(radius=0.2, color=INK, stroke_width=3).set_fill(BG, 1).move_to(p) for k, p in rp.items()}
        labs = {k: T(k, 20).move_to(p) for k, p in rp.items()}
        self.play(Transform(cap, T("Residual network: forward arcs carry c − f, backward arcs carry f.", 26, MUTED).to_edge(DOWN)))
        self.play(*[FadeIn(d) for d in dots.values()], *[FadeIn(l) for l in labs.values()])
        arcs = []
        for (a, b), (f, c) in caps.items():
            p, q = rp[a], rp[b]
            if c - f > 0:
                arcs.append(VGroup(CurvedArrow(p + (q - p) * 0.12, q - (q - p) * 0.12, angle=-0.35, color=EDGE, stroke_width=3), T(str(c - f), 20, INK).move_to((p + q) / 2 + rotate_vector((q - p) / np.linalg.norm(q - p), -PI / 2) * 0.35)))
            if f > 0:
                arcs.append(VGroup(CurvedArrow(q - (q - p) * 0.12, p + (q - p) * 0.12, angle=-0.35, color=MAG, stroke_width=3), T(str(f), 20, MAG).move_to((p + q) / 2 + rotate_vector((q - p) / np.linalg.norm(q - p), PI / 2) * 0.35)))
        self.play(LaggedStart(*[Create(a) for a in arcs], lag_ratio=0.15), run_time=3)
        self.wait(1)
        self.play(Transform(cap, T("s → a → b → t is an augmenting path in the residual network.", 26, MUTED).to_edge(DOWN)))
        hl = VGroup(*[Line(rp[x] + (rp[y] - rp[x]) * 0.15, rp[y] - (rp[y] - rp[x]) * 0.15, color=HOT, stroke_width=8) for x, y in [("s", "a"), ("a", "b"), ("b", "t")]])
        self.play(Create(hl), run_time=1.5)
        self.play(Transform(cap, T("Bottleneck min(1, 1, 1) = 1: the flow grows to 5 = capacity of the cut around s.", 26, MUTED).to_edge(DOWN)))
        self.wait(2.5)


class WLRefinement(Scene):
    def construct(self):
        title = T("Colour refinement (1-dimensional Weisfeiler–Leman)", 32).to_edge(UP)
        self.play(Write(title))
        pos = {"a": (-4.5, 0), "b": (-2.5, 0), "c": (-0.5, 0), "d": (1.5, 0), "e": (3.5, 0), "f": (-0.5, -2)}
        E = [("a", "b"), ("b", "c"), ("c", "d"), ("d", "e"), ("c", "f")]
        net = Net(self, pos, E)
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(m) for m in net.v.values()], *[FadeIn(m) for m in net.lab.values()])
        palette = [ACCENT, AMBER, TEAL, MAG, HOT, "#b39ddb"]
        rounds = [
            ({k: 0 for k in pos}, "Round 0: every vertex has the same colour."),
            ({"a": 1, "e": 1, "f": 1, "b": 2, "d": 2, "c": 3}, "Round 1: (colour, multiset of neighbour colours) separates degrees 1, 2, 3."),
            ({"a": 1, "e": 1, "f": 4, "b": 2, "d": 2, "c": 3}, "Round 2: f is adjacent to the degree-3 vertex; a and e are not."),
        ]
        cap = T(rounds[0][1], 26, MUTED).to_edge(DOWN)
        self.play(*[net.v[k].animate.set_fill(palette[0], 0.85) for k in pos], FadeIn(cap))
        self.wait(1)
        prev = rounds[0][0]
        for colors, text in rounds[1:]:
            msets = VGroup()
            for k in pos:
                nb = sorted(prev[y] if x == k else prev[x] for (x, y) in E if k in (x, y))
                msets.add(T("{" + ",".join(str(c) for c in nb) + "}", 18, INK).next_to(net.v[k], UP, buff=0.18))
            self.play(FadeIn(msets), Transform(cap, T("Each vertex collects the multiset of its neighbours’ colours …", 26, MUTED).to_edge(DOWN)))
            self.wait(1.2)
            self.play(*[net.v[k].animate.set_fill(palette[c], 0.85) for k, c in colors.items()], FadeOut(msets), Transform(cap, T(text, 26, MUTED).to_edge(DOWN)), run_time=1.5)
            prev = colors
            self.wait(1.2)
        self.play(Transform(cap, T("Stable: the next round splits nothing. Different histograms ⇒ not isomorphic.", 26, MUTED).to_edge(DOWN)))
        self.wait(2.5)


class HallCondition(Scene):
    def construct(self):
        title = T("Hall’s condition", 40).to_edge(UP)
        self.play(Write(title))
        L, R = ["a", "b", "c", "d"], ["w", "x", "y", "z"]
        pos = {**{k: (-2.5, 1.0 - 1.05 * i) for i, k in enumerate(L)}, **{k: (2.5, 1.0 - 1.05 * i) for i, k in enumerate(R)}}
        E = [("a", "w"), ("a", "x"), ("b", "w"), ("b", "x"), ("c", "x"), ("c", "w"), ("d", "y"), ("d", "z")]
        net = Net(self, pos, E)
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(m) for m in net.v.values()], *[FadeIn(m) for m in net.lab.values()])
        cap = T("Can every vertex on the left get its own partner?", 26, MUTED).to_edge(DOWN)
        self.play(FadeIn(cap))
        S = ["a", "b", "c"]
        bS = SurroundingRectangle(VGroup(*[net.v[k] for k in S]), color=ACCENT, buff=0.3, corner_radius=0.25).set_fill(ACCENT, 0.15)
        self.play(Create(bS), Transform(cap, T("Take S = {a, b, c}.", 26, MUTED).to_edge(DOWN)))
        self.play(*color_edges(net, [e for e in E if e[0] in S], AMBER, 6))
        NS = ["w", "x"]
        bN = SurroundingRectangle(VGroup(*[net.v[k] for k in NS]), color=MAG, buff=0.3, corner_radius=0.25).set_fill(MAG, 0.15)
        self.play(Create(bN), Transform(cap, T("Its neighbourhood N(S) = {w, x}.", 26, MUTED).to_edge(DOWN)))
        ineq = T("|N(S)| = 2  <  3 = |S|", 32, MAG).next_to(title, DOWN, buff=0.25)
        self.play(FadeIn(ineq))
        self.play(Transform(cap, T("Three vertices, two possible partners: no matching covers S.", 26, MUTED).to_edge(DOWN)))
        self.wait(1.5)
        rule = T("Hall: L can be matched  ⇔  |N(S)| ≥ |S| for every S ⊆ L", 26, ACCENT).next_to(ineq, DOWN, buff=0.15)
        self.play(FadeIn(rule))
        self.wait(2.5)


class EulerFormula(Scene):
    def construct(self):
        title = T("Euler’s formula by contraction", 38).to_edge(UP)
        self.play(Write(title))
        pos = {1: (-1.5, -2.2), 2: (1.5, -2.2), 3: (1.5, 0.8), 4: (-1.5, 0.8), 5: (0, 2.3)}
        arcs = {(3, 4): -0.45, (4, 5): 0.5}
        E = [(1, 2), (2, 3), (3, 4), (4, 1), (3, 5), (4, 5)]
        net = Net(self, pos, E, arcs=arcs)
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(m) for m in net.v.values()], *[FadeIn(m) for m in net.lab.values()])
        st = {"n": 5, "m": 6, "f": 3}

        def counter():
            return T(f"n − m + f = {st['n']} − {st['m']} + {st['f']} = {st['n'] - st['m'] + st['f']}", 32, ACCENT).to_edge(RIGHT).shift(UP * 0.5 + LEFT * 0.2)
        ctr = counter()
        cap = T("A connected plane graph: the house. Faces: 2 inside + the outer face.", 26, MUTED).to_edge(DOWN)
        self.play(FadeIn(ctr), FadeIn(cap))
        self.wait(1.2)

        def step(text, dn, dm, df, remove_edges=(), merge=None, flash=None):
            st["n"] += dn; st["m"] += dm; st["f"] += df
            if merge:
                x, y = merge; dx, dy = net.v[x], net.v[y]
                self.play(dx.animate.move_to(dy.get_center()), run_time=1.4)
                dx.add_updater(lambda m, dy=dy: m.move_to(dy.get_center()))
                hide = [dx.animate.set_opacity(0), net.lab[x].animate.set_opacity(0)]
            else:
                self.play(Indicate(net.e[flash], color=HOT, scale_factor=1.0), run_time=1.2)
                hide = []
            self.play(*hide, *[FadeOut(net.e.pop(k)) for k in remove_edges], Transform(ctr, counter()), Transform(cap, T(text, 26, MUTED).to_edge(DOWN)), run_time=1)
            self.wait(1)

        step("Contract edge 3–5: n and m both drop by 1.", -1, -1, 0, remove_edges=[(3, 5)], merge=(5, 3))
        step("Delete one of two parallel edges: m and f both drop by 1.", 0, -1, -1, remove_edges=[(4, 5)], flash=(4, 5))
        step("Contract edge 2–3.", -1, -1, 0, remove_edges=[(2, 3)], merge=(3, 2))
        step("Contract edge 1–2: another pair of parallel edges appears.", -1, -1, 0, remove_edges=[(1, 2)], merge=(2, 1))
        step("Delete a parallel edge.", 0, -1, -1, remove_edges=[(3, 4)], flash=(3, 4))
        step("Contract the last edge: one vertex, no edges, one face.", -1, -1, 0, remove_edges=[(4, 1)], merge=(4, 1))
        rule = T("Every step keeps n − m + f fixed, and a single vertex has 1 − 0 + 1 = 2.", 26, ACCENT).next_to(title, DOWN)
        self.play(FadeIn(rule))
        self.wait(2.5)


class PlanarDual(Scene):
    def construct(self):
        title = T("The dual of a plane graph", 38).to_edge(UP)
        self.play(Write(title))
        o, i = 2.4, 1.0
        pos = {"A": (-o, o * 0.8), "B": (o, o * 0.8), "C": (o, -o * 0.8 - 0.4), "D": (-o, -o * 0.8 - 0.4), "a": (-i, i * 0.6), "b": (i, i * 0.6), "c": (i, -i * 0.6 - 0.4), "d": (-i, -i * 0.6 - 0.4)}
        for k in pos:
            pos[k] = (pos[k][0] - 1.6, pos[k][1])
        E = [("A", "B"), ("B", "C"), ("C", "D"), ("D", "A"), ("a", "b"), ("b", "c"), ("c", "d"), ("d", "a"), ("A", "a"), ("B", "b"), ("C", "c"), ("D", "d")]
        net = Net(self, pos, E, r=0.2, label_size=18)
        self.play(*[Create(m) for m in net.e.values()], *[FadeIn(m) for m in net.v.values()], *[FadeIn(m) for m in net.lab.values()])
        cap = T("The cube, drawn in the plane: 6 faces (5 inside, 1 outside).", 26, MUTED).to_edge(DOWN)
        self.play(FadeIn(cap))
        P = lambda k: np.array([*pos[k], 0])
        faces = {"F0": ["a", "b", "c", "d"], "Ft": ["A", "B", "b", "a"], "Fr": ["B", "C", "c", "b"], "Fb": ["C", "D", "d", "c"], "Fl": ["D", "A", "a", "d"]}
        fc = {k: sum(P(v) for v in vs) / len(vs) for k, vs in faces.items()}
        fc["Fo"] = np.array([4.6, 0.2, 0])
        dv = {k: Dot(p, radius=0.13, color=HOT) for k, p in fc.items()}
        self.play(Transform(cap, T("Put one vertex inside every face, including the outer face.", 26, MUTED).to_edge(DOWN)))
        self.play(LaggedStart(*[GrowFromCenter(d) for d in dv.values()], lag_ratio=0.2))
        adj = [("F0", "Ft"), ("F0", "Fr"), ("F0", "Fb"), ("F0", "Fl"), ("Ft", "Fr"), ("Fr", "Fb"), ("Fb", "Fl"), ("Fl", "Ft"), ("Ft", "Fo"), ("Fr", "Fo"), ("Fb", "Fo"), ("Fl", "Fo")]
        self.play(Transform(cap, T("Join two face-vertices across every edge they share.", 26, MUTED).to_edge(DOWN)))
        dlines = VGroup()
        for a, b in adj:
            if b == "Fo":
                ang = {"Ft": -0.6, "Fr": 0.0, "Fb": 0.6, "Fl": 1.6}[a]
                dlines.add(ArcBetweenPoints(fc[a], fc[b], angle=ang, color=HOT, stroke_width=3))
            else:
                dlines.add(DashedLine(fc[a], fc[b], color=HOT, stroke_width=3, dash_length=0.12))
        self.play(LaggedStart(*[Create(l) for l in dlines], lag_ratio=0.12), run_time=3)
        self.wait(1)
        self.play(*[m.animate.set_opacity(0.15) for m in [*net.e.values(), *net.v.values(), *net.lab.values()]], run_time=1)
        self.play(Transform(cap, T("6 face-vertices, 12 edges, every face-vertex of degree 4: the octahedron.", 26, MUTED).to_edge(DOWN)))
        rule = T("faces of G ↔ vertices of G*,   edges ↔ edges,   vertices of G ↔ faces of G*", 24, ACCENT).next_to(title, DOWN)
        self.play(FadeIn(rule))
        self.wait(2.5)
