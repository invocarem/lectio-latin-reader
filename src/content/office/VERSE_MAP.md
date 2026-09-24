# Office verse map

The Gallican psalter in `src/content/psalter/latin.md` stays as it is. Lectio reads it unchanged. The Office lines a psalm out through `src/content/office/verseMap.ts`.

A psalm that is not listed here is shown in Gallican verses. Do not invent a lining. Add a psalm only when its Benedictine verses are known: which Gallican verses join, which title to drop from the Latin, and what the Office line numbers are.

An Office line names one or more Gallican verse numbers, in order. Latin and Douay for those numbers are joined. `dropLatinPrefix` is removed from the start of the Latin of the first of those verses. The number on the page is the Office line, not the Gallican verse number.

The cursus cuts (Psalms 9 and 17 at Prime, Psalm 118 in sections of eight, and the Vespers halves) are which day receives which Gallican verses. They are not this map.

## Tracking

Check a psalm when its Benedictine lining is finished. A title drop alone is not finished.

- [x] 1
- [ ] 2
- [ ] 3
- [ ] 4
- [ ] 5
- [ ] 6
- [ ] 7
- [ ] 8
- [ ] 9
- [ ] 10
- [ ] 11
- [x] 12
- [ ] 13
- [x] 14
- [ ] 15
- [ ] 16
- [ ] 17
- [ ] 18
- [ ] 19
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
- [ ] 50
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
- [ ] 66
- [ ] 67
- [ ] 68
- [ ] 69
- [ ] 70
- [ ] 71
- [ ] 72
- [ ] 73
- [ ] 74
- [ ] 75
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
- [ ] 91
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
- [ ] 122
- [ ] 123
- [ ] 124
- [ ] 125
- [ ] 126
- [ ] 127
- [ ] 128
- [ ] 129
- [ ] 130
- [ ] 131
- [ ] 132
- [ ] 133
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
- [ ] 148
- [ ] 149
- [ ] 150

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

### Psalmus 119

| Office line | Gallican verses | Latin |
| --- | --- | --- |
| 1 | 1 | Drop *Canticum graduum.* |
| 2 | 2 | As stored |
| 3 | 3 | As stored |
| 4 | 4 | As stored |
| 5 | 5 and 6 | *Heu mihi… Cedar ;* followed by *multum incola fuit anima mea.* |
| 6 | 7 | *Cum his qui oderunt pacem…* |

### Psalmi 120–133

Each keeps its Gallican verse numbers. The Office drops the title from the Latin of verse 1.

- 120–125, 127–129, 131, 133: drop *Canticum graduum.*
- 126: drop *Canticum graduum Salomonis.*
- 130 and 132: drop *Canticum graduum David.*

*Salomonis* and *David* belong to the title, so they go with it. The verse then begins at *Nisi Dominus*, *Domine, non est*, and *Ecce quam bonum*.

## Not entered

Every other psalm, 2–11, 15–118, and 134–150. The Office still shows those in Gallican verses.
