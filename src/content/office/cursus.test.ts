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
    expect(tue).toEqual({ psalm: 9, from: 2, to: 21 });
    expect(wed).toEqual({ psalm: 9, from: 22, to: 39 });
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

  test("a Prime slice resolves verses from the Gallican chapter", () => {
    const verses = sliceVerses({ psalm: 9, from: 2, to: 21 });
    expect(verses[0].n).toBe("2");
    expect(verses[0].latin.startsWith("Confitebor tibi")).toBe(true);
    expect(verses.at(-1)?.n).toBe("21");
    expect(verses.some((verse) => verse.n === "1" || verse.n === "22")).toBe(false);
  });
});
