#!/usr/bin/env python3
"""Merge curated gloss overrides into a work's lexicon.json.

Re-running is idempotent: any existing `edited` field is first removed.

Usage:
    python scripts/apply_overrides.py
    python scripts/apply_overrides.py --work canticum
"""

from __future__ import annotations

import argparse
import json
import sys

from _works import DEFAULT_WORK, lexicon_dir


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work", default=DEFAULT_WORK, help=f"work id (default: {DEFAULT_WORK})")
    args = parser.parse_args()

    LEXDIR = lexicon_dir(args.work)
    lex = json.loads((LEXDIR / "lexicon.json").read_text(encoding="utf-8"))
    overrides_path = LEXDIR / "overrides.json"
    overrides = json.loads(overrides_path.read_text(encoding="utf-8"))["entries"]

    entries = lex["entries"]
    by_key = {e["key"]: e for e in entries}

    missing = sorted(k for k in overrides if k not in by_key)
    applied = 0
    for e in entries:
        e.pop("edited", None)
        e.pop("curated", None)
        card = overrides.get(e["key"])
        if card:
            e["edited"] = dict(card)
            e["curated"] = True
            applied += 1

    lex["curated_count"] = applied
    (LEXDIR / "lexicon.json").write_text(
        json.dumps(lex, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"lexicon.json: {len(entries)} entries, {applied} curated")
    if missing:
        print(f"WARN: override keys with no lexicon entry ({len(missing)}): {missing}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
