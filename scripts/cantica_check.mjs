#!/usr/bin/env node
/**
 * Check cantica Latin/English page alignment.
 *
 * Lectio pages are split on Latin sentence boundaries and, with
 * sentenceAligned on (see src/content/cantica/index.ts), English is sliced
 * with the exact same sentence-index boundaries. That only aligns when the
 * English in renderings/close.json has exactly ONE sentence per Latin
 * sentence, in order. This script parses the paragraph text out of latin.md,
 * runs the same raw sentence splitter over Latin and English, and flags any
 * paragraph where the two RAW sentence counts differ.
 *
 *   node scripts/cantica_check.mjs            # report alignment across all 86
 *   node scripts/cantica_check.mjs --dump 1   # print Sermo 1 sentence-by-sentence
 *
 * It never edits content.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const latinMd = readFileSync(join(ROOT, "src/content/cantica/latin.md"), "utf8");
const close = JSON.parse(
  readFileSync(join(ROOT, "src/content/cantica/renderings/close.json"), "utf8"),
);

// --- splitter replica (from src/content/splitLectio.ts) -------------------
const ABBREV = new Set([
  "al","apoc","act","bar","baruch","cant","cantic","cap","cf","col","coloss",
  "colossens","cor","dan","deut","dr","eccl","eccle","eccli","eph","ephes","esdr",
  "etc","exod","ezech","ezek","gal","galat","gen","hab","habac","heb","hebr",
  "iob","id","ibid","ioan","ioel","isa","isai","iudic","ierem","iac","jac","jer","jn",
  "job","joel","john","jos","jud","lev","levit","lk","luc","mal","malach","mar",
  "marc","math","matt","matth","mach","machab","mic","mich","mk","mr","mt","n","nah","no","num",
  "os","ose","ovid","paral","pet","petr","phil","philipp","philip","philem",
  "prov","ps","psal","reg","rev","rom","ruth","s","sap","scil","seq","serm",
  "sir","song","soph","sophon","sq","ss","st","thess","thren","tim","tit","tob",
  "tom","v","viz","vs","vv","wis","zach",
]);
const CLOSING = new Set(['"', "'", "»", "”", "’", ")"]);
const OPENING = new Set(["«", "“", '"', "'"]);
function isAbbrev(t) {
  const s = t.replace(/[«»“”"'']/g, "").replace(/\.+$/, "");
  if (s.length === 1 && /[A-Za-z]/.test(s)) return true;
  return ABBREV.has(s.toLowerCase());
}
function splitSentences(text, allowLowercase) {
  const source = text.trim();
  if (!source) return [];
  const sentences = [];
  let buf = "", i = 0, n = source.length;
  while (i < n) {
    const ch = source[i];
    if (ch === "." || ch === "?" || ch === "!") {
      buf += ch;
      let j = i + 1;
      while (j < n && CLOSING.has(source[j])) { buf += source[j]; j++; }
      while (j < n && /\s/.test(source[j])) j++;
      const atEnd = j >= n;
      const nxt = atEnd ? "" : source[j];
      const core = buf.replace(/[.?!]+["'»”’)]*$/, "");
      const m = core.match(/([A-Za-z]+)$/);
      const last = m ? m[1] : "";
      const skip = isAbbrev(last) || /\d/.test(nxt);
      const letterStart = nxt
        ? allowLowercase ? /[A-Za-z]/.test(nxt) : nxt === nxt.toUpperCase() && /[A-Za-z]/.test(nxt)
        : false;
      const starts = atEnd || (nxt && (letterStart || OPENING.has(nxt)));
      if (starts && !skip) {
        const s = buf.trim();
        if (s) sentences.push(s);
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
  return sentences.length ? sentences : [source];
}
const wordCount = (t) => { const n = t.trim().split(/\s+/).filter(Boolean).length; return n || 1; };

// --- parse latin.md: sermon # -> { paragraph # -> latin } ---------------
const sermons = new Map();
let current = null;
for (const line of latinMd.split(/\r?\n/)) {
  const head = line.match(/^## Sermo (\d+)\s*$/);
  if (head) { current = head[1]; sermons.set(current, {}); continue; }
  if (!current) continue;
  const para = line.match(/^(\d+)\.\s+(.+)$/);
  if (para) sermons.get(current)[para[1]] = para[2].trim();
}

// --- compare ---------------------------------------------------------------
if (process.argv.includes("--scan")) {
  // Find Latin sentences that look like citation-fracture artifacts (a short
  // sentence that is really the tail of a "(Book. X, N)" citation), so the
  // abbreviation list can be extended and the Latin won't split there.
  let found = 0;
  for (const [sermon, paras] of sermons) {
    for (const [no, latin] of Object.entries(paras)) {
      for (const s of splitSentences(latin, false)) {
        const stripped = s.trim();
        if (wordCount(stripped) > 7) continue;
        const artifact = /^[IVXLCDM]+\s*,\s*\d+[\s,;.)]/.test(stripped)
          || /^\d+[\s,;.)u]/.test(stripped)
          || /^(et\s+|sed\s+|nam\s+|post\s+|etiam\s+|ac\s+)?\(?[IVXLCDM][IVXLCDM]*\s*,/.test(stripped);
        if (artifact) {
          found++;
          console.log(`Sermo ${sermon} ¶${no}: "${stripped.slice(0, 60)}"`);
        }
      }
    }
  }
  console.log(found ? `\n${found} possible citation-fracture artifact(s).` : "No obvious fracture artifacts.");
  process.exitCode = found ? 1 : 0;
  process.exit(0);
}

const dumpSermon = process.argv.find((a) => a.startsWith("--dump="))?.slice("--dump=".length)
  ?? (process.argv.indexOf("--dump") >= 0 ? process.argv[process.argv.indexOf("--dump") + 1] : null);
if (dumpSermon) {
  const paras = sermons.get(dumpSermon);
  if (!paras) { console.log(`No Sermo ${dumpSermon} found.`); process.exit(2); }
  for (const [no, latin] of Object.entries(paras)) {
    console.log(`\n## Sermo ${dumpSermon} ¶${no} — ${splitSentences(latin, false).length} sentences`);
    splitSentences(latin, false).forEach((s, i) => {
      const ew = (close.chapters?.[dumpSermon]?.[no] ?? "");
      console.log(`  [${i + 1}] (${wordCount(s)}w) ${s}`);
    });
  }
  console.log(`\nclose.json English for this sermon: ${Object.keys(close.chapters?.[dumpSermon] ?? {}).filter((k) => k !== "title").length} paragraph(s).`);
  process.exit(0);
}

let totalParas = 0, withEnglish = 0, mismatched = [];
for (const [sermon, paras] of sermons) {
  for (const [no, latin] of Object.entries(paras)) {
    totalParas++;
    const english = (close.chapters?.[sermon]?.[no] ?? "").trim();
    if (!english) continue;
    withEnglish++;
    const laN = splitSentences(latin, false).length;
    const enN = splitSentences(english, false).length;
    const lw = wordCount(latin), ew = wordCount(english);
    if (laN !== enN) {
      mismatched.push({ sermon, no, laN, enN, lw, ew });
    }
  }
}

console.log(`Parsed ${sermons.size} sermons, ${totalParas} paragraphs from latin.md.`);
console.log(`close.json has English for ${withEnglish} paragraphs.`);
if (mismatched.length) {
  console.log(`\nMISALIGNED (${mismatched.length}) — English must have ONE sentence per Latin sentence (raw counts differ):`);
  for (const m of mismatched) {
    console.log(
      `  Sermo ${m.sermon} ¶${m.no}: latin ${m.laN} sentences / ${m.lw}w, english ${m.enN} sentences / ${m.ew}w  ${m.laN > m.enN ? "(ENGLISH TOO SHORT)" : "(ENGLISH TOO LONG)"}`,
    );
  }
  process.exitCode = 1;
} else if (withEnglish > 0) {
  console.log("\nAll translated paragraphs are sentence-aligned with their Latin. ✓");
}

// --- title coverage (sermons 1..86 should each carry an English title) ----
const untitled = [];
for (let s = 1; s <= 86; s++) {
  const t = close.chapters?.[String(s)]?.title;
  if (!t || !String(t).trim()) untitled.push(s);
}
if (untitled.length) {
  console.log(`\nSermon(s) missing an English title: ${untitled.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("All 86 sermons carry an English title. ✓");
}

