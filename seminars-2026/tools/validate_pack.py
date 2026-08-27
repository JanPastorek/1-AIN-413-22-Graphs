"""Validate local links, Markdown tables, Python syntax, data, and file boundary."""

import ast
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from labs.graph_io import validate_graph


def main():
    errors = []
    files = [p for p in ROOT.rglob("*") if p.is_file() and "__pycache__" not in p.parts]
    forbidden = ("answer_key", "exit_tickets", "private_instances", "reference_algorithms", "INSTRUCTOR")
    for path in files:
        rel = str(path.relative_to(ROOT))
        if any(word.lower() in rel.lower() for word in forbidden):
            errors.append(f"Instructor-only filename: {rel}")
        if path.suffix == ".py":
            try:
                ast.parse(path.read_text(encoding="utf-8"), filename=rel)
            except SyntaxError as error:
                errors.append(f"Syntax: {rel}: {error}")
        if path.suffix != ".md":
            continue
        content = path.read_text(encoding="utf-8")
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", content):
            if target.startswith(("https://", "http://", "mailto:", "#")):
                continue
            dest = (path.parent / target.split("#", 1)[0]).resolve()
            if not dest.is_relative_to(ROOT) or not dest.exists():
                errors.append(f"Broken or outside-pack link: {rel}: {target}")
        width = None
        in_code = False
        for number, line in enumerate(content.splitlines(), 1):
            if line.startswith(chr(96) * 3):
                in_code = not in_code
            if in_code or not line.startswith("|"):
                width = None
                continue
            count = len(re.findall(r"(?<!\\)\|", line))
            if width is not None and count != width:
                errors.append(f"Table columns: {rel}:{number}")
            width = count
        if in_code:
            errors.append(f"Unclosed code fence: {rel}")
    with (ROOT / "data" / "studio_graphs.json").open(encoding="utf-8") as handle:
        data = json.load(handle)
    expected = {"bfs": (6, 6), "fiber": (6, 9), "transit": (5, 7), "flow": (4, 5), "placements": (6, 5), "sensor": (6, 6), "coloring": (5, 5)}
    for name, graph in data.items():
        validate_graph(graph)
        if (len(graph["vertices"]), len(graph["edges"])) != expected[name]:
            errors.append(f"Catalog counts differ: {name}")
    weeks = list((ROOT / "weeks").glob("*.md"))
    if len(weeks) != 12:
        errors.append(f"Expected 12 weekly sheets, found {len(weeks)}")
    for path in weeks:
        content = path.read_text(encoding="utf-8")
        if not all(f"## {level} —" in content for level in "ABC"):
            errors.append(f"Missing A/B/C section: {path.name}")
    for error in errors:
        print(error)
    if errors:
        return 1
    print(f"PASS: {len(files)} files; 12 weekly sheets; 7 datasets; local links, tables, syntax")
    print("Boundary scan passed; human review still required. Remote URLs are not tested here.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
