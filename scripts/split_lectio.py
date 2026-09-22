#!/usr/bin/env python3
"""Split long PL units into lectio-sized chunks.

latin-units.json is left alone. Chunks are derived after English is attached,
and written onto de-gradibus.json as a `chunks` array.

IDs for a unit broken into three parts look like praefatio-s1, praefatio-s2,
praefatio-s3.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/content/gradibus/de-gradibus.json"

TARGET_WORDS = 60
NEVER_SPLIT = {"title", "chapter-title"}

# Period after these tokens is not a sentence end (citations, n. 1, S. Bernardus).
ABBREV = {
    "al", "apoc", "bar", "cant", "cantic", "cap", "cf", "col", "cor", "dan",
    "deut", "dr", "eccl", "eccli", "eph", "etc", "exod", "ezech", "ezek",
    "gal", "gen", "hab", "heb", "hebr", "id", "ibid", "ioan", "isa", "jac",
    "jer", "jn", "job", "joel", "john", "jos", "jud", "lev", "lk", "luc",
    "mal", "mar", "marc", "matt", "matth", "mic", "mk", "mr", "mt", "n",
    "nah", "no", "num", "os", "paral", "pet", "petr", "phil", "philipp",
    "prov", "ps", "psal", "reg", "rev", "rom", "s", "sap", "scil", "seq",
    "sir", "song", "sq", "ss", "st", "thess", "tim", "tit", "tob", "tom",
    "v", "viz", "vs", "vv", "wis", "zach",
}
MIN_SENT_WORDS = 12
MIN_CHUNK_WORDS = 20


def _is_abbrev(token: str) -> bool:
    stripped = token.strip("«»“”\"'").rstrip(".")
    if len(stripped) == 1 and stripped.isalpha():
        return True
    return stripped.casefold() in ABBREV


def split_sentences(text: str, *, allow_lowercase: bool = False) -> list[str]:
    """Split on .?! skipping citation abbreviations. Parentheses are not a fence:
    PL asides are often unbalanced and would swallow the rest of a unit.

    O'Donnell-style all-lowercase Latin does not capitalize after a period, so
    pass allow_lowercase=True for those texts. Capitalized Latin (Bernard) keeps
    the default, which still requires an uppercase letter after .?!
    """
    text = text.strip()
    if not text:
        return []

    sentences: list[str] = []
    buf: list[str] = []
    i = 0
    n = len(text)

    while i < n:
        ch = text[i]
        if ch in ".?!":
            buf.append(ch)
            j = i + 1
            while j < n and text[j] in "\"'»”’)":
                buf.append(text[j])
                j += 1
            while j < n and text[j].isspace():
                j += 1
            at_end = j >= n
            nxt = text[j] if j < n else ""
            core = re.sub(r'[.?!]+["\'»”’)]*$', "", "".join(buf))
            last_m = re.search(r"([A-Za-z]+)$", core)
            last = last_m.group(1) if last_m else ""
            skip = _is_abbrev(last) or nxt.isdigit()
            letter_start = nxt.isalpha() if allow_lowercase else nxt.isupper()
            starts = at_end or (nxt and (letter_start or nxt in "«“\"'"))
            if starts and not skip:
                sent = "".join(buf).strip()
                if sent:
                    sentences.append(sent)
                buf = []
                i = j
                continue
            i += 1
            continue
        buf.append(ch)
        i += 1

    tail = "".join(buf).strip()
    if tail:
        sentences.append(tail)
    return sentences or [text]


def word_count(text: str) -> int:
    return len(text.split()) or 1


def coalesce(sents: list[str], min_words: int = MIN_SENT_WORDS) -> list[str]:
    """Attach very short sentences to a neighbor so lectio pages are not one word."""
    if not sents:
        return sents
    out = [sents[0]]
    for sent in sents[1:]:
        if word_count(sent) < min_words:
            out[-1] = join_sents([out[-1], sent])
        else:
            out.append(sent)
    if len(out) >= 2 and word_count(out[0]) < min_words:
        out[0:2] = [join_sents(out[0:2])]
    return out


def desired_parts(n_sents: int, words: int, kind: str) -> int:
    if kind in NEVER_SPLIT:
        return 1
    if words <= int(TARGET_WORDS * 1.25) or n_sents <= 1:
        return 1
    return max(1, min(n_sents, round(words / TARGET_WORDS)))


def partition(items: list[str], n_parts: int) -> list[list[str]]:
    """Split `items` into n_parts runs, keeping word counts as even as possible."""
    n_parts = max(1, min(n_parts, len(items)))
    if n_parts == 1:
        return [items]

    weights = [word_count(item) for item in items]
    m = len(items)
    inf = 10**9
    prefix = [0]
    for w in weights:
        prefix.append(prefix[-1] + w)

    dp = [[inf] * (n_parts + 1) for _ in range(m + 1)]
    back = [[0] * (n_parts + 1) for _ in range(m + 1)]
    dp[0][0] = 0
    for i in range(1, m + 1):
        for k in range(1, min(n_parts, i) + 1):
            for j in range(k - 1, i):
                cost = max(dp[j][k - 1], prefix[i] - prefix[j])
                if cost < dp[i][k]:
                    dp[i][k] = cost
                    back[i][k] = j

    groups: list[list[str]] = []
    i, k = m, n_parts
    while k:
        j = back[i][k]
        groups.append(items[j:i])
        i, k = j, k - 1
    groups.reverse()
    return groups


def merge_tiny(groups: list[list[str]], min_words: int = MIN_CHUNK_WORDS) -> list[list[str]]:
    """Fold leftover scraps into the previous lectio part."""
    if not groups:
        return groups
    out = [groups[0]]
    for group in groups[1:]:
        if word_count(join_sents(group)) < min_words:
            out[-1] = out[-1] + group
        else:
            out.append(group)
    if len(out) >= 2 and word_count(join_sents(out[0])) < min_words:
        out[0:2] = [out[0] + out[1]]
    return out


def join_sents(sents: list[str]) -> str:
    return " ".join(sents).strip()


def chunk_unit(unit: dict, *, allow_lowercase: bool = False) -> list[dict]:
    latin = unit["latin"]
    english = unit.get("english") or ""
    # Latin may be all-lowercase (O'Donnell); English renderings stay capitalized.
    la = coalesce(split_sentences(latin, allow_lowercase=allow_lowercase))
    en = coalesce(split_sentences(english)) if english else [""]
    n = desired_parts(len(la), word_count(latin), unit.get("kind", ""))
    n = max(1, min(n, len(la), max(1, len(en))))

    la_groups = merge_tiny(partition(la, n))
    en_groups = partition(en, len(la_groups))
    while len(en_groups) < len(la_groups) and len(la_groups) > 1:
        la_groups[-2] = la_groups[-2] + la_groups[-1]
        la_groups.pop()
    parts = len(la_groups)
    chunks = []
    for i, (la_g, en_g) in enumerate(zip(la_groups, en_groups), start=1):
        chunk_id = unit["id"] if parts == 1 else f"{unit['id']}-s{i}"
        chunks.append({
            "id": chunk_id,
            "part": i,
            "parts": parts,
            "latin": join_sents(la_g),
            "english": join_sents(en_g),
        })
    return chunks


def add_chunks(units: list[dict]) -> list[dict]:
    for unit in units:
        unit["chunks"] = chunk_unit(unit)
    return units


def report(units: list[dict]) -> None:
    total = 0
    for unit in units:
        chunks = unit["chunks"]
        total += len(chunks)
        if len(chunks) == 1:
            continue
        words = " + ".join(str(word_count(c["latin"])) for c in chunks)
        print(f"{unit['id']}: {len(chunks)} parts ({words} words)")
    print(f"\n{len(units)} source units -> {total} lectio units")


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else OUT
    units = json.loads(path.read_text(encoding="utf-8"))
    add_chunks(units)
    path.write_text(json.dumps(units, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report(units)
    print(f"wrote chunks -> {path}")


if __name__ == "__main__":
    main()
