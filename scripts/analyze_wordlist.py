#!/usr/bin/env python3
"""Run Whitaker over a work's forms.json.

Intended to run inside the whitaker Docker image, where the Words binary exists:

    bash scripts/analyze-in-docker.sh             # full list
    bash scripts/analyze-in-docker.sh --limit 20  # smoke test
    bash scripts/analyze-in-docker.sh --work canticum
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess

from _works import DEFAULT_WORK, lexicon_dir

WHITAKER_BIN = os.environ.get("WHITAKER_BIN", "/opt/whitakers-words/bin/words")
WHITAKER_DIR = os.environ.get("WHITAKER_DIR", "/opt/whitakers-words")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work", default=DEFAULT_WORK, help=f"work id (default: {DEFAULT_WORK})")
    parser.add_argument("--limit", type=int, help="analyze only the first N forms")
    return parser.parse_args(argv)


def call_whitaker(word: str) -> str:
    if not os.path.isfile(WHITAKER_BIN):
        raise SystemExit(
            f"Whitaker not found at {WHITAKER_BIN}. "
            "Run this script inside the Whitaker Docker image."
        )
    proc = subprocess.run(
        [WHITAKER_BIN, word],
        capture_output=True,
        text=True,
        timeout=30,
        cwd=WHITAKER_DIR,
    )
    if proc.returncode != 0:
        return f"Error: {proc.stderr.strip() or proc.returncode}"
    return proc.stdout


def analyze_one(entry: dict) -> dict:
    raw = call_whitaker(entry["query"])
    return {
        **entry,
        "raw": raw.strip(),
        "ok": not raw.startswith("Error:"),
    }


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    LEXICON = lexicon_dir(args.work)

    forms = LEXICON / "forms.json"
    out = LEXICON / "analyses.json"
    if not forms.is_file():
        raise SystemExit(f"Missing {forms.relative_to(LEXICON.parents[1])}. Run scripts/extract_wordlist.py first.")

    data = json.loads(forms.read_text(encoding="utf-8"))
    word_forms = data["forms"]
    limit = args.limit if args.limit is not None else len(word_forms)
    selected = word_forms[:limit]
    analyses = []
    for index, entry in enumerate(selected, start=1):
        analyses.append(analyze_one(entry))
        if index % 50 == 0 or index == len(selected):
            print(f"{index}/{len(selected)} {entry['form']}", flush=True)
    payload = {
        "source": data["source"],
        "engine": "whitakers-words",
        "form_count": len(analyses),
        "misses": sum(1 for item in analyses if not item["ok"]),
        "analyses": analyses,
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out.relative_to(LEXICON.parents[1])} ({payload['misses']} misses)")


if __name__ == "__main__":
    main()
