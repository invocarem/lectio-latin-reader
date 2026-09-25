# Office verse map

The Gallican psalter in `src/content/psalter/latin.md` stays as it is. Lectio reads it unchanged. The Office lines a psalm out through `src/content/office/verseMap.ts`.

A psalm that is not listed here is shown in Gallican verses. Do not invent a lining. Add a psalm only when its Benedictine verses are known: which Gallican verses join, which title to drop from the Latin, and what the Office line numbers are.

The reference for the Benedictine lining is the *Psallam Domino* blog (Kate Edwards), at <https://psallamdomino.blogspot.com> — in particular the per-psalm pages (for example the `ps 15` label shows Psalm 15 pointed for the Office). Read the lining there before adding or changing a psalm here.

An Office line names one or more Gallican verse numbers, in order. Latin and Douay for those numbers are joined. `dropLatinPrefix` is removed from the start of the Latin of the first of those verses. The number on the page is the Office line, not the Gallican verse number.

The cursus cuts (Psalms 9 and 17 at Prime, Psalm 118 in sections of eight, and the Vespers halves) are which day receives which Gallican verses. They are not this map.

## Tracking

Check a psalm when its Benedictine lining is finished. A title drop alone is not finished.

- [x] 1
- [x] 2
- [ ] 3
- [x] 4
- [ ] 5
- [x] 6
- [ ] 7
- [ ] 8
- [ ] 9
- [ ] 10
- [ ] 11
- [x] 12
- [ ] 13
- [x] 14
- [x] 15
- [x] 16
- [x] 17
- [x] 18
- [x] 19
- [ ] 20
- [ ] 21
- [ ] 22
- [ ] 23
- [ ] 24
- [ ] 25
- [ ] 26
- [ ] 27
- [ ] 28
- [ ] 29
- [ ] 30
- [ ] 31
- [ ] 32
- [ ] 33
- [ ] 34
- [ ] 35
- [ ] 36
- [ ] 37
- [ ] 38
- [ ] 39
- [ ] 40
- [ ] 41
- [ ] 42
- [ ] 43
- [ ] 44
- [ ] 45
- [ ] 46
- [ ] 47
- [ ] 48
- [ ] 49
- [x] 50
- [ ] 51
- [ ] 52
- [ ] 53
- [ ] 54
- [ ] 55
- [ ] 56
- [ ] 57
- [ ] 58
- [ ] 59
- [ ] 60
- [ ] 61
- [ ] 62
- [ ] 63
- [ ] 64
- [ ] 65
- [x] 66
- [ ] 67
- [ ] 68
- [ ] 69
- [ ] 70
- [ ] 71
- [ ] 72
- [ ] 73
- [ ] 74
- [x] 75
- [ ] 76
- [ ] 77
- [ ] 78
- [ ] 79
- [ ] 80
- [ ] 81
- [ ] 82
- [ ] 83
- [ ] 84
- [ ] 85
- [ ] 86
- [ ] 87
- [ ] 88
- [ ] 89
- [ ] 90
- [x] 91
- [ ] 92
- [ ] 93
- [ ] 94
- [ ] 95
- [ ] 96
- [ ] 97
- [ ] 98
- [ ] 99
- [ ] 100
- [ ] 101
- [ ] 102
- [ ] 103
- [ ] 104
- [ ] 105
- [ ] 106
- [ ] 107
- [ ] 108
- [ ] 109
- [ ] 110
- [ ] 111
- [ ] 112
- [ ] 113
- [ ] 114
- [ ] 115
- [ ] 116
- [ ] 117
- [ ] 118
- [x] 119
- [ ] 120
- [ ] 121
- [x] 122
- [x] 123
- [x] 124
- [x] 125
- [x] 126
- [ ] 127
- [ ] 128
- [ ] 129
- [ ] 130
- [ ] 131
- [ ] 132
- [x] 133
- [ ] 134
- [ ] 135
- [ ] 136
- [ ] 137
- [ ] 138
- [ ] 139
- [ ] 140
- [ ] 141
- [ ] 142
- [ ] 143
- [ ] 144
- [ ] 145
- [ ] 146
- [ ] 147
- [x] 148
- [x] 149
- [x] 150

## Entered

### Psalmus 1

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1 |
| 2 | Gallican 2 |
| 3 | Gallican 3 through *in tempore suo :* |
| 4 | *et folium eius non defluet* to the end of Gallican 3 |
| 5 | Gallican 4 |
| 6 | Gallican 5 |
| 7 | Gallican 6 |

### Psalmus 4

