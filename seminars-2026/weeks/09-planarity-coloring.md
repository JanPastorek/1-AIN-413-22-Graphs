# 09 — Circuit-board inspectors

**90 minutes; planarity pilot and proof clinic.** Prerequisites: Euler's formula for connected plane graphs, proper coloring, induction. In the default twelve-week assessment schedule, Week 9 uses [the combined clinic/practical schedule](../assessed-live/README.md); this full studio is preparation/optional discussion material, not an additional required session. If running the full studio instead, schedule the practical elsewhere and explicitly reduce other contact work.

You will refute a false converse, give a nonplanarity argument, and prove a coloring bound from a structural lemma.

## A — Foundation

State n−m+f for a connected plane graph, counting the outer face. Does a crossing in one drawing prove nonplanarity? What is the difference between an abstract planar graph and a chosen plane embedding?

## B — Core studio

**Brief:** a circuit-board checker declares a simple graph planar whenever m ≤ 3n−6, for n ≥ 3. Your job is to audit the rule.

1. Decide whether the inequality is necessary, sufficient, or both. Construct a counterexample if needed before searching.
2. In [House of Graphs](https://houseofgraphs.org/search), combine **Number of Vertices = 6**, **Number of Edges = 9**, **Bipartite = Yes**, **Minimum Degree = 3**, **Maximum Degree = 3**. Inspect a result and independently verify the criteria.
3. For this candidate, assume a plane embedding and count face-edge incidences. Why must face boundaries have length at least four? Combine with Euler's formula to derive a contradiction. State any bridge/simple-graph assumptions you use.
4. Prove that every nonempty simple planar graph has a vertex of degree at most five, handling n = 1,2 separately. Use this lemma and induction to prove every simple planar graph is six-colorable. Explain why this argument does not prove four-colorability.
5. Give a short peer explanation of the inductive extension step, then revise it after a question.

**Change:** subdivide an edge of your nonplanar graph. Does the graph become planar? Distinguish containing a graph literally from containing its subdivision.

## C — Challenge

Draw the dual of a chosen plane embedding that includes a bridge. What becomes of that bridge? Alternatively, use the [small-data-trap lesson](../practice/small-data-trap.md) on a separate available occasion. It is a full alternative lesson, not an extra ten-minute problem.

## Session rhythm

7 recall; 10 audit; 20 construct/query; 15 compare; 18 induction; 13 individual clinic/perturbation; 7 protected exit. The teacher provides the offline candidate only after your own attempt.
