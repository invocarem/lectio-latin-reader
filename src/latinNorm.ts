/**
 * Latin displayed in the psalm readers is normalized so the screen never
 * shows diacritics we strip from other surfaces. `scaffold.ts`/`latin.md`
 * keep the raw source spelling (with whatever ë it has); this folds those
 * down and makes each verse begin on a capital letter.
 */

/** Fold ë→e (and Ë→E), then capitalize the first letter of the text. */
export function normLatin(text: string): string {
  const folded = text.replace(/ë/g, "e").replace(/Ë/g, "E");
  return folded.replace(/^([^A-Za-z]*)([a-z])/, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
}
