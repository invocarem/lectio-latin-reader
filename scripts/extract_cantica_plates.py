#!/usr/bin/env python3
"""Map PL 183 columns onto Cantica paragraphs and render Study plates.

Usage:
    python scripts/extract_cantica_plates.py columns   # write columns.json
    python scripts/extract_cantica_plates.py plates    # render public/facsimiles/songs/
    python scripts/extract_cantica_plates.py           # both

The scan is tmp/ingest/pl183.pdf (Archive.org patrologiaecur183mign).
Page 397 is cols. 785–786; page 603 is cols. 1197–1198.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "tmp/ingest"
PL_TXT = CACHE / "cantica-pl.txt"
PL_PDF = CACHE / "pl183.pdf"
COLUMNS_OUT = ROOT / "src/content/cantica/columns.json"
PLATES_DIR = ROOT / "public/facsimiles/songs"

HEAD = re.compile(r"SERMO(?:N)?\s+([IVXLC]+)\.?")
MARKER = re.compile(r"\b0*(\d{3,4})[A-Da-d]\b")
ARABIC = {
    r: n
    for n, r in enumerate(
        [
            "",
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
            "XII",
            "XIII",
            "XIV",
            "XV",
            "XVI",
            "XVII",
            "XVIII",
            "XIX",
            "XX",
            "XXI",
            "XXII",
            "XXIII",
            "XXIV",
            "XXV",
            "XXVI",
            "XXVII",
            "XXVIII",
            "XXIX",
            "XXX",
            "XXXI",
            "XXXII",
            "XXXIII",
            "XXXIV",
            "XXXV",
            "XXXVI",
            "XXXVII",
            "XXXVIII",
            "XXXIX",
            "XL",
            "XLI",
            "XLII",
            "XLIII",
            "XLIV",
            "XLV",
            "XLVI",
            "XLVII",
            "XLVIII",
            "XLIX",
            "L",
            "LI",
            "LII",
            "LIII",
            "LIV",
            "LV",
            "LVI",
            "LVII",
            "LVIII",
            "LIX",
            "LX",
            "LXI",
            "LXII",
            "LXIII",
            "LXIV",
            "LXV",
            "LXVI",
            "LXVII",
            "LXVIII",
            "LXIX",
            "LXX",
            "LXXI",
            "LXXII",
            "LXXIII",
            "LXXIV",
            "LXXV",
            "LXXVI",
            "LXXVII",
            "LXXVIII",
            "LXXIX",
            "LXXX",
            "LXXXI",
            "LXXXII",
            "LXXXIII",
            "LXXXIV",
            "LXXXV",
            "LXXXVI",
        ]
    )
    if n
}

FIRST_PAGE = 397  # 1-based PDF page for cols. 785–786
FIRST_COL = 785
LAST_COL = 1198


def plate_name(column: int) -> str:
    lo = column - 1 if column % 2 == 0 else column
    return f"songs/pl-{lo}-{lo + 1}.png"


def parse_columns(raw: str) -> dict[str, dict[str, int]]:
    hits: list[tuple[int, int, int]] = []
    seen: set[int] = set()
    for match in HEAD.finditer(raw):
        n = ARABIC.get(match.group(1))
        if not n or n in seen:
            continue
        seen.add(n)
        hits.append((n, match.start(), match.end()))
    hits.sort(key=lambda item: item[1])
    missing = [i for i in range(1, 87) if i not in seen]
    if missing:
        raise SystemExit(f"PL text missing sermons: {missing}")

    last = FIRST_COL
    out: dict[str, dict[str, int]] = {}
    for idx, (n, _start, end) in enumerate(hits):
        body_end = hits[idx + 1][1] if idx + 1 < len(hits) else len(raw)
        body = raw[end:body_end]
        parts = re.split(r"(?:(?<=\s)|^)(\d{1,2})\.\s+(?=[A-Z])", body)
        title = parts[0] if parts else ""
        title_m = MARKER.search(title) or MARKER.search(body[:400])
        title_col = int(title_m.group(1)) if title_m else last
        last = title_col
        row: dict[str, int] = {"title": title_col}
        toks = parts[1:]
        for i in range(0, len(toks) - 1, 2):
            para_n = toks[i]
            para = toks[i + 1]
            found = MARKER.search(para)
            if found:
                last = int(found.group(1))
            row[para_n] = last
        out[str(n)] = row
    return out


def write_columns() -> dict[str, dict[str, int]]:
    raw = PL_TXT.read_text(encoding="utf-8", errors="replace")
    data = parse_columns(raw)
    COLUMNS_OUT.write_text(
        json.dumps(
            {
                "source": "Migne PL 183 column stamps (0785A …) in tmp/ingest/cantica-pl.txt. "
                "Each value is the first column on which that block begins.",
                "chapters": data,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {COLUMNS_OUT} ({len(data)} sermons)")
    return data


def render_plates() -> None:
    import pymupdf
    from PIL import Image

    if not PL_PDF.exists():
        raise SystemExit(f"Missing {PL_PDF}. Download patrologiaecur183mign.pdf there.")
    PLATES_DIR.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(PL_PDF)
    zoom = 150 / 72
    matrix = pymupdf.Matrix(zoom, zoom)
    written = 0
    for i, col in enumerate(range(FIRST_COL, LAST_COL + 1, 2)):
        page_no = FIRST_PAGE + i
        if page_no < 1 or page_no > doc.page_count:
            raise SystemExit(f"PDF has no page {page_no} for cols {col}-{col + 1}")
        page = doc[page_no - 1]
        pix = page.get_pixmap(matrix=matrix, colorspace=pymupdf.csGRAY, alpha=False)
        im = Image.frombytes("L", (pix.width, pix.height), pix.samples)
        dest = PLATES_DIR / f"pl-{col}-{col + 1}.png"
        im.save(dest, format="PNG", optimize=True, compress_level=9)
        written += 1
        if written % 20 == 0 or written == 1:
            print(f"  {written}: {dest.name} ({dest.stat().st_size // 1024} KB)")
    print(f"wrote {written} plates -> {PLATES_DIR}")


def main() -> None:
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in {"all", "columns"}:
        write_columns()
    if which in {"all", "plates"}:
        render_plates()


if __name__ == "__main__":
    main()
