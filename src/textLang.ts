/** What a lectio or cursus page shows. Study keeps its own column toggle. */
export type TextLang = "latin" | "both" | "english";

export const TEXT_LANG_KEY = "lectio.textLang";

/** Saved choice, or Latin and English together when nothing valid is stored. */
export function parseTextLang(stored: string | null): TextLang {
  if (stored === "latin" || stored === "both" || stored === "english") return stored;
  return "both";
}

export function showsLatin(lang: TextLang): boolean {
  return lang !== "english";
}

export function showsEnglish(lang: TextLang): boolean {
  return lang !== "latin";
}