Gallican verse 1 is the title *In finem, in carminibus. Psalmus David.* — it is dropped. Gallican verse 2 is split at *Miserere mei:* the Office line 1 is *Cum invocarem… dilatasti mihi.*, line 2 begins *Miserere mei*. Verses 3–10 stay as they are.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 2 through *dilatasti mihi.* |
| 2 | Gallican 2 from *Miserere mei* to the end |
| 3 | Gallican 3 |
| 4 | Gallican 4 |
| 5 | Gallican 5 |
| 6 | Gallican 6 |
| 7 | Gallican 7 |
| 8 | Gallican 8 |
| 9 | Gallican 9 |
| 10 | Gallican 10 |

### Psalmus 6

Gallican verse 1 is the title *In finem, in carminibus. Psalmus David. Pro octava.* — it is dropped. The Office therefore shows ten lines, Gallican verses 2–11; line 1 begins *Domine, ne in furore tuo arguas me*. The content verses are unchanged.

### Psalmus 12

An Office line may take part of a Gallican verse. `latinThrough` ends a slice, inclusive. `latinFrom` starts the next slice.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *In finem. Psalmus David.* |
| 2 | Gallican 2 |
| 3 | Gallican 3, then Gallican 4 through *Respice, et exaudi me, Domine Deus meus.* |
| 4 | *Illumina oculos meos* through *adversus eum.* |
| 5 | *Qui tribulant me* through *speravi.* |
| 6 | *Exsultabit cor meum* to the end |

### Psalmus 13

Gallican verse numbers stay. Drop *In finem. Psalmus David.* Verse 1 begins *Dixit insipiens*.

### Psalmus 90

Gallican verse numbers stay. Drop the title *Laus cantici David.* from the Latin of verse 1, so it begins *Qui habitat*. Shown at Compline.

### Psalmus 14

The office lines split the five stored Gallican verses into seven office lines. Drop *Psalmus David.* from the Latin (and *A psalm for David.* from the English) of the first line.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Psalmus David.* |
| 2 | Gallican 2 |
| 3 | Gallican 3 through *qui non egit dolum in lingua sua,* |
| 4 | *nec fecit proximo suo malum* to the end of Gallican 3 |
| 5 | Gallican 4 through *timentes autem Dominum glorificat.* |
| 6 | *Qui iurat proximo suo* to *…non accepit :* (end of Gallican 4, then start of Gallican 5) |
| 7 | Gallican 5 from *qui facit haec* to the end |

### Psalmus 15

The office lines split the ten stored Gallican verses into eleven office lines. Gallican 1 (whose *Tituli inscriptio, ipsi David.* is dropped) joins Gallican 2, because the Benedictine points *Conserva me… non eges* as one verse. Gallican 4 splits at *Non congregabo*, and Gallican 10 splits at *Notas mihi fecisti*.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Tituli inscriptio, ipsi David.*, then Gallican 2 |
| 2 | Gallican 3 |
| 3 | Gallican 4 through *postea acceleraverunt.* |
| 4 | *Non congregabo* to the end of Gallican 4 |
| 5 | Gallican 5 |
| 6 | Gallican 6 |
| 7 | Gallican 7 |
| 8 | Gallican 8 |
| 9 | Gallican 9 |
| 10 | Gallican 10 through *videre corruptionem.* |
| 11 | *Notas mihi fecisti* to the end of Gallican 10 |

### Psalmus 16

The office lines split the fifteen stored Gallican verses into seventeen office lines. Gallican 1 (*Oratio David.* dropped) splits at *Auribus percipe*; Gallican 8 and 9 split at *Sub umbra* and *Inimici mei*; Gallican 13 joins Gallican 14 through *ab inimicis manus tuae.* (the Benedictine point keeps *frameam tuam ab inimicis manus tuae.* as one verse); and Gallican 14 splits at *Domine, a paucis* and *Saturati sunt*.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Oratio David.*, through *intende deprecationem meam.* |
| 2 | *Auribus percipe* to the end of Gallican 1 |
| 3 | Gallican 2 |
| 4 | Gallican 3 |
| 5 | Gallican 4 |
| 6 | Gallican 5 |
| 7 | Gallican 6 |
| 8 | Gallican 7 |
| 9 | Gallican 8 through *ut pupillam oculi.* |
| 10 | *Sub umbra alarum tuarum* to the end of Gallican 8, then Gallican 9 through *afflixerunt.* |
| 11 | *Inimici mei* to the end of Gallican 9, then Gallican 10 |
| 12 | Gallican 11 |
| 13 | Gallican 12 |
| 14 | Gallican 13, then Gallican 14 through *ab inimicis manus tuae.* |
| 15 | *Domine, a paucis* through *adimpletus est venter eorum.* |
| 16 | *Saturati sunt* to the end of Gallican 14 |
| 17 | Gallican 15 |

