#!/usr/bin/env python3
"""Validate tracked repository governance files and local Markdown references."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = [
    "AGENTS.md",
    "repository-rules/README.md",
    *[f"repository-rules/{n}" for n in (
        "01-ROADMAP.md",
        "02-UI-UX-ANTI-SLOP.md",
        "03-ARCHITECTURE-CODE.md",
        "04-ATTRIBUTION-DATA.md",
        "05-SECURITY-PRIVACY.md",
        "06-TESTING-RELEASE.md",
        "07-GIT-AND-AGENT-WORKFLOW.md",
        "08-DECISIONS.md",
    )],
    ".github/pull_request_template.md",
]
failures = []
for rel in REQUIRED:
    file = ROOT / rel
    if not file.is_file() or not file.read_text(encoding="utf-8").strip():
        failures.append(f"missing or empty: {rel}")

for rel in REQUIRED:
    file = ROOT / rel
    if not file.is_file() or file.suffix.lower() != ".md":
        continue
    data = file.read_text(encoding="utf-8")
    # Check relative local links in Markdown, excluding URL schemes and anchors.
    for target in re.findall(r"(?<!!)\[[^\]]+\]\(([^)]+)\)", data):
        path = target.split("#", 1)[0]
        if not path or path.startswith(("http:", "https:", "mailto:", "/")):
            continue
        path = path.replace("%20", " ")
        if not (file.parent / path).exists():
            failures.append(f"broken link in {rel}: {target}")

if failures:
    for f in failures:
        print("ERROR:", f, file=sys.stderr)
    sys.exit(1)
print(f"PASS: {len(REQUIRED)} required governance files and local links verified")
