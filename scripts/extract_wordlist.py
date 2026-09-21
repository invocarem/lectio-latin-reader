#!/usr/bin/env python3
"""Build a unique-form list from latin-units.json. No morphology.

Usage:
    python scripts/extract_wordlist.py
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/content/gradibus/latin-units.json"
OUT = ROOT / "src/content/gradibus/lexicon/forms.json"

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
STEM_FIXES = (("charit", "carit"),)


def normalize_query(form: str) -> str:
    query = form.lower().replace("j", "i").replace("v", "u")
    for old, new in STEM_FIXES:
        if query.startswith(old):
            query = new + query[len(old) :]
    return query


def extract(units: list[dict]) -> dict:
    counts: Counter[str] = Counter()
    printed: dict[str, str] = {}
    first_n: dict[str, str] = {}

    for unit in units:
        current = unit.get("id") or ""
        line = CITATION.sub(" ", unit.get("latin") or "")
        for token in TOKEN.findall(line):
            key = token.lower()
            if len(key) == 1 and key not in {"a", "e", "o"}:
                continue
            counts[key] += 1
            printed.setdefault(key, token)
            first_n.setdefault(key, current)

    forms = []
    for key, count in counts.most_common():
        form = printed[key]
        forms.append(
            {
                "form": form,
                "key": key,
                "query": normalize_query(form),
                "count": count,
                "first": first_n.get(key) or None,
            }
        )
    return {
        "source": str(SOURCE.relative_to(ROOT)),
        "form_count": len(forms),
        "token_count": sum(counts.values()),
        "forms": forms,
    }


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing {SOURCE.relative_to(ROOT)}")
    units = json.loads(SOURCE.read_text(encoding="utf-8"))
    data = extract(units)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} ({data['form_count']} forms, {data['token_count']} tokens)")


if __name__ == "__main__":
    main()
