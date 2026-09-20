import lexiconData from "./content/lexicon/lexicon.json";

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

const payload = lexiconData as unknown as LexiconPayload;

const byKey = new Map<string, Entry>();
for (const entry of payload.entries) {
  byKey.set(entry.key, entry);
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

export function lookup(raw: string): Entry | undefined {
  const key = normalise(raw);
  if (!key) return undefined;
  const exact = byKey.get(key);
  if (exact) return exact;
  const folded = foldKey(key);
  if (folded !== key) return byKey.get(folded);
  return undefined;
}

/** The preferred short gloss: the curated card first, else Whitaker's first sense. */
export function glossFor(entry: Entry): string {
  if (entry.edited?.gloss) {
    return entry.edited.gloss;
  }
  return entry.senses?.[0]?.gloss ?? (entry.no_gloss ? "(no gloss)" : "");
}

/** The preferred lemma: the curated card's lemma, else the first sense's lemma, else the key. */
export function lemmaFor(entry: Entry): string {
  if (entry.edited?.lemma) {
    return entry.edited.lemma;
  }
  return entry.senses?.[0]?.lemma ?? entry.key;
}

/** All Whitaker gloss senses as lines. */
export function sensesFor(entry: Entry): string[] {
  return entry.senses?.map((s) => s.gloss).filter(Boolean) ?? [];
}
