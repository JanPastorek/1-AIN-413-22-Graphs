# Adoption and implementation status

This folder stages the redesign without altering the current course. It is suitable for a draft pull request and later extraction into a clean student repository. Original PDFs, notebooks, datasets, solutions, and root policies are unchanged.

## Implemented material

- Twelve Foundation/Core/Challenge studio sheets, with the Phase 1 priorities (1, 4, 5, 7, 8, 9) written first.
- Degree-sequence, planarity, and domination pilots; a separate 90-minute small-data discovery lesson.
- Proposed 50-point assessment, three AI zones, proof/algorithm guide, common rubrics, and platform evidence cards.
- Dependency-free graph inputs, validators, public feedback, and student BFS/Dijkstra/coloring scaffolds.
- Separately delivered instructor notes, solutions, ten exit tickets with alternates, two live practicals and keys, clinic rubrics, reveal cards, and private mathematical validation.
- Graphathon with four application tracks and one theory track; optional advanced exploration menu.

## Decisions before adoption

1. Confirm 12 × 90 minutes, lecture prerequisites, class size, and teaching-assistant hours.
2. Approve the proposed **seminar** marking scheme and make-up procedure. Any change to the separate 150-point coursework requires its own lecturer decision; this pack does not implement that change.
3. Choose a clean student repository name and a genuinely private instructor location. A public branch is not a privacy boundary. Copy this folder, not the historical repository with its solutions.
4. Decide licensing with the owner. No license has been imposed on existing material or third-party datasets.
5. Schedule the two practicals and two clinics. They replace ordinary activities rather than increasing contact hours.
6. Recheck platform links and print offline cards. Do not make automatic uploads to graph databases.

## Pilot, not just publish

Run Week 2's degree-sequence clinic, Week 9's planarity clinic, and Week 11's sensor studio first. Record approximate stage times and misconception codes in the instructor pilot log. Then try the small-data-trap lesson. These classroom pilots and outcome collection require real teaching and have **not** been marked complete by preparing files.

Use the same three diagnostic skills across the pilot: repair a false converse; select and justify an algorithm; distinguish feasible output from a certified optimum. Review weak items and accessibility issues before the next offering. Local before/after data helps improvement but does not prove causal effectiveness or equivalence with another university.

## Publication checklist

- [ ] Policies approved and dates announced.
- [ ] Student repository contains no instructor files, future keys, reveals, or assessment instances.
- [ ] Teacher has verified local tests and offline materials.
- [ ] Each assessed student's score has individual evidence.
- [ ] No old public solution has been reused as an unseen assessment.
- [ ] Licensing and dataset provenance decisions recorded.
- [ ] Instructor pack stored with teaching staff only; unseen tickets rotated after release.

## Implementation validation

Validated locally on Python3.12.13: eight infrastructure tests; all local Markdown links and tables; syntax and graph-format checks; and a filename-boundary scan. The teacher-only runner additionally checks120 random shortest-path cases against a Bellman–Ford oracle,256 tiny coloring cases against full enumeration, the worked numeric keys, both private practicals and transfer variants, and Graphathon algorithm-track answers. It also enumerates the two degree-sequence classes and checks the11-vertex coloring reveal.

The three public student functions are intentionally unimplemented. Their smoke-feedback command reports NOT IMPLEMENTED and exits nonzero until students complete them; this is expected, not a passing algorithm test. Static checks and numeric oracles supplement the written proofs and do not certify learning or all possible inputs.
