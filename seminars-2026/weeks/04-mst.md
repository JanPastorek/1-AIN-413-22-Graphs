# 04 — Campus fiber auction

**90 minutes.** Prerequisites: trees, cycles, connectedness, sorting. Tool-aware calculation is allowed after a paper attempt.

You will distinguish an MST from a shortest-path tree, justify a safe edge by exchange, and adapt a tree to changed costs.

## A — Foundation

Why does a tree on n vertices have n−1 edges? Does n−1 edges alone imply a tree? In a weighted graph, what objective does an MST minimize?

## B — Core studio

Six campus buildings A–F may be connected by cables. Costs: AB4, AC2, BC1, BD5, CD8, CE10, DE2, DF6, EF3. These are undirected edges; use `fiber` in the practice data. Costs are synthetic units.

1. State the connectivity requirement and what the model omits about reliability. Each pair proposes a connected design and its cost.
2. Run Kruskal with a ledger: considered edge, accepted/rejected, and the reason. Another pair challenges any unsupported choice. No points are awarded for buying edges fastest.
3. Prove the safe-edge step: let a minimum-weight edge cross a cut respected by the current forest. In an optimum extending the forest, add that edge, identify an edge on the resulting cycle crossing the same cut, and exchange. Explain why the replacement does not increase cost.
4. Compare with Prim: which cut is used at each step? What common proof idea makes both methods work?
5. Audit a purported proof claiming “the lightest edge on every cycle must be in every MST.” Find the quantifier or rule that fails, and state a valid related rule.

**Change:** BD's cost becomes 9. Update the solution and justify it without blindly rerunning the entire trace. Then ask whether minimizing total cable length also minimizes the distance from A to every other building.

## C — Challenge

Prove that distinct edge weights imply a unique MST. Does uniqueness imply distinct weights? Construct a counterexample. Or require the network to stay connected after any one cable fails: explain why the original tree objective no longer fits.

## Session rhythm

7 recall; 10 model; 20 auction/trace; 15 compare; 18 exchange proof; 13 changed input; 7 protected exit. Explain runtime in terms of n and m and the use of sorting/union-find, not just the cost of the drawing.