### Psalmus 17

One map for the whole psalm. Friday Prime keeps Gallican 2–25 and Saturday Prime keeps Gallican 26–51; each half numbers the lines it keeps from 1. Gallican 1 is the title and stays outside both slices. Gallican 3 splits into three lines, Gallican 7 and 16 each split in two, and Gallican 36 splits after *suscepit me*.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 2, then Gallican 3 through *et liberator meus.* |
| 2 | *Deus meus adiutor meus* through *et sperabo in eum ;* |
| 3 | *protector meus* to the end of Gallican 3 |
| 4 | Gallican 4 |
| 5 | Gallican 5 |
| 6 | Gallican 6 |
| 7 | Gallican 7 through *clamavi :* |
| 8 | *et exaudivit* to the end of Gallican 7 |
| 9 | Gallican 8 |
| 10 | Gallican 9 |
| 11 | Gallican 10 |
| 12 | Gallican 11 |
| 13 | Gallican 12 |
| 14 | Gallican 13 |
| 15 | Gallican 14 |
| 16 | Gallican 15 |
| 17 | Gallican 16 through *fundamenta orbis terrarum,* |
| 18 | *ab increpatione tua* to the end of Gallican 16 |
| 19 | Gallican 17 |
| 20 | Gallican 18 |
| 21 | Gallican 19 |
| 22 | Gallican 20 |
| 23 | Gallican 21 |
| 24 | Gallican 22 |
| 25 | Gallican 23 |
| 26 | Gallican 24 |
| 27 | Gallican 25 |
| 28 | Gallican 26. Saturday Prime line 1, *Cum sancto sanctus eris* |
| 29 | Gallican 27 |
| 30 | Gallican 28 |
| 31 | Gallican 29 |
| 32 | Gallican 30 |
| 33 | Gallican 31 |
| 34 | Gallican 32 |
| 35 | Gallican 33 |
| 36 | Gallican 34 |
| 37 | Gallican 35 |
| 38 | Gallican 36 through *suscepit me,* |
| 39 | *et disciplina tua correxit* to the end of Gallican 36 |
| 40 | Gallican 37 |
| 41 | Gallican 38 |
| 42 | Gallican 39 |
| 43 | Gallican 40 |
| 44 | Gallican 41 |
| 45 | Gallican 42 |
| 46 | Gallican 43 |
| 47 | Gallican 44 |
| 48 | Gallican 45 |
| 49 | Gallican 46 |
| 50 | Gallican 47 |
| 51 | Gallican 48 |
| 52 | Gallican 49 |
| 53 | Gallican 50 |
| 54 | Gallican 51 |

### Psalmus 18

Shown whole at Saturday Prime. Gallican 1 is the title *In finem. Psalmus David.* and is dropped. Gallican 6 splits at *Exsultavit*, and that second half joins the opening of Gallican 7 through *egressio eius.* Gallican 13 joins Gallican 14 through *parce servo tuo.* Gallican 15 splits at *Domine, adiutor meus*.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 2 |
| 2 | Gallican 3 |
| 3 | Gallican 4 |
| 4 | Gallican 5 |
| 5 | Gallican 6 through *de thalamo suo.* |
| 6 | *Exsultavit ut gigas* to the end of Gallican 6, then Gallican 7 through *egressio eius.* |
| 7 | *Et occursus eius* to the end of Gallican 7 |
| 8 | Gallican 8 |
| 9 | Gallican 9 |
| 10 | Gallican 10 |
| 11 | Gallican 11 |
| 12 | Gallican 12 |
| 13 | Gallican 13, then Gallican 14 through *parce servo tuo.* |
| 14 | *Si mei non fuerint* to the end of Gallican 14 |
| 15 | Gallican 15 through *in conspectu tuo semper.* |
| 16 | *Domine, adiutor meus* to the end of Gallican 15 |

### Psalmus 19

Shown whole at Saturday Prime, the last psalm of that hour. Gallican 1 is the title *In finem. Psalmus David.* and is dropped. Gallican 7 splits after *christum suum.*

| Office line | Latin |
| --- | --- |
| 1 | Gallican 2 |
| 2 | Gallican 3 |
| 3 | Gallican 4 |
| 4 | Gallican 5 |
| 5 | Gallican 6 |
| 6 | Gallican 7 through *christum suum.* |
| 7 | *Exaudiet illum* to the end of Gallican 7 |
| 8 | Gallican 8 |
| 9 | Gallican 9 |
| 10 | Gallican 10 |

