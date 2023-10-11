<!-- slide template="[[Academic-pres]]" -->
# Exercises 3

::: footer
Graphs, graph algorithms and optimalization - Isomorphisms, Ján Pastorek, <a style="color: white">jan.pastorek@fmph.uniba.sk</a>
:::

---

<!-- slide template="[[Academic-pres]]" -->
Code for moodle

    grafy&algoritmy23 



---

<!-- slide template="[[Academic-pres]]" -->

![[51a08fa2604481bb205b940985affab5_MD5.png|700]]

---
<!-- slide template="[[Academic-pres]]" -->
How many subgraphs does Graph with ${} n {}$ vertices k-vertex induced subgraphs does a graph have?

$$\begin{pmatrix}
n \\
k
\end{pmatrix}$$


---
<!-- slide template="[[Academic-pres]]" -->
How many subgraphs does Graph with ${} n {}$ vertices have?

$$\sum_{k=0}^n \begin{pmatrix}
n \\
k
\end{pmatrix} = 2^n$$

---
<!-- slide template="[[Academic-pres]]" -->
**Bipartite networks and projections**



![[Graph#^c5ece0]] 

---
![[374fe2adef6b0f70d9910441e5a8feba_MD5.png]]

---
<!-- slide template="[[Academic-pres]]" -->
Are these claims true? (Stanoyevitch, 8.1 exercises 13 & 14) 
1. A subgraph of a bipartite graph is bipartite.
2. A bipartite graph cannot have a self-loop.


---


<!-- slide template="[[Academic-pres]]" -->
![[Graph#^4270ca]]



---

<!-- slide template="[[Academic-pres]]" -->
### Isomorphism - Heuristics from the lecture:
If ${} G_1 {}$ and ${} G_2 {}$ are isomorphic, then:
1. ${} |V_1 |=|V_2 |, |E_1 |=|E_2 | {}$
2. the degree of ${} v {}$ is equal to the degree of ${} ϕ(v)$, for all ${} v∈V_1 {}$  
3. the vertex degree sequence of the graph ${} G_1 {}$ is the same as the vertex degree sequence of ${} G_2 {}$  
4. the image of a path of length ${} n {}$ in ${} G_1 {}$ is a path of length ${} n {}$ in ${} G_2 {}$  
5. the cycle image of length ${} n {}$ in ${} G_1$ is the cycle of length $n {}$ in ${} G_2 {}$ 
6. Here too, you get your favorite graph property and ${} ϕ$ preserves it

---
<!-- slide template="[[Academic-pres]]" -->
> [!math|{"type":"theorem","number":"auto","setAsNoteMathLink":true,"title":"isomorphism of graphs is equivalent to isomorphism of complements of graphs (Stanoyevitch, Exercise for the reader 8.11)","label":"isomorphism-of-graphs-is-equivalent-to-isomorphism-of-complements-of-graphs-stanoyevitch-exercise-for-the-reader-11","_index":0}] Theorem 1 (isomorphism of graphs is equivalent to isomorphism of complements of graphs (Stanoyevitch, Exercise for the reader 8.11)).
> ![[04e91fddd83d1c76af25b4ca8ba3e4d1_MD5.png]]

---
<!-- slide template="[[Academic-pres]]" -->
![[Graph Isomorphism#^f5d115]] 

---

<!-- slide template="[[Academic-pres]]" -->
### Are these graphs bipartite;  and isomorphic? (Stanoyevitch, 8.1 exercises 18 - 25)

---

<!-- slide template="[[Academic-pres]]" -->
![[9bf26bf39c472063a478ca94cb247739_MD5.png]]

---

<!-- slide template="[[Academic-pres]]" -->
![[471839355e9ac54556caedc58ad44b25_MD5.png]]
![[6bb16bf73541e00116ffd8249ce767c6_MD5.png]]

---

<!-- slide template="[[Academic-pres]]" -->
![[0108dee46c78dbc76d9fa95255f6adad_MD5.png]]
![[561c8f50cba02141c378007e982af063_MD5.png]]

---
<!-- slide template="[[Academic-pres]]" -->
Tip: use the fact that isomorphism is an **equivalence relation** to shorten your proofs (reflexive, **symmetric** and **transitive**)
![[e5e0170cdd99eca0f850c92e0eb637aa_MD5.png]]

![[609c3a9521f975d340c8be03ec922911_MD5.png]]

---

![[8743d21d489f897ca45b29918fe4f36b_MD5.png]]

---

![[b928e2e265dea8c15a7f5d9ee2eebf46_MD5.png]]

---

<!-- slide template="[[Academic-pres]]" -->
If it is a directed graph, for it to be isomorphic to another graph, it needs to also preserve the directionality of edges.

![[b392fddadfe1f76ecd56189881ca0f19_MD5.png]]

![[fdad381cef2c8ef2ea36788192f61853_MD5.png]]

---

![[cad3d18cdeefca666c80e804a040b07d_MD5.png]]

---

Do not forget about your home projects!