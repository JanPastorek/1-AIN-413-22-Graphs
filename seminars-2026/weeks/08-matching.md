# 08 — Placement office

**90 minutes.** Prerequisites: bipartite graphs, augmenting paths, set complements. House of Graphs is optional in the comparison block.

You will separate maximum from maximal, improve an allocation, and certify matching optimality using a cover or Hall obstruction.

## A — Foundation

On a four-vertex path, select the middle edge. Is this matching maximal? Maximum? Define left-saturating versus perfect. Does stability optimize the same objective as cardinality?

## B — Core studio

Applicants a,b,c are eligible for placements x,y,z through edges ax, ay, bx, cy, cz. Each applicant and placement can be used at most once. Use `placements`.

1. Write a cardinality-maximization model. Begin with matching {ax,cy}. Explain why simply adding one edge cannot complete the allocation.
2. Find an alternating augmenting path and flip its edges. Justify why the result is still a matching and its cardinality increases by one.
3. Find a vertex cover of the same size as the matching. Prove that any matching has size at most any vertex cover, then conclude optimality from equality.
4. In [House of Graphs](https://houseofgraphs.org/search), search bipartite graphs on 6–8 vertices with **Matching Number = 3**. Choose one graph and try to supply both witnesses before reading its **Vertex Cover Number**. Record a stable graph URL.
5. For a maximum matching, let Z be the vertices reached from unmatched left-side vertices by unmatched edges left→right and matched edges right→left. Investigate why (L minus Z) union (R intersect Z) is a cover of matching size. Use the teacher's scaffold for the full argument.

**Change:** replace eligibility edges by ax, bx, cx, cy. Find a deficient set of applicants and explain why no left-saturating matching exists. A failed greedy allocation is not a Hall certificate.

## C — Challenge

Remove bipartiteness and find a graph with matching number smaller than vertex-cover number. Or assign preferences and identify a blocking pair: explain why a maximum-cardinality matching can still be unstable.

## Session rhythm

7 recall; 10 model; 20 augment; 15 certificate/query; 18 proof; 13 deficient-set change; 7 protected exit. The optional stability task does not displace the core certificate proof.
