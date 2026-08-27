# PHOEG, House of Graphs, and evidence

## Choose the appropriate instrument

[PHOEG](https://phoeg.umons.ac.be/phoeg/) compares graph invariants and lets you inspect graphs represented by plotted points. Its documented interface includes orders 2–10 for simple undirected graphs. Use small orders first. A coordinate can represent multiple non-isomorphic graphs; a location inside a convex hull need not represent any graph.

[House of Graphs](https://houseofgraphs.org/search) searches a curated collection by numeric properties, graph class, text, encoding, and drawing. The searchable collection is not exhaustive. Its [meta-directory](https://houseofgraphs.org/meta-directory) is a separate route to specified collections/generators; read the exact scope of each collection.

Neither website replaces local tools for weighted or directed routing, residual-flow algorithms, and random-model simulation. Use the supplied Python scaffolding for those tasks. No student account, public upload, or paid service is required for these studios.

## PHOEG recipe

1. Write your prediction and the graph class before querying.
2. Select the x and y invariants named on the sheet; select the order panel.
3. Add the specified numeric or Boolean constraints. For an equality, set the numeric minimum and maximum to the same value.
4. Select an actual plotted point and inspect the graphs behind it. Confirm the order and constraints of the panel you are reading.
5. Use **Share Configuration** to retain the view. Record the settings in words too.

Example for Week 2: x = **Size**, y = **Maximum degree**, order 5, **Minimum degree** bounded below and above by 1; inspect (4,2). Your task is to justify the mathematics, not merely read a multiplicity count.

## House of Graphs recipe

Use [Search](https://houseofgraphs.org/search), combine the criteria specified on the task, and open an individual result. Record its stable graph URL and edge list/encoding. A search-results page is not a stable identity for the chosen graph. Numeric data may be missing; missing does not mean false. Distinguish ordinary and induced subgraph constraints if you use them.

You can search by graph6/sparse6 without first canonicalizing the input. Different encodings alone do not prove non-isomorphism. Do not upload graphs or comments as part of a required exercise.

## Evidence card (copy onto half a page)

- **Prediction:** precise statement and graph class.
- **Search record:** tool, date, order bounds, filters, axes, saved configuration or graph URL.
- **Witness:** edge list/encoding and readable drawing.
- **Independent check:** which property did we actually verify, and how?
- **Conclusion label:** example / counterexample / finite computational evidence / proof / still unresolved here.
- **Transfer:** what changes if an assumption changes?
- **Assistance:** material AI or other assistance, if allowed.

One counterexample refutes a universal statement. Many confirming examples do not prove it. No result in a curated database does not prove nonexistence. Claims of smallest order need a completeness argument or an appropriately cited theorem.

## Offline fallback

The teacher has printable graph cards and reveal cards for platform activities. Continue with them if a query takes more than three minutes. Do not spend the proof block troubleshooting a website. Locally constructed graphs are mathematical examples, not pretend downloads from a database.

Scope and educational use: [PHOEG paper](https://arxiv.org/html/2603.27242v1); [House of Graphs knowledge-management paper](https://arxiv.org/html/2603.23070v1). Interface terminology was checked on 27 August 2026; the teacher should recheck before the offering.