### Psalmus 50

Said every day at Lauds. Gallican 1–2 are the title and are dropped, so line 1 begins *Miserere mei, Deus*. Gallican 3 splits after *misericordiam tuam*. Gallican 4–21 stay whole, which makes twenty office lines.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 3 through *misericordiam tuam ;* |
| 2 | *et secundum multitudinem* to the end of Gallican 3 |
| 3 | Gallican 4 |
| 4 | Gallican 5 |
| 5 | Gallican 6 |
| 6 | Gallican 7 |
| 7 | Gallican 8 |
| 8 | Gallican 9 |
| 9 | Gallican 10 |
| 10 | Gallican 11 |
| 11 | Gallican 12 |
| 12 | Gallican 13 |
| 13 | Gallican 14 |
| 14 | Gallican 15 |
| 15 | Gallican 16 |
| 16 | Gallican 17 |
| 17 | Gallican 18 |
| 18 | Gallican 19 |
| 19 | Gallican 20 |
| 20 | Gallican 21 |

### Psalmus 66

Said every day at Lauds, the first psalm of the hour. Gallican 1 is the title *In finem, in hymnis. Psalmus cantici David.* and is dropped. The eight stored verses become six office lines: Gallican 6 joins Gallican 7 through *fructum suum*, and the rest of Gallican 7 joins Gallican 8.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 2 |
| 2 | Gallican 3 |
| 3 | Gallican 4 |
| 4 | Gallican 5 |
| 5 | Gallican 6, then Gallican 7 through *fructum suum :* |
| 6 | *benedicat nos Deus* to the end of Gallican 7, then Gallican 8 |

### Psalmus 75

Friday Lauds. Gallican 1 is the title *In finem, in laudibus. Psalmus Asaph, canticum ad Assyrios.* and is dropped. Gallican 5 joins Gallican 6 through *corde.* Gallican 12 splits after *munera*, and *terribili* joins Gallican 13.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 2 |
| 2 | Gallican 3 |
| 3 | Gallican 4 |
| 4 | Gallican 5, then Gallican 6 through *corde.* |
| 5 | *Dormierunt somnum suum* to the end of Gallican 6 |
| 6 | Gallican 7 |
| 7 | Gallican 8 |
| 8 | Gallican 9 |
| 9 | Gallican 10 |
| 10 | Gallican 11 |
| 11 | Gallican 12 through *affertis munera :* |
| 12 | *terribili* to the end of Gallican 12, then Gallican 13 |

### Psalmus 91

Friday Lauds. Gallican 1 is the title *Psalmus cantici, in die sabbati.* and is dropped. Gallican 8 splits after *iniquitatem*, and *ut intereant* joins Gallican 9. Gallican 15 joins Gallican 16 through *ut annuntient*.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 2 |
| 2 | Gallican 3 |
| 3 | Gallican 4 |
| 4 | Gallican 5 |
| 5 | Gallican 6 |
| 6 | Gallican 7 |
| 7 | Gallican 8 through *operantur iniquitatem,* |
| 8 | *ut intereant* to the end of Gallican 8, then Gallican 9 |
| 9 | Gallican 10 |
| 10 | Gallican 11 |
| 11 | Gallican 12 |
| 12 | Gallican 13 |
| 13 | Gallican 14 |
| 14 | Gallican 15, then Gallican 16 through *ut annuntient* |
| 15 | *quoniam rectus* to the end of Gallican 16 |

### Psalmus 148

Said every day at Lauds, with Psalms 149 and 150. Drop *Alleluia.* from Gallican 1. Gallican 4 joins Gallican 5 through *laudent nomen Domini.* Gallican 12 joins Gallican 13. Gallican 14 splits after *populi sui*, and the closing *Alleluia.* is left off the last line.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Alleluia.* |
| 2 | Gallican 2 |
| 3 | Gallican 3 |
| 4 | Gallican 4, then Gallican 5 through *laudent nomen Domini.* |
| 5 | *Quia ipse dixit* to the end of Gallican 5 |
| 6 | Gallican 6 |
| 7 | Gallican 7 |
| 8 | Gallican 8 |
| 9 | Gallican 9 |
| 10 | Gallican 10 |
| 11 | Gallican 11 |
| 12 | Gallican 12, then Gallican 13 |
| 13 | Gallican 14 through *populi sui.* |
| 14 | *Hymnus omnibus sanctis* through *appropinquanti sibi.* |

