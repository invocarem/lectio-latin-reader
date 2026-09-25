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
  15: [
    {
      pieces: [
        { verse: 1, dropLatinPrefix: "Tituli inscriptio, ipsi David. ", englishFrom: "Preserve me," },
        { verse: 2 },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "postea acceleraverunt.",
          englishThrough: "afterwards they made haste.",
        },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "Non congregabo", englishFrom: "I will not gather together" },
      ],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    {
      pieces: [
        {
          verse: 10,
          latinThrough: "videre corruptionem.",
          englishThrough: "to see corruption.",
        },
      ],
    },
    {
      pieces: [
        { verse: 10, latinFrom: "Notas mihi fecisti", englishFrom: "Thou hast made known" },
      ],
    },
  ],
  16: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Oratio David. ",
          englishFrom: "Hear,",
          latinThrough: "intende deprecationem meam.",
          englishThrough: "attend to my supplication.",
        },
      ],
    },
    {
      pieces: [
        { verse: 1, latinFrom: "Auribus percipe", englishFrom: "Give ear" },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    {
      pieces: [
        {
          verse: 8,
          latinThrough: "ut pupillam oculi.",
          englishThrough: "as the apple of thy eye.",
        },
      ],
    },
    {
      pieces: [
        { verse: 8, latinFrom: "Sub umbra", englishFrom: "Protect me" },
        {
          verse: 9,
          latinThrough: "afflixerunt.",
          englishThrough: "who have afflicted me.",
        },
      ],
    },
    {
      pieces: [
        { verse: 9, latinFrom: "Inimici mei", englishFrom: "My enemies" },
        { verse: 10 },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    {
      pieces: [
        { verse: 13 },
        {
          verse: 14,
          latinThrough: "ab inimicis manus tuae.",
          englishThrough: "From the enemies of thy hand.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "Domine, a paucis",
          latinThrough: "adimpletus est venter eorum.",
          englishFrom: "O Lord, divide them",
          englishThrough: "from thy hidden stores.",
        },
      ],
    },
    {
      pieces: [
        { verse: 14, latinFrom: "Saturati sunt", englishFrom: "They are full" },
      ],
    },
    { pieces: [{ verse: 15 }] },
  ],
  17: [
    {
      pieces: [
        { verse: 2 },
        {
          verse: 3,
          latinThrough: "et liberator meus.",
          englishThrough: "and my deliverer.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Deus meus adiutor meus",
          latinThrough: "et sperabo in eum ;",
          englishFrom: "My God is my helper",
          englishThrough: "will I put my trust.",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "protector meus", englishFrom: "My protector" },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "clamavi :",
          englishThrough: "cried to my God:",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "et exaudivit", englishFrom: "And he heard" },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    {
      pieces: [
        {
          verse: 16,
          latinThrough: "fundamenta orbis terrarum,",
          englishThrough: "were discovered:",
        },
      ],
    },
    {
      pieces: [
        { verse: 16, latinFrom: "ab increpatione tua", englishFrom: "At thy rebuke" },
      ],
    },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
    { pieces: [{ verse: 27 }] },
    { pieces: [{ verse: 28 }] },
    { pieces: [{ verse: 29 }] },
    { pieces: [{ verse: 30 }] },
    { pieces: [{ verse: 31 }] },
    { pieces: [{ verse: 32 }] },
    { pieces: [{ verse: 33 }] },
    { pieces: [{ verse: 34 }] },
    { pieces: [{ verse: 35 }] },
    {
      pieces: [
        {
          verse: 36,
          latinThrough: "suscepit me,",
          englishThrough: "held me up:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 36,
          latinFrom: "et disciplina tua correxit",
          englishFrom: "And thy discipline hath corrected",
        },
      ],
    },
    { pieces: [{ verse: 37 }] },
    { pieces: [{ verse: 38 }] },
    { pieces: [{ verse: 39 }] },
    { pieces: [{ verse: 40 }] },
    { pieces: [{ verse: 41 }] },
    { pieces: [{ verse: 42 }] },
    { pieces: [{ verse: 43 }] },
    { pieces: [{ verse: 44 }] },
    { pieces: [{ verse: 45 }] },
    { pieces: [{ verse: 46 }] },
    { pieces: [{ verse: 47 }] },
    { pieces: [{ verse: 48 }] },
    { pieces: [{ verse: 49 }] },
    { pieces: [{ verse: 50 }] },
    { pieces: [{ verse: 51 }] },
  ],
  18: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "de thalamo suo.",
          englishThrough: "coming out of his bridechamber,",
        },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "Exsultavit ut gigas", englishFrom: "Hath rejoiced" },
        {
          verse: 7,
          latinThrough: "egressio eius.",
          englishThrough: "end of heaven,",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "Et occursus eius", englishFrom: "And his circuit" },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    {
      pieces: [
        { verse: 13 },
        {
          verse: 14,
          latinThrough: "parce servo tuo.",
          englishThrough: "spare thy servant.",
        },
      ],
    },
    {
      pieces: [
        { verse: 14, latinFrom: "Si mei non fuerint", englishFrom: "If they shall have no dominion" },
      ],
    },
    {
      pieces: [
        {
          verse: 15,
          latinThrough: "in conspectu tuo semper.",
          englishThrough: "in thy sight.",
        },
      ],
    },
    {
      pieces: [
        { verse: 15, latinFrom: "Domine, adiutor meus", englishFrom: "O Lord, my helper" },
      ],
    },
  ],
  19: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "christum suum.",
          englishThrough: "saved his anointed.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "Exaudiet illum", englishFrom: "He will hear him" },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
  ],
  50: [
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "misericordiam tuam ;",
          englishThrough: "thy great mercy.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "et secundum multitudinem",
          englishFrom: "And according to the multitude",
        },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
  ],
  66: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        { verse: 6 },
        {
          verse: 7,
          latinThrough: "fructum suum :",
          englishThrough: "her fruit.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "benedicat nos Deus", englishFrom: "May God, our God bless us" },
        { verse: 8 },
      ],
    },
  ],
  75: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        { verse: 5 },
        {
          verse: 6,
          latinThrough: "corde.",
          englishThrough: "were troubled.",
        },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "Dormierunt somnum suum", englishFrom: "They have slept their sleep" },
      ],
    },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    {
      pieces: [
        {
          verse: 12,
          latinThrough: "affertis munera :",
          englishThrough: "bring presents.",
        },
      ],
    },
    {
      pieces: [
        { verse: 12, latinFrom: "terribili,", englishFrom: "To him that is terrible" },
        { verse: 13 },
      ],
    },
  ],
  91: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    {
      pieces: [
        {
          verse: 8,
          latinThrough: "operantur iniquitatem,",
          englishThrough: "shall appear:",
        },
      ],
    },
    {
      pieces: [
        { verse: 8, latinFrom: "ut intereant", englishFrom: "That they may perish" },
        { verse: 9 },
      ],
    },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    {
      pieces: [
        { verse: 15 },
        {
          verse: 16,
          latinThrough: "ut annuntient",
          englishThrough: "That they may shew,",
        },
      ],
    },
    {
      pieces: [
        { verse: 16, latinFrom: "quoniam rectus", englishFrom: "That the Lord our God is righteous" },
      ],
    },
  ],
  148: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        { verse: 4 },
        {
          verse: 5,
          latinThrough: "laudent nomen Domini.",
          englishThrough: "Praise the name of the Lord.",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "Quia ipse dixit", englishFrom: "For he spoke" },
      ],
    },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }, { verse: 13 }] },
    {
      pieces: [
        {
          verse: 14,
          latinThrough: "populi sui.",
          englishThrough: "horn of his people.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "Hymnus omnibus sanctis",
          latinThrough: "appropinquanti sibi.",
          englishFrom: "A hymn to all his saints",
          englishThrough: "approaching to him.",
        },
      ],
    },
  ],
  149: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [
        {
          verse: 9,
          latinThrough: "sanctis eius.",
          englishThrough: "his saints.",
        },
      ],
    },
  ],
  150: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        { verse: 5 },
        {
          verse: 6,
          latinThrough: "Dominum !",
          englishThrough: "praise the Lord.",
        },
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
