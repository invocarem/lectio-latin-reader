import canticaLexiconData from "./content/cantica/lexicon/lexicon.json";
import canticumLexiconData from "./content/canticum/lexicon/lexicon.json";
import confessionsLexiconData from "./content/confessions/lexicon/lexicon.json";
import gradibusLexiconData from "./content/gradibus/lexicon/lexicon.json";
import psalterLexiconData from "./content/psalter/lexicon/lexicon.json";
import ruleLexiconData from "./content/rule/lexicon/lexicon.json";
import type { WorkId } from "./types";

export interface Edited {
  lemma?: string;
  pos?: string;
  gloss: string;
  note?: string;
}

export interface Sense {
  lemma?: string;
  pos?: string;
  gloss: string;
}

export interface Entry {
  key: string;
  form: string;
  query: string;
  count?: number;
  first?: number | string | null;
  pos?: string[];
  senses?: Sense[];
  no_gloss?: boolean;
  curated?: boolean;
  edited?: Edited;
}

interface LexiconPayload {
  entries: Entry[];
}

/** Normalise a clicked token to a lexicon key (lowercase, punctuation stripped). */
export function normalise(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/^[\W_]+|[\W_]+$/g, "");
}

function foldKey(key: string): string {
  return key.replaceAll("j", "i");
}

export interface Lexicon {
  lookup(raw: string): Entry | undefined;
  glossFor(entry: Entry): string;
  lemmaFor(entry: Entry): string;
  sensesFor(entry: Entry): string[];
}

function buildLexicon(payload: unknown): Lexicon {
  const byKey = new Map<string, Entry>();
  for (const entry of (payload as LexiconPayload).entries) {
    byKey.set(entry.key, entry);
  }

  function lookup(raw: string): Entry | undefined {
    const key = normalise(raw);
    if (!key) return undefined;
    const exact = byKey.get(key);
    if (exact) return exact;
    const folded = foldKey(key);
    if (folded !== key) return byKey.get(folded);
    return undefined;
  }

  /** The preferred short gloss: the curated card first, else Whitaker's first sense. */
  function glossFor(entry: Entry): string {
    if (entry.edited?.gloss) {
      return entry.edited.gloss;
    }
    return entry.senses?.[0]?.gloss ?? (entry.no_gloss ? "(no gloss)" : "");
  }

  /** The preferred lemma: the curated card's lemma, else the first sense's lemma, else the key. */
  function lemmaFor(entry: Entry): string {
    if (entry.edited?.lemma) {
      return entry.edited.lemma;
    }
    return entry.senses?.[0]?.lemma ?? entry.key;
  }

  /** All Whitaker gloss senses as lines. */
  function sensesFor(entry: Entry): string[] {
    return entry.senses?.map((s) => s.gloss).filter(Boolean) ?? [];
  }

  return { lookup, glossFor, lemmaFor, sensesFor };
}

const lexiconCache = new Map<WorkId, Lexicon>();

const lexiconData: Record<WorkId, unknown> = {
  gradibus: gradibusLexiconData,
  canticum: canticumLexiconData,
  cantica: canticaLexiconData,
  psalter: psalterLexiconData,
  rule: ruleLexiconData,
  confessions: confessionsLexiconData,
};

/** The closed word list for a given work. */
export function lexiconFor(workId: WorkId): Lexicon {
  let lexicon = lexiconCache.get(workId);
  if (!lexicon) {
    lexicon = buildLexicon(lexiconData[workId]);
    lexiconCache.set(workId, lexicon);
  }
  return lexicon;
}
