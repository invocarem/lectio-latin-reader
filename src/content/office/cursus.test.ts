/// <reference types="vitest/globals" />
import { hourSlots, psalmsInWeek } from "./cursus";
import { sliceVerses } from "./resolve";

describe("weekly cursus", () => {
  test("every Gallican psalm from 1 to 150 appears in the week", () => {
    const seen = new Set(psalmsInWeek());
    const missing = Array.from({ length: 150 }, (_, i) => i + 1).filter((n) => !seen.has(n));
    expect(missing).toEqual([]);
  });

  test("Thursday Terce is Psalms 119, 120, and 121", () => {
    expect(hourSlots("thu", "terce").map((slot) => slot.slices.map((slice) => slice.psalm))).toEqual([
      [119],
      [120],
      [121],
    ]);
  });

  test("Prime splits Psalm 9 and Psalm 17 on the Rule's verse cuts", () => {
    const tue = hourSlots("tue", "prime")[2].slices[0];
    const wed = hourSlots("wed", "prime")[0].slices[0];
    const fri = hourSlots("fri", "prime")[2].slices[0];
    const sat = hourSlots("sat", "prime")[0].slices[0];
    expect(tue).toEqual({ psalm: 9, from: 2, to: 19 });
    expect(wed).toEqual({ psalm: 9, from: 20, to: 39 });
    expect(fri).toEqual({ psalm: 17, from: 2, to: 25 });
    expect(sat).toEqual({ psalm: 17, from: 26, to: 51 });
  });

  test("Monday Vespers joins Psalms 115 and 116 in one slot", () => {
    const joined = hourSlots("mon", "vespers")[2];
    expect(joined.slices.map((slice) => slice.psalm)).toEqual([115, 116]);
  });

  test("ferial Vigils twelves are marked custom; Sunday's twelve are not", () => {
    const sunTwelve = hourSlots("sun", "vigils").slice(2);
    const monTwelve = hourSlots("mon", "vigils").slice(2);
    expect(sunTwelve.every((slot) => !slot.custom)).toBe(true);
    expect(monTwelve).toHaveLength(12);
    expect(monTwelve.every((slot) => slot.custom)).toBe(true);
  });

  test("Psalm 119 is lined out for the Office without editing the Gallican text", () => {
    const verses = sliceVerses({ psalm: 119 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(verses[0].latin.startsWith("Ad Dominum")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[4].latin).toContain("Heu mihi");
    expect(verses[4].latin).toContain("multum incola fuit anima mea");
    expect(verses[5].latin.startsWith("Cum his qui oderunt pacem")).toBe(true);
  });

  test("Psalm 12 is lined out by splitting Gallican verses", () => {
    const verses = sliceVerses({ psalm: 12 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(verses[0].latin.startsWith("Usquequo, Domine")).toBe(true);
    expect(verses[2].latin.endsWith("Domine Deus meus.")).toBe(true);
    expect(verses[3].latin.startsWith("Illumina oculos meos")).toBe(true);
    expect(verses[3].latin.endsWith("adversus eum.")).toBe(true);
    expect(verses[4].latin.startsWith("Qui tribulant me")).toBe(true);
    expect(verses[4].latin.endsWith("speravi.")).toBe(true);
    expect(verses[5].latin.startsWith("Exsultabit cor meum")).toBe(true);
  });

  test("Psalm 14 is lined out into its seven Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 14 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(verses[0].latin.startsWith("Domine, quis habitabit")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David.")).toBe(false);
    expect(verses[2].latin.endsWith("in lingua sua,")).toBe(true);
    expect(verses[3].latin.startsWith("nec fecit proximo suo malum")).toBe(true);
    expect(verses[3].latin.endsWith("adversus proximos suos.")).toBe(true);
    expect(verses[4].latin.startsWith("Ad nihilum deductus est")).toBe(true);
    expect(verses[4].latin.endsWith("glorificat.")).toBe(true);
    expect(verses[5].latin.startsWith("Qui iurat proximo suo")).toBe(true);
    expect(verses[5].latin).toContain("qui pecuniam suam");
    expect(verses[5].latin.endsWith("non accepit :")).toBe(true);
    expect(verses[6].latin.startsWith("qui facit haec")).toBe(true);
    expect(verses[6].latin.endsWith("in aeternum.")).toBe(true);
  });

  test("Psalm 15 is lined out into its eleven Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 15 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
    ]);
    expect(verses[0].latin.startsWith("Conserva me, Domine")).toBe(true);
    expect(verses[0].latin.includes("Tituli inscriptio")).toBe(false);
    expect(verses[0].latin).toContain("Dixi Domino");
    expect(verses[0].english.startsWith("Preserve me")).toBe(true);
    expect(verses[0].english.includes("inscription of a title")).toBe(false);
    expect(verses[1].latin.startsWith("Sanctis qui sunt in terra")).toBe(true);
    expect(verses[2].latin.startsWith("Multiplicatae sunt infirmitates")).toBe(true);
    expect(verses[2].latin.endsWith("acceleraverunt.")).toBe(true);
    expect(verses[2].latin.includes("Non congregabo")).toBe(false);
    expect(verses[3].latin.startsWith("Non congregabo")).toBe(true);
    expect(verses[3].latin.endsWith("per labia mea.")).toBe(true);
    expect(verses[4].latin.startsWith("Dominus pars")).toBe(true);
    expect(verses[9].latin.startsWith("Quoniam non derelinques")).toBe(true);
    expect(verses[9].latin.endsWith("corruptionem.")).toBe(true);
    expect(verses[9].latin.includes("Notas mihi")).toBe(false);
    expect(verses[10].latin.startsWith("Notas mihi fecisti")).toBe(true);
    expect(verses[10].latin.endsWith("usque in finem.")).toBe(true);
    expect(verses[10].english.startsWith("Thou hast made known")).toBe(true);
  });

  test("Psalm 16 is lined out into its seventeen Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 16 });
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"],
    );
    expect(verses[0].latin.startsWith("Exaudi, Domine, iustitiam meam")).toBe(true);
    expect(verses[0].latin.includes("Oratio David")).toBe(false);
    expect(verses[1].latin.startsWith("Auribus percipe")).toBe(true);
    expect(verses[8].latin.startsWith("A resistentibus dexterae tuae")).toBe(true);
    expect(verses[8].latin.endsWith("ut pupillam oculi.")).toBe(true);
    expect(verses[9].latin.startsWith("Sub umbra alarum tuarum")).toBe(true);
    expect(verses[9].latin.endsWith("afflixerunt.")).toBe(true);
    expect(verses[10].latin.startsWith("Inimici mei animam meam")).toBe(true);
    expect(verses[10].latin.endsWith("superbiam.")).toBe(true);
    expect(verses[13].latin.startsWith("Exsurge, Domine")).toBe(true);
    expect(verses[13].latin).toContain("frameam tuam ab inimicis manus tuae.");
    expect(verses[13].latin.includes("divide eos")).toBe(false);
    expect(verses[14].latin.startsWith("Domine, a paucis de terra")).toBe(true);
    expect(verses[14].latin.endsWith("venter eorum.")).toBe(true);
    expect(verses[15].latin.startsWith("Saturati sunt filiis")).toBe(true);
    expect(verses[15].latin.endsWith("parvulis suis.")).toBe(true);
    expect(verses[16].latin.startsWith("Ego autem in iustitia")).toBe(true);
  });

  test("Psalm 17 is lined for Friday Prime and Saturday Prime", () => {
    const friday = sliceVerses({ psalm: 17, from: 2, to: 25 });
    const saturday = sliceVerses({ psalm: 17, from: 26, to: 51 });
    const numbers = Array.from({ length: 27 }, (_, i) => String(i + 1));
    expect(friday.map((verse) => verse.n)).toEqual(numbers);
    expect(saturday.map((verse) => verse.n)).toEqual(numbers);
    expect(friday[0].latin.startsWith("Diligam te, Domine")).toBe(true);
    expect(friday[0].latin.endsWith("et liberator meus.")).toBe(true);
    expect(friday[0].latin.includes("In finem")).toBe(false);
    expect(friday[1].latin.startsWith("Deus meus adiutor meus")).toBe(true);
    expect(friday[1].latin.endsWith("sperabo in eum ;")).toBe(true);
    expect(friday[2].latin.startsWith("protector meus")).toBe(true);
    expect(friday[6].latin.endsWith("clamavi :")).toBe(true);
    expect(friday[7].latin.startsWith("et exaudivit")).toBe(true);
    expect(friday[16].latin.endsWith("orbis terrarum,")).toBe(true);
    expect(friday[17].latin.startsWith("ab increpatione tua")).toBe(true);
    expect(friday[26].latin.startsWith("Et retribuet mihi Dominus")).toBe(true);
    expect(friday[26].latin.endsWith("oculorum eius.")).toBe(true);
    expect(friday[0].english.endsWith("and my deliverer.")).toBe(true);
    expect(friday[1].english.startsWith("My God is my helper")).toBe(true);
    expect(saturday[0].latin.startsWith("Cum sancto sanctus eris")).toBe(true);
    expect(saturday[10].latin.startsWith("et dedisti mihi")).toBe(true);
    expect(saturday[10].latin.endsWith("suscepit me,")).toBe(true);
    expect(saturday[11].latin.startsWith("et disciplina tua correxit")).toBe(true);
    expect(saturday[11].latin.endsWith("me docebit.")).toBe(true);
    expect(saturday[26].latin.startsWith("magnificans salutes")).toBe(true);
    expect(saturday[10].english.endsWith("held me up:")).toBe(true);
    expect(saturday[11].english.startsWith("And thy discipline hath corrected")).toBe(true);
  });

  test("Psalm 18 is lined out into its sixteen Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 18 });
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
    );
    expect(verses[0].latin.startsWith("Caeli enarrant")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[4].latin.startsWith("In sole posuit")).toBe(true);
    expect(verses[4].latin.endsWith("de thalamo suo.")).toBe(true);
    expect(verses[4].latin.includes("Exsultavit")).toBe(false);
    expect(verses[5].latin.startsWith("Exsultavit ut gigas")).toBe(true);
    expect(verses[5].latin.endsWith("egressio eius.")).toBe(true);
    expect(verses[6].latin.startsWith("Et occursus eius")).toBe(true);
    expect(verses[6].latin.endsWith("calore eius.")).toBe(true);
    expect(verses[12].latin.startsWith("Delicta quis intelligit")).toBe(true);
    expect(verses[12].latin.endsWith("parce servo tuo.")).toBe(true);
    expect(verses[13].latin.startsWith("Si mei non fuerint")).toBe(true);
    expect(verses[14].latin.endsWith("tuo semper.")).toBe(true);
    expect(verses[14].latin.includes("adiutor")).toBe(false);
    expect(verses[15].latin).toBe("Domine, adiutor meus, et redemptor meus.");
    expect(verses[4].english.endsWith("coming out of his bridechamber,")).toBe(true);
    expect(verses[5].english.startsWith("Hath rejoiced")).toBe(true);
    expect(verses[5].english.endsWith("end of heaven,")).toBe(true);
    expect(verses[15].english.startsWith("O Lord, my helper")).toBe(true);
  });

  test("Psalm 19 is lined out into its ten Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 19 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    ]);
    expect(verses[0].latin.startsWith("Exaudiat te Dominus")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[5].latin.startsWith("Impleat Dominus")).toBe(true);
    expect(verses[5].latin.endsWith("christum suum.")).toBe(true);
    expect(verses[5].latin.includes("Exaudiet")).toBe(false);
    expect(verses[6].latin.startsWith("Exaudiet illum")).toBe(true);
    expect(verses[6].latin.endsWith("dexterae eius.")).toBe(true);
    expect(verses[9].latin.startsWith("Domine, salvum fac regem")).toBe(true);
    expect(verses[5].english.endsWith("saved his anointed.")).toBe(true);
    expect(verses[6].english.startsWith("He will hear him")).toBe(true);
  });

  test("Psalm 56 is lined into its fourteen Tuesday Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 56 });
    expect(verses).toHaveLength(14);
    expect(verses[0].latin.startsWith("Miserere mei, Deus, miserere mei")).toBe(true);
    expect(verses[0].latin.endsWith("anima mea.")).toBe(true);
    expect(verses[0].latin.includes("speluncam")).toBe(false);
    expect(verses[0].english.endsWith("trusteth in thee.")).toBe(true);
    expect(verses[1].latin.startsWith("Et in umbra alarum")).toBe(true);
    expect(verses[3].latin.endsWith("conculcantes me.")).toBe(true);
    expect(verses[4].latin.startsWith("Misit Deus misericordiam")).toBe(true);
    expect(verses[4].latin.endsWith("Dormivi conturbatus.")).toBe(true);
    expect(verses[4].english.startsWith("God hath sent his mercy")).toBe(true);
    expect(verses[4].english.endsWith("I slept troubled.")).toBe(true);
    expect(verses[5].latin.startsWith("Filii hominum")).toBe(true);
    expect(verses[7].latin.endsWith("animam meam.")).toBe(true);
    expect(verses[8].latin.startsWith("Foderunt ante faciem")).toBe(true);
    expect(verses[8].english.startsWith("They dug a pit")).toBe(true);
    expect(verses[12].latin.startsWith("quoniam magnificata est")).toBe(true);
    expect(verses[13].latin.startsWith("Exaltare super caelos")).toBe(true);
    expect(verses[13].latin).toContain("super omnem terram");
  });

  test("Psalm 66 is lined out into its six Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 66 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(verses[0].latin.startsWith("Deus misereatur nostri")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[4].latin.startsWith("Confiteantur tibi populi")).toBe(true);
    expect(verses[4].latin.endsWith("fructum suum :")).toBe(true);
    expect(verses[4].latin.includes("benedicat nos Deus")).toBe(false);
    expect(verses[5].latin.startsWith("benedicat nos Deus, Deus noster")).toBe(true);
    expect(verses[5].latin).toContain("Benedicat nos Deus, et metuant eum");
    expect(verses[5].latin.endsWith("fines terrae.")).toBe(true);
    expect(verses[4].english.endsWith("her fruit.")).toBe(true);
    expect(verses[5].english.startsWith("May God, our God bless us")).toBe(true);
    expect(verses[5].english).toContain("all the ends of the earth fear him.");
  });

  test("Psalm 42 is lined into its six Tuesday Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 42 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(verses[0].latin.startsWith("Iudica me, Deus")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].english.startsWith("Judge me, O God")).toBe(true);
    expect(verses[3].latin.startsWith("Et introibo ad altare Dei")).toBe(true);
    expect(verses[3].latin.endsWith("iuventutem meam.")).toBe(true);
    expect(verses[3].english.endsWith("joy to my youth.")).toBe(true);
    expect(verses[4].latin.startsWith("Confitebor tibi in cithara")).toBe(true);
    expect(verses[4].latin.endsWith("conturbas me ?")).toBe(true);
    expect(verses[4].english.startsWith("To thee, O God my God")).toBe(true);
    expect(verses[4].english.endsWith("disquiet me?")).toBe(true);
    expect(verses[5].latin.startsWith("Spera in Deo")).toBe(true);
    expect(verses[5].latin.endsWith("Deus meus.")).toBe(true);
    expect(verses[5].english.startsWith("Hope in God")).toBe(true);
  });

  test("Psalm 50 is lined out into its twenty Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 50 });
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 20 }, (_, i) => String(i + 1)),
    );
    expect(verses[0].latin.startsWith("Miserere mei, Deus")).toBe(true);
    expect(verses[0].latin.endsWith("misericordiam tuam ;")).toBe(true);
    expect(verses[0].latin.includes("Nathan")).toBe(false);
    expect(verses[1].latin.startsWith("et secundum multitudinem")).toBe(true);
    expect(verses[1].latin.endsWith("iniquitatem meam.")).toBe(true);
    expect(verses[14].latin.startsWith("Libera me de sanguinibus")).toBe(true);
    expect(verses[15].latin.startsWith("Domine, labia mea aperies")).toBe(true);
    expect(verses[19].latin.startsWith("Tunc acceptabis sacrificium")).toBe(true);
    expect(verses[0].english.endsWith("thy great mercy.")).toBe(true);
    expect(verses[1].english.startsWith("And according to the multitude")).toBe(true);
  });

  test("Psalm 75 is lined out into its twelve Friday Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 75 });
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    );
    expect(verses[0].latin.startsWith("Notus in Iudaea Deus")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[3].latin.startsWith("Illuminans tu mirabiliter")).toBe(true);
    expect(verses[3].latin.endsWith("corde.")).toBe(true);
    expect(verses[3].latin.includes("Dormierunt")).toBe(false);
    expect(verses[4].latin.startsWith("Dormierunt somnum suum")).toBe(true);
    expect(verses[4].latin.endsWith("manibus suis.")).toBe(true);
    expect(verses[7].latin.startsWith("De caelo auditum fecisti")).toBe(true);
    expect(verses[10].latin.startsWith("Vovete et reddite")).toBe(true);
    expect(verses[10].latin.endsWith("affertis munera :")).toBe(true);
    expect(verses[11].latin.startsWith("terribili,")).toBe(true);
    expect(verses[11].latin.endsWith("reges terrae.")).toBe(true);
    expect(verses[3].english.endsWith("were troubled.")).toBe(true);
    expect(verses[4].english.startsWith("They have slept their sleep")).toBe(true);
    expect(verses[11].english.startsWith("To him that is terrible")).toBe(true);
  });

  test("Psalm 80 is lined into its fifteen Friday Vigils office lines", () => {
    const verses = sliceVerses({ psalm: 80 });
    expect(verses).toHaveLength(15);
    expect(verses[0].latin.startsWith("Exsultate Deo adiutori nostro")).toBe(true);
    expect(verses[0].latin.includes("torcularibus")).toBe(false);
    expect(verses[7].latin.startsWith("Audi, populus meus")).toBe(true);
    expect(verses[7].latin.endsWith("deum alienum.")).toBe(true);
    expect(verses[7].latin).toContain("Israël, si audieris me,");
    expect(verses[7].english.startsWith("Hear, O my people")).toBe(true);
    expect(verses[7].english).toContain("there shall be no new god in thee");
    expect(verses[11].latin.startsWith("Si populus meus audisset me")).toBe(true);
    expect(verses[12].latin.startsWith("pro nihilo forsitan")).toBe(true);
    expect(verses[14].latin.startsWith("Et cibavit eos ex adipe")).toBe(true);
  });

  test("Psalm 91 is lined out into its fifteen Friday Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 91 });
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
    );
    expect(verses[0].latin.startsWith("Bonum est confiteri Domino")).toBe(true);
    expect(verses[0].latin.includes("sabbati")).toBe(false);
    expect(verses[6].latin.startsWith("Cum exorti fuerint")).toBe(true);
    expect(verses[6].latin.endsWith("operantur iniquitatem,")).toBe(true);
    expect(verses[6].latin.includes("intereant")).toBe(false);
    expect(verses[7].latin.startsWith("ut intereant")).toBe(true);
    expect(verses[7].latin.endsWith("Domine.")).toBe(true);
    expect(verses[13].latin.startsWith("Adhuc multiplicabuntur")).toBe(true);
    expect(verses[13].latin.endsWith("ut annuntient")).toBe(true);
    expect(verses[14].latin.startsWith("quoniam rectus Dominus")).toBe(true);
    expect(verses[14].latin.endsWith("iniquitas in eo.")).toBe(true);
    expect(verses[6].english.endsWith("shall appear:")).toBe(true);
    expect(verses[7].english.startsWith("That they may perish")).toBe(true);
    expect(verses[13].english.endsWith("That they may shew,")).toBe(true);
    expect(verses[14].english.startsWith("That the Lord our God is righteous")).toBe(true);
  });

  test("Psalm 92 is lined into its seven Friday Vigils office lines", () => {
    const verses = sliceVerses({ psalm: 92 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(verses[0].latin.startsWith("Dominus regnavit, decorem")).toBe(true);
    expect(verses[0].latin.includes("fundata est terra")).toBe(false);
    expect(verses[0].latin.endsWith("praecinxit se.")).toBe(true);
    expect(verses[0].english.endsWith("hath girded himself.")).toBe(true);
    expect(verses[1].latin.startsWith("Etenim firmavit orbem")).toBe(true);
    expect(verses[1].english.startsWith("For he hath established")).toBe(true);
    expect(verses[3].latin.endsWith("vocem suam ;")).toBe(true);
    expect(verses[3].english.endsWith("their voice.")).toBe(true);
    expect(verses[4].latin.startsWith("elevaverunt flumina fluctus")).toBe(true);
    expect(verses[4].latin.endsWith("aquarum multarum.")).toBe(true);
    expect(verses[4].english.startsWith("The floods have lifted up their waves,")).toBe(true);
    expect(verses[4].english.endsWith("many waters.")).toBe(true);
    expect(verses[5].latin.startsWith("Mirabiles elationes maris")).toBe(true);
    expect(verses[5].english.startsWith("Wonderful are the surges")).toBe(true);
    expect(verses[6].latin.startsWith("Testimonia tua credibilia")).toBe(true);
  });

  test("Psalm 93 drops the Wednesday title and keeps its twenty-three verses", () => {
    const verses = sliceVerses({ psalm: 93 });
    expect(verses).toHaveLength(23);
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 23 }, (_, index) => String(index + 1)),
    );
    expect(verses[0].latin.startsWith("Deus ultionum Dominus")).toBe(true);
    expect(verses[0].latin.includes("quarta sabbati")).toBe(false);
    expect(verses[0].english.startsWith("The Lord is the God to whom revenge")).toBe(true);
    expect(verses[3].latin.startsWith("effabuntur et loquentur")).toBe(true);
    expect(verses[22].latin.startsWith("Et reddet illis iniquitatem")).toBe(true);
    expect(verses[22].latin.endsWith("Dominus Deus noster.")).toBe(true);
  });

  test("Psalm 148 is lined out into its fourteen Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 148 });
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
    );
    expect(verses[0].latin.startsWith("Laudate Dominum de caelis")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[3].latin.startsWith("Laudate eum, caeli caelorum")).toBe(true);
    expect(verses[3].latin.endsWith("laudent nomen Domini.")).toBe(true);
    expect(verses[3].latin.includes("Quia ipse")).toBe(false);
    expect(verses[4].latin.startsWith("Quia ipse dixit")).toBe(true);
    expect(verses[11].latin.startsWith("iuvenes et virgines")).toBe(true);
    expect(verses[11].latin.endsWith("eius solius.")).toBe(true);
    expect(verses[12].latin.startsWith("Confessio eius")).toBe(true);
    expect(verses[12].latin.endsWith("populi sui.")).toBe(true);
    expect(verses[13].latin).toBe(
      "Hymnus omnibus sanctis eius ; filiis Israël, populo appropinquanti sibi.",
    );
    expect(verses[13].latin.includes("Alleluia")).toBe(false);
    expect(verses[3].english.endsWith("Praise the name of the Lord.")).toBe(true);
    expect(verses[4].english.startsWith("For he spoke")).toBe(true);
    expect(verses[13].english.startsWith("A hymn to all his saints")).toBe(true);
    expect(verses[13].english.endsWith("approaching to him.")).toBe(true);
  });

  test("Psalms 149 and 150 close Lauds without the Alleluia frame", () => {
    const oneFortyNine = sliceVerses({ psalm: 149 });
    const oneFifty = sliceVerses({ psalm: 150 });
    expect(oneFortyNine.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(oneFortyNine[0].latin.startsWith("Cantate Domino canticum novum")).toBe(true);
    expect(oneFortyNine[0].latin.includes("Alleluia")).toBe(false);
    expect(oneFortyNine[6].latin.startsWith("ad faciendam vindictam")).toBe(true);
    expect(oneFortyNine[8].latin.startsWith("ut faciant in eis")).toBe(true);
    expect(oneFortyNine[8].latin.endsWith("sanctis eius.")).toBe(true);
    expect(oneFortyNine[8].latin.includes("Alleluia")).toBe(false);
    expect(oneFortyNine[8].english.endsWith("his saints.")).toBe(true);
    expect(oneFifty.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5"]);
    expect(oneFifty[0].latin.startsWith("Laudate Dominum in sanctis eius")).toBe(true);
    expect(oneFifty[0].latin.includes("Alleluia")).toBe(false);
    expect(oneFifty[4].latin.startsWith("Laudate eum in cymbalis")).toBe(true);
    expect(oneFifty[4].latin.endsWith("laudet Dominum !")).toBe(true);
    expect(oneFifty[4].latin.includes("Alleluia")).toBe(false);
    expect(oneFifty[4].english.endsWith("praise the Lord.")).toBe(true);
  });

  test("Psalm 13 drops its title", () => {
    expect(sliceVerses({ psalm: 13 })[0].latin.startsWith("Dixit insipiens")).toBe(true);
  });

  test("Psalm 6 drops its title verse and keeps verses 2–11", () => {
    const verses = sliceVerses({ psalm: 6 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    ]);
    expect(verses[0].latin.startsWith("Domine, ne in furore tuo arguas me")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].latin.includes("Pro octava")).toBe(false);
    expect(verses[1].latin.startsWith("Miserere mei, Domine")).toBe(true);
    expect(verses[9].latin.startsWith("Erubescant")).toBe(true);
  });

  test("Psalm 7 splits Gallican verses 7–9 for Tuesday Prime", () => {
    const verses = sliceVerses({ psalm: 7 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18",
    ]);
    expect(verses[0].latin.startsWith("Domine Deus meus, in te speravi")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].latin.includes("Chusi")).toBe(false);
    expect(verses[5].latin.endsWith("inimicorum meorum :")).toBe(true);
    expect(verses[5].latin.includes("et exsurge")).toBe(false);
    expect(verses[6].latin.startsWith("et exsurge, Domine Deus meus")).toBe(true);
    expect(verses[6].latin.endsWith("circumdabit te :")).toBe(true);
    expect(verses[6].latin.includes("inimicorum meorum")).toBe(false);
    expect(verses[7].latin.startsWith("et propter hanc")).toBe(true);
    expect(verses[7].latin.endsWith("iudicat populos")).toBe(true);
    expect(verses[8].latin.startsWith("Iudica me, Domine")).toBe(true);
    expect(verses[17].latin.startsWith("Confitebor Domino")).toBe(true);
  });

  test("Psalm 3 drops its title verse and keeps verses 2–9 for Matins", () => {
    const verses = sliceVerses({ psalm: 3 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8",
    ]);
    expect(verses[0].latin.startsWith("Domine, quid multiplicati sunt")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].latin.includes("Absalom")).toBe(false);
    expect(verses[0].latin.includes("Non est salus")).toBe(false);
    expect(verses[1].latin.startsWith("multi dicunt animae meae")).toBe(true);
    expect(verses[7].latin.startsWith("Domini est salus")).toBe(true);
    expect(verses[7].latin.endsWith("benedictio tua.")).toBe(true);
  });

  test("Psalm 8 splits Gallican verse 2 and joins verses 6–7 for Tuesday Prime", () => {
    const verses = sliceVerses({ psalm: 8 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(verses[0].latin.startsWith("Domine, Dominus noster")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].latin.endsWith("in universa terra !")).toBe(true);
    expect(verses[0].latin.includes("quoniam elevata")).toBe(false);
    expect(verses[1].latin.startsWith("quoniam elevata est magnificentia tua")).toBe(true);
    expect(verses[1].latin.includes("Domine, Dominus noster")).toBe(false);
    expect(verses[5].latin.startsWith("Minuisti eum")).toBe(true);
    expect(verses[5].latin.endsWith("manuum tuarum.")).toBe(true);
    expect(verses[8].latin.startsWith("Domine, Dominus noster")).toBe(true);
    expect(verses[8].latin.endsWith("in universa terra !")).toBe(true);
  });

  test("Psalm 10 splits Gallican verse 5 for Wednesday Prime", () => {
    const verses = sliceVerses({ psalm: 10 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8",
    ]);
    expect(verses[0].latin.startsWith("In Domino confido")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[3].latin.startsWith("Dominus in templo sancto suo")).toBe(true);
    expect(verses[3].latin.endsWith("sedes eius.")).toBe(true);
    expect(verses[3].latin.includes("Oculi eius")).toBe(false);
    expect(verses[4].latin.startsWith("Oculi eius")).toBe(true);
    expect(verses[4].latin.endsWith("filios hominum.")).toBe(true);
    expect(verses[4].latin.includes("Dominus in templo")).toBe(false);
    expect(verses[7].latin.startsWith("Quoniam iustus Dominus")).toBe(true);
  });

  test("Psalm 11 splits Gallican verse 6 for Wednesday Prime", () => {
    const verses = sliceVerses({ psalm: 11 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(verses[0].latin.startsWith("Salvum me fac, Domine")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[4].latin.startsWith("Propter miseriam inopum")).toBe(true);
    expect(verses[4].latin.endsWith("dicit Dominus.")).toBe(true);
    expect(verses[4].latin.includes("Ponam")).toBe(false);
    expect(verses[5].latin.startsWith("Ponam in salutari")).toBe(true);
    expect(verses[5].latin.endsWith("fiducialiter agam in eo.")).toBe(true);
    expect(verses[5].latin.includes("Propter miseriam")).toBe(false);
    expect(verses[8].latin.startsWith("In circuitu impii")).toBe(true);
    expect(verses[0].english.endsWith("from among the children of men.")).toBe(true);
    expect(verses[5].english.startsWith("I will set him in safety")).toBe(true);
  });

  test("Compline Psalm 90 drops its Laus cantici David title", () => {
    const verses = sliceVerses({ psalm: 90 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16",
    ]);
    expect(verses[0].latin.startsWith("Qui habitat")).toBe(true);
    expect(verses[0].latin.includes("Laus cantici David")).toBe(false);
    expect(verses[1].latin.startsWith("Dicet Domino")).toBe(true);
  });

  test("Compline Psalm 133 splits Gallican verse 1 into two office lines", () => {
    const verses = sliceVerses({ psalm: 133 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4"]);
    expect(verses[0].latin.startsWith("Ecce nunc benedicite")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[0].latin.endsWith("omnes servi Domini :")).toBe(true);
    expect(verses[0].latin.includes("qui statis")).toBe(false);
    expect(verses[1].latin.startsWith("qui statis in domo")).toBe(true);
    expect(verses[1].latin.endsWith("domus Dei nostri.")).toBe(true);
    expect(verses[1].latin.includes("Ecce nunc")).toBe(false);
    expect(verses[2].latin.startsWith("In noctibus")).toBe(true);
    expect(verses[3].latin.startsWith("Benedicat te Dominus")).toBe(true);
    expect(verses[0].english.endsWith("all ye servants of the Lord:")).toBe(true);
    expect(verses[1].english.startsWith("Who stand in the house")).toBe(true);
  });

  test("Psalm 134 is lined out into its twenty-one Wednesday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 134 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21",
    ]);
    expect(verses[0].latin.startsWith("Laudate nomen Domini")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[6].latin.startsWith("Educens nubes")).toBe(true);
    expect(verses[6].latin.endsWith("fecit ;")).toBe(true);
    expect(verses[6].latin.includes("qui producit")).toBe(false);
    expect(verses[7].latin.startsWith("qui producit ventos")).toBe(true);
    expect(verses[7].latin.endsWith("usque ad pecus.")).toBe(true);
    expect(verses[7].latin.includes("primogenita Aegypti")).toBe(true);
    expect(verses[7].latin.includes("Educens nubes")).toBe(false);
    expect(verses[20].latin.startsWith("Benedictus Dominus ex Sion")).toBe(true);
    expect(verses[20].latin.endsWith("qui habitat in Ierusalem.")).toBe(true);
    expect(verses[6].english.endsWith("for the rain.")).toBe(true);
  });

  test("Psalm 135 is lined out with the Alleluia dropped and verse 26 split", () => {
    const verses = sliceVerses({ psalm: 135 });
    expect(verses.length).toBe(27);
    expect(verses[0].latin.startsWith("Confitemini Domino, quoniam bonus")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[0].english.startsWith("Praise the Lord")).toBe(true);
    expect(verses[0].english.includes("Alleluia")).toBe(false);
    expect(verses[25].latin.startsWith("Confitemini Deo caeli")).toBe(true);
    expect(verses[25].latin.endsWith("misericordia eius.")).toBe(true);
    expect(verses[25].latin.includes("Confitemini Domino dominorum")).toBe(false);
    expect(verses[26].latin.startsWith("Confitemini Domino dominorum")).toBe(true);
    expect(verses[26].latin.endsWith("misericordia eius.")).toBe(true);
    expect(verses[26].latin.includes("Confitemini Deo caeli")).toBe(false);
    expect(verses[25].english.startsWith("Give glory to the God of heaven")).toBe(true);
    expect(verses[26].english.startsWith("Give glory to the Lord of lords")).toBe(true);
  });

  test("Psalm 136 drops its title and splits Gallican verses 3, 6, and 7", () => {
    const verses = sliceVerses({ psalm: 136 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
    ]);
    expect(verses[0].latin.startsWith("Super flumina Babylonis")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].latin.includes("Ieremiae")).toBe(false);
    expect(verses[2].latin.startsWith("quia illic interrogaverunt")).toBe(true);
    expect(verses[2].latin.endsWith("verba cantionum ;")).toBe(true);
    expect(verses[2].latin.includes("abduxerunt")).toBe(false);
    expect(verses[3].latin.startsWith("et qui abduxerunt nos")).toBe(true);
    expect(verses[3].latin.endsWith("de canticis Sion.")).toBe(true);
    expect(verses[6].latin.startsWith("Adhaereat lingua mea")).toBe(true);
    expect(verses[6].latin.endsWith("si non meminero tui ;")).toBe(true);
    expect(verses[7].latin.startsWith("si non proposuero Ierusalem")).toBe(true);
    expect(verses[8].latin.startsWith("Memor esto, Domine")).toBe(true);
    expect(verses[8].latin.endsWith("in die Ierusalem :")).toBe(true);
    expect(verses[9].latin.startsWith("qui dicunt")).toBe(true);
    expect(verses[9].latin.endsWith("fundamentum in ea.")).toBe(true);
    expect(verses[11].latin.startsWith("Beatus qui tenebit")).toBe(true);
    expect(verses[2].english.endsWith("the words of songs.")).toBe(true);
    expect(verses[9].english.startsWith("Who say")).toBe(true);
  });

  test("Psalm 137 drops its title and re-lines the first two Gallican verses", () => {
    const verses = sliceVerses({ psalm: 137 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(verses[0].latin.startsWith("Confitebor tibi, Domine")).toBe(true);
    expect(verses[0].latin.includes("Ipsi David")).toBe(false);
    expect(verses[0].latin.endsWith("audisti verba oris mei")).toBe(true);
    expect(verses[0].latin.includes("In conspectu")).toBe(false);
    expect(verses[1].latin.startsWith("In conspectu angelorum")).toBe(true);
    expect(verses[1].latin.endsWith("confitebor nomini tuo")).toBe(true);
    expect(verses[1].latin.includes("super misericordia")).toBe(false);
    expect(verses[2].latin.startsWith("super misericordia tua")).toBe(true);
    expect(verses[2].latin.endsWith("nomen sanctum tuum.")).toBe(true);
    expect(verses[8].latin.startsWith("Dominus retribuet pro me")).toBe(true);
    expect(verses[0].english.startsWith("I will praise thee")).toBe(true);
    expect(verses[1].english.startsWith("I will sing praise")).toBe(true);
    expect(verses[2].english.startsWith("For thy mercy")).toBe(true);
  });

  test("Psalm 4 drops the title verse and splits Gallican verse 2", () => {    const verses = sliceVerses({ psalm: 4 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    expect(verses[0].latin.startsWith("Cum invocarem")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].latin.endsWith("dilatasti mihi.")).toBe(true);
    expect(verses[0].latin.includes("Miserere mei")).toBe(false);
    expect(verses[1].latin.startsWith("Miserere mei")).toBe(true);
    expect(verses[1].latin.endsWith("orationem meam.")).toBe(true);
    expect(verses[1].english.startsWith("Have mercy on me")).toBe(true);
    expect(verses[2].latin.startsWith("Filii hominum")).toBe(true);
    expect(verses[4].latin.startsWith("Irascimini")).toBe(true);
    expect(verses[9].latin.startsWith("quoniam tu, Domine")).toBe(true);
  });

  test("Psalm 127 splits the vine and the olive plants", () => {
    const verses = sliceVerses({ psalm: 127 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(verses[0].latin.startsWith("Beati omnes")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[0].english.startsWith("Blessed are all")).toBe(true);
    expect(verses[2].latin.startsWith("Uxor tua")).toBe(true);
    expect(verses[2].latin.endsWith("domus tuae ;")).toBe(true);
    expect(verses[2].latin.includes("filii tui")).toBe(false);
    expect(verses[3].latin.startsWith("filii tui")).toBe(true);
    expect(verses[3].latin.endsWith("mensae tuae.")).toBe(true);
    expect(verses[6].latin.startsWith("Et videas filios")).toBe(true);
    expect(verses[2].english.endsWith("sides of thy house.")).toBe(true);
    expect(verses[3].english.startsWith("Thy children")).toBe(true);
  });

  test("Psalm 128 joins the necks of sinners with those who hate Sion", () => {
    const verses = sliceVerses({ psalm: 128 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(verses[0].latin.startsWith("Saepe expugnaverunt")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[0].english.startsWith("Often have they fought")).toBe(true);
    expect(verses[3].latin.startsWith("Dominus iustus concidit")).toBe(true);
    expect(verses[3].latin).toContain("Confundantur, et convertantur");
    expect(verses[3].latin.endsWith("oderunt Sion.")).toBe(true);
    expect(verses[6].latin.startsWith("Et non dixerunt")).toBe(true);
    expect(verses[6].latin.endsWith("nomine Domini.")).toBe(true);
  });

  test("Psalm 115 is lined out into its eight Monday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 115 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(verses[0].latin.startsWith("Credidi, propter quod locutus sum")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[4].latin.startsWith("Vota mea Domino reddam coram")).toBe(true);
    expect(verses[4].latin).toContain("Pretiosa in conspectu Domini");
    expect(verses[4].latin.endsWith("sanctorum eius.")).toBe(true);
    expect(verses[5].latin.startsWith("O Domine, quia ego servus tuus")).toBe(true);
    expect(verses[5].latin.endsWith("ancillae tuae.")).toBe(true);
    expect(verses[5].latin.includes("Dirupisti")).toBe(false);
    expect(verses[6].latin.startsWith("Dirupisti vincula mea")).toBe(true);
    expect(verses[6].latin.endsWith("invocabo.")).toBe(true);
    expect(verses[7].latin.startsWith("Vota mea Domino reddam in conspectu")).toBe(true);
    expect(verses[7].latin.endsWith("Ierusalem.")).toBe(true);
    expect(verses[5].english.endsWith("thy handmaid.")).toBe(true);
    expect(verses[6].english.startsWith("Thou hast broken my bonds")).toBe(true);
  });

  test("Psalm 116 drops Alleluia and keeps its two verses", () => {
    const verses = sliceVerses({ psalm: 116 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2"]);
    expect(verses[0].latin.startsWith("Laudate Dominum, omnes gentes")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[1].latin.startsWith("Quoniam confirmata est")).toBe(true);
  });

  test("Psalm 141 is lined out into its ten Friday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 141 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    ]);
    expect(verses[0].latin.startsWith("Voce mea ad Dominum clamavi")).toBe(true);
    expect(verses[0].latin.includes("spelunca")).toBe(false);
    expect(verses[2].latin.startsWith("in deficiendo")).toBe(true);
    expect(verses[2].latin.endsWith("semitas meas.")).toBe(true);
    expect(verses[3].latin.startsWith("In via hac")).toBe(true);
    expect(verses[3].latin.endsWith("laqueum mihi.")).toBe(true);
    expect(verses[4].latin.endsWith("cognosceret me :")).toBe(true);
    expect(verses[5].latin.startsWith("periit fuga a me")).toBe(true);
    expect(verses[5].latin.endsWith("animam meam.")).toBe(true);
    expect(verses[7].latin.endsWith("humiliatus sum nimis.")).toBe(true);
    expect(verses[8].latin.startsWith("Libera me a persequentibus")).toBe(true);
    expect(verses[9].latin.startsWith("Educ de custodia")).toBe(true);
    expect(verses[2].english.endsWith("my paths.")).toBe(true);
    expect(verses[5].english.startsWith("Flight hath failed me")).toBe(true);
    expect(verses[8].english.startsWith("Deliver me from my persecutors")).toBe(true);
  });

  test("Psalm 143 is lined into two Friday Vespers halves", () => {
    const first = sliceVerses({ psalm: 143, from: 1, to: 8 });
    const second = sliceVerses({ psalm: 143, from: 9, to: 15 });
    expect(first.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(second.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(first[0].latin.startsWith("Benedictus Dominus Deus meus")).toBe(true);
    expect(first[0].latin.includes("Goliath")).toBe(false);
    expect(first[1].latin.endsWith("liberator meus ;")).toBe(true);
    expect(first[1].english.endsWith("my deliverer:")).toBe(true);
    expect(first[2].latin.startsWith("protector meus")).toBe(true);
    expect(first[2].english.startsWith("My protector")).toBe(true);
    expect(first[8].latin.startsWith("quorum os locutum est")).toBe(true);
    expect(second[0].latin.startsWith("Deus, canticum novum")).toBe(true);
    expect(second[1].latin.startsWith("Qui das salutem regibus")).toBe(true);
    expect(second[1].latin.endsWith("eripe me,")).toBe(true);
    expect(second[1].english.endsWith("Deliver me,")).toBe(true);
    expect(second[2].latin.startsWith("et erue me")).toBe(true);
    expect(second[2].english.startsWith("And rescue me")).toBe(true);
    expect(second[3].latin.endsWith("iuventute sua ;")).toBe(true);
    expect(second[4].latin.startsWith("filiae eorum")).toBe(true);
    expect(second[5].latin.endsWith("ex hoc in illud ;")).toBe(true);
    expect(second[6].latin.startsWith("oves eorum")).toBe(true);
    expect(second[6].latin.endsWith("crassae.")).toBe(true);
    expect(second[6].english.endsWith("Their oxen fat.")).toBe(true);
    expect(second[7].latin.startsWith("Non est ruina")).toBe(true);
    expect(second[8].latin.startsWith("Beatum dixerunt")).toBe(true);
  });

  test("Psalm 144 is lined into Friday and Saturday Vespers", () => {
    const friday = sliceVerses(hourSlots("fri", "vespers")[3].slices[0]);
    const saturday = sliceVerses(hourSlots("sat", "vespers")[0].slices[0]);
    expect(friday.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(saturday.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
    ]);
    expect(friday[0].latin.startsWith("Exaltabo te, Deus meus rex")).toBe(true);
    expect(friday[0].latin.includes("Laudatio")).toBe(false);
    expect(friday[0].english.startsWith("I will extol thee")).toBe(true);
    expect(friday[0].english.includes("Praise, for David")).toBe(false);
    expect(friday[8].latin.startsWith("Suavis Dominus universis")).toBe(true);
    expect(friday[8].latin.endsWith("opera eius.")).toBe(true);
    expect(saturday[0].latin.startsWith("Confiteantur tibi, Domine")).toBe(true);
    expect(saturday[2].latin.startsWith("ut notam faciant")).toBe(true);
    expect(saturday[3].latin.endsWith("generationem.")).toBe(true);
    expect(saturday[3].english.endsWith("all generations.")).toBe(true);
    expect(saturday[4].latin.startsWith("Fidelis Dominus")).toBe(true);
    expect(saturday[4].english.startsWith("The Lord is faithful")).toBe(true);
    expect(saturday[12].latin.startsWith("Laudationem Domini")).toBe(true);
  });

  test("Psalm 129 is lined into its eight Tuesday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 129 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8",
    ]);
    expect(verses[0].latin.startsWith("De profundis clamavi")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[0].latin.endsWith("vocem meam.")).toBe(true);
    expect(verses[0].english.startsWith("Out of the depths")).toBe(true);
    expect(verses[0].english.endsWith("Lord, hear my voice.")).toBe(true);
    expect(verses[1].latin.startsWith("Fiant aures tuae")).toBe(true);
    expect(verses[1].latin.endsWith("deprecationis meae.")).toBe(true);
    expect(verses[1].english.startsWith("Let thy ears be attentive")).toBe(true);
    expect(verses[3].latin.endsWith("sustinui te, Domine.")).toBe(true);
    expect(verses[3].english.endsWith("O Lord.")).toBe(true);
    expect(verses[4].latin.startsWith("Sustinuit anima mea")).toBe(true);
    expect(verses[4].latin.endsWith("in Domino.")).toBe(true);
    expect(verses[4].english.startsWith("My soul hath relied")).toBe(true);
    expect(verses[4].english.endsWith("hoped in the Lord.")).toBe(true);
    expect(verses[7].latin.startsWith("Et ipse redimet Israël")).toBe(true);
  });

  test("Psalm 130 is lined into its five Tuesday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 130 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5"]);
    expect(verses[0].latin.startsWith("Domine, non est exaltatum")).toBe(true);
    expect(verses[0].latin.includes("Canticum")).toBe(false);
    expect(verses[0].latin.endsWith("oculi mei,")).toBe(true);
    expect(verses[0].english.startsWith("Lord, my heart is not exalted")).toBe(true);
    expect(verses[0].english.endsWith("nor are my eyes lofty.")).toBe(true);
    expect(verses[1].latin.startsWith("neque ambulavi in magnis")).toBe(true);
    expect(verses[1].english.startsWith("Neither have I walked")).toBe(true);
    expect(verses[2].latin.startsWith("Si non humiliter sentiebam")).toBe(true);
    expect(verses[2].latin.endsWith("animam meam :")).toBe(true);
    expect(verses[2].english.endsWith("exalted my soul:")).toBe(true);
    expect(verses[3].latin.startsWith("sicut ablactatus")).toBe(true);
    expect(verses[3].latin.endsWith("anima mea.")).toBe(true);
    expect(verses[3].english.startsWith("As a child that is weaned")).toBe(true);
    expect(verses[4].latin.startsWith("Speret Israël in Domino")).toBe(true);
  });

  test("Psalm 131 is lined into its nineteen Tuesday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 131 });
    expect(verses).toHaveLength(19);
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 19 }, (_, index) => String(index + 1)),
    );
    expect(verses[0].latin.startsWith("Memento, Domine, David")).toBe(true);
    expect(verses[0].latin.includes("Canticum")).toBe(false);
    expect(verses[0].english.startsWith("O Lord, remember David")).toBe(true);
    expect(verses[1].latin.startsWith("sicut iuravit Domino")).toBe(true);
    expect(verses[4].latin.startsWith("et requiem temporibus meis")).toBe(true);
    expect(verses[11].latin.startsWith("Si custodierint filii tui")).toBe(true);
    expect(verses[11].latin.endsWith("quae docebo eos,")).toBe(true);
    expect(verses[11].english.endsWith("which I shall teach them:")).toBe(true);
    expect(verses[12].latin.startsWith("et filii eorum")).toBe(true);
    expect(verses[12].latin.endsWith("sedem tuam.")).toBe(true);
    expect(verses[12].english.startsWith("Their children also")).toBe(true);
    expect(verses[18].latin.startsWith("Inimicos eius induam")).toBe(true);
  });

  test("Psalm 132 is lined into its four Tuesday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 132 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4"]);
    expect(verses[0].latin.startsWith("Ecce quam bonum")).toBe(true);
    expect(verses[0].latin.includes("Canticum")).toBe(false);
    expect(verses[0].english.startsWith("Behold how good")).toBe(true);
    expect(verses[1].latin.startsWith("Sicut unguentum in capite")).toBe(true);
    expect(verses[1].latin.endsWith("barbam Aaron,")).toBe(true);
    expect(verses[1].english.endsWith("the beard of Aaron,")).toBe(true);
    expect(verses[2].latin.startsWith("quod descendit in oram")).toBe(true);
    expect(verses[2].latin.endsWith("montem Sion.")).toBe(true);
    expect(verses[2].english.startsWith("Which ran down")).toBe(true);
    expect(verses[2].english.endsWith("mount Sion.")).toBe(true);
    expect(verses[3].latin.startsWith("Quoniam illic mandavit")).toBe(true);
    expect(verses[3].latin.endsWith("in saeculum.")).toBe(true);
    expect(verses[3].english.startsWith("For there the Lord")).toBe(true);
  });

  test("Songs of Ascents 120–133 drop the Canticum graduum title", () => {
    expect(sliceVerses({ psalm: 120 })[0].latin.startsWith("Levavi oculos")).toBe(true);
    expect(sliceVerses({ psalm: 126 })[0].latin.startsWith("Nisi Dominus")).toBe(true);
    expect(sliceVerses({ psalm: 130 })[0].latin.startsWith("Domine, non est")).toBe(true);
    expect(sliceVerses({ psalm: 132 })[0].latin.startsWith("Ecce quam bonum")).toBe(true);
    expect(sliceVerses({ psalm: 133 })[0].latin.includes("Canticum graduum")).toBe(false);
    expect(sliceVerses({ psalm: 120 })[1].n).toBe("2");
  });

  test("Psalm 122 splits Gallican verse 2 and keeps the rest", () => {
    const verses = sliceVerses({ psalm: 122 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5"]);
    expect(verses[0].latin.startsWith("Ad te levavi")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[1].latin.startsWith("Ecce sicut oculi servorum")).toBe(true);
    expect(verses[1].latin.endsWith("manibus dominorum suorum")).toBe(true);
    expect(verses[1].latin.includes("ancillae")).toBe(false);
    expect(verses[2].latin.startsWith("sicut oculi ancillae")).toBe(true);
    expect(verses[2].latin.includes("servorum")).toBe(false);
    expect(verses[2].latin.endsWith("misereatur nostri.")).toBe(true);
    expect(verses[3].latin.startsWith("Miserere nostri")).toBe(true);
    expect(verses[4].latin.startsWith("quia multum repleta est")).toBe(true);
    expect(verses[1].english.endsWith("masters,")).toBe(true);
    expect(verses[2].english.startsWith("As the eyes of the handmaid")).toBe(true);
  });

  test("Psalm 123 joins and splits the opening Gallican verses", () => {
    const verses = sliceVerses({ psalm: 123 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(verses[0].latin.startsWith("Nisi quia Dominus")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[0].latin.endsWith("erat in nobis :")).toBe(true);
    expect(verses[0].latin.includes("cum exsurgerent")).toBe(false);
    expect(verses[1].latin.startsWith("cum exsurgerent")).toBe(true);
    expect(verses[1].latin.endsWith("deglutissent nos")).toBe(true);
    expect(verses[1].latin.includes("irasceretur")).toBe(false);
    expect(verses[2].latin.startsWith("cum irasceretur")).toBe(true);
    expect(verses[2].latin.endsWith("absorbuisset nos ;")).toBe(true);
    expect(verses[3].latin.startsWith("torrentem pertransivit")).toBe(true);
    expect(verses[4].latin.startsWith("Benedictus Dominus")).toBe(true);
    expect(verses[5].latin.startsWith("Anima nostra")).toBe(true);
    expect(verses[5].latin.endsWith("de laqueo venantium")).toBe(true);
    expect(verses[5].latin.includes("contritus")).toBe(false);
    expect(verses[6].latin.startsWith("laqueus contritus est")).toBe(true);
    expect(verses[6].latin.endsWith("liberati sumus.")).toBe(true);
    expect(verses[7].latin.startsWith("Adiutorium nostrum")).toBe(true);
    expect(verses[0].english.startsWith("If it had not been")).toBe(true);
    expect(verses[1].english.startsWith("When men rose up")).toBe(true);
    expect(verses[2].english.startsWith("When their fury")).toBe(true);
  });

  test("Psalm 124 joins in Ierusalem onto the first office line", () => {
    const verses = sliceVerses({ psalm: 124 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5"]);
    expect(verses[0].latin.startsWith("Qui confidunt")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[0].latin.endsWith("in Ierusalem.")).toBe(true);
    expect(verses[0].latin.includes("Montes")).toBe(false);
    expect(verses[1].latin.startsWith("Montes in circuitu eius")).toBe(true);
    expect(verses[1].latin.endsWith("in saeculum.")).toBe(true);
    expect(verses[1].latin.includes("Ierusalem")).toBe(false);
    expect(verses[2].latin.startsWith("Quia non relinquet")).toBe(true);
    expect(verses[3].latin.startsWith("benefac, Domine")).toBe(true);
    expect(verses[4].latin.startsWith("Declinantes autem")).toBe(true);
    expect(verses[0].english.endsWith("In Jerusalem.")).toBe(true);
    expect(verses[1].english.startsWith("Mountains are round about")).toBe(true);
  });

  test("Psalm 125 splits Gallican verse 2 at Tunc dicent", () => {
    const verses = sliceVerses({ psalm: 125 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(verses[0].latin.startsWith("In convertendo")).toBe(true);
    expect(verses[0].latin.includes("Canticum graduum")).toBe(false);
    expect(verses[1].latin.startsWith("Tunc repletum est")).toBe(true);
    expect(verses[1].latin.endsWith("exsultatione.")).toBe(true);
    expect(verses[1].latin.includes("dicent")).toBe(false);
    expect(verses[2].latin.startsWith("Tunc dicent inter gentes")).toBe(true);
    expect(verses[2].latin.endsWith("facere cum eis.")).toBe(true);
    expect(verses[3].latin.startsWith("Magnificavit Dominus facere nobiscum")).toBe(true);
    expect(verses[6].latin.startsWith("Euntes ibant")).toBe(true);
    expect(verses[6].latin.endsWith("semina sua.")).toBe(true);
    expect(verses[6].latin.includes("Venientes")).toBe(false);
    expect(verses[7].latin.startsWith("Venientes autem")).toBe(true);
    expect(verses[7].latin.endsWith("manipulos suos.")).toBe(true);
    expect(verses[1].english.endsWith("with joy.")).toBe(true);
    expect(verses[2].english.startsWith("Then shall they say among the Gentiles")).toBe(true);
  });

  test("Psalm 126 splits the first two Gallican verses", () => {
    const verses = sliceVerses({ psalm: 126 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(verses[0].latin.startsWith("Nisi Dominus aedificaverit")).toBe(true);
    expect(verses[0].latin.includes("Salomonis")).toBe(false);
    expect(verses[0].latin.endsWith("aedificant eam.")).toBe(true);
    expect(verses[0].latin.includes("custodierit")).toBe(false);
    expect(verses[1].latin.startsWith("Nisi Dominus custodierit")).toBe(true);
    expect(verses[1].latin.endsWith("custodit eam.")).toBe(true);
    expect(verses[2].latin.startsWith("Vanum est vobis")).toBe(true);
    expect(verses[2].latin.endsWith("panem doloris.")).toBe(true);
    expect(verses[2].latin.includes("Cum dederit")).toBe(false);
    expect(verses[3].latin.startsWith("Cum dederit")).toBe(true);
    expect(verses[3].latin.endsWith("fructus ventris.")).toBe(true);
    expect(verses[4].latin.startsWith("Sicut sagittae")).toBe(true);
    expect(verses[5].latin.startsWith("Beatus vir")).toBe(true);
    expect(verses[0].english.endsWith("that build it.")).toBe(true);
    expect(verses[1].english.startsWith("Unless the Lord keep")).toBe(true);
    expect(verses[3].english.startsWith("When he shall give sleep")).toBe(true);
  });

  test("Psalm 1 splits Gallican verse 3 and keeps the rest", () => {
    const verses = sliceVerses({ psalm: 1 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(verses[2].latin.endsWith("in tempore suo :")).toBe(true);
    expect(verses[3].latin.startsWith("et folium eius non defluet")).toBe(true);
    expect(verses[3].latin.endsWith("prosperabuntur.")).toBe(true);
    expect(verses[4].latin.startsWith("Non sic impii")).toBe(true);
    expect(verses[6].latin.startsWith("quoniam novit Dominus")).toBe(true);
  });

  test("a psalm with no map keeps Gallican verse numbers", () => {
    const verses = sliceVerses({ psalm: 2 });
    expect(verses[0].n).toBe("1");
    expect(verses[0].latin.startsWith("Quare fremuerunt")).toBe(true);
  });

  test("Psalm 9 is lined into Tuesday and Wednesday Prime", () => {
    const tuesday = sliceVerses(hourSlots("tue", "prime")[2].slices[0]);
    const wednesday = sliceVerses(hourSlots("wed", "prime")[0].slices[0]);
    expect(tuesday).toHaveLength(19);
    expect(wednesday).toHaveLength(23);
    expect(tuesday[0].n).toBe("1");
    expect(wednesday[0].n).toBe("1");
    expect(tuesday[0].latin.startsWith("Confitebor tibi, Domine")).toBe(true);
    expect(tuesday[0].latin.includes("occultis")).toBe(false);
    expect(tuesday[5].latin.endsWith("destruxisti.")).toBe(true);
    expect(tuesday[6].latin.startsWith("Periit memoria")).toBe(true);
    expect(tuesday[6].latin.endsWith("permanet.")).toBe(true);
    expect(tuesday[7].latin.startsWith("Paravit in iudicio")).toBe(true);
    expect(tuesday[7].latin.endsWith("in iustitia.")).toBe(true);
    expect(tuesday[14].latin.startsWith("exsultabo in salutari")).toBe(true);
    expect(tuesday[14].latin.endsWith("quem fecerunt ;")).toBe(true);
    expect(tuesday[15].latin.startsWith("in laqueo isto")).toBe(true);
    expect(tuesday[18].latin.startsWith("Quoniam non in finem oblivio")).toBe(true);
    expect(wednesday[0].latin.startsWith("Exsurge, Domine")).toBe(true);
    expect(wednesday[1].latin.startsWith("Constitue, Domine")).toBe(true);
    expect(wednesday[2].latin.startsWith("Ut quid, Domine")).toBe(true);
    expect(wednesday[6].latin.endsWith("omni tempore.")).toBe(true);
    expect(wednesday[7].latin.startsWith("Auferuntur iudicia")).toBe(true);
    expect(wednesday[7].english.startsWith("Thy judgments are removed")).toBe(true);
    expect(wednesday[11].latin.endsWith("spelunca sua.")).toBe(true);
    expect(wednesday[12].latin.startsWith("Insidiatur ut rapiat")).toBe(true);
    expect(wednesday[17].latin.endsWith("manus tuas.")).toBe(true);
    expect(wednesday[18].latin.startsWith("Tibi derelictus est pauper")).toBe(true);
    expect(wednesday[22].latin.startsWith("iudicare pupillo")).toBe(true);
  });
});