### Psalmus 149

Said every day at Lauds, after Psalm 148. Drop *Alleluia.* from Gallican 1, and leave the closing *Alleluia.* off Gallican 9. The nine stored verses stay whole apart from those two cuts.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Alleluia.* |
| 2 | Gallican 2 |
| 3 | Gallican 3 |
| 4 | Gallican 4 |
| 5 | Gallican 5 |
| 6 | Gallican 6 |
| 7 | Gallican 7 |
| 8 | Gallican 8 |
| 9 | Gallican 9 through *sanctis eius.* |

### Psalmus 150

The last psalm of Lauds. Drop *Alleluia.* from Gallican 1. Gallican 5 joins Gallican 6 through *laudet Dominum*, and the closing *Alleluia.* is left off.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Alleluia.* |
| 2 | Gallican 2 |
| 3 | Gallican 3 |
| 4 | Gallican 4 |
| 5 | Gallican 5, then Gallican 6 through *Dominum !* |

### Psalmus 119

| Office line | Gallican verses | Latin |
| --- | --- | --- |
| 1 | 1 | Drop *Canticum graduum.* |
| 2 | 2 | As stored |
| 3 | 3 | As stored |
| 4 | 4 | As stored |
| 5 | 5 and 6 | *Heu mihi… Cedar ;* followed by *multum incola fuit anima mea.* |
| 6 | 7 | *Cum his qui oderunt pacem…* |

### Psalmus 122

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Canticum graduum.* |
| 2 | Gallican 2 through *manibus dominorum suorum* |
| 3 | *sicut oculi ancillae* to the end of Gallican 2 |
| 4 | Gallican 3 |
| 5 | Gallican 4 |

### Psalmus 123

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Canticum graduum.*, then Gallican 2 through *nisi quia Dominus erat in nobis :* |
| 2 | *cum exsurgerent* to the end of Gallican 2, then Gallican 3 through *forte vivos deglutissent nos* |
| 3 | *cum irasceretur* to the end of Gallican 3, then Gallican 4 |
| 4 | Gallican 5, from *torrentem* |
| 5 | Gallican 6 |
| 6 | Gallican 7 through *de laqueo venantium* |
| 7 | *laqueus contritus est* to the end of Gallican 7 |
| 8 | Gallican 8, *Adiutorium nostrum* |

### Psalmus 124

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Canticum graduum.*, then *in Ierusalem.* |
| 2 | *Montes in circuitu eius* to the end of Gallican 2 |
| 3 | Gallican 3 |
| 4 | Gallican 4, *benefac* |
| 5 | Gallican 5, *Declinantes* |

### Psalmus 125

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Canticum graduum.* |
| 2 | Gallican 2 through *et lingua nostra exsultatione.* |
| 3 | *Tunc dicent inter gentes* to the end of Gallican 2 |
| 4 | Gallican 3 |
| 5 | Gallican 4 |
| 6 | Gallican 5 |
| 7 | Gallican 6 through *mittentes semina sua.* |
| 8 | *Venientes autem* to the end of Gallican 6 |

### Psalmus 126

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Canticum graduum Salomonis.*, through *qui aedificant eam.* |
| 2 | *Nisi Dominus custodierit* to the end of Gallican 1 |
| 3 | Gallican 2 through *panem doloris.* |
| 4 | *Cum dederit* to the end of Gallican 2, then Gallican 3 through *fructus ventris.* |
| 5 | Gallican 4, *Sicut sagittae* |
| 6 | Gallican 5, *Beatus vir* |

### Psalmi 120–121, 127–132

Each keeps its Gallican verse numbers. The Office drops the title from the Latin of verse 1.

- 120, 121, 127–129, 131: drop *Canticum graduum.*
- 130 and 132: drop *Canticum graduum David.*

*David* belongs to the title, so it goes with it. The verse then begins at *Domine, non est* and *Ecce quam bonum*.

### Psalmus 133

Shown at Compline. Splits Gallican verse 1: line 1 drops *Canticum graduum.* and runs through *omnes servi Domini :*; line 2 begins *qui statis in domo*. Gallican verses 2 and 3 stay as they are.

| Office line | Latin |
| --- | --- |
| 1 | Gallican 1, drop *Canticum graduum.*, through *omnes servi Domini :* |
| 2 | Gallican 1 from *qui statis in domo* to the end |
| 3 | Gallican 2 |
| 4 | Gallican 3 |

## Not entered

Every other psalm, 2–11, 20–49, 51–65, 67–74, 76–90, 92–118, and 134–147. The Office still shows those in Gallican verses.
