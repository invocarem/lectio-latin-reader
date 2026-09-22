#!/usr/bin/env python3
"""Shared per-work wiring for the lexicon pipeline.

Each work maps to (source kind, source file, lexicon directory). The tools in
this folder accept `--work` and look their input/output files up in the work's
lexicon dir, so a fresh work (e.g. canticum) can be built without editing
paths in the scripts.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

WORKS = {
    "gradibus": ("units", "src/content/gradibus/latin-units.json", "src/content/gradibus/lexicon"),
    "psalter": ("md", "src/content/psalter/latin.md", "src/content/psalter/lexicon"),
    "rule": ("md", "src/content/rule/latin.md", "src/content/rule/lexicon"),
    "confessions": ("md", "src/content/confessions/latin.md", "src/content/confessions/lexicon"),
    "cantica": ("md", "src/content/cantica/latin.md", "src/content/cantica/lexicon"),
    "canticum": ("md", "src/content/canticum/latin.md", "src/content/canticum/lexicon"),
}

DEFAULT_WORK = "gradibus"


def lexicon_dir(work: str) -> Path:
    if work not in WORKS:
        raise SystemExit(
            f"Unknown work {work!r}. Known: {', '.join(sorted(WORKS))}"
        )
    return ROOT / WORKS[work][2]
