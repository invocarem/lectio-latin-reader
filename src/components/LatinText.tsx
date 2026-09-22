import { isLatinWord, splitLatinParts } from "../latinWords";

type LatinTextProps = {
  text: string;
  unitId: string;
  activeToken?: string;
  onWord: (word: string, el: HTMLElement, tokenKey: string) => void;
};

export function LatinText({ text, unitId, activeToken, onWord }: LatinTextProps) {
  return splitLatinParts(text).map((part, index) => {
    if (!part) return null;
    if (!isLatinWord(part)) {
      return <span key={index}>{part}</span>;
    }
    const tokenKey = `${unitId}:${index}`;
    return (
      <span
        key={index}
        className={tokenKey === activeToken ? "w active" : "w"}
        data-word={part}
        onClick={(event) => {
          event.stopPropagation();
          onWord(part, event.currentTarget, tokenKey);
        }}
      >
        {part}
      </span>
    );
  });
}
