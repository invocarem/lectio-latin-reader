import { useCallback, useState, type KeyboardEvent, type ReactNode } from "react";
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

function moveLang(lang: TextLang, key: string): TextLang | null {
  const index = OPTIONS.findIndex((option) => option.id === lang);
  if (key === "ArrowRight" || key === "ArrowDown") {
    return OPTIONS[(index + 1) % OPTIONS.length].id;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return OPTIONS[(index - 1 + OPTIONS.length) % OPTIONS.length].id;
  }
  if (key === "Home") return OPTIONS[0].id;
  if (key === "End") return OPTIONS[OPTIONS.length - 1].id;
  return null;
}

export function TextLangToggle({
  lang,
  onChange,
}: {
  lang: TextLang;
  onChange: (next: TextLang) => void;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = moveLang(lang, event.key);
    if (!next) return;
    event.preventDefault();
    onChange(next);
    const buttons = event.currentTarget.parentElement?.querySelectorAll("button");
    const index = OPTIONS.findIndex((option) => option.id === next);
    buttons?.[index]?.focus();
  };

  return (
    <div className="text-lang" role="radiogroup" aria-label="Reading language">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={lang === option.id}
          aria-label={option.label}
          title={option.label}
          tabIndex={lang === option.id ? 0 : -1}
          onClick={() => onChange(option.id)}
          onKeyDown={onKeyDown}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
