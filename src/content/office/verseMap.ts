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
  4: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "dilatasti mihi.",
          englishThrough: "thou hast enlarged me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Miserere mei",
          englishFrom: "Have mercy on me",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
  ],
  6: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
  ],
  90: dropTitle("Laus cantici David. "),
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
  122: [
    { pieces: [{ verse: 1, dropLatinPrefix: GRADUAL }] },
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "manibus dominorum suorum",
          englishThrough: "hands of their masters,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "sicut oculi ancillae",
          englishFrom: "As the eyes of the handmaid",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
  ],
  123: [
    {
      pieces: [
        { verse: 1, dropLatinPrefix: GRADUAL, englishFrom: "If it had not been" },
        {
          verse: 2,
          latinThrough: "nisi quia Dominus erat in nobis :",
          englishThrough: "If it had not been that the Lord was with us,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "cum exsurgerent",
          englishFrom: "When men rose up",
        },
        {
          verse: 3,
          latinThrough: "forte vivos deglutissent nos",
          englishThrough: "swallowed us up alive.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "cum irasceretur",
          englishFrom: "When their fury",
        },
        { verse: 4 },
      ],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "de laqueo venantium",
          englishThrough: "snare of the fowlers.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "laqueus contritus est",
          englishFrom: "The snare is broken",
        },
      ],
    },
    { pieces: [{ verse: 8 }] },
  ],
  124: [
    {
      pieces: [
        { verse: 1, dropLatinPrefix: GRADUAL, englishFrom: "They that trust" },
        {
          verse: 2,
          latinThrough: "in Ierusalem.",
          englishThrough: "In Jerusalem.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Montes in circuitu eius",
          englishFrom: "Mountains are round about",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
  ],
  125: [
    { pieces: [{ verse: 1, dropLatinPrefix: GRADUAL, englishFrom: "When the Lord brought back" }] },
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "et lingua nostra exsultatione.",
          englishThrough: "and our tongue with joy.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Tunc dicent inter gentes",
          englishFrom: "Then shall they say among the Gentiles",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "mittentes semina sua.",
          englishThrough: "casting their seeds.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Venientes autem",
          englishFrom: "But coming they shall come",
        },
      ],
    },
  ],
  126: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Canticum graduum Salomonis. ",
          englishFrom: "Unless the Lord build",
          latinThrough: "qui aedificant eam.",
          englishThrough: "that build it.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 1,
          latinFrom: "Nisi Dominus custodierit",
          englishFrom: "Unless the Lord keep",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "panem doloris.",
          englishThrough: "bread of sorrow.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Cum dederit",
          englishFrom: "When he shall give sleep",
        },
        { verse: 3 },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
  ],
  127: dropTitle(GRADUAL),
  128: dropTitle(GRADUAL),
  129: dropTitle(GRADUAL),
  130: dropTitle("Canticum graduum David. "),
  131: dropTitle(GRADUAL),
  132: dropTitle("Canticum graduum David. "),
  133: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: GRADUAL,
          latinThrough: "omnes servi Domini :",
          englishThrough: "all ye servants of the Lord:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 1,
          latinFrom: "qui statis in domo",
          englishFrom: "Who stand in the house",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
  ],
};
