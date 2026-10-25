import { useCallback, useState, type ReactNode } from "react";
import { parseTextLang, TEXT_LANG_KEY, type TextLang } from "../textLang";
import { BothLangIcon, EnglishIcon, LatinIcon } from "./icons";

const OPTIONS: { id: TextLang; label: string; icon: ReactNode }[] = [
  { id: "latin", label: "Latin only", icon: <LatinIcon /> },
  { id: "both", label: "Latin and English", icon: <BothLangIcon /> },
  { id: "english", label: "English only", icon: <EnglishIcon /> },
];

function storedLang(): TextLang {
  if (typeof localStorage === "undefined") return "both";
  return parseTextLang(localStorage.getItem(TEXT_LANG_KEY));
}

/** Latin, both, or English. The choice is kept for Lectio and Cursus. */
export function useTextLang(): [TextLang, (next: TextLang) => void] {
  const [lang, setLang] = useState<TextLang>(storedLang);

  const choose = useCallback((next: TextLang) => {
    setLang(next);
    try {
      localStorage.setItem(TEXT_LANG_KEY, next);
    } catch {
      // Private mode can refuse storage; the choice still holds for this view.
    }
  }, []);

  return [lang, choose];
}

export function TextLangToggle({
  lang,
  onChange,
}: {
  lang: TextLang;
  onChange: (next: TextLang) => void;
}) {
  return (
    <div className="text-lang" role="group" aria-label="Reading language">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={lang === option.id}
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.id)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
