# Release 1.0 — Lectio per cancellos

A Latin reader for St Bernard of Clairvaux. The weekly psalm cursus is the first work, because it follows the clock. Phase 1 of the cursus is the psalms of the hours. It is not the Divine Office, so this release does not call it that.

The bundle ID stays `com.invocarem.lectiolatinreader`. The church-window icon stays as it is.

## What this release is

Three works, in this order on the home screen:

1. *Cursus psalmorum* — Psalms of the hours, according to the Rule
2. *De gradibus humilitatis et superbiae* — the Steps of Humility and Pride
3. *Sermones in Cantica Canticorum* — Sermons on the Song of Songs

Rule, Confessions, the Psalter, and the Song itself stay under Other works.

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

> A Latin reader for St Bernard of Clairvaux. It opens on the weekly cursus, the psalms of the hours according to the Rule, then the Steps of Humility and Pride and the Sermons on the Song of Songs. Each page is a short Latin lectio, with a close English and a gloss on any word. The name is from the Song of Songs: he looks through the lattices.

Keywords (the Latin name will not be what people type):

`bernard, clairvaux, latin, sermons, song of songs, humility, psalms, cursus`

## Before the screenshots

1. On the Mac, run `npm run cap:sync`, then archive. Raise the build number. The display name in the project is already **Lectio per cancellos**. The build already on TestFlight still says Lectio and will not pick this up.
2. The Xcode project includes iPad as well as iPhone. For an iPhone-only release, set the target to iPhone before that archive. If it stays universal, App Store Connect also requires a 13-inch iPad screenshot set.
3. On the phone or the Simulator, read the name under the icon. If iOS cuts it to “Lectio per…”, shorten only that label to **Cancelli**. Leave the store name as the full phrase.
4. Screenshots from the 6.7-inch iPhone: the home screen (all three works), one page of the Steps, one sermon page, one cursus page.

## Submitting it

In App Store Connect, open the app already used for TestFlight and use the **App Store** tab. Do not create a new app.

1. Create version **1.0** and attach the new archive.
2. Fill in the name, subtitle, description, and keywords above.
3. Privacy: **Data Not Collected**. Add a privacy-policy URL and a support URL. One public page is enough: no account, no analytics, the texts stay on the phone.
4. Export compliance: **No**. The app already declares no non-exempt encryption.
5. Submit for review. After approval, release it yourself if you chose manual release. TestFlight testers stay as they are.
