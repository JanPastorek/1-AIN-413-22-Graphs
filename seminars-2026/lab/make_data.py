"""Regenerate src/data.js from the course repository's data folders.

Run from seminars-2026/lab:  python3 make_data.py
"""
import csv, gzip, json
from collections import defaultdict
from pathlib import Path

LAB = Path(__file__).resolve().parent
PACK = LAB.parent            # seminars-2026
REPO = PACK.parent           # repository root

studio = json.loads((PACK / "data" / "studio_graphs.json").read_text(encoding="utf-8"))
names = {"bfs": "Studio 1: BFS sketch", "fiber": "Studio 4: campus fiber bids", "transit": "Studio 5: transit network",
         "flow": "Studio 7: evacuation network", "placements": "Studio 8: placements", "sensor": "Studio 11: sensor ring C₆",
         "coloring": "Studio 9: odd cycle C₅"}
P = {}
for key, name in names.items():
    s = studio[key]
    weighted = any(e[2] != 1 for e in s["edges"])
    lines = (["directed"] if s["directed"] else []) + s["vertices"] + [f"{a} {b} {c}" if weighted else f"{a} {b}" for a, b, c in s["edges"]]
    P["studio_" + key] = {"name": name, "text": "\n".join(lines), "group": "From the course repo"}

karate = [l.split() for l in (REPO / "data" / "karate_elist.txt").read_text().splitlines() if l.strip()]
P["karate"] = {"name": "Zachary karate club (34)", "text": "\n".join(" ".join(e) for e in karate), "group": "From the course repo"}

rows = list(csv.DictReader((REPO / "data" / "Vienna_subway.csv").open(encoding="utf-8"), delimiter=";"))
P["vienna"] = {"name": "Vienna U-Bahn 2019 (98 stations)", "text": "\n".join(f"{r['Start']} ; {r['Stop']}" for r in rows), "group": "From the course repo"}
lines_at = defaultdict(set)
for r in rows:
    lines_at[r["Start"]].add(r["Line"]); lines_at[r["Stop"]].add(r["Line"])
inter = {s for s in lines_at if len(lines_at[s]) > 1}
nm = lambda s, l: f"{s} U{l}" if s in inter else s
out = [f"{nm(r['Start'], r['Line'])} ; {nm(r['Stop'], r['Line'])} ; 2" for r in rows]
for s in sorted(inter):
    for l in sorted(lines_at[s]):
        out.append(f"{s} ; {s} U{l} ; 2")
P["vienna_t"] = {"name": "Vienna U-Bahn with transfer times", "text": "\n".join(out), "group": "From the course repo"}

stats = []
for r in csv.DictReader((REPO / "data" / "summary_statistics.csv").open(encoding="utf-8")):
    if r["Name"] == "IMDB movies and actors":
        continue
    stats.append({"name": r["Name"], "type": r["Type"], "n": int(r["Nodes"]), "m": int(r["Links"]), "k": float(r["Average Degree"]),
                  "C": float(r["Clustering"]), "p": float(r["Density"]), "L": float(r["Average Path Length"])})

edges = [l.split()[:2] for l in gzip.open(REPO / "data" / "openflights" / "openflights_usa.edges.gz", "rt") if l.strip()]
air = "|".join(f"{a} {b}" for a, b in edges)

(LAB / "src" / "data.js").write_text("const REPO_PRESETS = " + json.dumps(P, ensure_ascii=False) + ";\nconst NETSTATS = " + json.dumps(stats)
                                     + ";\nconst AIRPORTS = " + json.dumps(air) + ";\n", encoding="utf-8")
print(f"wrote src/data.js: {len(P)} graphs, {len(stats)} network summaries, {len(edges)} airport routes")
