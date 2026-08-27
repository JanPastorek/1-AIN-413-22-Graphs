# 10 — Network forecast

**90 minutes.** Prerequisites: probability, expectation, connected components. Tool-aware local Python simulation; no personal social-network data required.

You will derive expectations with indicator variables, distinguish a random model from a curated database, and interpret a simulation without claiming proof.

## A — Foundation

Define G(n,p): each unordered pair of distinct vertices is independently an edge with probability p. Is this uniform over all unlabelled graphs? Does linearity of expectation require independent summands?

## B — Core studio

**Brief:** a designer proposes a random communication network on 30 locations. Before simulating, decide what observations would make you doubt the model's suitability.

1. Predict the expected number of edges and isolated vertices at p = 0.03, 0.10, and 0.20. Record your derivation before using code.
2. Define an indicator for each potential edge and for each isolated vertex. Derive E[m] = choose(n,2)p and E[isolates] = n(1−p)^(n−1). Explain why the latter indicators need not be independent.
3. With a fixed random seed, generate 100 independent samples per p. Record mean edges, mean isolates, and proportion connected. Implement generation with `random.Random`; use BFS for connectivity. Document whether sampling is labelled.
4. Compare predictions and sample means. Repeat with another seed. Explain why empirical agreement is not proof and why no isolated vertices does not force connectivity.
5. Would the same histogram computed from House of Graphs estimate properties of G(n,p)? Identify the selection bias. If authentic course datasets are available, compare one only after documenting its construction and limitations.

**Change:** require the graph to be connected. Explain why rejecting disconnected samples changes the sampling distribution. Do not silently compare this conditional sample with the original expectation.

## C — Challenge

Explore connectivity near p ≈ log(n)/n for increasing n; label this as a finite experiment. Distinguish the connectivity scale from the Hamiltonicity scale (log n + log log n)/n. Or compare preferential attachment with G(n,p), stating which properties each model is designed to capture.

## Session rhythm

7 recall; 10 prediction; 20 derivation; 15 simulation; 18 interpretation; 13 distribution change; 7 protected exit. If laptops fail, the teacher supplies a seeded-results card so the interpretation and proof still happen.
