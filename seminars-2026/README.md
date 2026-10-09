# Graphs, Graph Algorithms, and Optimization — seminar studios

**Status: proposed teaching pack for review, not a change to the currently published course regulations.** The original course files and root README are retained. Adopt this pack only after confirming the timetable and assessment with the lecturer.

Twelve 90-minute seminars; definitions and main algorithms are introduced in the accompanying lectures. No graded take-home project is required by this proposed **50-point seminar component**. The lecturer's separate 150-point coursework and examination rules are unchanged.

## How seminars work

Come with paper and, when available, a laptop. First predict or attempt a problem individually; then work in pairs, explain your reasoning, test a counterexample, and adapt to a changed input. Most meetings finish with a short individual check. A polished program or a database screenshot is not sufficient evidence of understanding.

Each sheet has **A: Foundation** (ungraded preparation), **B: Core Studio** (the main in-class work), and **C: Challenge** (optional depth). Core work never depends on completing C. Pair roles rotate: explain, question, operate the computer, and check the evidence.

## Course map

| Week | Studio | Mathematical anchor |
|---:|---|---|
| 1 | [Network detective](weeks/01-modeling.md) | Models, BFS layers, invariants |
| 2 | [Same degrees, different networks](weeks/02-degrees.md) | Handshaking, Havel–Hakimi, non-uniqueness |
| 3 | [Graph forensics](weeks/03-isomorphism.md) | Isomorphism, invariants, automorphisms |
| 4 | [Campus fiber auction](weeks/04-mst.md) | Cut property and exchange proof |
| 5 | [Transit control room](weeks/05-shortest-paths.md) | Relaxation, settling invariant, negative weights |
| 6 | [Snowplough versus courier](weeks/06-routing.md) | Euler trails versus Hamilton cycles |
| 7 | [Evacuation control](weeks/07-flows.md) | Residual edges and max-flow/min-cut |
| 8 | [Placement office](weeks/08-matching.md) | Augmenting paths and matching/cover certificates |
| 9 | [Circuit-board inspectors](weeks/09-planarity-coloring.md) | Euler's formula, obstructions, six-color induction |
| 10 | [Network forecast](weeks/10-random-graphs.md) | Indicator variables and empirical evidence |
| 11 | [Sensor budget](weeks/11-domination.md) | Bounds, domination, integer programming |
| 12 | [Graphathon](weeks/12-graphathon.md) | Model, justify, test, adapt |

The [small-data trap](practice/small-data-trap.md) is a complete alternative coloring studio, not an additional required session. The [challenge menu](practice/challenges.md) adds radius/diameter, Brooks, Mantel, and symmetry explorations.

The [Graph Studio Lab](lab/index.html) is an optional in-browser companion: for every studio it opens with a motivating real-world problem, gives animated definitions, steps through the algorithms with pseudocode and networkx code, and offers prediction, certificate-checking and exit-ticket modes. The [lab and database explorations](practice/lab-and-database-explorations.md) are matching exercises, each session starting with its motivating problem. See the [lab README](lab/README.md).

## Start here

- [Assessment and AI-use policy](syllabus/assessment-and-ai.md)
- [Proof patterns and answer template](syllabus/reasoning-guide.md)
- [Terminology and algorithm assumptions](syllabus/glossary.md)
- [Platform guide and evidence card](syllabus/platforms.md)
- [Rubrics](rubrics/README.md)
- [Python setup](environment/README.md) and [graph data catalog](data/README.md)
- [Graph Studio Lab](lab/README.md) and [lab and database explorations](practice/lab-and-database-explorations.md)
- [Live-practical format](assessed-live/README.md)
- [Implementation status and adoption checklist](IMPLEMENTATION.md)
- [Teaching sources and reuse notes](SOURCES.md)

From this folder, run:

```bash
python3 -m unittest discover -s tests -v
python3 tools/validate_pack.py
python3 -m labs.inspect_graph transit
python3 -m labs.feedback
```

The infrastructure tests pass before students implement anything. `labs/student_algorithms.py` deliberately contains three unfinished functions; `labs.feedback` reports them as **NOT IMPLEMENTED**, not as successful solutions. Complete them during the relevant studio. There are no third-party Python dependencies.

## Release boundary

This directory contains public practice and teaching instructions only. Instructor solutions, unseen exit tickets, practical instances, reveal cards, and marking keys are supplied separately to the teacher. A branch in a public repository is **not** private. Do not commit the instructor pack here.

The folder is self-contained and can be copied to a clean student repository after review; copying the entire historical repository would also copy the old public solutions. No existing repository has been archived, deleted, or relicensed.
