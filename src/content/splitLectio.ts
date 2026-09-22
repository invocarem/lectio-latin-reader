import type { LectioChunk } from "../types";

/** Same target as scripts/split_lectio.py (Gradibus lectio pages). */
const TARGET_WORDS = 60;
const NEVER_SPLIT = new Set(["title", "chapter-title"]);
const MIN_SENT_WORDS = 12;
const MIN_CHUNK_WORDS = 20;
const ABBREV = new Set([
  "al",
  "apoc",
  "act",
  "bar",
  "baruch",
  "cant",
  "cantic",
  "cap",
  "cf",
  "col",
  "coloss",
  "colossens",
  "cor",
  "dan",
  "deut",
  "dr",
  "eccl",
  "eccle",
  "eccli",
  "eph",
  "ephes",
  "esdr",
  "etc",
  "exod",
  "ezech",
  "ezek",
  "gal",
  "galat",
  "gen",
  "hab",
  "habac",
  "heb",
  "hebr",
  "iob",
  "id",
  "ibid",
  "ioan",
  "ioel",
  "isa",
  "isai",
  "iudic",
  "ierem",
  "iac",
  "jac",
  "jer",
  "jn",
  "job",
  "joel",
  "john",
  "jos",
  "jud",
  "lev",
  "levit",
  "lk",
  "luc",
  "mal",
  "malach",
  "mar",
  "marc",
  "math",
  "matt",
  "matth",
  "mach",
  "machab",
  "mic",
  "mich",
  "mk",
  "mr",
  "mt",
  "n",
  "nah",
  "no",
  "num",
  "os",
  "ose",
  "ovid",
  "paral",
  "pet",
  "petr",
  "phil",
  "philipp",
  "philip",
  "philem",
  "prov",
  "ps",
  "psal",
  "reg",
  "rev",
  "rom",
  "ruth",
  "s",
  "sap",
  "scil",
  "seq",
  "serm",
  "sir",
  "song",
  "soph",
  "sophon",
  "sq",
  "ss",
  "st",
  "thess",
  "thren",
  "tim",
  "tit",
  "tob",
  "tom",
  "v",
  "viz",
  "vs",
  "vv",
  "wis",
  "zach",
]);
const CLOSING = new Set(["\"", "'", "»", "”", "’", ")"]);
const OPENING = new Set(["«", "“", "\"", "'"]);

export type Chunkable = {
  id: string;
  latin: string;
  english: string;
  kind?: string;
};

