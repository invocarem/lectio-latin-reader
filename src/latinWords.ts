const WORD_RE = /([A-Za-z\u00C0-\u024F''\u2019]+)/;
const WORD_ONLY = /^[A-Za-z\u00C0-\u024F''\u2019]+$/;

export function splitLatinParts(text: string): string[] {
  return text.split(WORD_RE);
}

export function isLatinWord(part: string): boolean {
  return Boolean(part) && WORD_ONLY.test(part);
}

export function latinWords(text: string): string[] {
  return splitLatinParts(text).filter(isLatinWord);
}
