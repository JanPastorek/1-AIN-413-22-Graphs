# 11 — Sensor budget

**90 minutes; PHOEG/optimization pilot.** Prerequisites: closed neighborhoods, maximum degree, binary variables. No commercial ILP solver is required; exact subset enumeration suffices for the small graphs.

You will model coverage, prove a bound, and distinguish feasibility from certified optimality.

## A — Foundation

A sensor covers its own vertex and all adjacent vertices. Write N[v]. Explain why a vertex cover and a dominating set solve different coverage problems. What changes for total domination?

## B — Core studio

**Brief:** install as few sensors as possible on six locations arranged in a cycle, with edges AB,BC,CD,DE,EF,FA. Use `sensor`. All sites are candidates and cost one unit; physical ranges and interference are omitted.

1. Predict a good sensor set and a reason fewer sensors might be impossible.
2. In [PHOEG](https://phoeg.umons.ac.be/phoeg/), set x = **Maximum degree**, y = **Domination number**, **Connectedness = true**, order 6; then compare order 7. Conjecture bounds at fixed n and identify witnesses.
3. Prove ceil(n/(Δ+1)) ≤ γ ≤ n−Δ for any nonempty simple graph. For the lower bound, count what one sensor covers. For the upper bound, choose a maximum-degree vertex and decide what to do with vertices outside its closed neighborhood.
4. Write an integer program: binary x_v, objective minimize their sum, and one coverage constraint for each location. State why the constraints encode the model in both directions.
5. Use `is_dominating_set` to check feasibility. Write a tiny exact subset search with `itertools.combinations`; compare it with a greedy rule you specify precisely, including ties. A heuristic solution is only an upper bound.

**Change:** A becomes unavailable as a sensor location, but still needs coverage. Then allow coverage within distance two. State the changed constraints, not just the new answer.

## C — Challenge

Give unequal positive costs and write the weighted objective. Or use a linear-programming relaxation as a lower bound, explaining why a fractional solution is not a deployable sensor set. Construct a graph where your chosen greedy rule is suboptimal.

## Session rhythm

10 definitions; 15 PHOEG; 20 proof; 20 exact/greedy and ILP; 15 change; 10 individual constraint/certificate check and feedback. This last check is formative unless announced as an existing assessment component; it is not an eleventh graded exit ticket.
