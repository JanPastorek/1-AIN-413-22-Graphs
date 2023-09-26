![N is a Number: A Portrait of Paul Erdős - YouTube](https://www.youtube.com/watch?v=fEbYLNyvQy0&ab_channel=mgoonvo)

---

![VRNetzer Intro - YouTube](https://www.youtube.com/watch?v=S5at3KU06lY&ab_channel=menchelab)

---

Exercises 2

<grid drag="100 6" drop="bottom" bg="#00466e" style="font-size:30px">
######  Graphs, graph algorithms and optimalization - Basics 2, Ján Pastorek, <a style="color: white">jan.pastorek@fmph.uniba.sk</a>
<!-- element style="font-weight:300; color: white" -->
</grid>


---

Consultations: @ me <br>
I respond only on Mondays, Wednesdays and Fridays mornings
<grid drag="100 6" drop="bottom" bg="#00466e" style="font-size:30px">
######  Graphs, graph algorithms and optimalization - Basics 2, Ján Pastorek, <a style="color: white">jan.pastorek@fmph.uniba.sk</a>
<!-- element style="font-weight:300; color: white" -->
</grid>


---

Link for exercises repo <br>
https://shorturl.at/msSV8 <br>
[JanPastorek/1-AIN-413-22-Graphs (github.com)](https://github.com/JanPastorek/1-AIN-413-22-Graphs)
<grid drag="100 6" drop="bottom" bg="#00466e" style="font-size:30px">
######  Graphs, graph algorithms and optimalization - Basics 2, Ján Pastorek, <a style="color: white">jan.pastorek@fmph.uniba.sk</a>
<!-- element style="font-weight:300; color: white" -->
</grid>


---

50 points 
There will be paper and coding home projects, max. 5 altogether.
Home projects ≠ coding exercises

---

**Degree distribution, degree sequence**
![[cbc29ec29027a257ea925ed93af72f96_MD5.png]]


---

> [!math|{"type":"definition","number":"auto","setAsNoteMathLink":false,"title":"simple families of graphs","label":"simple-families-of-graphs","_index":0}] Definition 1 (simple families of graphs).
> - ${} n-path {}$ graph
> - ${} n-cycle {}$ graph, corresponding to group ${} D_{n} {}$ 
> - ${} k-regular {}$ graph, each vertex has ${} k {}$ degree
> - ${} k-complete {}$ graph
> - ${} n-hypercube$ , ${} Q_{n} {}$ is the simple graph having vertex set ${} V(Q_{n}) = \{length {}$  $n {}$   ${} bit {}$ ${} strings\} {}$, and having an edge between vertices *iff* bit strings differ exactly in one bit. 
> ![[Pasted image 20230912110735.png]]


---
Are these sequences **graphical**? Prove. (Hint: Havel-Hakimi alg. & Handshake theorem & logic)
1. ${} \{2,2,2,1,1\} {}$
2. ${} \{2,2\} {}$
3. ${} \{2,2,2,2\} {}$
4. ${} \{ 3,3,5,1,7,9,1\} {}$
5. ${} \{3,3,3,3,3,3,3,3\} {}$
6. ${} \{ 6,5,5,4,3,3,3,2,2 \} {}$
7. ${} \{ 3,3,2,2,1,1 \} {}$
8. ${} \{ 7,6,4,3,3,2 \} {}$
9. ${} \{ 3,3,1,1 \} {}$
10. ${} \{ 5,4,3,3,2,2,2,1,1,1 \} {}$

---

**Eccentricity of vertex, diameter, radius, central vertex, connectivity**

- The **eccentricity of vertex** 𝑣 is the **distance from 𝑣 to farthest vertex** 
- The **radius** of a graph 𝐺 is the **minimum of all vertex eccentricities** 
- The **central vertex** the graph 𝐺 is a vertex with a **minimal eccentricity**
![[Pasted image 20230926095539.png]]

---
![[cbc1045ebe8ec33c75cc5e51d495da83_MD5.png|300]]

---

![[fdff2650d6cd428e9124d7696ddf11a5_MD5.png|300]]

---

![[0e6f5c10beba0a563f6960b3f6b76af8_MD5.png|300]]


---

**Vertex cut, edge cut**
![[Pasted image 20230926095539.png]]

---

![[cbc29ec29027a257ea925ed93af72f96_MD5.png]]




---

**Bipartite networks and projections**
![[374fe2adef6b0f70d9910441e5a8feba_MD5.png]]