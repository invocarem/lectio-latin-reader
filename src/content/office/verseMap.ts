/**
 * How the Office lines out a Gallican psalm.
 * Psalms absent from this map are shown as stored in latin.md.
 * Add a psalm only when its Benedictine lining is known.
 * The same decisions are written in VERSE_MAP.md.
 */
/**
 * A slice of one Gallican verse. `latinFrom` / `latinThrough` cut inside
 * the verse; both are inclusive. Omit them to take the whole verse.
 */
export type OfficePiece = {
  verse: number;
  dropLatinPrefix?: string;
  latinFrom?: string;
  latinThrough?: string;
  englishFrom?: string;
  englishThrough?: string;
};

export type OfficeLine = {
  /** Whole Gallican verses, in order, joined into this one Office line. */
  sources?: number[];
  /** Removed from the start of the Latin of the first source verse. */
  dropLatinPrefix?: string;
  /** Finer cuts, when one Gallican verse is split across Office lines. */
  pieces?: OfficePiece[];
};

/** Drop a Latin title and keep every Gallican verse number. */
export type TitleDrop = {
  dropLatinPrefix: string;
};

export type VerseMapEntry = OfficeLine[] | TitleDrop;

const GRADUAL = "Canticum graduum. ";

function dropTitle(dropLatinPrefix: string): TitleDrop {
  return { dropLatinPrefix };
}

export const VERSE_MAP: Partial<Record<number, VerseMapEntry>> = {
  1: [
    { pieces: [{ verse: 1 }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3, latinThrough: "in tempore suo :", englishThrough: "in due season." }] },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "et folium eius non defluet",
          englishFrom: "And his leaf shall not fall off",
        },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
  ],
  13: dropTitle("In finem. Psalmus David. "),
  14: [
    {
      pieces: [
        { verse: 1, dropLatinPrefix: "Psalmus David. ", englishFrom: "Lord," },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "qui non egit dolum in lingua sua,",
          englishThrough: "who hath not used deceit in his tongue:",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "nec fecit proximo suo malum", englishFrom: "Nor hath done evil" },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "timentes autem Dominum glorificat.",
          englishThrough: "he glorifieth them that fear the Lord.",
        },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "Qui iurat proximo suo", englishFrom: "He that sweareth to his neighbour" },
        {
          verse: 5,
          latinThrough: "et munera super innocentem non accepit :",
          englishThrough: "nor taken bribes against the innocent:",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "qui facit haec", englishFrom: "He that doth these things" },
      ],
    },
  ],
  12: [
    { pieces: [{ verse: 1, dropLatinPrefix: "In finem. Psalmus David. " }] },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        { verse: 3 },
        {
          verse: 4,
          latinThrough: "Respice, et exaudi me, Domine Deus meus.",
          englishThrough: "Consider, and hear me, O Lord, my God.",
        },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "Illumina oculos meos", englishFrom: "Enlighten my eyes" },
        { verse: 5, latinThrough: "adversus eum.", englishThrough: "against him." },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "Qui tribulant me", englishFrom: "They that trouble me" },
        { verse: 6, latinThrough: "speravi.", englishThrough: "thy mercy." },
      ],
    },
    { pieces: [{ verse: 6, latinFrom: "Exsultabit cor meum", englishFrom: "My heart shall rejoice" }] },
  ],
  119: [
    { sources: [1], dropLatinPrefix: GRADUAL },
    { sources: [2] },
    { sources: [3] },
    { sources: [4] },
    { sources: [5, 6] },
    { sources: [7] },
  ],
  120: dropTitle(GRADUAL),
  121: dropTitle(GRADUAL),
  122: dropTitle(GRADUAL),
  123: dropTitle(GRADUAL),
  124: dropTitle(GRADUAL),
  125: dropTitle(GRADUAL),
  126: dropTitle("Canticum graduum Salomonis. "),
  127: dropTitle(GRADUAL),
  128: dropTitle(GRADUAL),
  129: dropTitle(GRADUAL),
  130: dropTitle("Canticum graduum David. "),
  131: dropTitle(GRADUAL),
  132: dropTitle("Canticum graduum David. "),
  133: dropTitle(GRADUAL),
};
