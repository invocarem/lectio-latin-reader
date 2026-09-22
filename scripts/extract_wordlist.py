#!/usr/bin/env python3
"""Build a unique-form word list for a work's lexicon. No morphology.

Works whose Latin lives in a JSON `latin-units.json` ("units") and works whose
Latin lives in a `latin.md` book ("md") are both supported; only the reading
step differs.

Usage:
    python scripts/extract_wordlist.py [--work canticum]
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# work id -> (source kind, source file, lexicon dir)
WORKS = {
    "gradibus": ("units", "src/content/gradibus/latin-units.json", "src/content/gradibus/lexicon"),
    "psalter": ("md", "src/content/psalter/latin.md", "src/content/psalter/lexicon"),
    "rule": ("md", "src/content/rule/latin.md", "src/content/rule/lexicon"),
    "confessions": ("md", "src/content/confessions/latin.md", "src/content/confessions/lexicon"),
    "cantica": ("md", "src/content/cantica/latin.md", "src/content/cantica/lexicon"),
    "canticum": ("md", "src/content/canticum/latin.md", "src/content/canticum/lexicon"),
}

DEFAULT_WORK = "gradibus"
OUT_FILE = "forms.json"

CITATION = re.compile(
    r"\("
    r"(?:"
    r"(?:cap\.|n\.|Reg\.|Ibid\.|id\.|cf\.)|"
    r"(?:(?:[IVX]+|[123])\s+)?"
    r"(?:"
    r"Marc|Luc|Ioan|Joan|Matth|Reg|Gen|Eccli|Hebr|Philipp?|Petr|Cor|Rom|"
    r"Coloss|Isai?|Psal|Galat|Ierem|Jerem|Act|Iob|Job|Cantic|num|cap"
    r")\.?"
    r")"
    r"[^)]*"
    r"\)",
    re.IGNORECASE,
)
TOKEN = re.compile(r"[A-Za-z]+")
HEADING = re.compile(r"^#{1,6}\s+(.*)$")
VERSE_PREFIX = re.compile(r"^\s*\d+\s*\.\s*")
STEM_FIXES = (("charit", "carit"),)

# Inline explanatory titles inside a book (e.g. cantica sermon titles in italics).
PROSE_TITLE = re.compile(r"^\s*\*.*\*\s*$")


def normalize_query(form: str) -> str:
    query = form.lower().replace("j", "i").replace("v", "u")
    for old, new in STEM_FIXES:
        if query.startswith(old):
            query = new + query[len(old):]
    return query


def _chapter_number(heading: str) -> str | None:
    """Pull the trailing chapter/section number out of a `## Caput 3` heading."""
    m = re.search(r"(\d+)\s*$", heading.strip())
    return m.group(1) if m else None


def tokenize_one(line: str, chapter: str | None) -> list[tuple[str, str, str, str]]:
    """Return (key, printed form, chapter, ...) tuples for one line of text."""
    line = CITATION.sub(" ", line)
    out = []
    for token in TOKEN.findall(line):
        key = token.lower()
        if len(key) == 1 and key not in {"a", "e", "o"}:
            continue
        out.append((key, token, chapter, None))
    return out


def extract_from_units(source: Path, data: list[dict]) -> dict:
    counts: Counter[str] = Counter()
    printed: dict[str, str] = {}
    first_n: dict[str, str] = {}

    for unit in data:
        current = unit.get("id") or ""
        line = CITATION.sub(" ", unit.get("latin") or "")
        for token in TOKEN.findall(line):
            key = token.lower()
            if len(key) == 1 and key not in {"a", "e", "o"}:
                continue
            counts[key] += 1
            printed.setdefault(key, token)
            first_n.setdefault(key, current)
    return _finish(counts, printed, first_n, source)


def extract_from_md(source: Path, text: str) -> dict:
    counts: Counter[str] = Counter()
    printed: dict[str, str] = {}
    first_n: dict[str, str] = {}
    chapter: str | None = None

    for raw in text.splitlines():
        s = raw.strip()
        if not s or s == "---" or PROSE_TITLE.match(s):
            continue
        m = HEADING.match(s)
        if m:
            chapter = _chapter_number(m.group(1))
            continue
        s = VERSE_PREFIX.sub("", s)
        s = CITATION.sub(" ", s)
        for token in TOKEN.findall(s):
            key = token.lower()
            if len(key) == 1 and key not in {"a", "e", "o"}:
                continue
            counts[key] += 1
            printed.setdefault(key, token)
            first_n.setdefault(key, chapter)
    return _finish(counts, printed, first_n, source)


def _finish(counts: Counter, printed: dict, first_n: dict, source: Path) -> dict:
    forms = []
    for key, count in counts.most_common():
        form = printed[key]
        forms.append(
            {
                "form": form,
                "key": key,
                "query": normalize_query(form),
                "count": count,
                "first": first_n.get(key),
            }
        )
    return {
        "source": str(source.relative_to(ROOT)).replace("\\", "/"),
        "form_count": len(forms),
        "token_count": sum(counts.values()),
        "forms": forms,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work", default=DEFAULT_WORK, help=f"work id (default: {DEFAULT_WORK})")
    args = parser.parse_args()

    if args.work not in WORKS:
        raise SystemExit(f"Unknown work {args.work!r}. Known: {', '.join(sorted(WORKS))}")
    kind, src_rel, lex_rel = WORKS[args.work]
    source = ROOT / src_rel
    lexdir = ROOT / lex_rel

    if not source.is_file():
        raise SystemExit(f"Missing {source.relative_to(ROOT)}")

    if kind == "units":
        data = extract_from_units(source, json.loads(source.read_text(encoding="utf-8")))
    else:
        data = extract_from_md(source, source.read_text(encoding="utf-8"))

    lexdir.mkdir(parents=True, exist_ok=True)
    out = lexdir / OUT_FILE
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out.relative_to(ROOT)} ({data['form_count']} forms, {data['token_count']} tokens)")


if __name__ == "__main__":
    main()
