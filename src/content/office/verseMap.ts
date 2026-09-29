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
  /** `""` contributes no Latin, when this verse's English belongs here and its Latin was already taken. */
  latinThrough?: string;
  englishFrom?: string;
  /** `""` contributes no English, when Douay already ended on the previous line. */
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
  /** English (Douay) title of the same first verse, dropped to match. */
  dropEnglishPrefix?: string;
};

export type VerseMapEntry = OfficeLine[] | TitleDrop;

const GRADUAL = "Canticum graduum. ";

function dropTitle(dropLatinPrefix: string, dropEnglishPrefix?: string): TitleDrop {
  return { dropLatinPrefix, dropEnglishPrefix };
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
  3: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
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
  5: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "loquuntur mendacium.",
          englishThrough: "speak a lie.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Virum sanguinum",
          englishFrom: "The bloody and the deceitful man",
        },
        {
          verse: 8,
          latinThrough: "misericordiae tuae",
          englishThrough: "multitude of thy mercy,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "introibo in domum tuam",
          englishFrom: "I will come into thy house;",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    {
      pieces: [
        {
          verse: 11,
          latinThrough: "iudica illos, Deus.",
          englishThrough: "judge them, O God.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinFrom: "Decidant a cogitationibus",
          englishFrom: "Let them fall from their devices:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinThrough: "habitabis in eis.",
          englishThrough: "dwell in them.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "Et gloriabuntur",
          englishFrom: "And all they that love thy name shall glory in thee.",
        },
        {
          verse: 13,
          latinThrough: "benedices iusto.",
          englishThrough: "bless the just.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "Domine, ut scuto",
          englishFrom: "O Lord, thou hast crowned us,",
        },
      ],
    },
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
  7: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "inimicorum meorum :",
          englishThrough: "borders of my enemies.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "et exsurge, Domine Deus meus", englishFrom: "And arise" },
        {
          verse: 8,
          latinThrough: "circumdabit te :",
          englishThrough: "shall surround thee.",
        },
      ],
    },
    {
      pieces: [
        { verse: 8, latinFrom: "et propter hanc", englishFrom: "And for their sakes" },
        { verse: 9, latinThrough: "iudicat populos", englishThrough: "judgeth the people." },
      ],
    },
    { pieces: [{ verse: 9, latinFrom: "Iudica me, Domine", englishFrom: "Judge me, O Lord" }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
  ],
  8: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "in universa terra !",
          englishThrough: "in the whole earth!",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "quoniam elevata est magnificentia tua",
          englishFrom: "For thy magnificence",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }, { verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
  ],
  9: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "destruxisti.",
          englishThrough: "thou hast destroyed.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Periit memoria",
          englishFrom: "Their memory hath perished",
        },
        {
          verse: 8,
          latinThrough: "permanet.",
          englishThrough: "remaineth for ever.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "Paravit in iudicio",
          englishFrom: "He hath prepared his throne",
        },
        { verse: 9 },
      ],
    },
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
          latinThrough: "quem fecerunt ;",
          englishThrough: "which they prepared.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 16,
          latinFrom: "in laqueo isto",
          englishFrom: "Their foot hath been taken",
        },
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
    {
      pieces: [
        {
          verse: 26,
          latinThrough: "omni tempore.",
          englishThrough: "at all times.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 26,
          latinFrom: "Auferuntur iudicia",
          englishFrom: "Thy judgments are removed",
        },
      ],
    },
    { pieces: [{ verse: 27 }] },
    { pieces: [{ verse: 28 }] },
    { pieces: [{ verse: 29 }] },
    {
      pieces: [
        {
          verse: 30,
          latinThrough: "spelunca sua.",
          englishThrough: "in his den.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 30,
          latinFrom: "Insidiatur ut rapiat",
          englishFrom: "He lieth in ambush",
        },
      ],
    },
    { pieces: [{ verse: 31 }] },
    { pieces: [{ verse: 32 }] },
    { pieces: [{ verse: 33 }] },
    { pieces: [{ verse: 34 }] },
    {
      pieces: [
        {
          verse: 35,
          latinThrough: "manus tuas.",
          englishThrough: "into thy hands.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 35,
          latinFrom: "Tibi derelictus",
          englishFrom: "To thee is the poor man left",
        },
      ],
    },
    { pieces: [{ verse: 36 }] },
    { pieces: [{ verse: 37 }] },
    { pieces: [{ verse: 38 }] },
    { pieces: [{ verse: 39 }] },
  ],
  10: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "sedes eius.",
          englishThrough: "is in heaven.",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "Oculi eius", englishFrom: "His eyes look" },
      ],
    },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
  ],
  11: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "dicit Dominus.",
          englishThrough: "saith the Lord.",
        },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "Ponam in salutari", englishFrom: "I will set him in safety" },
      ],
    },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
  90: dropTitle("Laus cantici David. ", "The praise of a canticle for David. "),
  13: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "In finem. Psalmus David. ",
          latinThrough: "Non est Deus.",
          englishFrom: "The fool hath said",
          englishThrough: "There is no God.",
        },
      ],
    },
    {
      pieces: [
        { verse: 1, latinFrom: "Corrupti sunt", englishFrom: "They are corrupt" },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "non est usque ad unum.",
          englishThrough: "no not one.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Sepulchrum patens",
          latinThrough: "sub labiis eorum,",
          englishFrom: "Their throat",
          englishThrough: "under their lips.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "quorum os",
          latinThrough: "ad effundendum sanguinem.",
          englishFrom: "Their mouth",
          englishThrough: "to shed blood.",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "Contritio et infelicitas", englishFrom: "Destruction" },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
  ],
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
  20: [
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
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
  ],
  21: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    {
      pieces: [
        { verse: 11 },
        {
          verse: 12,
          latinThrough: "ne discesseris a me,",
          englishThrough: "Depart not from me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "quoniam tribulatio proxima est",
          englishFrom: "For tribulation is very near",
        },
      ],
    },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    {
      pieces: [
        {
          verse: 15,
          latinThrough: "omnia ossa mea :",
          englishThrough: "all my bones are scattered.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 15,
          latinFrom: "factum est cor meum",
          englishFrom: "My heart is become like wax",
        },
      ],
    },
    { pieces: [{ verse: 16 }] },
    {
      pieces: [
        {
          verse: 17,
          latinThrough: "obsedit me.",
          englishThrough: "hath besieged me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 17,
          latinFrom: "Foderunt manus meas",
          englishFrom: "They have dug my hands and feet.",
        },
        {
          verse: 18,
          latinThrough: "dinumeraverunt omnia ossa mea.",
          englishThrough: "numbered all my bones.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 18,
          latinFrom: "Ipsi vero consideraverunt",
          englishFrom: "And they have looked and stared upon me.",
        },
        { verse: 19 },
      ],
    },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    {
      pieces: [
        {
          verse: 25,
          latinThrough: "deprecationem pauperis,",
          englishThrough: "the poor man.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 25,
          latinFrom: "nec avertit faciem suam",
          englishFrom: "Neither hath he turned away",
        },
      ],
    },
    { pieces: [{ verse: 26 }] },
    { pieces: [{ verse: 27 }] },
    {
      pieces: [
        {
          verse: 28,
          latinThrough: "universi fines terrae ;",
          englishThrough: "converted to the Lord:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 28,
          latinFrom: "et adorabunt in conspectu eius",
          englishFrom: "And all the kindreds",
        },
      ],
    },
    { pieces: [{ verse: 29 }] },
    { pieces: [{ verse: 30 }] },
    { pieces: [{ verse: 31 }] },
    { pieces: [{ verse: 32 }] },
  ],
  22: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus David. ",
          latinThrough: "et nihil mihi deerit :",
          englishFrom: "The Lord ruleth me",
          englishThrough: "I shall want nothing.",
        },
        {
          verse: 2,
          latinThrough: "ibi me collocavit.",
          englishFrom: "He hath set me in a place of pasture",
          englishThrough: "a place of pasture.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Super aquam refectionis",
          latinThrough: "educavit me ;",
          englishFrom: "He hath brought me up",
          englishThrough: "on the water of refreshment:",
        },
        {
          verse: 3,
          latinThrough: "animam meam convertit.",
          englishThrough: "He hath converted my soul.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Deduxit me super semitas iustitiae",
          englishFrom: "He hath led me",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "quoniam tu mecum es.",
          englishThrough: "for thou art with me.",
        },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "Virga tua", englishFrom: "Thy rod" },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "qui tribulant me ;",
          englishThrough: "them that afflict me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "impinguasti in oleo caput meum",
          englishFrom: "Thou hast anointed my head with oil",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "omnibus diebus vitae meae ;",
          englishThrough: "all the days of my life.",
        },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "et ut inhabitem", englishFrom: "And that I may dwell" },
      ],
    },
  ],
  23: dropTitle("Prima sabbati. Psalmus David. "),
  24: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "In finem. Psalmus David. ",
          englishFrom: "To thee, O Lord, have I lifted up my soul",
        },
        { verse: 2 },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "supervacue",
          englishThrough: "without cause.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Vias tuas, Domine",
          englishFrom: "Shew, O Lord, thy ways to me",
        },
      ],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "ne memineris",
          englishThrough: "do not remember.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Secundum misericordiam tuam",
          englishFrom: "According to thy mercy",
        },
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
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
  ],
  25: dropTitle("In finem. Psalmus David. "),
  26: dropTitle("Psalmus David, priusquam liniretur. "),
  27: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus ipsi David. ",
          englishFrom: "Unto thee will I cry",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        { verse: 3, latinThrough: "ne perdas me ;", englishThrough: "destroy me not:" },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "qui loquuntur pacem", englishFrom: "Who speak peace" },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "adinventionum ipsorum.",
          englishThrough: "their inventions.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Secundum opera manuum eorum",
          englishFrom: "According to the works of their hands",
        },
      ],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        { verse: 7, latinThrough: "adiutus sum :", englishThrough: "I have been helped." },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "et refloruit caro mea", englishFrom: "And my flesh" },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
  28: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus David, in consummatione tabernaculi. ",
          englishFrom: "Bring to the Lord",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }, { verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
  ],
  29: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "in voluntate eius :",
          englishThrough: "in his good will.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "ad vesperum demorabitur",
          englishFrom: "In the evening weeping",
        },
      ],
    },
    { pieces: [{ verse: 7 }] },
    {
      pieces: [
        {
          verse: 8,
          latinThrough: "decori meo virtutem ;",
          englishThrough: "to my beauty.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "avertisti faciem tuam",
          englishFrom: "Thou turnedst away thy face",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    {
      pieces: [
        {
          verse: 10,
          latinThrough: "in corruptionem ?",
          englishThrough: "to corruption?",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "numquid confitebitur",
          englishFrom: "Shall dust confess",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
  ],
  30: [
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "accelera ut eruas me.",
          englishThrough: "make haste to deliver me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Esto mihi in Deum protectorem",
          englishFrom: "Be thou unto me a God",
        },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "supervacue ;",
          englishThrough: "to no purpose.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "ego autem in Domino speravi.",
          englishFrom: "But I have hoped in the Lord:",
        },
        {
          verse: 8,
          latinThrough: "in misericordia tua,",
          englishThrough: "in thy mercy.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "quoniam respexisti humilitatem meam",
          englishFrom: "For thou hast regarded my humility",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    {
      pieces: [
        {
          verse: 11,
          latinThrough: "in gemitibus.",
          englishThrough: "in sighs.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinFrom: "Infirmata est in paupertate",
          englishFrom: "My strength is weakened",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinThrough: "et timor notis meis ;",
          englishThrough: "and a fear to my acquaintance.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "qui videbant me foras fugerunt a me.",
          englishFrom: "They that saw me without fled from me.",
        },
        {
          verse: 13,
          latinThrough: "tamquam mortuus a corde ;",
          englishThrough: "from the heart.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "factus sum tamquam vas perditum",
          englishFrom: "I am become as a vessel that is destroyed.",
        },
        {
          verse: 14,
          latinThrough: "in circuitu.",
          englishThrough: "round about.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "In eo dum convenirent",
          englishFrom: "While they assembled together against me",
        },
      ],
    },
    {
      pieces: [
        { verse: 15 },
        {
          verse: 16,
          latinThrough: "sortes meae :",
          englishThrough: "in thy hands.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 16,
          latinFrom: "eripe me de manu",
          englishFrom: "Deliver me out of the hands",
        },
      ],
    },
    {
      pieces: [
        { verse: 17 },
        {
          verse: 18,
          latinThrough: "quoniam invocavi te.",
          englishThrough: "I have called upon thee.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 18,
          latinFrom: "Erubescant impii",
          englishFrom: "Let the wicked be ashamed",
        },
        {
          verse: 19,
          latinThrough: "labia dolosa,",
          englishThrough: "be made dumb.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 19,
          latinFrom: "quae loquuntur adversus iustum",
          englishFrom: "Which speak iniquity",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 20,
          latinThrough: "timentibus te ;",
          englishThrough: "that fear thee!",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 20,
          latinFrom: "perfecisti eis qui sperant",
          englishFrom: "Which thou hast wrought",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 21,
          latinThrough: "conturbatione hominum ;",
          englishThrough: "disturbance of men.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 21,
          latinFrom: "proteges eos in tabernaculo",
          englishFrom: "Thou shalt protect them",
        },
      ],
    },
    { pieces: [{ verse: 22 }] },
    {
      pieces: [
        {
          verse: 23,
          latinThrough: "oculorum tuorum :",
          englishThrough: "before thy eyes.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 23,
          latinFrom: "ideo exaudisti vocem",
          englishFrom: "Therefore thou hast heard",
        },
      ],
    },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
  ],
  31: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Ipsi David intellectus. ",
          englishFrom: "Blessed are they",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "non abscondi.",
          englishThrough: "not concealed.",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "Dixi :", englishFrom: "I said I will confess" },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "in tempore opportuno.",
          englishThrough: "a seasonable time.",
        },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "Verumtamen", englishFrom: "And yet" },
      ],
    },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [
        {
          verse: 9,
          latinThrough: "non est intellectus.",
          englishThrough: "no understanding.",
        },
      ],
    },
    {
      pieces: [
        { verse: 9, latinFrom: "In camo et freno", englishFrom: "With bit and bridle" },
      ],
    },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
  ],
  32: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus David. ",
          englishFrom: "Rejoice in the Lord",
        },
      ],
    },
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
    { pieces: [{ verse: 22 }] },
  ],
  33: [
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
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
  ],
  34: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Ipsi David. ",
          englishFrom: "Judge thou, O Lord,",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "animam meam ;",
          englishThrough: "my soul.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "avertantur retrorsum",
          englishFrom: "Let them be turned back",
        },
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
          latinThrough: "quis similis tibi ?",
          englishThrough: "like to thee?",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "eripiens inopem",
          englishFrom: "Who deliverest the poor",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    {
      pieces: [
        {
          verse: 13,
          latinThrough: "induebar cilicio ;",
          englishThrough: "haircloth.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "humiliabam in ieiunio",
          englishFrom: "I humbled my soul",
        },
      ],
    },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    {
      pieces: [
        {
          verse: 26,
          latinThrough: "malis meis ;",
          englishThrough: "my evils.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 26,
          latinFrom: "induantur confusione",
          englishFrom: "Let them be clothed with confusion",
        },
      ],
    },
    { pieces: [{ verse: 27 }] },
    { pieces: [{ verse: 28 }] },
  ],
  35: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "abyssus multa.",
          englishThrough: "a great deep.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Homines et iumenta salvabis, Domine,",
          englishFrom: "Men and beasts thou wilt preserve, O Lord:",
        },
        {
          verse: 8,
          latinThrough: "misericordiam tuam, Deus.",
          englishThrough: "O God!",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "Filii autem hominum",
          englishFrom: "But the children of men",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
  ],
  36: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus ipsi David. ",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        { verse: 6 },
        {
          verse: 7,
          latinThrough: "et ora eum.",
          englishThrough: "pray to him.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Noli aemulari in eo",
          englishFrom: "Envy not the man",
        },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    {
      pieces: [
        {
          verse: 14,
          latinThrough: "arcum suum :",
          englishThrough: "their bow.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "ut deiiciant",
          englishFrom: "To cast down the poor",
        },
      ],
    },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    {
      pieces: [
        { verse: 19 },
        {
          verse: 20,
          latinThrough: "quia peccatores peribunt.",
          englishThrough: "shall perish.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 20,
          latinFrom: "Inimici vero",
          englishFrom: "And the enemies of the Lord,",
        },
      ],
    },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
    { pieces: [{ verse: 27 }] },
    {
      pieces: [
        {
          verse: 28,
          latinThrough: "in aeternum conservabuntur.",
          englishThrough: "for ever.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 28,
          latinFrom: "Iniusti punientur",
          englishFrom: "The unjust shall be punished,",
        },
      ],
    },
    { pieces: [{ verse: 29 }] },
    { pieces: [{ verse: 30 }] },
    { pieces: [{ verse: 31 }] },
    { pieces: [{ verse: 32 }] },
    { pieces: [{ verse: 33 }] },
    { pieces: [{ verse: 34 }] },
    { pieces: [{ verse: 35 }] },
    { pieces: [{ verse: 36 }] },
    { pieces: [{ verse: 37 }] },
    { pieces: [{ verse: 38 }] },
    { pieces: [{ verse: 39 }] },
    { pieces: [{ verse: 40 }] },
  ],
  37: [
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
    {
      pieces: [
        {
          verse: 12,
          latinThrough: "appropinquaverunt, et steterunt ;",
          englishThrough: "stood against me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "et qui iuxta me erant",
          englishFrom: "And they that were near me stood afar off:",
        },
        {
          verse: 13,
          latinThrough: "",
          englishThrough: "used violence.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "Et qui inquirebant",
          englishFrom: "And they that sought evils to me",
        },
      ],
    },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
  ],
  38: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "in lingua mea.",
          englishThrough: "with my tongue.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Posui ori meo",
          englishFrom: "I have set a guard to my mouth",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "finem meum,",
          englishThrough: "know my end.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "et numerum dierum meorum",
          englishFrom: "And what is the number of my days:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "ante te.",
          englishThrough: "before thee.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Verumtamen universa",
          englishFrom: "And indeed all things are vanity:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "conturbatur :",
          englishThrough: "in vain.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "thesaurizat",
          englishFrom: "He storeth up:",
        },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    {
      pieces: [
        { verse: 10 },
        {
          verse: 11,
          englishThrough: "from me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinThrough: "",
          englishFrom: "The strength of thy hand hath made me faint in rebukes:",
        },
        {
          verse: 12,
          latinThrough: "corripuisti hominem.",
          englishThrough: "for iniquity.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "Et tabescere fecisti",
          englishFrom: "And thou hast made his soul",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinThrough: "lacrimas meas.",
          englishThrough: "to my tears.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "Ne sileas",
          englishFrom: "Be no silent:",
        },
      ],
    },
    { pieces: [{ verse: 14 }] },
  ],
  39: [
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "de luto faecis.",
          englishThrough: "mire of dregs.",
        },
      ],
    },
    {
      pieces: [{ verse: 3, latinFrom: "Et statuit", englishFrom: "And he set my feet" }],
    },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "carmen Deo nostro.",
          englishThrough: "to our God.",
        },
      ],
    },
    {
      pieces: [{ verse: 4, latinFrom: "Videbunt multi", englishFrom: "Many shall see" }],
    },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "similis sit tibi.",
          englishThrough: "like to thee.",
        },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "Annuntiavi et locutus sum", englishFrom: "I have declared" },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "perfecisti mihi.",
          englishThrough: "ears for me.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "Holocaustum", englishFrom: "Burnt offering" },
        { verse: 8, latinThrough: "Ecce venio.", englishThrough: "Behold I come." },
      ],
    },
    {
      pieces: [
        { verse: 8, latinFrom: "In capite libri", englishFrom: "In the head of the book" },
        { verse: 9 },
      ],
    },
    { pieces: [{ verse: 10 }] },
    {
      pieces: [
        {
          verse: 11,
          latinThrough: "salutare tuum dixi",
          englishThrough: "thy salvation.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinFrom: "non abscondi misericordiam",
          englishFrom: "I have not concealed",
        },
      ],
    },
    { pieces: [{ verse: 12 }] },
    {
      pieces: [
        {
          verse: 13,
          latinThrough: "ut viderem.",
          englishThrough: "able to see.",
        },
      ],
    },
    {
      pieces: [
        { verse: 13, latinFrom: "Multiplicatae sunt", englishFrom: "They are multiplied" },
      ],
    },
    { pieces: [{ verse: 14 }] },
    {
      pieces: [
        {
          verse: 15,
          latinThrough: "ut auferant eam",
          englishThrough: "take it away.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 15,
          latinFrom: "convertantur retrorsum",
          englishFrom: "Let them be turned backward",
        },
      ],
    },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    {
      pieces: [
        {
          verse: 18,
          latinThrough: "sollicitus est mei.",
          englishThrough: "careful for me.",
        },
      ],
    },
    {
      pieces: [
        { verse: 18, latinFrom: "Adiutor meus", englishFrom: "Thou art my helper" },
      ],
    },
  ],
  40: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "iniquitatem sibi.",
          englishThrough: "to itself.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Egrediebatur foras",
          englishFrom: "He went out and spoke to the same purpose.",
        },
        {
          verse: 8,
          latinThrough: "In idipsum",
          englishThrough: "",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "adversum me susurrabant",
          englishFrom: "All my enemies whispered together",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
  ],
  41: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "domum Dei,",
          englishThrough: "house of God:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "in voce exsultationis",
          englishFrom: "With the voice of joy",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "conturbas me ?",
          englishThrough: "trouble me?",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Spera in Deo",
          englishFrom: "Hope in God",
        },
        {
          verse: 7,
          latinThrough: "et Deus meus.",
          englishThrough: "And my God.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Ad meipsum",
          englishFrom: "My soul is troubled within my self:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinThrough: "cataractarum tuarum ;",
          englishThrough: "flood-gates.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "omnia excelsa tua",
          englishFrom: "All thy heights",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinThrough: "canticum eius ;",
          englishThrough: "in the night.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "apud me oratio",
          englishFrom: "With me is prayer",
        },
        {
          verse: 10,
          latinThrough: "Susceptor meus es",
          englishThrough: "my support.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "quare oblitus es mei",
          englishFrom: "Why hast thou forgotten me?",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinThrough: "inimici mei,",
          englishThrough: "reproached me;",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinFrom: "dum dicunt mihi",
          englishFrom: "Whilst they say to me",
        },
        {
          verse: 12,
          latinThrough: "conturbas me ?",
          englishThrough: "disquiet me?",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "Spera in Deo",
          englishFrom: "Hope thou in God",
        },
      ],
    },
  ],
  43: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "annuntiaverunt nobis,",
          englishThrough: "declared to us,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "opus quod operatus",
          englishFrom: "The work thou hast wrought",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "non salvavit eos",
          englishThrough: "save them.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "sed dextera tua",
          englishFrom: "But thy right hand",
        },
      ],
    },
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
    {
      pieces: [
        {
          verse: 22,
          latinThrough: "abscondita cordis.",
          englishThrough: "of the heart.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 22,
          latinFrom: "Quoniam propter te",
          englishFrom: "Because for thy sake",
        },
      ],
    },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
  ],
  44: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "opera mea regi.",
          englishThrough: "to the king:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Lingua mea",
          englishFrom: "My tongue is the pen",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "et regna,",
          englishThrough: "and reign.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "propter veritatem",
          englishFrom: "Because of truth",
        },
      ],
    },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [
        { verse: 9 },
        {
          verse: 10,
          latinThrough: "in honore tuo.",
          englishThrough: "in thy glory.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "Astitit regina",
          englishFrom: "The queen stood",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    {
      pieces: [
        { verse: 14 },
        {
          verse: 15,
          latinThrough: "circumamicta varietatibus.",
          englishThrough: "with varieties.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 15,
          latinFrom: "Adducentur regi",
          englishFrom: "After her shall virgins",
        },
      ],
    },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    {
      pieces: [
        {
          verse: 18,
          latinThrough: "generationem",
          englishThrough: "all generations.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 18,
          latinFrom: "propterea populi",
          englishFrom: "Therefore shall people praise",
        },
      ],
    },
  ],
  45: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [
        { verse: 9 },
        {
          verse: 10,
          latinThrough: "finem terrae.",
          englishThrough: "of the earth.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "Arcum conteret",
          englishFrom: "He shall destroy the bow,",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
  ],
  46: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
  ],
  47: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        { verse: 6 },
        {
          verse: 7,
          latinThrough: "apprehendit eos",
          englishThrough: "took hold of them.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "ibi dolores",
          englishFrom: "There were pains",
        },
        { verse: 8 },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
  ],
  48: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [
        { verse: 9 },
        { verse: 10 },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinThrough: "stultus peribunt.",
          englishThrough: "perish together:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinFrom: "Et relinquent alienis",
          englishFrom: "And they shall leave their riches",
        },
        {
          verse: 12,
          latinThrough: "in aeternum ;",
          englishThrough: "for ever.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "tabernacula eorum",
          englishFrom: "Their dwelling places",
        },
      ],
    },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    {
      pieces: [
        {
          verse: 15,
          latinThrough: "mors depascet eos.",
          englishThrough: "feed upon them.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 15,
          latinFrom: "Et dominabuntur",
          englishFrom: "And the just shall have dominion",
        },
      ],
    },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
  ],
  49: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus Asaph. ",
          latinThrough: "vocavit terram",
          englishFrom: "The God of gods",
          englishThrough: "the earth.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 1,
          latinFrom: "a solis ortu",
          englishFrom: "From the rising of the sun",
        },
        { verse: 2 },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "non silebit.",
          englishThrough: "keep silence.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Ignis in conspectu",
          englishFrom: "A fire shall burn",
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
    {
      pieces: [
        { verse: 20 },
        {
          verse: 21,
          latinThrough: "et tacui.",
          englishThrough: "I was silent.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 21,
          latinFrom: "Existimasti",
          englishFrom: "Thou thoughtest unjustly",
        },
      ],
    },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
  ],
  42: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus David. ",
          englishFrom: "Judge me, O God",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "iuventutem meam.",
          englishThrough: "joy to my youth.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Confitebor tibi",
          englishFrom: "To thee, O God my God",
        },
        {
          verse: 5,
          latinThrough: "conturbas me ?",
          englishThrough: "disquiet me?",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "Spera in Deo", englishFrom: "Hope in God" },
      ],
    },
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
  51: [
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    {
      pieces: [
        { verse: 8 },
        {
          verse: 9,
          latinThrough: "adiutorem suum ;",
          englishThrough: "his helper:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "sed speravit",
          englishFrom: "But trusted in the abundance",
        },
      ],
    },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
  ],
  52: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "In finem, pro Ma\u00ebleth intelligentiae David. ",
          englishFrom: "The fool said in his heart:",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "ubi non erat timor.",
          englishThrough: "no fear.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Quoniam Deus dissipavit",
          englishFrom: "For God hath scattered",
        },
      ],
    },
    { pieces: [{ verse: 7 }] },
  ],
  53: [
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
  54: [
    {
      pieces: [
        { verse: 2 },
        {
          verse: 3,
          latinThrough: "exaudi me.",
          englishThrough: "hear me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Contristatus sum",
          englishFrom: "I am grieved in my exercise",
        },
        {
          verse: 4,
          latinThrough: "tribulatione peccatoris.",
          englishThrough: "of the sinner.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Quoniam declinaverunt",
          englishFrom: "For they have cast iniquities upon me:",
        },
      ],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    {
      pieces: [
        { verse: 11 },
        {
          verse: 12,
          latinThrough: "et iniustitia :",
          englishThrough: "And injustice.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "et non defecit",
          englishFrom: "And usury and deceit",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinThrough: "sustinuissem utique.",
          englishThrough: "borne with it.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "Et si is qui oderat",
          englishFrom: "And if he that hated me",
        },
      ],
    },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    {
      pieces: [
        {
          verse: 16,
          latinThrough: "viventes :",
          englishThrough: "into hell.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 16,
          latinFrom: "quoniam nequitiae",
          englishFrom: "For there is wickedness",
        },
      ],
    },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    {
      pieces: [
        {
          verse: 20,
          latinThrough: "ante saecula.",
          englishThrough: "humble them.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 20,
          latinFrom: "Non enim est illis",
          englishFrom: "For there is no change with them",
        },
        {
          verse: 21,
          latinThrough: "in retribuendo ;",
          englishThrough: "to repay.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 21,
          latinFrom: "contaminaverunt testamentum",
          englishFrom: "They have defiled his covenant,",
        },
        {
          verse: 22,
          latinThrough: "appropinquavit cor illius.",
          englishThrough: "drawn near.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 22,
          latinFrom: "Molliti sunt",
          englishFrom: "His words are smoother than oil",
        },
      ],
    },
    { pieces: [{ verse: 23 }] },
    {
      pieces: [
        {
          verse: 24,
          latinThrough: "interitus.",
          englishThrough: "of destruction.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 24,
          latinFrom: "Viri sanguinum",
          englishFrom: "Bloody and deceitful men",
        },
      ],
    },
  ],
  55: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "observabunt.",
          englishThrough: "watch my heel.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Sicut sustinuerunt",
          englishFrom: "As they have waited for my soul,",
        },
        {
          verse: 8,
          englishThrough: "in pieces.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinThrough: "",
          englishFrom: "O God,",
        },
        {
          verse: 9,
          latinThrough: "in conspectu tuo,",
          englishThrough: "in thy sight,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "sicut et in promissione",
          englishFrom: "As also in thy promise.",
        },
        {
          verse: 10,
          latinThrough: "retrorsum.",
          englishThrough: "turned back.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "In quacumque die",
          englishFrom: "In what day soever",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
  ],
  56: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "anima mea.",
          englishThrough: "trusteth in thee.",
        },
      ],
    },
    {
      pieces: [
        { verse: 2, latinFrom: "Et in umbra", englishFrom: "And in the shadow" },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "conculcantes me.",
          englishThrough: "trod upon me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Misit Deus misericordiam",
          englishFrom: "God hath sent his mercy",
        },
        {
          verse: 5,
          latinThrough: "Dormivi conturbatus.",
          englishThrough: "I slept troubled.",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "Filii hominum", englishFrom: "The sons of men" },
      ],
    },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "animam meam.",
          englishThrough: "bowed down my soul.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "Foderunt ante", englishFrom: "They dug a pit" },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
  ],
  57: [
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
    { pieces: [{ verse: 12 }] },
  ],
  58: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "Deus Israël,",
          englishThrough: "the God of Israel.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "intende ad visitandas",
          englishFrom: "Attend to visit",
        },
      ],
    },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    {
      pieces: [
        { verse: 10 },
        { verse: 11 },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinThrough: "populi mei.",
          englishThrough: "my people forget.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "Disperge illos",
          englishFrom: "Scatter them",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinThrough: "superbia sua.",
          englishThrough: "in their pride.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "Et de execratione",
          englishFrom: "And for their cursing",
        },
        {
          verse: 14,
          latinThrough: "non erunt.",
          englishThrough: "shall be no more.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "Et scient quia",
          englishFrom: "And they shall know",
        },
      ],
    },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    {
      pieces: [
        {
          verse: 17,
          latinThrough: "misericordiam tuam :",
          englishThrough: "in the morning.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 17,
          latinFrom: "quia factus es",
          englishFrom: "For thou art become",
        },
      ],
    },
    { pieces: [{ verse: 18 }] },
  ],
  59: [
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "facie arcus ;",
          englishThrough: "before the bow:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "ut liberentur",
          englishFrom: "That thy beloved",
        },
        { verse: 7 },
      ],
    },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [
        {
          verse: 9,
          latinThrough: "capitis mei.",
          englishThrough: "strength of my head.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "Iuda rex meus",
          englishFrom: "Juda is my king:",
        },
        {
          verse: 10,
          latinThrough: "spei meae.",
          englishThrough: "pot of my hope.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "In Idumaeam",
          englishFrom: "Into Edom",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
  ],
  60: [
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "exaltasti me.",
          englishThrough: "on a rock.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Deduxisti me",
          englishFrom: "Thou hast conducted me",
        },
        { verse: 4 },
      ],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
  61: [
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
    {
      pieces: [
        { verse: 12 },
        { verse: 13 },
      ],
    },
  ],
  62: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "de luce vigilo.",
          englishThrough: "break of day.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Sitivit in te",
          englishFrom: "For thee my soul",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        { verse: 7 },
        {
          verse: 8,
          latinThrough: "adiutor meus,",
          englishThrough: "my helper.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "et in velamento",
          englishFrom: "And I will rejoice",
        },
        { verse: 9 },
      ],
    },
    {
      pieces: [
        { verse: 10 },
        { verse: 11 },
      ],
    },
    { pieces: [{ verse: 12 }] },
  ],
  63: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        { verse: 4 },
        { verse: 5 },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "sermonem nequam.",
          englishThrough: "resolute in wickedness.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Narraverunt ut",
          englishFrom: "They have talked",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "scrutinio.",
          englishThrough: "in their search.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Accedet homo",
          englishFrom: "Man shall come",
        },
        {
          verse: 8,
          latinThrough: "exaltabitur Deus.",
          englishThrough: "shall be exalted.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "Sagittae parvulorum",
          englishFrom: "The arrows of children",
        },
        {
          verse: 9,
          latinThrough: "linguae eorum.",
          englishThrough: "are made weak.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "Conturbati sunt",
          englishFrom: "All that saw",
        },
        {
          verse: 10,
          latinThrough: "omnis homo.",
          englishThrough: "was afraid.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "Et annuntiaverunt",
          englishFrom: "And they declared",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
  ],
  64: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "atriis tuis.",
          englishThrough: "in thy courts.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "Replebimur in bonis",
          englishFrom: "We shall be filled",
        },
        {
          verse: 6,
          latinThrough: "in aequitate.",
          englishThrough: "in justice.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Exaudi nos",
          englishFrom: "Hear us, O God",
        },
      ],
    },
    {
      pieces: [
        { verse: 7 },
        {
          verse: 8,
          latinThrough: "fluctuum eius.",
          englishThrough: "of its waves.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "Turbabuntur gentes",
          englishFrom: "The Gentiles shall be troubled",
        },
        { verse: 9 },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinThrough: "locupletare eam.",
          englishThrough: "enriched it.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "Flumen Dei",
          englishFrom: "The river of God",
        },
      ],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
  ],
  65: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "In finem. Canticum psalmi resurrectionis. ",
          englishFrom: "Shout with joy to God, all the earth,",
        },
        { verse: 2 },
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
    {
      pieces: [
        { verse: 11 },
        {
          verse: 12,
          latinThrough: "capita nostra.",
          englishThrough: "over our heads.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "Transivimus per",
          englishFrom: "We have passed",
        },
      ],
    },
    {
      pieces: [
        { verse: 13 },
        {
          verse: 14,
          latinThrough: "labia mea :",
          englishThrough: "have uttered,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "et locutum est",
          englishFrom: "And my mouth",
        },
      ],
    },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
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
  67: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "Dominus nomen illi",
          englishThrough: "the Lord is his name.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "exsultate in conspectu eius",
          englishFrom: "Rejoice ye before him",
        },
        {
          verse: 6,
          latinThrough: "iudicis viduarum",
          englishThrough: "and the judge of widows.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Deus in loco sancto suo",
          englishFrom: "God in his holy place",
        },
        {
          verse: 7,
          latinThrough: "in domo",
          englishThrough: "to dwell in a house:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "qui educit vinctos",
          englishFrom: "Who bringeth out them that were bound in strength",
        },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
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
          latinThrough: "mons pinguis",
          englishThrough: "is a fat mountain.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 16,
          latinFrom: "mons coagulatus",
          englishFrom: "A curdled mountain",
        },
        {
          verse: 17,
          latinThrough: "montes coagulatos",
          englishThrough: "ye curdled mountains?",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 17,
          latinFrom: "mons in quo beneplacitum",
          englishFrom: "A mountain in which God is well pleased to dwell",
        },
      ],
    },
    { pieces: [{ verse: 18 }] },
    {
      pieces: [
        {
          verse: 19,
          latinThrough: "accepisti dona in hominibus",
          englishThrough: "thou hast received gifts in men.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 19,
          latinFrom: "etenim non credentes",
          englishFrom: "Yea for those also that do not believe",
        },
      ],
    },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
    { pieces: [{ verse: 27 }] },
    {
      pieces: [
        {
          verse: 28,
          latinThrough: "in mentis excessu",
          englishThrough: "in ecstasy of mind.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 28,
          latinFrom: "principes Iuda",
          englishFrom: "The princes of Juda are their leaders",
        },
      ],
    },
    { pieces: [{ verse: 29 }] },
    { pieces: [{ verse: 30 }] },
    {
      pieces: [
        {
          verse: 31,
          latinThrough: "probati sunt argento",
          englishThrough: "who are tried with silver.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 31,
          latinFrom: "Dissipa gentes",
          englishFrom: "Scatter thou the nations",
        },
        { verse: 32 },
      ],
    },
    {
      pieces: [
        {
          verse: 33,
          latinThrough: "psallite Domino",
          englishThrough: "sing ye to the Lord:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 33,
          latinFrom: "psallite Deo",
          englishFrom: "Sing ye to God,",
        },
        {
          verse: 34,
          latinThrough: "ad orientem",
          englishThrough: "to the east.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 34,
          latinFrom: "ecce dabit",
          englishFrom: "Behold he will give to his voice the voice of power",
        },
        { verse: 35 },
      ],
    },
    { pieces: [{ verse: 36 }] },
  ],
  68: [
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "non est substantia.",
          englishThrough: "no sure standing.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Veni in altitudinem",
          englishFrom: "I am come into the depth",
        },
      ],
    },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "oderunt me gratis.",
          englishThrough: "without cause.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "Confortati sunt",
          englishFrom: "My enemies are grown strong",
        },
      ],
    },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "Domine virtutum ;",
          englishThrough: "the Lord of hosts.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "non confundantur",
          englishFrom: "Let them not be confounded",
        },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    {
      pieces: [
        {
          verse: 14,
          latinThrough: "beneplaciti, Deus.",
          englishThrough: "O God.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "In multitudine misericordiae",
          englishFrom: "In the multitude of thy mercy",
        },
      ],
    },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    {
      pieces: [
        {
          verse: 21,
          latinThrough: "et miseriam :",
          englishThrough: "reproach and misery.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 21,
          latinFrom: "et sustinui qui simul",
          englishFrom: "And I looked for one",
        },
      ],
    },
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
          latinThrough: "civitates Iuda,",
          englishThrough: "shall be built up.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 36,
          latinFrom: "et inhabitabunt ibi",
          englishFrom: "And they shall dwell there,",
        },
      ],
    },
    { pieces: [{ verse: 37 }] },
  ],
  69: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "mihi mala ;",
          englishThrough: "evils to me:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "avertantur statim",
          englishFrom: "Let them be presently",
        },
      ],
    },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "adiuva me.",
          englishThrough: "help me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Adiutor meus",
          englishFrom: "Thou art my helper",
        },
      ],
    },
  ],
  70: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus David, filiorum Ionadab, et priorum captivorum. ",
          englishFrom: "In thee, O Lord",
        },
        {
          verse: 2,
          latinThrough: "eripe me :",
          englishThrough: "rescue me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "inclina ad me",
          englishFrom: "Incline thy ear",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "salvum me facias :",
          englishThrough: "make me safe.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "quoniam firmamentum",
          englishFrom: "For thou art my firmament",
        },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "protector meus ;",
          englishThrough: "my protector.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "in te cantatio",
          englishFrom: "Of thee I shall",
        },
        { verse: 7 },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    {
      pieces: [
        {
          verse: 15,
          latinThrough: "salutare tuum.",
          englishThrough: "all the day long.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 15,
          latinFrom: "Quoniam non cognovi",
          englishFrom: "Because I have not known",
        },
        { verse: 16 },
      ],
    },
    { pieces: [{ verse: 17 }] },
    {
      pieces: [
        {
          verse: 18,
          latinThrough: "ne derelinquas me,",
          englishThrough: "forsake me not,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 18,
          latinFrom: "donec annuntiem",
          latinThrough: "ventura est,",
          englishFrom: "Until I shew",
          englishThrough: "is to come:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 18,
          latinFrom: "potentiam tuam",
          englishFrom: "Thy power,",
        },
        { verse: 19 },
      ],
    },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
  ],
  71: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "filio regis ;",
          englishThrough: "thy justice:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "iudicare populum",
          englishFrom: "To judge thy people",
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
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    {
      pieces: [
        {
          verse: 17,
          latinThrough: "permanet nomen eius.",
          englishThrough: "before the sun.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 17,
          latinFrom: "Et benedicentur",
          englishFrom: "And in him shall",
        },
      ],
    },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
  ],
  72: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus Asaph. ",
          englishFrom: "How good is God",
        },
      ],
    },
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
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    {
      pieces: [
        { verse: 21 },
        { verse: 22 },
      ],
    },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
    { pieces: [{ verse: 27 }] },
    {
      pieces: [
        {
          verse: 28,
          latinThrough: "spem meam :",
          englishThrough: "the Lord God:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 28,
          latinFrom: "ut annuntiem",
          englishFrom: "That I may declare",
        },
      ],
    },
  ],
  73: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Intellectus Asaph. ",
          englishFrom: "O God, why hast thou",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "ab initio.",
          englishThrough: "from the beginning.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Redemisti virgam",
          englishFrom: "The sceptre of thy inheritance",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "solemnitatis tuae ;",
          englishThrough: "thy solemnity.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "posuerunt signa",
          englishFrom: "They have set up",
        },
        {
          verse: 5,
          latinThrough: "super summum.",
          englishThrough: "the highest top.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "Quasi in silva",
          englishFrom: "As with axes",
        },
        { verse: 6 },
      ],
    },
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
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
  ],
  74: [
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "nomen tuum ;",
          englishThrough: "upon thy name.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "narrabimus mirabilia",
          englishFrom: "We will relate",
        },
        { verse: 3 },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        { verse: 7 },
        {
          verse: 8,
          latinThrough: "iudex est.",
          englishThrough: "the judge.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "Hunc humiliat",
          englishFrom: "One he putteth",
        },
        {
          verse: 9,
          latinThrough: "plenus misto.",
          englishThrough: "full of mixture.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "Et inclinavit",
          englishFrom: "And he hath poured",
        },
      ],
    },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
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
  76: [
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        { verse: 3, latinThrough: "et non sum deceptus.", englishThrough: "and I was not deceived." },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "Renuit consolari anima mea", englishFrom: "My soul refused to be comforted" },
        { verse: 4 },
      ],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    {
      pieces: [
        { verse: 14 },
        { verse: 15, latinThrough: "mirabilia :", englishThrough: "dost wonders." },
      ],
    },
    {
      pieces: [
        { verse: 15, latinFrom: "notam fecisti in populis virtutem tuam", englishFrom: "Thou hast made thy power known" },
        { verse: 16 },
      ],
    },
    { pieces: [{ verse: 17 }] },
    {
      pieces: [
        { verse: 18, latinThrough: "vocem dederunt nubes.", englishThrough: "the clouds sent out a sound." },
      ],
    },
    {
      pieces: [
        { verse: 18, latinFrom: "Etenim sagittae tuae transeunt", englishFrom: "For thy arrows pass" },
        { verse: 19, latinThrough: "vox tonitrui tui in rota.", englishThrough: "thy thunder in a wheel." },
      ],
    },
    {
      pieces: [
        { verse: 19, latinFrom: "Illuxerunt coruscationes", englishFrom: "Thy lightnings enlightened the world" },
      ],
    },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
  ],
  77: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Intellectus Asaph. ", englishFrom: "Attend, O my people" }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        { verse: 4, latinThrough: "in generatione altera,", englishThrough: "in another generation." },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "narrantes laudes Domini", englishFrom: "Declaring the praises" },
      ],
    },
    {
      pieces: [
        { verse: 5, latinThrough: "et legem posuit in Israël,", englishThrough: "and made a law in Israel." },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "quanta mandavit patribus nostris", englishFrom: "How great things" },
        { verse: 6, latinThrough: "generatio altera :", englishThrough: "That another generation might know them." },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "filii qui nascentur", englishFrom: "The children that should be born" },
      ],
    },
    { pieces: [{ verse: 7 }] },
    {
      pieces: [
        { verse: 8, latinThrough: "generatio prava et exasperans ;", englishThrough: "a perverse and exasperating generation." },
      ],
    },
    {
      pieces: [
        { verse: 8, latinFrom: "generatio quae non direxit cor suum", englishFrom: "A generation that set not their heart aright" },
      ],
    },
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
    {
      pieces: [
        { verse: 20, latinThrough: "et torrentes inundaverunt.", englishThrough: "the streams overflowed." },
      ],
    },
    {
      pieces: [
        { verse: 20, latinFrom: "Numquid et panem", englishFrom: "Can he also give bread" },
      ],
    },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
    { pieces: [{ verse: 27 }] },
    { pieces: [{ verse: 28 }] },
    {
      pieces: [
        { verse: 29 },
        { verse: 30, latinThrough: "a desiderio suo.", englishThrough: "that which they craved." },
      ],
    },
    {
      pieces: [
        { verse: 30, latinFrom: "Adhuc escae", englishFrom: "As yet their meat" },
        { verse: 31, latinThrough: "super eos :", englishFrom: "And the wrath of God", englishThrough: "came upon them." },
      ],
    },
    {
      pieces: [
        { verse: 31, latinFrom: "et occidit pingues", englishFrom: "And he slew the fat ones" },
      ],
    },
    { pieces: [{ verse: 32 }] },
    { pieces: [{ verse: 33 }] },
    { pieces: [{ verse: 34 }] },
    { pieces: [{ verse: 35 }] },
    { pieces: [{ verse: 36 }] },
    { pieces: [{ verse: 37 }] },
    {
      pieces: [
        { verse: 38, latinThrough: "et non disperdet eos.", englishThrough: "and will not destroy them." },
      ],
    },
    {
      pieces: [
        { verse: 38, latinFrom: "Et abundavit", englishFrom: "And many a time" },
      ],
    },
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
    { pieces: [{ verse: 52 }] },
    { pieces: [{ verse: 53 }] },
    {
      pieces: [
        { verse: 54, latinThrough: "quem acquisivit dextera eius ;", englishThrough: "the mountain which his right hand had purchased." },
      ],
    },
    {
      pieces: [
        { verse: 54, latinFrom: "et eiecit a facie eorum gentes", englishFrom: "And he cast out the Gentiles" },
      ],
    },
    { pieces: [{ verse: 55 }] },
    { pieces: [{ verse: 56 }] },
    { pieces: [{ verse: 57 }] },
    { pieces: [{ verse: 58 }] },
    { pieces: [{ verse: 59 }] },
    { pieces: [{ verse: 60 }] },
    { pieces: [{ verse: 61 }] },
    { pieces: [{ verse: 62 }] },
    { pieces: [{ verse: 63 }] },
    { pieces: [{ verse: 64 }] },
    { pieces: [{ verse: 65 }] },
    { pieces: [{ verse: 66 }] },
    { pieces: [{ verse: 67 }] },
    { pieces: [{ verse: 68 }] },
    { pieces: [{ verse: 69 }] },
    { pieces: [{ verse: 70 }] },
    { pieces: [{ verse: 71 }] },
    { pieces: [{ verse: 72 }] },
  ],
  78: [
    {
      pieces: [{ verse: 1, dropLatinPrefix: "Psalmus Asaph. ", englishFrom: "O God" }],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    {
      pieces: [
        { verse: 10, latinThrough: "oculis nostris", englishThrough: "before our eyes" },
      ],
    },
    {
      pieces: [
        { verse: 10, latinFrom: "ultio sanguinis", englishFrom: "By the revenging" },
        {
          verse: 11,
          latinThrough: "gemitus compeditorum",
          englishThrough: "come in before thee.",
        },
      ],
    },
    {
      pieces: [
        { verse: 11, latinFrom: "secundum magnitudinem", englishFrom: "According to the greatness" },
      ],
    },
    { pieces: [{ verse: 12 }] },
    {
      pieces: [{ verse: 13, latinThrough: "in saeculum", englishThrough: "for ever." }],
    },
    {
      pieces: [{ verse: 13, latinFrom: "in generationem", englishFrom: "We will shew forth" }],
    },
  ],
  79: [
    {
      pieces: [{ verse: 2, latinThrough: "velut ovem Ioseph", englishThrough: "like a sheep." }],
    },
    {
      pieces: [
        { verse: 2, latinFrom: "Qui sedes", englishFrom: "Thou that sittest" },
        { verse: 3, latinThrough: "et Manasse", englishThrough: "and Manasses." },
      ],
    },
    {
      pieces: [{ verse: 3, latinFrom: "Excita potentiam", englishFrom: "Stir up thy might" }],
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
  ],
  80: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }, { verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
  ],
  81: [
    {
      pieces: [{ verse: 1, dropLatinPrefix: "Psalmus Asaph. ", englishFrom: "God hath stood" }],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
  ],
  82: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        { verse: 6 },
        { verse: 7, latinThrough: "Ismahelitae", englishThrough: "Ishmahelites:" },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "Moab", englishFrom: "Moab" },
        { verse: 8 },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    {
      pieces: [{ verse: 12, latinThrough: "et Salmana", englishThrough: "and Salmana." }],
    },
    {
      pieces: [
        { verse: 12, latinFrom: "omnes principes eorum", englishFrom: "All their princes," },
        { verse: 13 },
      ],
    },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
  ],
  83: [
    {
      pieces: [
        { verse: 2 },
        { verse: 3, latinThrough: "in atria Domini", englishThrough: "for the courts of the Lord" },
      ],
    },
    {
      pieces: [{ verse: 3, latinFrom: "cor meum", englishFrom: "My heart" }],
    },
    {
      pieces: [{ verse: 4, latinThrough: "pullos suos", englishThrough: "lay her young ones:" }],
    },
    {
      pieces: [{ verse: 4, latinFrom: "altaria tua", englishFrom: "Thy altars" }],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }, { verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    {
      pieces: [{ verse: 11, latinThrough: "super millia", englishThrough: "above thousands." }],
    },
    {
      pieces: [{ verse: 11, latinFrom: "elegi abiectus", englishFrom: "I have chosen" }],
    },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
  ],
  84: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [{ verse: 9, latinThrough: "pacem in plebem suam", englishThrough: "peace unto his people" }],
    },
    {
      pieces: [{ verse: 9, latinFrom: "et super sanctos suos", englishFrom: "And unto his saints" }],
    },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
  ],
  85: [
    {
      pieces: [{ verse: 1, dropLatinPrefix: "Oratio ipsi David. ", englishFrom: "Incline thy ear" }],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }, { verse: 4 }] },
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
  ],
  86: [
    {
      pieces: [
        { verse: 1, dropLatinPrefix: "Filiis Core. Psalmus cantici. ", englishFrom: "The foundations thereof" },
        { verse: 2 },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [{ verse: 4, latinThrough: "scientium me", englishThrough: "knowing me" }],
    },
    {
      pieces: [{ verse: 4, latinFrom: "ecce alienigenae", englishFrom: "Behold the foreigners" }],
    },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
  ],
  87: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        { verse: 5 },
        { verse: 6, latinThrough: "inter mortuos liber", englishThrough: "Free among the dead." },
      ],
    },
    {
      pieces: [{ verse: 6, latinFrom: "sicut vulnerati", englishFrom: "Like the slain" }],
    },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [{ verse: 9, latinThrough: "abominationem sibi.", englishThrough: "to themselves." }],
    },
    {
      pieces: [
        { verse: 9, latinFrom: "Traditus sum", englishFrom: "I was delivered up" },
        { verse: 10, latinThrough: "prae inopia.", englishThrough: "through poverty." },
      ],
    },
    {
      pieces: [{ verse: 10, latinFrom: "Clamavi ad te", englishFrom: "All the day" }],
    },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
  ],
  88: [
    {
      pieces: [
        { verse: 2, latinThrough: "cantabo ;", englishThrough: "for ever." },
      ],
    },
    {
      pieces: [
        { verse: 2, latinFrom: "in generationem", englishFrom: "I will shew forth" },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        { verse: 4 },
        { verse: 5, latinThrough: "semen tuum,", englishThrough: "for ever." },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "et aedificabo", englishFrom: "And I will build up" },
      ],
    },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    {
      pieces: [
        { verse: 12 },
        { verse: 13, latinThrough: "tu creasti.", englishThrough: "thou hast created." },
      ],
    },
    {
      pieces: [
        { verse: 13, latinFrom: "Thabor et Hermon", englishFrom: "Thabor and Hermon" },
        { verse: 14, latinThrough: "cum potentia.", englishThrough: "with might." },
      ],
    },
    {
      pieces: [
        { verse: 14, latinFrom: "Firmetur manus tua", englishFrom: "Let thy hand" },
        { verse: 15, latinThrough: "sedis tuae :", englishThrough: "thy throne." },
      ],
    },
    {
      pieces: [
        { verse: 15, latinFrom: "misericordia et veritas", englishFrom: "Mercy and truth" },
        { verse: 16, latinThrough: "iubilationem :", englishThrough: "jubilation." },
      ],
    },
    {
      pieces: [
        { verse: 16, latinFrom: "Domine, in lumine", englishFrom: "They shall walk" },
        { verse: 17 },
      ],
    },
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
    { pieces: [{ verse: 36 }, { verse: 37 }] },
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
    { pieces: [{ verse: 52 }] },
    { pieces: [{ verse: 53 }] },
  ],
  89: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Oratio Moysi, hominis Dei. ",
          englishFrom: "Lord,",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "quae praeteriit :",
          englishThrough: "which is past.",
        },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "et custodia in nocte", englishFrom: "And as a watch in the night," },
        { verse: 5 },
      ],
    },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    {
      pieces: [
        {
          verse: 9,
          latinThrough: "defecimus.",
          englishThrough: "we have fainted away.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "Anni nostri sicut aranea meditabuntur",
          englishFrom: "Our years shall be considered as a spider:",
        },
        {
          verse: 10,
          latinThrough: "septuaginta anni.",
          englishThrough: "threescore and ten years.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "Si autem in potentatibus",
          latinThrough: "labor et dolor ;",
          englishFrom: "But if in the strong",
          englishThrough: "labour and sorrow.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "quoniam supervenit mansuetudo",
          englishFrom: "For mildness is come upon us:",
        },
      ],
    },
    {
      pieces: [
        { verse: 11 },
        { verse: 12, latinThrough: "dinumerare ?", englishThrough: "Can number thy wrath?" },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "Dexteram tuam sic notam fac",
          englishFrom: "So make thy right hand known:",
        },
      ],
    },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
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
  92: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Laus cantici ipsi David, in die ante sabbatum, quando fundata est terra. ",
          latinThrough: "praecinxit se.",
          englishThrough: "hath girded himself.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 1,
          latinFrom: "Etenim firmavit",
          englishFrom: "For he hath established",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "vocem suam ;",
          englishThrough: "their voice.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "elevaverunt flumina fluctus",
          englishFrom: "The floods have lifted up their waves,",
        },
        {
          verse: 4,
          latinThrough: "aquarum multarum.",
          englishThrough: "many waters.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Mirabiles elationes",
          englishFrom: "Wonderful are the surges",
        },
      ],
    },
    { pieces: [{ verse: 5 }] },
  ],
  93: dropTitle("Psalmus ipsi David, quarta sabbati. "),
  94: dropTitle("Laus cantici ipsi David. "),
  95: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Canticum ipsi David, quando domus aedificabatur post captivitatem. ",
          englishFrom: "Sing ye to the Lord a new canticle:",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        { verse: 7 },
        { verse: 8, latinThrough: "gloriam nomini eius.", englishThrough: "glory unto his name." },
      ],
    },
    {
      pieces: [
        { verse: 8, latinFrom: "Tollite hostias", englishFrom: "Bring up sacrifices," },
        { verse: 9, latinThrough: "atrio sancto eius.", englishThrough: "in his holy court." },
      ],
    },
    {
      pieces: [
        { verse: 9, latinFrom: "Commoveatur a facie", englishFrom: "Let all the earth be moved" },
        { verse: 10, latinThrough: "Dominus regnavit.", englishThrough: "the Lord hath reigned." },
      ],
    },
    {
      pieces: [
        { verse: 10, latinFrom: "Etenim correxit", englishFrom: "For he hath corrected the world," },
      ],
    },
    {
      pieces: [
        { verse: 11 },
        { verse: 12, latinThrough: "quae in eis sunt.", englishThrough: "shall be joyful." },
      ],
    },
    {
      pieces: [
        { verse: 12, latinFrom: "Tunc exsultabunt", englishFrom: "Then shall all the trees" },
        { verse: 13, latinThrough: "iudicare terram.", englishThrough: "to judge the earth." },
      ],
    },
    {
      pieces: [
        { verse: 13, latinFrom: "Iudicabit orbem", englishFrom: "He shall judge the world" },
      ],
    },
  ],
  96: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Huic David, quando terra eius restituta est. ",
          englishFrom: "The Lord hath reigned,",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "simulacris suis.",
          englishThrough: "in their idols.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Adorate eum omnes angeli eius.",
          englishFrom: "Adore him, all you his angels:",
        },
        { verse: 8, latinThrough: "laetata est Sion,", englishThrough: "and was glad." },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "et exsultaverunt filiae Iudae",
          englishFrom: "And the daughters of Juda rejoiced,",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
  ],
  97: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus ipsi David. ",
          latinThrough: "quia mirabilia fecit.",
          englishFrom: "Sing ye to the Lord a new canticle:",
          englishThrough: "wonderful things.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 1,
          latinFrom: "Salvavit sibi dextera",
          englishFrom: "His right hand hath wrought",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "domui Israël.",
          englishThrough: "house of Israel.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Viderunt omnes",
          englishFrom: "All the ends of the earth",
        },
      ],
    },
    { pieces: [{ verse: 4 }] },
    {
      pieces: [
        { verse: 5 },
        { verse: 6, latinThrough: "tubae corneae.", englishThrough: "sound of cornet." },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "Iubilate in conspectu",
          englishFrom: "Make a joyful noise before the Lord our king:",
        },
        { verse: 7 },
      ],
    },
    {
      pieces: [
        { verse: 8 },
        { verse: 9, latinThrough: "iudicare terram.", englishThrough: "to judge the earth." },
      ],
    },
    {
      pieces: [
        {
          verse: 9,
          latinFrom: "Iudicabit orbem",
          englishFrom: "He shall judge the world",
        },
      ],
    },
  ],
  98: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus ipsi David. ",
          englishFrom: "The Lord hath reigned,",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        { verse: 3 },
        { verse: 4, latinThrough: "iudicium diligit.", englishThrough: "loveth judgment." },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Tu parasti directiones",
          englishFrom: "Thou hast prepared directions:",
        },
      ],
    },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "nomen eius :",
          englishThrough: "upon his name.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 6,
          latinFrom: "invocabant Dominum",
          englishFrom: "They called upon the Lord,",
        },
        { verse: 7, latinThrough: "loquebatur ad eos.", englishThrough: "pillar of the cloud." },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Custodiebant",
          englishFrom: "They kept his testimonies,",
        },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
  99: [
    {
      pieces: [
        { verse: 2, latinThrough: "in laetitia.", englishThrough: "with gladness." },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Introite in conspectu eius",
          englishFrom: "Come in before his presence",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "non ipsi nos :",
          englishThrough: "not we ourselves.",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "populus eius", englishFrom: "We are his people" },
        { verse: 4, latinThrough: "confitemini illi.", englishThrough: "give glory to him." },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "Laudate nomen eius", englishFrom: "Praise ye his name:" },
        { verse: 5 },
      ],
    },
  ],
  100: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus ipsi David. ",
          latinThrough: "Domine ;",
          englishFrom: "Mercy and judgment",
          englishThrough: "O Lord:",
        },
      ],
    },
    {
      pieces: [
        { verse: 1, latinFrom: "psallam,", englishFrom: "I will sing," },
        { verse: 2, latinThrough: "ad me ?", englishThrough: "come to me." },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Perambulabam",
          englishFrom: "I walked in the innocence",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "praevaricationes odivi ;",
          englishThrough: "workers of iniquities.",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "non adhaesit mihi", englishThrough: "" },
        { verse: 4 },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "hunc persequebar :",
          englishThrough: "him did I persecute.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinFrom: "superbo oculo",
          englishFrom: "With him that had a proud eye,",
        },
      ],
    },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
  ],
  101: [
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "aurem tuam ;",
          englishThrough: "incline thy ear to me.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "in quacumque die invocavero te",
          englishFrom: "In what day soever I shall call upon thee,",
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
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
    {
      pieces: [
        {
          verse: 27,
          latinThrough: "vestimentum veterascent.",
          englishThrough: "like a garment:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 27,
          latinFrom: "Et sicut opertorium",
          englishFrom: "And as a vesture thou shalt change them,",
        },
        { verse: 28 },
      ],
    },
    { pieces: [{ verse: 29 }] },
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
  115: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }, { verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "ancillae tuae.",
          englishThrough: "thy handmaid.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "Dirupisti vincula mea", englishFrom: "Thou hast broken my bonds" },
        { verse: 8 },
      ],
    },
    { pieces: [{ verse: 9 }, { verse: 10 }] },
  ],
  116: dropTitle("Alleluia. "),
  117: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
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
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }, { verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    {
      pieces: [
        { verse: 25 },
        { verse: 26, latinThrough: "nomine Domini :", englishThrough: "name of the Lord." },
      ],
    },
    {
      pieces: [
        { verse: 26, latinFrom: "benediximus vobis", englishFrom: "We have blessed you" },
        { verse: 27, latinThrough: "illuxit nobis.", englishThrough: "shone upon us." },
      ],
    },
    {
      pieces: [
        { verse: 27, latinFrom: "Constituite diem solemnem", englishFrom: "Appoint a solemn day" },
      ],
    },
    {
      pieces: [{ verse: 28, latinThrough: "exaltabo te.", englishThrough: "exalt thee." }],
    },
    {
      pieces: [
        {
          verse: 28,
          latinFrom: "Confitebor tibi quoniam exaudisti me",
          englishFrom: "I will praise thee, because thou hast heard me",
        },
      ],
    },
    { pieces: [{ verse: 29 }] },
  ],
  141: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "semitas meas.",
          englishThrough: "my paths.",
        },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "In via hac", englishFrom: "In this way wherein I walked" },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "cognosceret me :",
          englishThrough: "would know me.",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "periit fuga a me", englishFrom: "Flight hath failed me" },
      ],
    },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "humiliatus sum nimis.",
          englishThrough: "very low.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "Libera me", englishFrom: "Deliver me from my persecutors" },
      ],
    },
    { pieces: [{ verse: 8 }] },
  ],
  142: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus David, quando persequebatur eum Absalom filius eius. ",
          englishFrom: "Hear, O Lord, my prayer",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "humiliavit in terra vitam meam",
          englishThrough: "he hath brought down my life to the earth.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "collocavit me in obscuris",
          englishFrom: "He hath made me to dwell in darkness",
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
          latinThrough: "defecit spiritus meus",
          englishThrough: "my spirit hath fainted away.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Non avertas faciem tuam",
          englishFrom: "Turn not away thy face",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinThrough: "quia in te speravi",
          englishThrough: "for in thee have I hoped.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "Notam fac mihi viam",
          englishFrom: "Make the way known to me",
        },
      ],
    },
    {
      pieces: [
        { verse: 9 },
        {
          verse: 10,
          latinThrough: "quia Deus meus es tu",
          englishThrough: "for thou art my God.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 10,
          latinFrom: "Spiritus tuus bonus",
          englishFrom: "Thy good spirit shall lead me into the right land",
        },
        {
          verse: 11,
          latinThrough: "in aequitate tua",
          englishThrough: "in thy justice.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 11,
          latinFrom: "educes de tribulatione animam meam",
          englishFrom: "Thou wilt bring my soul out of trouble",
        },
        {
          verse: 12,
          latinThrough: "disperdes inimicos meos",
          englishThrough: "thou wilt destroy my enemies.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "et perdes omnes",
          englishFrom: "And thou wilt cut off all them that afflict my soul",
        },
      ],
    },
  ],
  143: [
    {
      pieces: [
        { verse: 1, dropLatinPrefix: "Psalmus David. Adversus Goliath. " },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "liberator meus ;",
          englishThrough: "my deliverer:",
        },
      ],
    },
    {
      pieces: [
        { verse: 2, latinFrom: "protector meus", englishFrom: "My protector" },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    {
      pieces: [
        { verse: 10 },
        { verse: 11, latinThrough: "eripe me,", englishThrough: "Deliver me," },
      ],
    },
    {
      pieces: [
        { verse: 11, latinFrom: "et erue me", englishFrom: "And rescue me" },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinThrough: "iuventute sua ;",
          englishThrough: "in their youth:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "filiae eorum",
          englishFrom: "Their daughters decked out",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinThrough: "ex hoc in illud ;",
          englishThrough: "into that.",
        },
      ],
    },
    {
      pieces: [
        { verse: 13, latinFrom: "oves eorum", englishFrom: "Their sheep fruitful" },
        { verse: 14, latinThrough: "crassae.", englishThrough: "Their oxen fat." },
      ],
    },
    {
      pieces: [
        {
          verse: 14,
          latinFrom: "Non est ruina",
          englishFrom: "There is no breach of wall",
        },
      ],
    },
    { pieces: [{ verse: 15 }] },
  ],
  144: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Laudatio ipsi David. ",
          englishFrom: "I will extol thee",
        },
      ],
    },
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
    { pieces: [{ verse: 12 }] },
    {
      pieces: [
        {
          verse: 13,
          latinThrough: "generationem.",
          englishThrough: "all generations.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 13,
          latinFrom: "Fidelis Dominus",
          englishFrom: "The Lord is faithful",
        },
      ],
    },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
  ],
  145: [
    { pieces: [{ verse: 2, latinThrough: "quamdiu fuero.", englishThrough: "as long as I shall be." }] },
    {
      pieces: [
        { verse: 2, latinFrom: "Nolite confidere", englishFrom: "Put not your trust" },
        { verse: 3 },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }, { verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "dat escam esurientibus.",
          englishThrough: "who giveth food to the hungry.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinFrom: "Dominus solvit compeditos",
          englishFrom: "The Lord looseth them that are fettered",
        },
        {
          verse: 8,
          latinThrough: "Dominus illuminat caecos.",
          englishThrough: "The Lord enlighteneth the blind.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "Dominus erigit elisos",
          englishFrom: "The Lord lifteth up",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
  ],
  146: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Alleluia. ",
          englishFrom: "Praise ye the Lord",
        },
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
          latinThrough: "pluviam ;",
          englishThrough: "prepareth rain for the earth.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 8,
          latinFrom: "qui producit",
          englishFrom: "Who maketh grass",
        },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
    { pieces: [{ verse: 11 }] },
  ],
  147: [
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
          latinThrough: "non manifestavit eis.",
          englishThrough: "made manifest to them.",
        },
      ],
    },
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
  127: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: GRADUAL,
          englishFrom: "Blessed are all",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "domus tuae ;",
          englishThrough: "sides of thy house.",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "filii tui", englishFrom: "Thy children" },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
  ],
  128: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: GRADUAL,
          englishFrom: "Often have they fought",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }, { verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
  ],
  129: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: GRADUAL,
          englishFrom: "Out of the depths",
        },
        {
          verse: 2,
          latinThrough: "vocem meam.",
          englishThrough: "Lord, hear my voice.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "Fiant aures",
          englishFrom: "Let thy ears be attentive",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "sustinui te, Domine.",
          englishThrough: "O Lord.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 4,
          latinFrom: "Sustinuit anima mea",
          englishFrom: "My soul hath relied",
        },
        { verse: 5 },
      ],
    },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
  ],
  130: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Canticum graduum David. ",
          latinThrough: "oculi mei,",
          englishFrom: "Lord, my heart",
          englishThrough: "nor are my eyes lofty.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 1,
          latinFrom: "neque ambulavi",
          englishFrom: "Neither have I walked",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "animam meam :",
          englishThrough: "exalted my soul:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "sicut ablactatus",
          englishFrom: "As a child that is weaned",
        },
      ],
    },
    { pieces: [{ verse: 3 }] },
  ],
  131: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: GRADUAL,
          englishFrom: "O Lord, remember David",
        },
      ],
    },
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
    {
      pieces: [
        {
          verse: 12,
          latinThrough: "quae docebo eos,",
          englishThrough: "which I shall teach them:",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 12,
          latinFrom: "et filii eorum",
          englishFrom: "Their children also",
        },
      ],
    },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
  ],
  132: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Canticum graduum David. ",
          englishFrom: "Behold how good",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinThrough: "barbam Aaron,",
          englishThrough: "the beard of Aaron,",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 2,
          latinFrom: "quod descendit in oram",
          englishFrom: "Which ran down",
        },
        {
          verse: 3,
          latinThrough: "montem Sion.",
          englishThrough: "mount Sion.",
        },
      ],
    },
    {
      pieces: [
        {
          verse: 3,
          latinFrom: "Quoniam illic",
          englishFrom: "For there the Lord",
        },
      ],
    },
  ],
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
  134: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. ", englishFrom: "Praise ye the name of the Lord" }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "fecit ;",
          englishThrough: "for the rain.",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "qui producit ventos", englishFrom: "He bringeth forth winds" },
        { verse: 8 },
      ],
    },
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
  135: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. ", englishFrom: "Praise the Lord" }] },
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
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    {
      pieces: [
        {
          verse: 26,
          latinThrough: "misericordia eius.",
          englishThrough: "for his mercy endureth for ever.",
        },
      ],
    },
    {
      pieces: [
        { verse: 26, latinFrom: "Confitemini Domino dominorum", englishFrom: "Give glory to the Lord of lords" },
      ],
    },
  ],
  136: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Psalmus David, Ieremiae. " }] },
    { pieces: [{ verse: 2 }] },
    {
      pieces: [
        {
          verse: 3,
          latinThrough: "verba cantionum ;",
          englishThrough: "the words of songs.",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "et qui abduxerunt nos", englishFrom: "And they that carried us away" },
      ],
    },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    {
      pieces: [
        {
          verse: 6,
          latinThrough: "meminero tui ;",
          englishThrough: "I do not remember thee:",
        },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "si non proposuero Ierusalem", englishFrom: "If I make not Jerusalem" },
      ],
    },
    {
      pieces: [
        {
          verse: 7,
          latinThrough: "in die Ierusalem :",
          englishThrough: "in the day of Jerusalem:",
        },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "qui dicunt", englishFrom: "Who say" },
      ],
    },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
  137: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Ipsi David. ",
          englishFrom: "I will praise thee",
          latinThrough: "audisti verba oris mei",
          englishThrough: "for thou hast heard the words of my mouth.",
        },
      ],
    },
    {
      pieces: [
        { verse: 1, latinFrom: "In conspectu angelorum", englishFrom: "I will sing praise" },
        {
          verse: 2,
          latinThrough: "confitebor nomini tuo",
          englishThrough: "and I will give glory to thy name.",
        },
      ],
    },
    {
      pieces: [
        { verse: 2, latinFrom: "super misericordia tua", englishFrom: "For thy mercy" },
      ],
    },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
  ],
  138: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "In finem, psalmus David. ",
          englishFrom: "Lord, thou hast proved me",
        },
        { verse: 2 },
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
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
  ],
  139: [
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
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
  ],
  140: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Psalmus David. ",
          englishFrom: "I have cried to thee",
        },
      ],
    },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    {
      pieces: [
        {
          verse: 4,
          latinThrough: "in peccatis ;",
          englishThrough: "in sins.",
        },
      ],
    },
    {
      pieces: [
        { verse: 4, latinFrom: "cum hominibus operantibus iniquitatem", englishFrom: "With men that work iniquity" },
      ],
    },
    {
      pieces: [
        {
          verse: 5,
          latinThrough: "caput meum.",
          englishThrough: "fatten my head.",
        },
      ],
    },
    {
      pieces: [
        { verse: 5, latinFrom: "Quoniam adhuc", englishFrom: "For my prayer shall still be" },
        { verse: 6, latinThrough: "iudices eorum.", englishThrough: "swallowed up." },
      ],
    },
    {
      pieces: [
        { verse: 6, latinFrom: "Audient verba mea", englishFrom: "They shall hear my words" },
        { verse: 7, latinThrough: "super terram,", englishThrough: "upon the ground:" },
      ],
    },
    {
      pieces: [
        { verse: 7, latinFrom: "dissipata sunt ossa nostra secus infernum", englishFrom: "Our bones are scattered by the side of hell." },
        { verse: 8 },
      ],
    },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
  ],
  102: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Ipsi David. ", englishFrom: "Bless the Lord" }] },
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
    { pieces: [{ verse: 12 }] },
    {
      pieces: [
        { verse: 13 },
        {
          verse: 14,
          latinThrough: "figmentum nostrum",
          englishThrough: "For he knoweth our frame.",
        },
      ],
    },
    {
      pieces: [
        { verse: 14, latinFrom: "recordatus est", englishFrom: "He remembereth that we are dust" },
        { verse: 15 },
      ],
    },
    { pieces: [{ verse: 16 }] },
    {
      pieces: [
        {
          verse: 17,
          latinThrough: "super timentes eum.",
          englishThrough: "upon them that fear him:",
        },
      ],
    },
    {
      pieces: [
        { verse: 17, latinFrom: "Et iustitia illius", englishFrom: "And his justice" },
        {
          verse: 18,
          latinThrough: "testamentum eius",
          englishThrough: "keep his covenant,",
        },
      ],
    },
    {
      pieces: [
        { verse: 18, latinFrom: "et memores sunt mandatorum", englishFrom: "And are mindful" },
      ],
    },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
  ],
  103: [
    {
      pieces: [
        {
          verse: 1,
          dropLatinPrefix: "Ipsi David. ",
          englishFrom: "Bless the Lord",
          latinThrough: "magnificatus es vehementer.",
          englishThrough: "thou art exceedingly great.",
        },
      ],
    },
    {
      pieces: [
        { verse: 1, latinFrom: "Confessionem et decorem", englishFrom: "Thou hast put on" },
        {
          verse: 2,
          latinThrough: "sicut vestimento",
          englishThrough: "as with a garment.",
        },
      ],
    },
    {
      pieces: [
        { verse: 2, latinFrom: "Extendens caelum", englishFrom: "Who stretchest out" },
        {
          verse: 3,
          latinThrough: "superiora eius",
          englishThrough: "with water.",
        },
      ],
    },
    {
      pieces: [
        { verse: 3, latinFrom: "qui ponis nubem", englishFrom: "Who makest the clouds" },
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
    {
      pieces: [
        {
          verse: 14,
          latinThrough: "herbam servituti hominum",
          englishThrough: "and herb for the service of men.",
        },
      ],
    },
    {
      pieces: [
        { verse: 14, latinFrom: "ut educas", englishFrom: "That thou mayst bring" },
        {
          verse: 15,
          latinThrough: "laetificet cor hominis",
          englishThrough: "to cheer the heart of man.",
        },
      ],
    },
    {
      pieces: [
        { verse: 15, latinFrom: "ut exhilaret", englishFrom: "That he may make" },
      ],
    },
    {
      pieces: [
        { verse: 16 },
        {
          verse: 17,
          latinThrough: "nidificabunt",
          englishThrough: "make their nests.",
        },
      ],
    },
    {
      pieces: [
        { verse: 17, latinFrom: "herodii", englishFrom: "The highest of them" },
        { verse: 18 },
      ],
    },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20 }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    {
      pieces: [
        {
          verse: 25,
          latinThrough: "quorum non est numerus",
          englishThrough: "without number:",
        },
      ],
    },
    {
      pieces: [
        { verse: 25, latinFrom: "animalia", englishFrom: "Creatures little and great" },
        {
          verse: 26,
          latinThrough: "naves pertransibunt",
          englishThrough: "the ships shall go.",
        },
      ],
    },
    {
      pieces: [
        { verse: 26, latinFrom: "draco iste", englishFrom: "This sea dragon" },
        { verse: 27 },
      ],
    },
    { pieces: [{ verse: 28 }] },
    { pieces: [{ verse: 29 }] },
    { pieces: [{ verse: 30 }] },
    { pieces: [{ verse: 31 }] },
    { pieces: [{ verse: 32 }] },
    { pieces: [{ verse: 33 }] },
    { pieces: [{ verse: 34 }] },
    { pieces: [{ verse: 35 }] },
  ],
  104: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
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
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    {
      pieces: [
        { verse: 18 },
        {
          verse: 19,
          latinThrough: "veniret verbum eius",
          englishThrough: "Until his word came.",
        },
      ],
    },
    {
      pieces: [
        { verse: 19, latinFrom: "Eloquium Domini", englishFrom: "The word of the Lord" },
        { verse: 20 },
      ],
    },
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
    { pieces: [{ verse: 36 }] },
    { pieces: [{ verse: 37 }] },
    { pieces: [{ verse: 38 }] },
    { pieces: [{ verse: 39 }] },
    { pieces: [{ verse: 40 }] },
    { pieces: [{ verse: 41 }] },
    { pieces: [{ verse: 42 }] },
    { pieces: [{ verse: 43 }] },
    { pieces: [{ verse: 44 }] },
    { pieces: [{ verse: 45 }] },
  ],
  105: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7, latinThrough: "misericordiae tuae.", englishThrough: "thy mercies:" }] },
    { pieces: [{ verse: 7, latinFrom: "Et irritaverunt", englishFrom: "And they provoked to wrath" }] },
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
    { pieces: [{ verse: 21 }, { verse: 22 }] },
    { pieces: [{ verse: 23, latinThrough: "in conspectu eius,", englishThrough: "in the breach:" }] },
    { pieces: [{ verse: 23, latinFrom: "ut averteret iram eius", latinThrough: "ne disperderet eos.", englishFrom: "To turn away his wrath", englishThrough: "destroy them." }, { verse: 24, latinThrough: "terram desiderabilem ;", englishThrough: "the desirable land." }] },
    { pieces: [{ verse: 24, latinFrom: "non crediderunt verbo eius.", englishFrom: "They believed not his word," }, { verse: 25 }] },
    { pieces: [{ verse: 26 }] },
    { pieces: [{ verse: 27 }] },
    { pieces: [{ verse: 28 }] },
    { pieces: [{ verse: 29 }] },
    { pieces: [{ verse: 30 }] },
    { pieces: [{ verse: 31 }] },
    { pieces: [{ verse: 32 }, { verse: 33, latinThrough: "spiritum eius,", englishThrough: "his spirit." }] },
    { pieces: [{ verse: 33, latinFrom: "et distinxit in labiis suis.", englishFrom: "And he distinguished" }, { verse: 34 }] },
    { pieces: [{ verse: 35 }, { verse: 36 }] },
    { pieces: [{ verse: 37 }] },
    { pieces: [{ verse: 38, latinThrough: "sculptilibus Chanaan.", englishThrough: "idols of Chanaan." }] },
    { pieces: [{ verse: 38, latinFrom: "Et infecta est terra", englishFrom: "And the land was polluted" }, { verse: 39 }] },
    { pieces: [{ verse: 40 }] },
    { pieces: [{ verse: 41 }] },
    { pieces: [{ verse: 42 }, { verse: 43, latinThrough: "saepe liberavit eos.", englishThrough: "deliver them." }] },
    { pieces: [{ verse: 43, latinFrom: "Ipsi autem", englishFrom: "But they provoked him" }] },
    { pieces: [{ verse: 44 }] },
    { pieces: [{ verse: 45 }] },
    { pieces: [{ verse: 46 }] },
    { pieces: [{ verse: 47, latinThrough: "de nationibus :", englishThrough: "among the nations:" }] },
    { pieces: [{ verse: 47, latinFrom: "ut confiteamur", englishFrom: "That we may give thanks" }] },
    { pieces: [{ verse: 48 }] },
  ],
  106: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
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
    { pieces: [{ verse: 36 }] },
    { pieces: [{ verse: 37 }] },
    { pieces: [{ verse: 38 }] },
    { pieces: [{ verse: 39 }] },
    { pieces: [{ verse: 40 }] },
    { pieces: [{ verse: 41 }] },
    { pieces: [{ verse: 42 }] },
    { pieces: [{ verse: 43 }] },
  ],
  107: [
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }, { verse: 7, latinThrough: "dilecti tui.", englishThrough: "may be delivered." }] },
    { pieces: [{ verse: 7, latinFrom: "Salvum fac dextera tua", englishFrom: "Save with thy right hand" }, { verse: 8, latinThrough: "in sancto suo :", englishThrough: "in his holiness." }] },
    { pieces: [{ verse: 8, latinFrom: "Exsultabo", englishFrom: "I will rejoice" }] },
    { pieces: [{ verse: 9, latinThrough: "capitis mei.", englishThrough: "of my head." }] },
    { pieces: [{ verse: 9, latinFrom: "Iuda rex meus", englishFrom: "Juda is my king:" }, { verse: 10, latinThrough: "spei meae :", englishThrough: "of my hope." }] },
    { pieces: [{ verse: 10, latinFrom: "in Idumaeam", englishFrom: "Over Edom" }] },
    { pieces: [{ verse: 11 }] },
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
  ],
  108: [
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
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }, { verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18, latinThrough: "elongabitur ab eo.", englishThrough: "far from him." }] },
    { pieces: [{ verse: 18, latinFrom: "Et induit maledictionem", englishFrom: "And he put on cursing" }] },
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
  ],
  109: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Psalmus David. ", latinThrough: "Sede a dextris meis,", englishFrom: "The Lord said to my Lord", englishThrough: "at my right hand:" }] },
    { pieces: [{ verse: 1, latinFrom: "donec ponam inimicos tuos", englishFrom: "Until I make thy enemies" }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
  ],
  110: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }, { verse: 5, latinThrough: "timentibus se ;", englishThrough: "them that fear him." }] },
    { pieces: [{ verse: 5, latinFrom: "memor erit", englishFrom: "He will be mindful for ever" }, { verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9, latinThrough: "testamentum suum.", englishThrough: "for ever." }] },
    { pieces: [{ verse: 9, latinFrom: "Sanctum et terribile", englishFrom: "Holy and terrible" }, { verse: 10, latinThrough: "timor Domini ;", englishThrough: "beginning of wisdom." }] },
    { pieces: [{ verse: 10, latinFrom: "intellectus bonus", englishFrom: "A good understanding" }] },
  ],
  111: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia, reversionis Aggaei et Zachariae. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }, { verse: 6 }] },
    { pieces: [{ verse: 7, latinThrough: "non timebit.", englishThrough: "the evil hearing." }] },
    { pieces: [{ verse: 7, latinFrom: "Paratum cor eius", englishFrom: "His heart is ready to hope" }, { verse: 8 }] },
    { pieces: [{ verse: 9 }] },
    { pieces: [{ verse: 10 }] },
  ],
  112: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3 }] },
    { pieces: [{ verse: 4 }] },
    { pieces: [{ verse: 5 }, { verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
  113: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
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
    { pieces: [{ verse: 12 }] },
    { pieces: [{ verse: 13 }] },
    { pieces: [{ verse: 14 }] },
    { pieces: [{ verse: 15 }] },
    { pieces: [{ verse: 16 }] },
    { pieces: [{ verse: 17 }] },
    { pieces: [{ verse: 18 }] },
    { pieces: [{ verse: 19 }] },
    { pieces: [{ verse: 20, latinThrough: "benedixit nobis.", englishThrough: "hath blessed us." }] },
    { pieces: [{ verse: 20, latinFrom: "Benedixit domui Israël", englishFrom: "He hath blessed the house of Israel" }] },
    { pieces: [{ verse: 21 }] },
    { pieces: [{ verse: 22 }] },
    { pieces: [{ verse: 23 }] },
    { pieces: [{ verse: 24 }] },
    { pieces: [{ verse: 25 }] },
    { pieces: [{ verse: 26 }] },
  ],
  114: [
    { pieces: [{ verse: 1, dropLatinPrefix: "Alleluia. " }] },
    { pieces: [{ verse: 2 }] },
    { pieces: [{ verse: 3, latinThrough: "invenerunt me.", englishThrough: "have found me." }] },
    { pieces: [{ verse: 3, latinFrom: "Tribulationem et dolorem inveni,", englishFrom: "I met with trouble and sorrow:" }, { verse: 4, latinThrough: "invocavi :", englishThrough: "name of the Lord." }] },
    { pieces: [{ verse: 4, latinFrom: "o Domine, libera animam meam.", englishFrom: "O Lord, deliver my soul." }, { verse: 5 }] },
    { pieces: [{ verse: 6 }] },
    { pieces: [{ verse: 7 }] },
    { pieces: [{ verse: 8 }] },
    { pieces: [{ verse: 9 }] },
  ],
};
