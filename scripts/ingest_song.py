#!/usr/bin/env python3
"""Ingest Canticum Canticorum (Vulgate + Douay) and Bernard's Cantica sermons.

Usage:
    python scripts/ingest_song.py              # both works
    python scripts/ingest_song.py canticum
    python scripts/ingest_song.py cantica
"""

from __future__ import annotations

import html
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "tmp/ingest"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

ROMAN = {
    n: r
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
}
ARABIC = {v: k for k, v in ROMAN.items() if k}

EXPECTED_VERSES = {1: 16, 2: 17, 3: 11, 4: 16, 5: 17, 6: 12, 7: 13, 8: 14}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except urllib.error.HTTPError:
        import subprocess

        result = subprocess.run(
            ["curl", "-sL", "-A", UA, url],
            check=True,
            capture_output=True,
        )
        return result.stdout


def fetch_text(url: str) -> str:
    return fetch(url).decode("utf-8", errors="replace")


def normalize_latin(text: str) -> str:
    text = (
        text.replace("æ", "ae")
        .replace("Æ", "Ae")
        .replace("œ", "oe")
        .replace("Œ", "Oe")
        .replace("j", "i")
        .replace("J", "I")
    )
    text = re.sub(r"\(\s*PL\s*183\s*\d+[A-Da-d]\s*\)", " ", text)
    text = re.sub(r"\(\s*\d{4}[A-Da-d]\s*\)", " ", text)
    text = re.sub(r"\b\d{4}[A-Da-d]\b", " ", text)
    text = re.sub(r"\[alias[^\]]*\]", " ", text, flags=re.I)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s+([;:,.?!])", r"\1", text)
    # Restore the psalter/Clementina space-before-colon/semicolon habit lightly
    # by leaving original punctuation as-is after collapsing.
    return text.strip()


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def write_scaffold(path: Path, work: str, chapters: list[dict]) -> None:
    lines = [
        f"// AUTO-GENERATED scaffold from content/{work}/latin.md.",
        "// The Latin here is authoritative in latin.md; do NOT hand-edit these strings.",
        f"// Regenerate: python scripts/ingest_song.py {work}",
        'import { paragraph, type Chapter } from "../schema";',
        "",
        "// Segment translations are re-keyed to this work's TranslationIds and filled by hand.",
        "const tl = (latin: string) => ({ latin, translations: {} as Record<string, string> });",
        "",
        "export const scaffoldChapters: Chapter[] = [",
    ]
    for chapter in chapters:
        number = "undefined" if chapter.get("number") is None else str(chapter["number"])
        lines.append("  {")
        lines.append(f"    id: {ts_string(chapter['id'])},")
        lines.append(f"    number: {number},")
        lines.append(f"    title: {ts_string(chapter['title'])},")
        lines.append(f"    heading: {ts_string(chapter.get('heading') or '')},")
        lines.append("    paragraphs: [")
        for para in chapter["paragraphs"]:
            n = para["n"]
            pid = f"p{n}"
            latin = para["latin"]
            lines.append(f'      paragraph({ts_string(pid)}, {ts_string(n)}, [')
            lines.append(f"        {{ id: {ts_string(pid + '.1')}, ...tl({ts_string(latin)}) }},")
            lines.append("      ]),")
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_latin_md(path: Path, title: str, note: str, chapters: list[dict]) -> None:
    chunks = [f"# {title}", "", f"*{note}*", ""]
    for chapter in chapters:
        chunks.append("---")
        chunks.append("")
        chunks.append(f"## {chapter['md_heading']}")
        chunks.append("")
        if chapter.get("heading"):
            chunks.append(f"*{chapter['heading']}*")
            chunks.append("")
        for para in chapter["paragraphs"]:
            chunks.append(f"{para['n']}. {para['latin']}")
            chunks.append("")
    path.write_text("\n".join(chunks).rstrip() + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Canticum Canticorum
# ---------------------------------------------------------------------------

def parse_vulgate(wikitext: str) -> dict[int, dict[int, str]]:
    chapters: dict[int, dict[int, str]] = {}
    parts = re.split(r"==Caput\s+(\d+)==", wikitext)
    for i in range(1, len(parts), 2):
        cap = int(parts[i])
        body = re.split(r"==", parts[i + 1], maxsplit=1)[0]
        toks = re.split(r"<sup>\s*(\d+)\s*</sup>", body)
        if toks and not re.match(r"^\d+$", (toks[0] or "").strip()):
            toks = toks[1:]
        verses: dict[int, str] = {}
        for j in range(0, len(toks) - 1, 2):
            n = int(toks[j])
            text = re.sub(r"<[^>]+>", "", toks[j + 1])
            verses[n] = normalize_latin(text)
        chapters[cap] = verses
    return chapters


def parse_douay(raw: str) -> dict[int, dict[int, str]]:
    start = raw.find("SOLOMON'S CANTICLE OF CANTICLES")
    if start < 0:
        start = 0
    end = raw.find("*** END OF THE PROJECT GUTENBERG")
    body = raw[start : end if end > 0 else None]
    chapters: dict[int, dict[int, str]] = {}
    current_ch = 0
    current_vs = 0
    buf: list[str] = []
    skip_notes = False

    def flush() -> None:
        if current_ch and current_vs and buf:
            text = re.sub(r"\s+", " ", " ".join(buf)).strip()
            chapters.setdefault(current_ch, {})[current_vs] = text
        buf.clear()

    for line in body.splitlines():
        line = line.strip()
        ch_m = re.match(r"Canticle of Canticles Chapter\s+(\d+)\s*$", line)
        if ch_m:
            flush()
            current_ch = int(ch_m.group(1))
            current_vs = 0
            skip_notes = False
            continue
        vs_m = re.match(r"(\d+):(\d+)\.\s+(.*)$", line)
        if vs_m:
            flush()
            current_ch = int(vs_m.group(1))
            current_vs = int(vs_m.group(2))
            skip_notes = False
            rest = vs_m.group(3).strip()
            buf = [rest] if rest else []
            continue
        if skip_notes or not current_vs:
            continue
        if "..." in line:
            skip_notes = True
            continue
        if line:
            buf.append(line)
    flush()
    return chapters


def ingest_canticum() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    wiki_path = CACHE / "canticum.json"
    douay_path = CACHE / "douay.txt"
    if not wiki_path.exists():
        wiki_path.write_bytes(
            fetch(
                "https://la.wikisource.org/w/api.php?action=query"
                "&titles=Vulgata_Clementina/Canticum_Canticorum"
                "&prop=revisions&rvprop=content&format=json&formatversion=2"
            )
        )
    if not douay_path.exists():
        douay_path.write_bytes(
            fetch("https://www.gutenberg.org/cache/epub/8324/pg8324.txt")
        )

    wiki = json.loads(wiki_path.read_text(encoding="utf-8"))
    wikitext = wiki["query"]["pages"][0]["revisions"][0]["content"]
    latin = parse_vulgate(wikitext)
    english = parse_douay(douay_path.read_text(encoding="utf-8"))

    print("Canticum verse counts:")
    chapters = []
    douay_out: dict[str, dict[str, str]] = {}
    for cap in range(1, 9):
        verses = latin.get(cap, {})
        eng = english.get(cap, {})
        expected = EXPECTED_VERSES[cap]
        latin_n = sorted(verses)
        eng_n = sorted(eng)
        print(f"  cap {cap}: latin {len(latin_n)} english {len(eng_n)} expected {expected}")
        if latin_n != list(range(1, expected + 1)):
            raise SystemExit(f"Canticum Latin verses unexpected in cap {cap}: {latin_n}")
        missing = [n for n in latin_n if not eng.get(n)]
        if missing:
            print(f"    missing Douay: {missing}")
        paragraphs = [{"n": str(n), "latin": verses[n]} for n in latin_n]
        chapters.append(
            {
                "id": f"canticum:{cap}",
                "number": cap,
                "title": f"Caput {cap}",
                "md_heading": f"Caput {cap}",
                "heading": "",
                "paragraphs": paragraphs,
            }
        )
        douay_out[str(cap)] = {str(n): eng.get(n, "") for n in latin_n}

    dest = ROOT / "src/content/canticum"
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "renderings").mkdir(exist_ok=True)
    write_latin_md(
        dest / "latin.md",
        "Canticum Canticorum (Vulgata Clementina)",
        "App working text: Vulgata Clementina, Canticum Canticorum, per la.wikisource.org "
        "(Vulgata Clementina / The Clementine Vulgate Project, public domain); ae/oe ligatures "
        "written ae/oe, and consonantal i written i not j (ejus→eius, Jerusalem→Ierusalem). "
        "For the study reader only; the app never edits this file.",
        chapters,
    )
    write_scaffold(dest / "scaffold.ts", "canticum", chapters)
    (dest / "renderings/douay.json").write_text(
        json.dumps(
            {
                "source": "Douay-Rheims, Challoner revision (1749–52). Public domain. "
                "Text from Project Gutenberg #8324 (Canticle of Canticles). Verse numbers "
                "follow the Clementine Vulgate index in latin.md; Challoner notes are omitted.",
                "chapters": douay_out,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print("Wrote src/content/canticum/")


# ---------------------------------------------------------------------------
# Sermones in Cantica Canticorum
# ---------------------------------------------------------------------------

def strip_tags(blob: str) -> str:
    blob = re.sub(r"<br\s*/?>", " ", blob, flags=re.I)
    blob = re.sub(r"</p>", "\n", blob, flags=re.I)
    blob = re.sub(r"<[^>]+>", " ", blob)
    return html.unescape(blob)


def parse_sermo_html(html_text: str) -> tuple[str, dict[int, str]]:
    """Return (latin subtitle, {n: paragraph})."""
    # Prefer the work body, not the navigation chrome.
    m = re.search(r'<div class="text">(.*)', html_text, re.S)
    body = m.group(1) if m else html_text
    paras = re.findall(r"<p\b[^>]*>(.*?)</p>", body, flags=re.S | re.I)
    title = ""
    numbered: dict[int, str] = {}
    for raw in paras:
        text = normalize_latin(strip_tags(raw))
        if not text:
            continue
        if re.search(r"↑", raw) or re.match(r"^\d+\.\s*↑", text):
            continue
        title_m = re.match(r"SERMO\s+[IVXLC]+\.\s*(.*)$", text, re.I)
        if title_m and not numbered:
            title = title_m.group(1).strip(" .")
            continue
        num_m = re.match(r"^(\d+)\.\s+(.*)$", text, re.S)
        if num_m:
            n = int(num_m.group(1))
            numbered[n] = num_m.group(2).strip()
    return title, numbered


def clean_pl_text(text: str) -> str:
    text = text.replace("\x0c", " ")
    text = re.sub(r"\ufffd(.*?)\ufffd", r"«\1»", text)
    text = text.replace("\ufffd", "")
    text = re.sub(r"\b\d+/\d+\b", " ", text)
    text = re.sub(r"\b(?:12|13|14|15)\d{2}\b", " ", text)
    text = re.sub(r"-\s*\n\s*", "", text)
    text = re.sub(r"\s+", " ", text)
    return normalize_latin(text)


def parse_pl_pdf(raw: str) -> list[tuple[int, str, dict[int, str]]]:
    head = re.compile(r"SERMO(?:N)?\s+([IVXLC]+)\.?")
    hits: list[tuple[int, int, int]] = []
    seen: set[int] = set()
    for match in head.finditer(raw):
        n = ARABIC.get(match.group(1))
        if not n or n in seen:
            continue
        seen.add(n)
        hits.append((n, match.start(), match.end()))
    hits.sort(key=lambda item: item[1])
    missing = [i for i in range(1, 87) if i not in seen]
    if missing:
        raise SystemExit(f"PL PDF missing sermons: {missing}")

    out: list[tuple[int, str, dict[int, str]]] = []
    for idx, (n, _start, end) in enumerate(hits):
        body_end = hits[idx + 1][1] if idx + 1 < len(hits) else len(raw)
        body = raw[end:body_end]
        parts = re.split(r"(?:(?<=\s)|^)(\d{1,2})\.\s+(?=[A-Z])", body)
        title = clean_pl_text(parts[0]) if parts else ""
        toks = parts[1:] if parts and not re.match(r"^\d+$", (parts[0] or "").strip()) else parts
        paras: dict[int, str] = {}
        for i in range(0, len(toks) - 1, 2):
            paras[int(toks[i])] = clean_pl_text(toks[i + 1])
        if not paras:
            raise SystemExit(f"Sermo {n}: no numbered paragraphs in PL PDF")
        out.append((n, title, paras))
    return out


def fetch_sermones() -> list[tuple[int, str, dict[int, str]]]:
    pdf_path = CACHE / "cantica.pdf"
    txt_path = CACHE / "cantica-pl.txt"
    if not txt_path.exists():
        if not pdf_path.exists():
            print("Downloading PL 183 PDF...")
            pdf_path.write_bytes(
                fetch(
                    "https://www.documentacatholicaomnia.eu/03d/"
                    "1090-1153,_Bernardus_Claraevallensis_Abbas,"
                    "_Sermones_in_Cantica_Canticorum,_LT.pdf"
                )
            )
        import subprocess

        subprocess.run(
            ["pdftotext", "-layout", str(pdf_path), str(txt_path)],
            check=True,
        )
    raw = txt_path.read_text(encoding="utf-8", errors="replace")
    sermons = parse_pl_pdf(raw)
    for n, title, paras in sermons:
        print(f"  sermo {n}: {len(paras)} paras — {title[:60]}")
    return sermons


def is_eales_junk(line: str) -> bool:
    if not line:
        return True
    low = line.lower()
    if "digitized by" in low or line.startswith("Google"):
        return True
    if re.fullmatch(r"\d+", line):
        return True
    if line in {"FACE", "PAGE", "CONTENTS"}:
        return True
    if re.match(r"^SERMONS ON THE SONG", line, re.I):
        return True
    if re.match(r"^Life and works of Saint Bernard", line, re.I):
        return True
    return False


def fix_roman(token: str) -> str:
    return token.replace("1", "I").replace("U", "II")


def parse_eales(raw: str) -> dict[int, dict[int, str]]:
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in raw.splitlines()]
    # Locate the body start at the first real SERMON I. that is followed by a title.
    start = None
    for i, ln in enumerate(lines):
        if ln == "SERMON I.":
            window = " ".join(x for x in lines[i : i + 6] if x)
            if "TITLE" in window.upper() and "CANTICLE" not in window[:20]:
                start = i
                break
    if start is None:
        raise SystemExit("Could not find Eales SERMON I.")

    heading_re = re.compile(r"^SERMON\s+([IVXLC1U]+)\.?\d*\s*$")
    heading_at: list[tuple[int, int]] = []
    for i, ln in enumerate(lines[start:], start):
        m = heading_re.match(ln)
        if not m:
            continue
        num = ARABIC.get(fix_roman(m.group(1)))
        if not num:
            continue
        heading_at.append((i, num))

    sermons: dict[int, dict[int, str]] = {}
    for idx, (line_i, num) in enumerate(heading_at):
        end = heading_at[idx + 1][0] if idx + 1 < len(heading_at) else len(lines)
        chunk = [ln for ln in lines[line_i + 1 : end] if not is_eales_junk(ln)]
        first_num = next(
            (k for k, ln in enumerate(chunk) if re.match(r"^\d+\.\s", ln)),
            len(chunk),
        )
        title_end = 0
        for k, ln in enumerate(chunk[:first_num]):
            upper = ln.upper()
            titled = (
                upper.startswith(("ON ", "OF ", "THAT ", "HOW ", "WHAT ", "ANOTHER", "PRINCIPALLY"))
                or (ln.isupper() and len(ln) > 8)
                or "CANT." in upper
                or (k <= 1 and "SOLOMON" in upper)
            )
            if titled:
                title_end = k + 1
            else:
                break
        body_start = title_end

        paras: dict[int, str] = {}
        current_n = 1
        buf: list[str] = []

        def flush() -> None:
            if not buf:
                return
            parts: list[str] = []
            for ln in buf:
                if parts and parts[-1].endswith("-"):
                    parts[-1] = parts[-1][:-1] + ln
                else:
                    parts.append(ln)
            text = " ".join(parts)
            text = re.sub(r"\s+", " ", text).strip()
            # Footnote markers like "experience,1" — leave them; they are mild OCR.
            if text and current_n >= 1:
                paras[current_n] = text
            buf.clear()

        # If the first remaining line is not numbered, it is paragraph 1.
        for ln in chunk[body_start:]:
            num_m = re.match(r"^(\d{1,2})\.\s+(.*)$", ln)
            if num_m:
                flush()
                current_n = int(num_m.group(1))
                if current_n < 1:
                    continue
                rest = num_m.group(2).strip()
                buf = [rest] if rest else []
            else:
                buf.append(ln)
        flush()
        if paras:
            sermons[num] = paras
    return sermons


def ingest_cantica() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    print("Parsing PL 183 sermons...")
    latin_sermons = fetch_sermones()
    eales_path = CACHE / "eales.txt"
    if not eales_path.exists():
        print("Downloading Eales OCR...")
        eales_path.write_bytes(
            fetch(
                "https://archive.org/download/LifeWorksOfSBernardClairvauxV4/"
                "LifeWorksOfSBernardClairvauxV4_djvu.txt"
            )
        )
    print("Parsing Eales...")
    english = parse_eales(eales_path.read_text(encoding="utf-8", errors="replace"))

    chapters = []
    eales_out: dict[str, dict[str, str]] = {}
    print("Cantica alignment:")
    for n, title, paras in latin_sermons:
        keys = sorted(paras)
        eng = english.get(n, {})
        missing = [k for k in keys if not eng.get(k)]
        extra = [k for k in sorted(eng) if k not in paras]
        print(
            f"  sermo {n}: latin {len(keys)} eales {len(eng)} "
            f"missing {missing or '-'} extra {extra or '-'}"
        )
        paragraphs = [{"n": str(k), "latin": paras[k]} for k in keys]
        chapters.append(
            {
                "id": f"cantica:{n}",
                "number": n,
                "title": f"Sermo {n}",
                "md_heading": f"Sermo {n}",
                "heading": title,
                "paragraphs": paragraphs,
            }
        )
        eales_out[str(n)] = {str(k): eng.get(k, "") for k in keys}

    dest = ROOT / "src/content/cantica"
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "renderings").mkdir(exist_ok=True)
    write_latin_md(
        dest / "latin.md",
        "Sermones in Cantica Canticorum",
        "App working text: Bernard of Clairvaux, Sermones in Cantica Canticorum (86 sermons), "
        "from Migne, Patrologia Latina 183, cols. 785–1198, via Documenta Catholica Omnia. "
        "ae/oe written without ligatures, and consonantal i written i not j. "
        "For the study reader only; the app never edits this file.",
        chapters,
    )
    write_scaffold(dest / "scaffold.ts", "cantica", chapters)
    (dest / "renderings/eales.json").write_text(
        json.dumps(
            {
                "source": "Samuel J. Eales, Cantica Canticorum: Eighty-Six Sermons on the "
                "Song of Solomon (Life and Works of Saint Bernard, vol. 4, 1893/1895). "
                "Public domain. Text from Internet Archive OCR of LifeWorksOfSBernardClairvauxV4; "
                "hyphenation joined, running headers dropped. English paragraphs are aligned "
                "to the PL numbered blocks in latin.md.",
                "chapters": eales_out,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    empty_eng = sum(1 for ch in eales_out.values() for v in ch.values() if not v)
    filled = sum(1 for ch in eales_out.values() for v in ch.values() if v)
    print(f"Wrote src/content/cantica/ ({filled} English paras, {empty_eng} empty)")


def main() -> None:
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in {"all", "canticum"}:
        ingest_canticum()
    if which in {"all", "cantica"}:
        ingest_cantica()


if __name__ == "__main__":
    main()
