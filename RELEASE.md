# Release 1.0 — Lectio per cancellos

A Latin reader and a companion for a journey. The frame is the Benedictine office: the weekly cursus of the hours, all 150 psalms, set so the whole Psalter can be prayed every week or every fortnight. This release adds the **session**: a measured pass through the Psalms — or through a work — one slice at a time, so a person with a busy life can still finish. The tool is offered as a help for the journey out of a busy, working life into the spiritual domain: a small gate opened a little each day. It is not the Divine Office, so this release does not call it that.

The bundle ID stays `com.invocarem.lectiolatinreader`. The church-window icon stays as it is.

## What this release is

Three works, in this order on the home screen:

1. *Cursus psalmorum* — Psalms of the hours, according to the Rule
2. *De gradibus humilitatis et superbiae* — the Steps of Humility and Pride
3. *Sermones in Cantica Canticorum* — Sermons on the Song of Songs

Rule, Confessions, the Psalter, and the Song itself stay under Other works.

Each session work shows a pass count on its card — **Pass: `slices sat` / `total`** — so the progress toward finishing is always in front of you.

### Why a pass

A session is one pass through a work. Completing the 150 psalms is a hard challenge for anyone whose days are already full. The session turns that large goal into a patient count: it measures how much of the work is finished and opens the next step, so the reader is never left to wonder where to go. Looked at honestly, this is the point of the tool — a help for the journey that steps from an everyday, economic life outward into the spiritual domain, one psalm, one section, one day at a time.

Two kinds of pass ship:

- **The Psalter (cursus).** A pass is the weekly cursus in **seven** or **fourteen** days. Each psalm is a slice; the panel browses the week, ticks each psalm when it is done, and stays open wherever a psalm is opened. A fortnight splits Vigils so the whole office still fits. The pass can be **exported and imported** as a file, and an office line can be **highlighted** with a note.
- **A lectio work** (De gradibus, the Confessions, the Rule, the Sermons on the Song of Songs). One pass is the whole work, read section by section. The panel groups the sections by chapter, ticks each one, and offers an **open the next slice not yet read** jump. Each work keeps its own pass.

### Why “cursus”

The home screen names the app in the small line, **Lectio per cancellos**, and the large line is the English **A Latin reader**.

The card and the reader use **Cursus**, not Officium. Officium would name the finished hour: opening, Gloria, Kyrie, Pater, canticle, hymn, collect. Those are later sections. What ships now is the weekly round of psalms.

Labels already in the app:

| Place | Text |
| --- | --- |
| Card kicker | Cursus |
| Card title | Cursus psalmorum |
| Card English line | Psalms of the hours |
| Card meta | according to the Rule |
| Second button | Cursus |
| Reader title | Cursus |
| Reader subtitle, line mode | Lectio · according to the Rule |
| Reader subtitle, hour mode | Cursus · according to the Rule |

The Lectio button stays. It is the reading mode, not the app name.

## Store listing

| Field | Text |
| --- | --- |
| Name | Lectio per cancellos |
| Subtitle | A Latin reader |
| Bundle ID | com.invocarem.lectiolatinreader |
| Category | Books |
| Secondary category | Reference |
| Price | Free |
| Age rating | 4+ |

Description:

> A Latin reader and a companion for the Benedictine office. It opens on the weekly cursus — the 150 psalms of the hours, according to the Rule — then on the Steps of Humility and Pride and the Sermons on the Song of Songs. A session measures a pass through the Psalms, in seven or fourteen days, or through a work, one slice at a time, so a busy life can still finish. Each page is a short Latin lectio, with a close English and a gloss on any word. The name is from the Song of Songs: he looks through the lattices.

Keywords (the Latin name will not be what people type):

`bernard, clairvaux, benedict, psalter, psalms, latin, cursus, office, lectio, meditation, sermons, song of songs, humility`

## Before the screenshots

1. On the Mac, run `npm run cap:sync`, then archive. Raise the build number. The name under the icon is **Lectio**, because the full phrase is cut off on an iPhone home screen. The store name stays **Lectio per cancellos**.
2. The Xcode project includes iPad as well as iPhone. For an iPhone-only release, set the target to iPhone before that archive. If it stays universal, App Store Connect also requires a 13-inch iPad screenshot set.
3. On the phone or the Simulator, read the name under the icon. It should say **Lectio**.
4. Open a session: on the office (cursus) screen turn on the **Session** switch and open the panel, then mark a psalm done; on a lectio work, open its panel and jump to the next slice. Read the count on the card under the work's title.
5. Screenshots from the 6.7-inch iPhone: the home screen (the three works, with two pass counts), one cursus page, one **session panel** over the cursus, one page of the Steps, one sermon page.

## Submitting it

In App Store Connect, open the app already used for TestFlight and use the **App Store** tab. Do not create a new app.

1. Create version **1.0** and attach the new archive.
2. Fill in the name, subtitle, description, and keywords above.
3. Privacy: **Data Not Collected**. Add a privacy-policy URL and a support URL. One public page is enough: no account, no analytics, the texts stay on the phone. A finished pass exists only on the phone (or in a file the reader exports on purpose).
4. Export compliance: **No**. The app already declares no non-exempt encryption.
5. Submit for review. After approval, release it yourself if you chose manual release. TestFlight testers stay as they are.