function isAbbrev(token: string): boolean {
  const stripped = token.replace(/[«»“”"'']/g, "").replace(/\.+$/, "");
  if (stripped.length === 1 && /[A-Za-z]/.test(stripped)) return true;
  return ABBREV.has(stripped.toLowerCase());
}

function splitSentences(text: string, allowLowercase: boolean): string[] {
  const source = text.trim();
  if (!source) return [];

  const sentences: string[] = [];
  let buf = "";
  let i = 0;
  const n = source.length;

  while (i < n) {
    const ch = source[i];
    if (ch === "." || ch === "?" || ch === "!") {
      buf += ch;
      let j = i + 1;
      while (j < n && CLOSING.has(source[j])) {
        buf += source[j];
        j += 1;
      }
      while (j < n && /\s/.test(source[j])) j += 1;
      const atEnd = j >= n;
      const nxt = atEnd ? "" : source[j];
      const core = buf.replace(/[.?!]+["'»”’)]*$/, "");
      const lastM = core.match(/([A-Za-z]+)$/);
      const last = lastM?.[1] ?? "";
      const skip = isAbbrev(last) || /\d/.test(nxt);
      const letterStart = nxt
        ? allowLowercase
          ? /[A-Za-z]/.test(nxt)
          : nxt === nxt.toUpperCase() && /[A-Za-z]/.test(nxt)
        : false;
      const starts = atEnd || (nxt && (letterStart || OPENING.has(nxt)));
      if (starts && !skip) {
        const sent = buf.trim();
        if (sent) sentences.push(sent);
        buf = "";
        i = j;
        continue;
      }
      i += 1;
      continue;
    }
    buf += ch;
    i += 1;
  }

  const tail = buf.trim();
  if (tail) sentences.push(tail);
  return sentences.length > 0 ? sentences : [source];
}

function wordCount(text: string): number {
  const n = text.trim().split(/\s+/).filter(Boolean).length;
  return n || 1;
}

function joinSents(sents: string[]): string {
  return sents.join(" ").trim();
}

function coalesce(sents: string[], minWords = MIN_SENT_WORDS): string[] {
  if (sents.length === 0) return sents;
  const out = [sents[0]];
  for (const sent of sents.slice(1)) {
    if (wordCount(sent) < minWords) {
      out[out.length - 1] = joinSents([out[out.length - 1], sent]);
    } else {
      out.push(sent);
    }
  }
  if (out.length >= 2 && wordCount(out[0]) < minWords) {
    out.splice(0, 2, joinSents(out.slice(0, 2)));
  }
  return out;
}

function desiredParts(nSents: number, words: number, kind: string): number {
  if (NEVER_SPLIT.has(kind)) return 1;
  if (words <= Math.floor(TARGET_WORDS * 1.25) || nSents <= 1) return 1;
  return Math.max(1, Math.min(nSents, Math.round(words / TARGET_WORDS)));
}

function partition(items: string[], nParts: number): string[][] {
  nParts = Math.max(1, Math.min(nParts, items.length));
  if (nParts === 1) return [items];

  const weights = items.map(wordCount);
  const m = items.length;
  const inf = 1e9;
  const prefix = [0];
  for (const w of weights) prefix.push(prefix[prefix.length - 1] + w);

  const dp = Array.from({ length: m + 1 }, () => Array(nParts + 1).fill(inf));
  const back = Array.from({ length: m + 1 }, () => Array(nParts + 1).fill(0));
  dp[0][0] = 0;
  for (let i = 1; i <= m; i++) {
    for (let k = 1; k <= Math.min(nParts, i); k++) {
      for (let j = k - 1; j < i; j++) {
        const cost = Math.max(dp[j][k - 1], prefix[i] - prefix[j]);
        if (cost < dp[i][k]) {
          dp[i][k] = cost;
          back[i][k] = j;
        }
      }
    }
  }

  const groups: string[][] = [];
  let i = m;
  let k = nParts;
  while (k) {
    const j = back[i][k];
    groups.push(items.slice(j, i));
    i = j;
    k -= 1;
  }
  groups.reverse();
  return groups;
}

function mergeTiny(groups: string[][], minWords = MIN_CHUNK_WORDS): string[][] {
  if (groups.length === 0) return groups;
  const out = [groups[0]];
  for (const group of groups.slice(1)) {
    if (wordCount(joinSents(group)) < minWords) {
      out[out.length - 1] = out[out.length - 1].concat(group);
    } else {
      out.push(group);
    }
  }
  if (out.length >= 2 && wordCount(joinSents(out[0])) < minWords) {
    out.splice(0, 2, out[0].concat(out[1]));
  }
  return out;
}

/**
 * Break a Latin+English unit into Gradibus-style lectio pages (~60 words).
 * O'Donnell-style all-lowercase Latin needs `{ allowLowercase: true }`.
 * English is always split with the capitalized-sentence rule (Pusey, etc.).
 *
 * `sentenceAligned` (used by cantica) assumes the English was written with
 * one sentence per Latin sentence, in order. Pages are then cut on the Latin
 * sentence boundaries and the English is sliced with the exact same
 * sentence-index boundaries, so every page's Latin and English are the same
 * material regardless of how word lengths fall. All other callers keep the
 * legacy independent word-balance grouping below.
 */
export function chunkLectio(
  unit: Chunkable,
  opts: { allowLowercase?: boolean; sentenceAligned?: boolean } = {},
): LectioChunk[] {
  const allowLowercase = opts.allowLowercase ?? false;
  const english = unit.english || "";

  const laRaw = splitSentences(unit.latin, allowLowercase);
  const enRaw = english ? splitSentences(english, false) : [];

  if (
    opts.sentenceAligned === true &&
    laRaw.length > 0 &&
    enRaw.length === laRaw.length
  ) {
    let n = desiredParts(laRaw.length, wordCount(unit.latin), unit.kind ?? "");
    n = Math.max(1, Math.min(n, laRaw.length, Math.max(1, enRaw.length)));
    const laGroups = mergeTiny(partition(laRaw, n));
    const sizes = laGroups.map((g) => g.length);
    const enGroups: string[][] = [];
    let off = 0;
    for (const s of sizes) {
      enGroups.push(enRaw.slice(off, off + s));
      off += s;
    }
    const parts = laGroups.length;
    return laGroups.map((laG, index) => {
      const part = index + 1;
      return {
        id: parts === 1 ? unit.id : `${unit.id}-s${part}`,
        part,
        parts,
        latin: joinSents(laG),
        english: joinSents(enGroups[index] ?? [""]),
      };
    });
  }

  const la = coalesce(laRaw);
  const en = english ? coalesce(enRaw) : [""];
  let n = desiredParts(la.length, wordCount(unit.latin), unit.kind ?? "");
  n = Math.max(1, Math.min(n, la.length, Math.max(1, en.length)));

  let laGroups = mergeTiny(partition(la, n));
  const enGroups = partition(en, laGroups.length);
  while (enGroups.length < laGroups.length && laGroups.length > 1) {
    laGroups[laGroups.length - 2] = laGroups[laGroups.length - 2].concat(
      laGroups[laGroups.length - 1],
    );
    laGroups.pop();
  }
  const parts = laGroups.length;
  return laGroups.map((laG, index) => {
    const part = index + 1;
    return {
      id: parts === 1 ? unit.id : `${unit.id}-s${part}`,
      part,
      parts,
      latin: joinSents(laG),
      english: joinSents(enGroups[index] ?? [""]),
    };
  });
}
