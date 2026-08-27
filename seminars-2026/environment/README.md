# Reproducible local setup

Required: **Python 3.12**, standard library only. Validated with Python **3.12.13**. No pip installation, network access, API key, notebook server, or commercial solver is needed for the provided labs. Other recent Python versions may work but are not the tested target.

Open a terminal in `seminars-2026`:

```bash
python3 --version
python3 -m unittest discover -s tests -v
python3 tools/validate_pack.py
python3 -m labs.inspect_graph transit
python3 -m labs.feedback
```

Implement the marked functions in `labs/student_algorithms.py` when the task asks you to. The public smoke feedback is ungraded and incomplete; passing it is not proof of correctness. Reference implementations and private assessment tests are not included.

The graph viewer prints adjacency lists and edge data for accessible paper-first work. PHOEG and House of Graphs provide the optional interactive drawings. External graph packages can be used in optional challenges if the teacher permits them; write down their versions and do not confuse an approximate routine with an exact solver.
