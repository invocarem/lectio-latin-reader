const WORD_RE = /([A-Za-z\u00C0-\u024F''\u2019]+)/;
const WORD_ONLY = /^[A-Za-z\u00C0-\u024F''\u2019]+$/;

type LatinTextProps = {
  text: string;
  unitId: string;
  activeToken?: string;
  onWord: (word: string, el: HTMLElement, tokenKey: string) => void;
};

export function LatinText({ text, unitId, activeToken, onWord }: LatinTextProps) {
  return text.split(WORD_RE).map((part, index) => {
    if (!part) return null;
    if (!WORD_ONLY.test(part)) {
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
