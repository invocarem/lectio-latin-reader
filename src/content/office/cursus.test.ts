/// <reference types="vitest/globals" />
import { hourSlots, psalmsInWeek } from "./cursus";
import { sliceLabel, sliceVerses } from "./resolve";

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
    expect(sunTwelve).toHaveLength(12);
    expect(sunTwelve.every((slot) => !slot.custom)).toBe(true);
    for (const day of ["mon", "tue", "wed", "thu", "fri", "sat"] as const) {
      const twelve = hourSlots(day, "vigils").slice(2);
      expect(twelve).toHaveLength(12);
      expect(twelve.every((slot) => slot.custom)).toBe(true);
    }
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

  test("Psalms 32 to 49, except 42, follow Kate's Benedictine lines", () => {
    const lengths = (psalm: number, from?: number, to?: number) =>
      sliceVerses({ psalm, from, to }).length;
    expect(lengths(32, 1, 11)).toBe(11);
    expect(lengths(32, 12, 22)).toBe(11);
    expect(lengths(33)).toBe(22);
    expect(lengths(34)).toBe(32);
    expect(lengths(35)).toBe(13);
    expect(lengths(36, 1, 26)).toBe(27);
    expect(lengths(36, 27, 40)).toBe(15);
    expect(lengths(37)).toBe(23);
    expect(lengths(38)).toBe(18);
    expect(lengths(39)).toBe(24);
    expect(lengths(40)).toBe(14);
    expect(lengths(41)).toBe(16);
    expect(lengths(43, 1, 13)).toBe(14);
    expect(lengths(43, 14, 26)).toBe(14);
    expect(lengths(44)).toBe(20);
    expect(lengths(45)).toBe(11);
    expect(lengths(46)).toBe(9);
    expect(lengths(47)).toBe(13);
    expect(lengths(48)).toBe(21);
    expect(lengths(49)).toBe(24);

    const thirtyTwo = sliceVerses({ psalm: 32, from: 1, to: 11 });
    expect(thirtyTwo[0].latin.startsWith("Exsultate, iusti")).toBe(true);
    expect(thirtyTwo[0].latin.includes("Psalmus David")).toBe(false);
    expect(thirtyTwo[0].english.startsWith("Rejoice in the Lord")).toBe(true);
    expect(sliceVerses({ psalm: 32, from: 12, to: 22 })[0].latin.startsWith("Beata gens")).toBe(true);

    const thirtyThree = sliceVerses({ psalm: 33 });
    expect(thirtyThree[0].latin.startsWith("Benedicam Dominum")).toBe(true);
    expect(thirtyThree[0].latin.includes("Achimelech")).toBe(false);
    expect(thirtyThree[19].latin.startsWith("Custodit Dominus")).toBe(true);

    const thirtyFour = sliceVerses({ psalm: 34 });
    expect(thirtyFour[0].latin.startsWith("Iudica, Domine")).toBe(true);
    expect(thirtyFour[0].english.startsWith("Judge thou, O Lord,")).toBe(true);
    expect(thirtyFour[3].latin.endsWith("animam meam ;")).toBe(true);
    expect(thirtyFour[4].latin.startsWith("avertantur retrorsum")).toBe(true);
    expect(thirtyFour[14].latin.endsWith("cilicio ;")).toBe(true);
    expect(thirtyFour[15].latin.startsWith("humiliabam in ieiunio")).toBe(true);
    expect(thirtyFour[31].latin.endsWith("laudem tuam.")).toBe(true);

    const thirtyFive = sliceVerses({ psalm: 35 });
    expect(thirtyFive[0].latin.startsWith("Dixit iniustus")).toBe(true);
    expect(thirtyFive[0].latin.includes("In finem")).toBe(false);
    expect(thirtyFive[5].latin.endsWith("abyssus multa.")).toBe(true);
    expect(thirtyFive[6].latin.startsWith("Homines et iumenta")).toBe(true);
    expect(thirtyFive[6].latin.endsWith("misericordiam tuam, Deus.")).toBe(true);
    expect(thirtyFive[6].english.endsWith("O God!")).toBe(true);
    expect(thirtyFive[7].latin.startsWith("Filii autem hominum")).toBe(true);

    const thirtySixA = sliceVerses({ psalm: 36, from: 1, to: 26 });
    const thirtySixB = sliceVerses({ psalm: 36, from: 27, to: 40 });
    expect(sliceLabel({ psalm: 36, from: 1, to: 26 })).toBe("Psalmus 36 · 1–26");
    expect(sliceLabel({ psalm: 36, from: 27, to: 40 })).toBe("Psalmus 36 · 27–40");
    expect(thirtySixA[0].latin.startsWith("Noli aemulari")).toBe(true);
    expect(thirtySixA[0].latin.includes("Psalmus ipsi David")).toBe(false);
    expect(thirtySixA[5].latin.endsWith("et ora eum.")).toBe(true);
    expect(thirtySixA[19].latin.endsWith("quia peccatores peribunt.")).toBe(true);
    expect(thirtySixA[26].latin.startsWith("Tota die miseretur")).toBe(true);
    expect(thirtySixB[0].latin.startsWith("Declina a malo")).toBe(true);
    expect(thirtySixB[1].latin.endsWith("conservabuntur.")).toBe(true);
    expect(thirtySixB[2].latin.startsWith("Iniusti punientur")).toBe(true);

    const thirtySeven = sliceVerses({ psalm: 37 });
    expect(thirtySeven[0].latin.startsWith("Domine, ne in furore")).toBe(true);
    expect(thirtySeven[0].latin.includes("sabbato")).toBe(false);
    expect(thirtySeven[10].latin.endsWith("et steterunt ;")).toBe(true);
    expect(thirtySeven[10].english.endsWith("stood against me.")).toBe(true);
    expect(thirtySeven[11].latin.startsWith("et qui iuxta me erant")).toBe(true);
    expect(thirtySeven[11].latin.endsWith("animam meam.")).toBe(true);
    expect(thirtySeven[11].english).toContain("used violence.");
    expect(thirtySeven[12].latin.startsWith("Et qui inquirebant")).toBe(true);
    expect(thirtySeven[12].english.startsWith("And they that sought evils to me")).toBe(true);

    const thirtyEight = sliceVerses({ psalm: 38 });
    expect(thirtyEight[0].latin.endsWith("in lingua mea.")).toBe(true);
    expect(thirtyEight[0].latin.includes("Idithun")).toBe(false);
    expect(thirtyEight[12].latin.endsWith("plagas tuas.")).toBe(true);
    expect(thirtyEight[12].english.endsWith("from me.")).toBe(true);
    expect(thirtyEight[13].latin.startsWith("A fortitudine")).toBe(true);
    expect(thirtyEight[13].latin.endsWith("corripuisti hominem.")).toBe(true);
    expect(thirtyEight[13].english.startsWith("The strength of thy hand")).toBe(true);
    expect(thirtyEight[14].latin.startsWith("Et tabescere fecisti")).toBe(true);
    expect(thirtyEight[17].latin.startsWith("Remitte mihi")).toBe(true);

    const thirtyNine = sliceVerses({ psalm: 39 });
    expect(thirtyNine[0].latin.startsWith("Exspectans exspectavi Dominum")).toBe(true);
    expect(thirtyNine[0].latin.includes("In finem")).toBe(false);
    expect(thirtyNine[1].latin.endsWith("de luto faecis.")).toBe(true);
    expect(thirtyNine[2].latin.startsWith("Et statuit super petram")).toBe(true);
    expect(thirtyNine[9].latin.startsWith("Holocaustum et pro peccato")).toBe(true);
    expect(thirtyNine[9].latin.endsWith("Ecce venio.")).toBe(true);
    expect(thirtyNine[10].latin.startsWith("In capite libri")).toBe(true);
    expect(thirtyNine[10].latin.endsWith("medio cordis mei.")).toBe(true);
    expect(thirtyNine[18].latin.startsWith("Confundantur et revereantur")).toBe(true);
    expect(thirtyNine[18].latin.endsWith("ut auferant eam")).toBe(true);
    expect(thirtyNine[19].latin.startsWith("convertantur retrorsum")).toBe(true);
    expect(thirtyNine[23].latin.startsWith("Adiutor meus et protector meus")).toBe(true);
    expect(thirtyNine[23].latin.endsWith("ne tardaveris.")).toBe(true);
    expect(thirtyNine.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);

    const forty = sliceVerses({ psalm: 40 });
    expect(forty[0].latin.startsWith("Beatus qui intelligit")).toBe(true);
    expect(forty[5].latin.endsWith("iniquitatem sibi.")).toBe(true);
    expect(forty[6].latin.startsWith("Egrediebatur foras")).toBe(true);
    expect(forty[6].latin.endsWith("in idipsum.")).toBe(false);
    expect(forty[6].latin.endsWith("In idipsum")).toBe(true);
    expect(forty[6].english.endsWith("the same purpose.")).toBe(true);
    expect(forty[7].latin.startsWith("adversum me susurrabant")).toBe(true);

    const fortyOne = sliceVerses({ psalm: 41 });
    expect(fortyOne[0].latin.includes("filiis Core")).toBe(false);
    expect(fortyOne[3].latin.endsWith("domum Dei,")).toBe(true);
    expect(fortyOne[6].latin.endsWith("et Deus meus.")).toBe(true);
    expect(fortyOne[11].latin.endsWith("Susceptor meus es")).toBe(true);
    expect(fortyOne[14].latin.startsWith("dum dicunt mihi")).toBe(true);
    expect(fortyOne[15].latin.startsWith("Spera in Deo")).toBe(true);

    const fortyThreeA = sliceVerses({ psalm: 43, from: 1, to: 13 });
    const fortyThreeB = sliceVerses({ psalm: 43, from: 14, to: 26 });
    expect(fortyThreeA[0].latin.startsWith("Deus, auribus nostris")).toBe(true);
    expect(fortyThreeA[13].latin.startsWith("Vendidisti populum")).toBe(true);
    expect(fortyThreeB[0].latin.startsWith("Posuisti nos opprobrium")).toBe(true);
    expect(fortyThreeB[8].latin.endsWith("abscondita cordis.")).toBe(true);
    expect(fortyThreeB[9].latin.startsWith("Quoniam propter te")).toBe(true);

    const fortyFour = sliceVerses({ psalm: 44 });
    expect(fortyFour[0].latin.endsWith("opera mea regi.")).toBe(true);
    expect(fortyFour[0].latin.includes("Canticum pro dilecto")).toBe(false);
    expect(fortyFour[9].latin.endsWith("in honore tuo.")).toBe(true);
    expect(fortyFour[14].latin.endsWith("circumamicta varietatibus.")).toBe(true);
    expect(fortyFour[19].latin.startsWith("propterea populi")).toBe(true);

    const fortyFive = sliceVerses({ psalm: 45 });
    expect(fortyFive[7].latin.endsWith("finem terrae.")).toBe(true);
    expect(fortyFive[8].latin.startsWith("Arcum conteret")).toBe(true);

    const fortySix = sliceVerses({ psalm: 46 });
    expect(fortySix[0].latin.startsWith("Omnes gentes")).toBe(true);
    expect(fortySix[1].latin.startsWith("quoniam Dominus excelsus")).toBe(true);

    const fortySeven = sliceVerses({ psalm: 47 });
    expect(fortySeven[4].latin.endsWith("apprehendit eos")).toBe(true);
    expect(fortySeven[5].latin.startsWith("ibi dolores")).toBe(true);
    expect(fortySeven[5].latin.endsWith("naves Tharsis.")).toBe(true);

    const fortyEight = sliceVerses({ psalm: 48 });
    expect(fortyEight[7].latin.endsWith("in finem.")).toBe(true);
    expect(fortyEight[8].latin.endsWith("stultus peribunt.")).toBe(true);
    expect(fortyEight[9].latin.endsWith("in aeternum ;")).toBe(true);
    expect(fortyEight[10].latin.startsWith("tabernacula eorum")).toBe(true);
    expect(fortyEight[13].latin.endsWith("mors depascet eos.")).toBe(true);

    const fortyNine = sliceVerses({ psalm: 49 });
    expect(fortyNine[0].latin.startsWith("Deus deorum Dominus")).toBe(true);
    expect(fortyNine[0].latin.includes("Psalmus Asaph")).toBe(false);
    expect(fortyNine[0].english.startsWith("The God of gods")).toBe(true);
    expect(fortyNine[1].latin.startsWith("a solis ortu")).toBe(true);
    expect(fortyNine[1].latin).toContain("Ex Sion species");
    expect(fortyNine[20].latin.endsWith("et tacui.")).toBe(true);
    expect(fortyNine[21].latin.startsWith("Existimasti")).toBe(true);

    const monday = hourSlots("mon", "vigils").flatMap((slot) => slot.slices);
    expect(monday.map((slice) => [slice.psalm, slice.from, slice.to])).toEqual(
      expect.arrayContaining([
        [36, 1, 26],
        [36, 27, 40],
      ]),
    );
    expect(hourSlots("mon", "lauds")[3].slices[0]).toEqual({ psalm: 35 });
    expect(hourSlots("mon", "vigils").slice(2).map((slot) => slot.slices[0].psalm)).toEqual([
      32, 33, 34, 36, 36, 37, 38, 39, 40, 41, 43, 44,
    ]);
    const tuesday = hourSlots("tue", "vigils").flatMap((slot) => slot.slices.map((slice) => slice.psalm));
    expect(tuesday.slice(2, 8)).toEqual([45, 46, 47, 48, 49, 51]);

    for (const verses of [
      thirtyTwo,
      thirtyThree,
      thirtyFour,
      thirtyFive,
      thirtySixA,
      thirtySixB,
      thirtySeven,
      thirtyEight,
      forty,
      fortyOne,
      fortyThreeA,
      fortyThreeB,
      fortyFour,
      fortyFive,
      fortySix,
      fortySeven,
      fortyEight,
      fortyNine,
    ]) {
      expect(verses.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);
    }
  });

  test("Psalms 51 to 55 follow Kate's Benedictine lines", () => {
    const fiftyOne = sliceVerses({ psalm: 51 });
    const fiftyTwo = sliceVerses({ psalm: 52 });
    const fiftyThree = sliceVerses({ psalm: 53 });
    const fiftyFour = sliceVerses({ psalm: 54 });
    const fiftyFive = sliceVerses({ psalm: 55 });
    expect(fiftyOne).toHaveLength(9);
    expect(fiftyTwo).toHaveLength(8);
    expect(fiftyThree).toHaveLength(7);
    expect(fiftyFour).toHaveLength(27);
    expect(fiftyFive).toHaveLength(13);

    expect(fiftyOne[0].latin.startsWith("Quid gloriaris")).toBe(true);
    expect(fiftyOne[0].latin.includes("Achimelech")).toBe(false);
    expect(fiftyOne[5].latin.endsWith("adiutorem suum ;")).toBe(true);
    expect(fiftyOne[5].english.endsWith("his helper:")).toBe(true);
    expect(fiftyOne[6].latin.startsWith("sed speravit")).toBe(true);

    expect(fiftyTwo[0].latin.startsWith("Dixit insipiens")).toBe(true);
    expect(fiftyTwo[0].latin.includes("Maëleth")).toBe(false);
    expect(fiftyTwo[0].english.startsWith("The fool said")).toBe(true);
    expect(fiftyTwo[5].latin.endsWith("ubi non erat timor.")).toBe(true);
    expect(fiftyTwo[6].latin.startsWith("Quoniam Deus dissipavit")).toBe(true);

    expect(fiftyThree[0].latin.startsWith("Deus, in nomine tuo")).toBe(true);
    expect(fiftyThree[0].latin.includes("Ziphaei")).toBe(false);
    expect(fiftyThree[6].latin.startsWith("Quoniam ex omni tribulatione")).toBe(true);

    expect(fiftyFour[0].latin.startsWith("Exaudi, Deus")).toBe(true);
    expect(fiftyFour[0].latin.endsWith("exaudi me.")).toBe(true);
    expect(fiftyFour[0].latin.includes("carminibus")).toBe(false);
    expect(fiftyFour[1].latin.startsWith("Contristatus sum")).toBe(true);
    expect(fiftyFour[1].latin.endsWith("tribulatione peccatoris.")).toBe(true);
    expect(fiftyFour[9].latin.endsWith("et iniustitia :")).toBe(true);
    expect(fiftyFour[11].latin.endsWith("sustinuissem utique.")).toBe(true);
    expect(fiftyFour[15].latin.endsWith("viventes :")).toBe(true);
    expect(fiftyFour[20].latin.endsWith("ante saecula.")).toBe(true);
    expect(fiftyFour[21].latin.endsWith("in retribuendo ;")).toBe(true);
    expect(fiftyFour[22].latin.endsWith("appropinquavit cor illius.")).toBe(true);
    expect(fiftyFour[25].latin.endsWith("interitus.")).toBe(true);
    expect(fiftyFour[26].latin.startsWith("Viri sanguinum")).toBe(true);

    expect(fiftyFive[0].latin.startsWith("Miserere mei, Deus")).toBe(true);
    expect(fiftyFive[0].latin.includes("Allophyli")).toBe(false);
    expect(fiftyFive[5].latin.endsWith("observabunt.")).toBe(true);
    expect(fiftyFive[6].latin.startsWith("Sicut sustinuerunt")).toBe(true);
    expect(fiftyFive[6].latin.endsWith("populos confringes.")).toBe(true);
    expect(fiftyFive[6].english.endsWith("in pieces.")).toBe(true);
    expect(fiftyFive[7].latin.startsWith("Deus, vitam meam")).toBe(true);
    expect(fiftyFive[7].english.startsWith("O God,")).toBe(true);
    expect(fiftyFive[7].latin.endsWith("in conspectu tuo,")).toBe(true);
    expect(fiftyFive[8].latin.endsWith("retrorsum.")).toBe(true);
    expect(fiftyFive[9].latin.startsWith("In quacumque die")).toBe(true);

    const tuesday = hourSlots("tue", "vigils").flatMap((slot) =>
      slot.slices.map((slice) => slice.psalm),
    );
    expect(tuesday.slice(7, 14)).toEqual([51, 52, 53, 54, 55, 57, 58]);
    expect(hourSlots("wed", "vigils")[2].slices[0]).toEqual({ psalm: 59 });

    for (const verses of [fiftyOne, fiftyTwo, fiftyThree, fiftyFour, fiftyFive]) {
      expect(verses.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);
    }
  });

  test("Psalms 57 to 65 follow Kate's Benedictine lines", () => {
    const fiftySeven = sliceVerses({ psalm: 57 });
    const fiftyEight = sliceVerses({ psalm: 58 });
    const fiftyNine = sliceVerses({ psalm: 59 });
    const sixty = sliceVerses({ psalm: 60 });
    const sixtyOne = sliceVerses({ psalm: 61 });
    const sixtyTwo = sliceVerses({ psalm: 62 });
    const sixtyThree = sliceVerses({ psalm: 63 });
    const sixtyFour = sliceVerses({ psalm: 64 });
    const sixtyFive = sliceVerses({ psalm: 65 });
    expect(fiftySeven).toHaveLength(11);
    expect(fiftyEight).toHaveLength(20);
    expect(fiftyNine).toHaveLength(13);
    expect(sixty).toHaveLength(8);
    expect(sixtyOne).toHaveLength(11);
    expect(sixtyTwo).toHaveLength(10);
    expect(sixtyThree).toHaveLength(11);
    expect(sixtyFour).toHaveLength(14);
    expect(sixtyFive).toHaveLength(19);

    expect(fiftySeven[0].latin.startsWith("Si vere utique")).toBe(true);
    expect(fiftySeven[0].latin.includes("ne disperdas")).toBe(false);
    expect(fiftySeven[10].latin.startsWith("Et dicet homo")).toBe(true);

    expect(fiftyEight[0].latin.startsWith("Eripe me de inimicis")).toBe(true);
    expect(fiftyEight[0].latin.includes("interficeret")).toBe(false);
    expect(fiftyEight[4].latin.endsWith("Deus Israël,")).toBe(true);
    expect(fiftyEight[5].latin.startsWith("intende ad visitandas")).toBe(true);
    expect(fiftyEight[9].latin.startsWith("Fortitudinem meam")).toBe(true);
    expect(fiftyEight[9].latin.endsWith("praeveniet me.")).toBe(true);
    expect(fiftyEight[10].latin.endsWith("populi mei.")).toBe(true);
    expect(fiftyEight[12].latin.endsWith("superbia sua.")).toBe(true);
    expect(fiftyEight[13].latin.startsWith("Et de execratione")).toBe(true);
    expect(fiftyEight[13].latin.endsWith("non erunt.")).toBe(true);
    expect(fiftyEight[17].latin.endsWith("misericordiam tuam :")).toBe(true);
    expect(fiftyEight[19].latin.startsWith("Adiutor meus")).toBe(true);

    expect(fiftyNine[0].latin.startsWith("Deus, repulisti nos")).toBe(true);
    expect(fiftyNine[0].latin.includes("Mesopotamiam")).toBe(false);
    expect(fiftyNine[3].latin.endsWith("facie arcus ;")).toBe(true);
    expect(fiftyNine[4].latin.startsWith("ut liberentur")).toBe(true);
    expect(fiftyNine[4].latin.endsWith("exaudi me.")).toBe(true);
    expect(fiftyNine[6].latin.endsWith("capitis mei.")).toBe(true);
    expect(fiftyNine[7].latin.startsWith("Iuda rex meus")).toBe(true);
    expect(fiftyNine[7].latin.endsWith("spei meae.")).toBe(true);

    expect(sixty[0].latin.startsWith("Exaudi, Deus, deprecationem")).toBe(true);
    expect(sixty[0].latin.includes("hymnis")).toBe(false);
    expect(sixty[1].latin.endsWith("exaltasti me.")).toBe(true);
    expect(sixty[2].latin.startsWith("Deduxisti me")).toBe(true);
    expect(sixty[2].latin.endsWith("facie inimici.")).toBe(true);

    expect(sixtyOne[0].latin.startsWith("Nonne Deo subiecta")).toBe(true);
    expect(sixtyOne[0].latin.includes("Idithun")).toBe(false);
    expect(sixtyOne[10].latin.startsWith("Semel locutus est Deus")).toBe(true);
    expect(sixtyOne[10].latin.endsWith("opera sua.")).toBe(true);

    expect(sixtyTwo[0].latin.startsWith("Deus, Deus meus")).toBe(true);
    expect(sixtyTwo[0].latin.endsWith("de luce vigilo.")).toBe(true);
    expect(sixtyTwo[0].latin.includes("Idumaeae")).toBe(false);
    expect(sixtyTwo[6].latin.endsWith("adiutor meus,")).toBe(true);
    expect(sixtyTwo[7].latin.startsWith("et in velamento")).toBe(true);
    expect(sixtyTwo[7].latin.endsWith("dextera tua.")).toBe(true);
    expect(sixtyTwo[8].latin.startsWith("Ipsi vero")).toBe(true);
    expect(sixtyTwo[8].latin.endsWith("vulpium erunt.")).toBe(true);

    expect(sixtyThree[0].latin.startsWith("Exaudi, Deus, orationem")).toBe(true);
    expect(sixtyThree[2].latin.endsWith("immaculatum.")).toBe(true);
    expect(sixtyThree[3].latin.endsWith("sermonem nequam.")).toBe(true);
    expect(sixtyThree[5].latin.endsWith("scrutinio.")).toBe(true);
    expect(sixtyThree[6].latin.endsWith("exaltabitur Deus.")).toBe(true);
    expect(sixtyThree[7].latin.endsWith("linguae eorum.")).toBe(true);
    expect(sixtyThree[8].latin.endsWith("omnis homo.")).toBe(true);

    expect(sixtyFour[0].latin.startsWith("Te decet hymnus")).toBe(true);
    expect(sixtyFour[0].latin.includes("Ieremiae")).toBe(false);
    expect(sixtyFour[3].latin.endsWith("atriis tuis.")).toBe(true);
    expect(sixtyFour[4].latin.endsWith("in aequitate.")).toBe(true);
    expect(sixtyFour[6].latin.endsWith("fluctuum eius.")).toBe(true);
    expect(sixtyFour[7].latin.startsWith("Turbabuntur gentes")).toBe(true);
    expect(sixtyFour[8].latin.endsWith("locupletare eam.")).toBe(true);
    expect(sixtyFour[9].latin.startsWith("Flumen Dei")).toBe(true);

    expect(sixtyFive[0].latin.startsWith("Iubilate Deo")).toBe(true);
    expect(sixtyFive[0].latin.includes("resurrectionis")).toBe(false);
    expect(sixtyFive[0].english.startsWith("Shout with joy")).toBe(true);
    expect(sixtyFive[9].latin.endsWith("capita nostra.")).toBe(true);
    expect(sixtyFive[11].latin.endsWith("labia mea :")).toBe(true);
    expect(sixtyFive[12].latin.startsWith("et locutum est")).toBe(true);
    expect(sixtyFive[18].latin.startsWith("Benedictus Deus")).toBe(true);

    const wednesday = hourSlots("wed", "vigils").flatMap((slot) =>
      slot.slices.map((slice) => slice.psalm),
    );
    expect(wednesday.slice(2, 6)).toEqual([59, 60, 61, 65]);
    const sundayLauds = hourSlots("sun", "lauds").flatMap((slot) =>
      slot.slices.map((slice) => slice.psalm),
    );
    expect(sundayLauds[3]).toBe(62);
    const wednesdayLauds = hourSlots("wed", "lauds").flatMap((slot) =>
      slot.slices.map((slice) => slice.psalm),
    );
    expect(wednesdayLauds.slice(2, 4)).toEqual([63, 64]);

    for (const verses of [
      fiftySeven,
      fiftyEight,
      fiftyNine,
      sixty,
      sixtyOne,
      sixtyTwo,
      sixtyThree,
      sixtyFour,
      sixtyFive,
    ]) {
      expect(verses.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);
    }
  });

  test("Psalms 69 to 74 follow Kate's Benedictine lines", () => {
    const sixtyNine = sliceVerses({ psalm: 69 });
    const seventy = sliceVerses({ psalm: 70 });
    const seventyOne = sliceVerses({ psalm: 71 });
    const seventyTwo = sliceVerses({ psalm: 72 });
    const seventyTwoFirst = sliceVerses({ psalm: 72, from: 1, to: 14 });
    const seventyTwoSecond = sliceVerses({ psalm: 72, from: 15, to: 28 });
    const seventyThree = sliceVerses({ psalm: 73 });
    const seventyThreeFirst = sliceVerses({ psalm: 73, from: 1, to: 12 });
    const seventyThreeSecond = sliceVerses({ psalm: 73, from: 13, to: 23 });
    const seventyFour = sliceVerses({ psalm: 74 });
    expect(sixtyNine).toHaveLength(7);
    expect(seventy).toHaveLength(26);
    expect(seventyOne).toHaveLength(20);
    expect(seventyTwo).toHaveLength(28);
    expect(seventyTwoFirst).toHaveLength(14);
    expect(seventyTwoSecond).toHaveLength(14);
    expect(seventyThree).toHaveLength(24);
    expect(seventyThreeFirst).toHaveLength(13);
    expect(seventyThreeSecond).toHaveLength(11);
    expect(seventyFour).toHaveLength(10);

    expect(sixtyNine[0].latin.startsWith("Deus, in adiutorium")).toBe(true);
    expect(sixtyNine[0].latin.includes("rememorationem")).toBe(false);
    expect(sixtyNine[2].latin.endsWith("mihi mala ;")).toBe(true);
    expect(sixtyNine[3].latin.startsWith("avertantur statim")).toBe(true);
    expect(sixtyNine[5].latin.endsWith("adiuva me.")).toBe(true);
    expect(sixtyNine[6].latin.startsWith("Adiutor meus")).toBe(true);

    expect(seventy[0].latin.startsWith("In te, Domine, speravi")).toBe(true);
    expect(seventy[0].latin.endsWith("eripe me :")).toBe(true);
    expect(seventy[0].latin.includes("Ionadab")).toBe(false);
    expect(seventy[0].english.startsWith("In thee, O Lord")).toBe(true);
    expect(seventy[1].latin.startsWith("inclina ad me")).toBe(true);
    expect(seventy[2].latin.endsWith("salvum me facias :")).toBe(true);
    expect(seventy[6].latin.endsWith("protector meus ;")).toBe(true);
    expect(seventy[7].latin.startsWith("in te cantatio")).toBe(true);
    expect(seventy[7].latin.endsWith("adiutor fortis.")).toBe(true);
    expect(seventy[15].latin.endsWith("salutare tuum.")).toBe(true);
    expect(seventy[16].latin.startsWith("Quoniam non cognovi")).toBe(true);
    expect(seventy[18].latin.endsWith("ne derelinquas me,")).toBe(true);
    expect(seventy[19].latin.endsWith("ventura est,")).toBe(true);
    expect(seventy[20].latin.startsWith("potentiam tuam")).toBe(true);
    expect(seventy[25].latin.startsWith("Sed et lingua mea")).toBe(true);

    expect(seventyOne[0].latin.startsWith("Deus, iudicium tuum")).toBe(true);
    expect(seventyOne[0].latin.endsWith("filio regis ;")).toBe(true);
    expect(seventyOne[0].latin.includes("Salomonem")).toBe(false);
    expect(seventyOne[1].latin.startsWith("iudicare populum")).toBe(true);
    expect(seventyOne[16].latin.endsWith("permanet nomen eius.")).toBe(true);
    expect(seventyOne[17].latin.startsWith("Et benedicentur")).toBe(true);
    expect(seventyOne[19].latin.endsWith("Fiat, fiat.")).toBe(true);
    expect(seventyOne.some((verse) => verse.latin.includes("Defecerunt laudes"))).toBe(false);

    expect(seventyTwo[0].latin.startsWith("Quam bonus Israël")).toBe(true);
    expect(seventyTwo[0].latin.includes("Asaph")).toBe(false);
    expect(seventyTwo[0].english.startsWith("How good is God")).toBe(true);
    expect(seventyTwoFirst.at(-1)?.latin.endsWith("in matutinis.")).toBe(true);
    expect(seventyTwoSecond[0].latin.startsWith("Si dicebam")).toBe(true);
    expect(seventyTwo[20].latin.startsWith("Quia inflammatum")).toBe(true);
    expect(seventyTwo[20].latin.endsWith("nescivi :")).toBe(true);
    expect(seventyTwo[26].latin.endsWith("spem meam :")).toBe(true);
    expect(seventyTwo[27].latin.startsWith("ut annuntiem")).toBe(true);
    expect(sliceLabel({ psalm: 72, from: 1, to: 14 })).toBe("Psalmus 72 · 1–14");
    expect(sliceLabel({ psalm: 72, from: 15, to: 28 })).toBe("Psalmus 72 · 15–28");

    expect(seventyThree[0].latin.startsWith("Ut quid, Deus")).toBe(true);
    expect(seventyThree[0].latin.includes("Asaph")).toBe(false);
    expect(seventyThree[0].english.startsWith("O God, why hast thou")).toBe(true);
    expect(seventyThree[1].latin.endsWith("ab initio.")).toBe(true);
    expect(seventyThree[4].latin.endsWith("solemnitatis tuae ;")).toBe(true);
    expect(seventyThree[5].latin.startsWith("posuerunt signa")).toBe(true);
    expect(seventyThree[5].latin.endsWith("super summum.")).toBe(true);
    expect(seventyThree[6].latin.startsWith("Quasi in silva")).toBe(true);
    expect(seventyThreeFirst.at(-1)?.latin.endsWith("medio terrae.")).toBe(true);
    expect(seventyThreeSecond[0].latin.startsWith("Tu confirmasti")).toBe(true);
    expect(sliceLabel({ psalm: 73, from: 1, to: 12 })).toBe("Psalmus 73 · 1–12");
    expect(sliceLabel({ psalm: 73, from: 13, to: 23 })).toBe("Psalmus 73 · 13–23");

    expect(seventyFour[0].latin.startsWith("Confitebimur tibi")).toBe(true);
    expect(seventyFour[0].latin.endsWith("nomen tuum ;")).toBe(true);
    expect(seventyFour[0].latin.includes("corrumpas")).toBe(false);
    expect(seventyFour[1].latin.startsWith("narrabimus mirabilia")).toBe(true);
    expect(seventyFour[1].latin.endsWith("iudicabo.")).toBe(true);
    expect(seventyFour[5].latin.endsWith("iudex est.")).toBe(true);
    expect(seventyFour[6].latin.startsWith("Hunc humiliat")).toBe(true);
    expect(seventyFour[6].latin.endsWith("plenus misto.")).toBe(true);
    expect(seventyFour[7].latin.startsWith("Et inclinavit")).toBe(true);
    expect(seventyFour[9].latin.startsWith("et omnia cornua")).toBe(true);

    const wednesday = hourSlots("wed", "vigils").flatMap((slot) =>
      slot.slices.map((slice) => slice.psalm),
    );
    expect(wednesday.at(-1)).toBe(72);
    const thursday = hourSlots("thu", "vigils").flatMap((slot) =>
      slot.slices.map((slice) => slice.psalm),
    );
    expect(thursday.slice(2)).toEqual([73, 74, 76, 77, 77, 78, 79, 80, 81, 82, 83, 84]);

    for (const verses of [
      sixtyNine,
      seventy,
      seventyOne,
      seventyTwo,
      seventyTwoFirst,
      seventyTwoSecond,
      seventyThree,
      seventyThreeFirst,
      seventyThreeSecond,
      seventyFour,
    ]) {
      expect(verses.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);
    }
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

  test("Psalm 76 is lined into its twenty Thursday Vigils office lines", () => {
    const verses = sliceVerses({ psalm: 76 });
    expect(verses).toHaveLength(20);
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
    );
    expect(verses[0].latin.startsWith("Voce mea ad Dominum clamavi")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[1].latin.endsWith("et non sum deceptus.")).toBe(true);
    expect(verses[2].latin.startsWith("Renuit consolari anima mea")).toBe(true);
    expect(verses[2].latin.endsWith("et defecit spiritus meus.")).toBe(true);
    expect(verses[12].latin.endsWith("Tu es Deus qui facis mirabilia :")).toBe(true);
    expect(verses[13].latin.startsWith("notam fecisti in populis virtutem tuam")).toBe(true);
    expect(verses[13].latin.endsWith("filios Iacob et Ioseph.")).toBe(true);
    expect(verses[15].latin.endsWith("vocem dederunt nubes.")).toBe(true);
    expect(verses[16].latin.startsWith("Etenim sagittae tuae transeunt")).toBe(true);
    expect(verses[16].latin.endsWith("vox tonitrui tui in rota.")).toBe(true);
    expect(verses[17].latin.startsWith("Illuxerunt coruscationes")).toBe(true);
    expect(verses[19].latin.endsWith("in manu Moysi et Aaron.")).toBe(true);
    expect(verses[2].english.startsWith("My soul refused to be comforted")).toBe(true);
    expect(verses[13].english.startsWith("Thou hast made thy power known")).toBe(true);
  });

  test("Psalm 77 splits into two thirty-nine-line parts at Kate's 39/40 break", () => {
    const first = sliceVerses({ psalm: 77, from: 1, to: 35 });
    const second = sliceVerses({ psalm: 77, from: 36, to: 72 });
    // Each part is numbered from 1 and has thirty-nine office lines.
    expect(first).toHaveLength(39);
    expect(first.map((verse) => verse.n)).toEqual(Array.from({ length: 39 }, (_, i) => String(i + 1)));
    expect(second).toHaveLength(39);
    expect(second.map((verse) => verse.n)).toEqual(Array.from({ length: 39 }, (_, i) => String(i + 1)));
    // Title dropped from line 1, which opens the psalm proper.
    expect(first[0].latin.startsWith("Attendite, popule meus, legem meam")).toBe(true);
    expect(first[0].latin.includes("Intellectus")).toBe(false);
    // The break: part 1 ends and part 2 opens on the following half-verse.
    expect(first[38].latin.startsWith("Et rememorati sunt quia Deus adiutor")).toBe(true);
    expect(second[0].latin.startsWith("Et dilexerunt eum in ore suo")).toBe(true);
    // Re-lining: v4 split into two lines, v5/v6 bridged, v8 split in two.
    expect(first[3].latin.endsWith("in generatione altera,")).toBe(true);
    expect(first[4].latin.startsWith("narrantes laudes Domini")).toBe(true);
    expect(first[5].latin.endsWith("et legem posuit in Israël,")).toBe(true);
    expect(first[6].latin.startsWith("quanta mandavit patribus nostris")).toBe(true);
    expect(first[10].latin.startsWith("generatio quae non direxit cor suum")).toBe(true);
    // v20, v29-/v30-/v31 bridge, v38, and v54 splits land where the pointer puts them.
    expect(first[22].latin.endsWith("et torrentes inundaverunt.")).toBe(true);
    expect(first[23].latin.startsWith("Numquid et panem")).toBe(true);
    expect(second[2].latin.endsWith("et non disperdet eos.")).toBe(true);
    expect(second[3].latin.startsWith("Et abundavit")).toBe(true);
    expect(second[19].latin.endsWith("quem acquisivit dextera eius ;")).toBe(true);
    expect(second[20].latin.startsWith("et eiecit a facie eorum gentes")).toBe(true);
    // The psalm closes with the final verse of part 2.
    expect(second[38].latin.endsWith("deduxit eos.")).toBe(true);
  });

  test("Psalm 78 is lined into its fifteen office lines", () => {
    const verses = sliceVerses({ psalm: 78 });
    expect(verses).toHaveLength(15);
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
    );
    // No title to drop beyond the embedded "Psalmus Asaph.": line 1 opens "Deus, venerunt gentes".
    expect(verses[0].latin.startsWith("Deus, venerunt gentes")).toBe(true);
    expect(verses[0].latin.includes("Psalmus Asaph")).toBe(false);
    expect(verses[0].english.startsWith("O God, the heathens")).toBe(true);
    // Gallican 1–9 and 12 stay one whole line each.
    expect(verses[8].latin.endsWith("propter nomen tuum.")).toBe(true);
    expect(verses[12].latin.startsWith("et redde vicinis nostris septuplum")).toBe(true);
    // Line 10: Gallican 10 through oculis nostris (ultio held for line 11).
    expect(verses[9].latin.startsWith("Ne forte dicant in gentibus")).toBe(true);
    expect(verses[9].latin.endsWith("oculis nostris")).toBe(true);
    expect(verses[9].latin.includes("ultio")).toBe(false);
    // Line 11: Gallican 10 tail joins Gallican 11 through gemitus compeditorum.
    expect(verses[10].latin.startsWith("ultio sanguinis servorum tuorum")).toBe(true);
    expect(verses[10].latin.endsWith("gemitus compeditorum")).toBe(true);
    // Line 12: the rest of Gallican 11.
    expect(verses[11].latin.startsWith("secundum magnitudinem brachii tui")).toBe(true);
    expect(verses[11].latin.endsWith("filios mortificatorum :")).toBe(true);
    // Gallican 13 splits: line 14 through in saeculum, line 15 the rest.
    expect(verses[13].latin.startsWith("Nos autem populus tuus")).toBe(true);
    expect(verses[13].latin.endsWith("in saeculum")).toBe(true);
    expect(verses[14].latin.startsWith("in generationem et generationem")).toBe(true);
    expect(verses[14].latin.endsWith("laudem tuam.")).toBe(true);
    // The English follows the same joins and cuts.
    expect(verses[10].english.includes("By the revenging the blood of thy servants")).toBe(true);
    expect(verses[10].english.includes("come in before thee.")).toBe(true);
    expect(verses[10].english.endsWith("come in before thee.")).toBe(true);
  });

  test("Psalm 79 is lined into its twenty office lines", () => {
    const verses = sliceVerses({ psalm: 79 });
    expect(verses).toHaveLength(20);
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 20 }, (_, i) => String(i + 1)),
    );
    // Gallican 1 is the title, dropped; line 1 opens the psalm with Gallican 2 through "velut ovem Ioseph".
    expect(verses[0].latin.startsWith("Qui regis Israël, intende")).toBe(true);
    expect(verses[0].latin.endsWith("velut ovem Ioseph")).toBe(true);
    expect(verses[0].latin.includes("Testimonium")).toBe(false);
    expect(verses[0].english.endsWith("like a sheep.")).toBe(true);
    // Line 2: Gallican 2's tail joins Gallican 3 through "et Manasse".
    expect(verses[1].latin.startsWith("Qui sedes super cherubim, manifestare")).toBe(true);
    expect(verses[1].latin.endsWith("et Manasse")).toBe(true);
    expect(verses[1].latin.includes("Excita potentiam")).toBe(false);
    // Line 3: the rest of Gallican 3.
    expect(verses[2].latin.startsWith("Excita potentiam tuam")).toBe(true);
    expect(verses[2].latin.endsWith("ut salvos facias nos.")).toBe(true);
    // Lines 4–20 are Gallican 4–20 whole.
    expect(verses[3].latin.startsWith("Deus, converte nos")).toBe(true);
    expect(verses[19].latin.endsWith("et salvi erimus.")).toBe(true);
    expect(verses[19].latin.startsWith("Domine Deus virtutum, converte nos")).toBe(true);
  });

  test("Psalm 81 is lined into its eight office lines, dropping the Psalmus Asaph title", () => {
    const verses = sliceVerses({ psalm: 81 });
    expect(verses).toHaveLength(8);
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8"],
    );
    // Gallican 1 opens with the title "Psalmus Asaph." which is dropped.
    expect(verses[0].latin.startsWith("Deus stetit in synagoga deorum")).toBe(true);
    expect(verses[0].latin.includes("Psalmus Asaph")).toBe(false);
    expect(verses[0].english.startsWith("God hath stood in the congregation of gods")).toBe(true);
    expect(verses[0].english.includes("A psalm for Asaph")).toBe(false);
    // All verses stay whole.
    expect(verses[1].latin.startsWith("Usquequo iudicatis iniquitatem")).toBe(true);
    expect(verses[7].latin.startsWith("Surge, Deus, iudica terram")).toBe(true);
    expect(verses[7].latin.endsWith("haereditabis in omnibus gentibus.")).toBe(true);
  });

  test("Psalm 82 is lined into its seventeen office lines", () => {
    const verses = sliceVerses({ psalm: 82 });
    expect(verses).toHaveLength(17);
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 17 }, (_, i) => String(i + 1)),
    );
    // Gallican 1 is the title, dropped; line 1 opens with Gallican 2.
    expect(verses[0].latin.startsWith("Deus, quis similis erit tibi")).toBe(true);
    expect(verses[0].latin.includes("Canticum Psalmi")).toBe(false);
    // Line 5: Gallican 6 joins Gallican 7 through "Ismahelitae".
    expect(verses[4].latin.startsWith("Quoniam cogitaverunt unanimiter")).toBe(true);
    expect(verses[4].latin.endsWith("et Ismahelitae")).toBe(true);
    expect(verses[4].latin.includes("Moab")).toBe(false);
    // Line 6: Gallican 7's tail joins Gallican 8.
    expect(verses[5].latin.startsWith("Moab et Agareni")).toBe(true);
    expect(verses[5].latin.endsWith("cum habitantibus Tyrum.")).toBe(true);
    // Line 10: Gallican 12 through "et Salmana".
    expect(verses[9].latin.startsWith("Pone principes eorum")).toBe(true);
    expect(verses[9].latin.endsWith("et Salmana")).toBe(true);
    expect(verses[9].latin.includes("omnes principes eorum")).toBe(false);
    // Line 11: Gallican 12's tail joins Gallican 13.
    expect(verses[10].latin.startsWith("omnes principes eorum")).toBe(true);
    expect(verses[10].latin.endsWith("possideamus sanctuarium Dei.")).toBe(true);
    // Whole-verse lines at the ends.
    expect(verses[11].latin.startsWith("Deus meus, pone illos ut rotam")).toBe(true);
    expect(verses[16].latin.startsWith("Et cognoscant quia nomen tibi Dominus")).toBe(true);
    expect(verses[16].latin.endsWith("Altissimus in omni terra.")).toBe(true);
    // Merged English follows the same joins.
    expect(verses[4].english.endsWith("and the Ishmahelites:")).toBe(true);
  });

  test("Psalm 83 is lined into its thirteen office lines", () => {
    const verses = sliceVerses({ psalm: 83 });
    expect(verses).toHaveLength(13);
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    );
    // Gallican 1 is the title, dropped; line 1 opens with Gallican 2 joined to Gallican 3 through "in atria Domini".
    expect(verses[0].latin.startsWith("Quam dilecta tabernacula tua")).toBe(true);
    expect(verses[0].latin.endsWith("in atria Domini")).toBe(true);
    expect(verses[0].latin.includes("torcularibus")).toBe(false);
    // Line 2: Gallican 3's tail.
    expect(verses[1].latin.startsWith("cor meum et caro mea")).toBe(true);
    expect(verses[1].latin.endsWith("in Deum vivum.")).toBe(true);
    // Gallican 4 splits: line 3 through "pullos suos", line 4 from "altaria tua".
    expect(verses[2].latin.startsWith("Etenim passer invenit sibi domum")).toBe(true);
    expect(verses[2].latin.endsWith("ubi ponat pullos suos")).toBe(true);
    expect(verses[3].latin.startsWith("altaria tua")).toBe(true);
    expect(verses[3].latin.endsWith("rex meus, et Deus meus.")).toBe(true);
    // Line 6 joins Gallican 6 and 7.
    expect(verses[5].latin.startsWith("Beatus vir cuius est auxilium")).toBe(true);
    expect(verses[5].latin.endsWith("in loco quem posuit.")).toBe(true);
    // Gallican 11 splits after "super millia".
    expect(verses[9].latin.startsWith("Quia melior est dies una")).toBe(true);
    expect(verses[9].latin.endsWith("super millia")).toBe(true);
    expect(verses[10].latin.startsWith("elegi abiectus esse")).toBe(true);
    expect(verses[10].latin.endsWith("in tabernaculis peccatorum.")).toBe(true);
    expect(verses[12].latin.startsWith("Non privabit bonis eos")).toBe(true);
  });

  test("Psalm 84 is lined into its fourteen office lines, splitting Gallican 9", () => {
    const verses = sliceVerses({ psalm: 84 });
    expect(verses).toHaveLength(14);
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 14 }, (_, i) => String(i + 1)),
    );
    // Gallican 1 is the title, dropped; line 1 opens with Gallican 2.
    expect(verses[0].latin.startsWith("Benedixisti, Domine, terram tuam")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    // Gallican 9 splits: line 8 through "pacem in plebem suam", line 9 the rest.
    expect(verses[7].latin.startsWith("Audiam quid loquatur in me Dominus Deus")).toBe(true);
    expect(verses[7].latin.endsWith("pacem in plebem suam")).toBe(true);
    expect(verses[7].latin.includes("super sanctos suos")).toBe(false);
    expect(verses[8].latin.startsWith("et super sanctos suos")).toBe(true);
    expect(verses[8].latin.endsWith("qui convertuntur ad cor.")).toBe(true);
    expect(verses[8].english.startsWith("And unto his saints")).toBe(true);
    // Whole-verse lines.
    expect(verses[5].latin.startsWith("Deus, tu conversus vivificabis nos")).toBe(true);
    expect(verses[13].latin.startsWith("Iustitia ante eum ambulabit")).toBe(true);
    expect(verses[13].latin.endsWith("in via gressus suos.")).toBe(true);
  });

  test("Psalm 85 is lined into its sixteen office lines, joining Gallican 3 and 4", () => {
    const verses = sliceVerses({ psalm: 85 });
    expect(verses).toHaveLength(16);
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 16 }, (_, i) => String(i + 1)),
    );
    // Gallican 1 title "Oratio ipsi David." dropped; line 1 opens with "Inclina, Domine".
    expect(verses[0].latin.startsWith("Inclina, Domine, aurem tuam")).toBe(true);
    expect(verses[0].latin.includes("Oratio ipsi David")).toBe(false);
    expect(verses[0].english.startsWith("Incline thy ear, O Lord")).toBe(true);
    // Line 3 joins Gallican 3 and 4.
    expect(verses[2].latin.startsWith("Miserere mei, Domine")).toBe(true);
    expect(verses[2].latin.endsWith("animam meam levavi.")).toBe(true);
    expect(verses[2].latin.includes("laetifica animam servi tui")).toBe(true);
    expect(verses[2].english.endsWith("I have lifted up my soul.")).toBe(true);
    // Whole-verse lines.
    expect(verses[1].latin.startsWith("Custodi animam meam")).toBe(true);
    expect(verses[10].latin.startsWith("Confitebor tibi, Domine Deus meus")).toBe(true);
    expect(verses[15].latin.startsWith("Fac mecum signum in bonum")).toBe(true);
    expect(verses[15].latin.endsWith("et consolatus es me.")).toBe(true);
  });

  test("Psalm 86 is lined into its seven office lines, joining 1+2 and splitting 4", () => {
    const verses = sliceVerses({ psalm: 86 });
    expect(verses).toHaveLength(7);
    expect(verses.map((verse) => verse.n)).toEqual(
      ["1", "2", "3", "4", "5", "6", "7"],
    );
    // Gallican 1 title dropped and joined to Gallican 2.
    expect(verses[0].latin.startsWith("Fundamenta eius in montibus sanctis")).toBe(true);
    expect(verses[0].latin.endsWith("super omnia tabernacula Iacob.")).toBe(true);
    expect(verses[0].latin.includes("Filiis Core")).toBe(false);
    expect(verses[0].english.startsWith("The foundations thereof")).toBe(true);
    // Gallican 4 splits: line 3 through "scientium me", line 4 the rest.
    expect(verses[2].latin.startsWith("Memor ero Rahab et Babylonis")).toBe(true);
    expect(verses[2].latin.endsWith("scientium me")).toBe(true);
    expect(verses[3].latin.startsWith("ecce alienigenae")).toBe(true);
    expect(verses[3].latin.endsWith("hi fuerunt illic.")).toBe(true);
    expect(verses[3].english.startsWith("Behold the foreigners")).toBe(true);
    // Whole-verse lines.
    expect(verses[1].latin.startsWith("Gloriosa dicta sunt de te")).toBe(true);
    expect(verses[4].latin.startsWith("Numquid Sion dicet")).toBe(true);
    expect(verses[6].latin.startsWith("Sicut laetantium omnium")).toBe(true);
  });

  test("Psalm 87 is lined into its nineteen Thursday Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 87 });
    expect(verses).toHaveLength(19);
    expect(verses.map((verse) => verse.n)).toEqual(
      Array.from({ length: 19 }, (_, i) => String(i + 1)),
    );
    // Gallican 1 is the title, dropped; line 1 opens with Gallican 2.
    expect(verses[0].latin.startsWith("Domine, Deus salutis meae")).toBe(true);
    expect(verses[0].latin.includes("Canticum Psalmi")).toBe(false);
    expect(verses[0].english.startsWith("O Lord, the God of my salvation")).toBe(true);
    // Gallican 5 joins Gallican 6 through "inter mortuos liber".
    expect(verses[3].latin.startsWith("Aestimatus sum cum descendentibus")).toBe(true);
    expect(verses[3].latin.endsWith("inter mortuos liber")).toBe(true);
    expect(verses[3].latin.includes("sicut vulnerati")).toBe(false);
    expect(verses[3].english.endsWith("Free among the dead.")).toBe(true);
    expect(verses[4].latin.startsWith("sicut vulnerati dormientes")).toBe(true);
    expect(verses[4].latin.endsWith("de manu tua repulsi sunt.")).toBe(true);
    expect(verses[4].english.startsWith("Like the slain")).toBe(true);
    // Gallican 9 splits after "abominationem sibi"; its tail joins Gallican 10 through "prae inopia".
    expect(verses[7].latin.startsWith("Longe fecisti notos meos a me")).toBe(true);
    expect(verses[7].latin.endsWith("abominationem sibi.")).toBe(true);
    expect(verses[7].latin.includes("Traditus sum")).toBe(false);
    expect(verses[7].english.endsWith("to themselves.")).toBe(true);
    expect(verses[8].latin.startsWith("Traditus sum, et non egrediebar")).toBe(true);
    expect(verses[8].latin.endsWith("prae inopia.")).toBe(true);
    expect(verses[8].latin.includes("Clamavi ad te")).toBe(false);
    expect(verses[8].english.startsWith("I was delivered up")).toBe(true);
    expect(verses[8].english.endsWith("through poverty.")).toBe(true);
    // Gallican 10 breaks after "prae inopia"; "Clamavi ad te" is its own line.
    expect(verses[9].latin.startsWith("Clamavi ad te, Domine, tota die")).toBe(true);
    expect(verses[9].latin.endsWith("expandi ad te manus meas.")).toBe(true);
    expect(verses[9].english.startsWith("All the day I cried to thee")).toBe(true);
    expect(verses[9].english.endsWith("my hands to thee.")).toBe(true);
    // Whole-verse lines.
    expect(verses[5].latin.startsWith("Posuerunt me in lacu inferiori")).toBe(true);
    expect(verses[15].latin.startsWith("Pauper sum ego")).toBe(true);
    expect(verses[18].latin.startsWith("Elongasti a me amicum et proximum")).toBe(true);
    expect(verses[18].latin.endsWith("notos meos a miseria.")).toBe(true);
    expect(verses.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);
  });

  test("Psalm 88 is lined in Kate's two Friday Matins parts", () => {
    const whole = sliceVerses({ psalm: 88 });
    const first = sliceVerses({ psalm: 88, from: 1, to: 19 });
    const second = sliceVerses({ psalm: 88, from: 20, to: 53 });
    expect(whole).toHaveLength(51);
    expect(first).toHaveLength(18);
    expect(second).toHaveLength(33);
    expect(first[0].latin.startsWith("Misericordias Domini")).toBe(true);
    expect(first[0].latin.endsWith("cantabo ;")).toBe(true);
    expect(first[0].latin.includes("Intellectus Ethan")).toBe(false);
    expect(first[0].english).toBe("The mercies of the Lord I will sing for ever.");
    expect(first[1].latin.startsWith("in generationem")).toBe(true);
    expect(first[1].english.startsWith("I will shew forth")).toBe(true);
    expect(first[3].latin.startsWith("Disposui testamentum")).toBe(true);
    expect(first[3].latin.endsWith("semen tuum,")).toBe(true);
    expect(first[3].english.endsWith("for ever.")).toBe(true);
    expect(first[4].latin.startsWith("et aedificabo")).toBe(true);
    expect(first[4].english.startsWith("And I will build up")).toBe(true);
    expect(first[11].latin.startsWith("Tui sunt caeli")).toBe(true);
    expect(first[11].latin.endsWith("tu creasti.")).toBe(true);
    expect(first[12].latin.startsWith("Thabor et Hermon")).toBe(true);
    expect(first[12].latin.endsWith("cum potentia.")).toBe(true);
    expect(first[13].latin.startsWith("Firmetur manus tua")).toBe(true);
    expect(first[13].latin.endsWith("sedis tuae :")).toBe(true);
    expect(first[14].latin.startsWith("misericordia et veritas")).toBe(true);
    expect(first[14].latin.endsWith("iubilationem :")).toBe(true);
    expect(first[15].latin.startsWith("Domine, in lumine")).toBe(true);
    expect(first[15].latin.endsWith("exaltabuntur.")).toBe(true);
    expect(first[17].latin.startsWith("Quia Domini est assumptio nostra")).toBe(true);
    expect(first[17].latin.endsWith("regis nostri.")).toBe(true);
    expect(second[0].latin.startsWith("Tunc locutus es")).toBe(true);
    expect(second[16].latin.startsWith("Semel iuravi")).toBe(true);
    expect(second[16].latin.endsWith("in aeternum manebit.")).toBe(true);
    expect(second[16].english.endsWith("for ever.")).toBe(true);
    expect(second[32].latin.startsWith("Benedictus Dominus")).toBe(true);
    expect(second[32].latin.endsWith("Fiat, fiat.")).toBe(true);
    expect(first.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);
    expect(second.every((verse) => verse.latin.length > 0 && verse.english.length > 0)).toBe(true);
    expect(sliceLabel({ psalm: 88, from: 1, to: 19, part: 1 })).toBe("Psalmus 88 · 1");
    expect(sliceLabel({ psalm: 88, from: 20, to: 53, part: 2 })).toBe("Psalmus 88 · 2");
    const friday = hourSlots("fri", "vigils").flatMap((slot) => slot.slices);
    expect(friday).toContainEqual({ psalm: 88, from: 1, to: 19, part: 1 });
    expect(friday).toContainEqual({ psalm: 88, from: 20, to: 53, part: 2 });
  });

  test("Psalm 80 is lined into its fifteen Thursday Vigils office lines", () => {
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

  test("Psalm 94 is the eleven-line invitatory", () => {
    const verses = sliceVerses({ psalm: 94 });
    expect(verses).toHaveLength(11);
    expect(verses[0].latin.startsWith("Venite, exsultemus Domino")).toBe(true);
    expect(verses[0].latin.includes("Laus cantici")).toBe(false);
    expect(verses[0].english.startsWith("Come let us praise the Lord")).toBe(true);
    expect(verses[10].latin.startsWith("Et isti non cognoverunt vias meas")).toBe(true);
    expect(hourSlots("sat", "vigils")[1].slices).toEqual([{ psalm: 94 }]);
  });

  test("Psalms 95 and 96 are lined for Friday Vigils", () => {
    const ninetyFive = sliceVerses({ psalm: 95 });
    const ninetySix = sliceVerses({ psalm: 96 });
    expect(ninetyFive).toHaveLength(13);
    expect(ninetySix).toHaveLength(13);
    expect(ninetyFive[0].latin.startsWith("Cantate Domino canticum novum")).toBe(true);
    expect(ninetyFive[0].latin.includes("post captivitatem")).toBe(false);
    expect(ninetyFive[6].latin.endsWith("gloriam nomini eius.")).toBe(true);
    expect(ninetyFive[7].latin.startsWith("Tollite hostias")).toBe(true);
    expect(ninetyFive[7].latin.endsWith("atrio sancto eius.")).toBe(true);
    expect(ninetyFive[8].latin.endsWith("Dominus regnavit.")).toBe(true);
    expect(ninetyFive[9].latin.startsWith("Etenim correxit")).toBe(true);
    expect(ninetyFive[10].latin.endsWith("quae in eis sunt.")).toBe(true);
    expect(ninetyFive[11].latin.startsWith("Tunc exsultabunt")).toBe(true);
    expect(ninetyFive[11].latin.endsWith("iudicare terram.")).toBe(true);
    expect(ninetyFive[12].latin.startsWith("Iudicabit orbem terrae")).toBe(true);
    expect(ninetyFive[6].english.endsWith("glory unto his name.")).toBe(true);
    expect(ninetyFive[12].english.startsWith("He shall judge the world")).toBe(true);
    expect(ninetySix[0].latin.startsWith("Dominus regnavit")).toBe(true);
    expect(ninetySix[0].latin.includes("restituta est")).toBe(false);
    expect(ninetySix[6].latin.endsWith("simulacris suis.")).toBe(true);
    expect(ninetySix[7].latin.startsWith("Adorate eum omnes angeli eius.")).toBe(true);
    expect(ninetySix[7].latin.endsWith("laetata est Sion,")).toBe(true);
    expect(ninetySix[8].latin.startsWith("et exsultaverunt filiae Iudae")).toBe(true);
    expect(ninetySix[12].latin.startsWith("Laetamini, iusti")).toBe(true);
    expect(ninetySix[7].english.endsWith("and was glad.")).toBe(true);
    const friday = hourSlots("fri", "vigils");
    expect(friday[8].slices).toEqual([{ psalm: 95 }]);
    expect(friday[9].slices).toEqual([{ psalm: 96 }]);
  });

  test("Psalms 97 to 100 are lined for Friday Vigils, and 101 for Saturday", () => {
    const ninetySeven = sliceVerses({ psalm: 97 });
    const ninetyEight = sliceVerses({ psalm: 98 });
    const ninetyNine = sliceVerses({ psalm: 99 });
    const oneHundred = sliceVerses({ psalm: 100 });
    const oneOhOne = sliceVerses({ psalm: 101 });
    expect(ninetySeven).toHaveLength(10);
    expect(ninetyEight).toHaveLength(10);
    expect(ninetyNine).toHaveLength(5);
    expect(oneHundred).toHaveLength(10);
    expect(oneOhOne).toHaveLength(29);
    expect(ninetySeven[0].latin.endsWith("quia mirabilia fecit.")).toBe(true);
    expect(ninetySeven[0].latin.includes("Psalmus ipsi David")).toBe(false);
    expect(ninetySeven[1].latin.startsWith("Salvavit sibi dextera")).toBe(true);
    expect(ninetySeven[3].latin.endsWith("domui Israël.")).toBe(true);
    expect(ninetySeven[6].latin.endsWith("tubae corneae.")).toBe(true);
    expect(ninetySeven[7].latin.startsWith("Iubilate in conspectu")).toBe(true);
    expect(ninetySeven[7].latin.endsWith("habitant in eo.")).toBe(true);
    expect(ninetySeven[8].latin.endsWith("iudicare terram.")).toBe(true);
    expect(ninetySeven[9].latin.startsWith("Iudicabit orbem terrarum")).toBe(true);
    expect(ninetyEight[0].latin.startsWith("Dominus regnavit")).toBe(true);
    expect(ninetyEight[2].latin.endsWith("iudicium diligit.")).toBe(true);
    expect(ninetyEight[5].latin.endsWith("nomen eius :")).toBe(true);
    expect(ninetyEight[6].latin.startsWith("invocabant Dominum")).toBe(true);
    expect(ninetyEight[6].latin.endsWith("loquebatur ad eos.")).toBe(true);
    expect(ninetyEight[7].latin.startsWith("Custodiebant testimonia")).toBe(true);
    expect(ninetyNine[0].latin.endsWith("in laetitia.")).toBe(true);
    expect(ninetyNine[0].latin.includes("confessione.")).toBe(false);
    expect(ninetyNine[2].latin.endsWith("non ipsi nos :")).toBe(true);
    expect(ninetyNine[3].latin.startsWith("populus eius")).toBe(true);
    expect(ninetyNine[3].latin.endsWith("confitemini illi.")).toBe(true);
    expect(ninetyNine[4].latin.startsWith("Laudate nomen eius")).toBe(true);
    expect(ninetyNine[4].english.startsWith("Praise ye his name:")).toBe(true);
    expect(oneHundred[0].latin.endsWith("Domine ;")).toBe(true);
    expect(oneHundred[0].latin.includes("Psalmus ipsi David")).toBe(false);
    expect(oneHundred[1].latin.startsWith("psallam,")).toBe(true);
    expect(oneHundred[1].latin.endsWith("ad me ?")).toBe(true);
    expect(oneHundred[3].latin.endsWith("praevaricationes odivi ;")).toBe(true);
    expect(oneHundred[4].latin.startsWith("non adhaesit mihi")).toBe(true);
    expect(oneHundred[4].english.startsWith("The perverse heart did not cleave")).toBe(true);
    expect(oneHundred[5].latin.endsWith("hunc persequebar :")).toBe(true);
    expect(oneHundred[6].latin.startsWith("superbo oculo")).toBe(true);
    expect(oneOhOne[0].latin.startsWith("Domine, exaudi orationem meam")).toBe(true);
    expect(oneOhOne[0].latin.includes("Oratio pauperis")).toBe(false);
    expect(oneOhOne[1].latin.endsWith("aurem tuam ;")).toBe(true);
    expect(oneOhOne[2].latin.startsWith("in quacumque die invocavero te")).toBe(true);
    expect(oneOhOne[13].latin.startsWith("Tu exsurgens misereberis Sion")).toBe(true);
    expect(oneOhOne[26].latin.endsWith("vestimentum veterascent.")).toBe(true);
    expect(oneOhOne[27].latin.startsWith("Et sicut opertorium")).toBe(true);
    expect(oneOhOne[27].latin.endsWith("non deficient.")).toBe(true);
    expect(oneOhOne[27].english.startsWith("And as a vesture")).toBe(true);
    expect(oneOhOne[28].latin.startsWith("Filii servorum tuorum")).toBe(true);
    const friday = hourSlots("fri", "vigils");
    expect(friday.slice(10, 14).map((slot) => slot.slices[0].psalm)).toEqual([97, 98, 99, 100]);
    const saturday = hourSlots("sat", "vigils");
    expect(saturday.slice(2, 4).map((slot) => slot.slices[0].psalm)).toEqual([101, 102]);
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

  test("Psalm 13 is lined into eleven Thursday Prime office lines", () => {
    const verses = sliceVerses({ psalm: 13 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
    ]);
    const first = verses[0];
    expect(first.latin.startsWith("Dixit insipiens")).toBe(true);
    expect(first.latin.endsWith("Non est Deus.")).toBe(true);
    expect(first.latin.includes("In finem")).toBe(false);
    expect(first.latin.includes("Psalmus David")).toBe(false);
    expect(verses[1].latin.startsWith("Corrupti sunt")).toBe(true);
    expect(verses[1].latin.endsWith("non est usque ad unum.")).toBe(true);
    expect(verses[2].latin.startsWith("Dominus de caelo")).toBe(true);
    expect(verses[3].latin.startsWith("Omnes declinaverunt")).toBe(true);
    expect(verses[3].latin.endsWith("non est usque ad unum.")).toBe(true);
    expect(verses[4].latin.startsWith("Sepulchrum patens")).toBe(true);
    expect(verses[4].latin.endsWith("sub labiis eorum,")).toBe(true);
    expect(verses[4].latin.includes("Quorum os")).toBe(false);
    expect(verses[5].latin.startsWith("quorum os maledictione")).toBe(true);
    expect(verses[5].latin.endsWith("ad effundendum sanguinem.")).toBe(true);
    expect(verses[6].latin.startsWith("Contritio et infelicitas")).toBe(true);
    expect(verses[6].latin.endsWith("ante oculos eorum.")).toBe(true);
    expect(verses[7].latin.startsWith("Nonne cognoscent")).toBe(true);
    expect(verses[8].latin.startsWith("Dominum non invocaverunt")).toBe(true);
    expect(verses[9].latin.startsWith("Quoniam Dominus")).toBe(true);
    expect(verses[10].latin.startsWith("Quis dabit")).toBe(true);
    // English tracks the same cuts
    expect(first.english.startsWith("The fool hath said")).toBe(true);
    expect(first.english.includes("Unto the end")).toBe(false);
    expect(first.english.endsWith("There is no God.")).toBe(true);
    expect(verses[3].english.endsWith("no not one.")).toBe(true);
    expect(verses[4].english.endsWith("under their lips.")).toBe(true);
    expect(verses[5].english.endsWith("to shed blood.")).toBe(true);
    // the cursus says it whole at Thursday Prime
    const thuPrime = hourSlots("thu", "prime").flatMap((slot) => slot.slices.map((s) => [s.psalm, s.from, s.to]));
    expect(thuPrime).toContainEqual([13, undefined, undefined]);
  });

  test("Psalm 20 drops its title and keeps Gallican verses 2–14 whole", () => {
    const verses = sliceVerses({ psalm: 20 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
    ]);
    expect(verses[0].latin.startsWith("Domine, in virtute tua")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].english.startsWith("In thy strength, O Lord")).toBe(true);
    expect(verses[12].latin.startsWith("Exaltare, Domine")).toBe(true);
    expect(verses[12].latin.endsWith("virtutes tuas.")).toBe(true);
  });

  test("Psalm 21 drops its title and lines the Benedictine thirty-four verses", () => {
    const verses = sliceVerses({ psalm: 21 });
    expect(verses).toHaveLength(34);
    expect(verses[0].latin.startsWith("Deus, Deus meus, respice in me")).toBe(true);
    expect(verses[0].latin.includes("pro susceptione")).toBe(false);
    expect(verses[0].english.startsWith("O God my God, look upon me")).toBe(true);
    expect(verses[9].latin.startsWith("In te proiectus sum ex utero")).toBe(true);
    expect(verses[9].latin.endsWith("ne discesseris a me,")).toBe(true);
    expect(verses[9].english.endsWith("Depart not from me.")).toBe(true);
    expect(verses[10].latin.startsWith("quoniam tribulatio proxima est")).toBe(true);
    expect(verses[10].english.startsWith("For tribulation is very near")).toBe(true);
    expect(verses[13].latin.endsWith("omnia ossa mea :")).toBe(true);
    expect(verses[14].latin.startsWith("factum est cor meum")).toBe(true);
    expect(verses[14].english.startsWith("My heart is become like wax")).toBe(true);
    expect(verses[16].latin.endsWith("obsedit me.")).toBe(true);
    expect(verses[17].latin.startsWith("Foderunt manus meas")).toBe(true);
    expect(verses[17].latin.endsWith("dinumeraverunt omnia ossa mea.")).toBe(true);
    expect(verses[17].english.endsWith("numbered all my bones.")).toBe(true);
    expect(verses[18].latin.startsWith("Ipsi vero consideraverunt")).toBe(true);
    expect(verses[18].latin.endsWith("miserunt sortem.")).toBe(true);
    expect(verses[24].latin.endsWith("deprecationem pauperis,")).toBe(true);
    expect(verses[25].latin.startsWith("nec avertit faciem suam")).toBe(true);
    expect(verses[25].english.startsWith("Neither hath he turned away")).toBe(true);
    expect(verses[28].latin.endsWith("universi fines terrae ;")).toBe(true);
    expect(verses[29].latin.startsWith("et adorabunt in conspectu eius")).toBe(true);
    expect(verses[29].english.startsWith("And all the kindreds")).toBe(true);
    expect(verses[33].latin.startsWith("Annuntiabitur Domino")).toBe(true);
    expect(verses[33].latin.endsWith("quem fecit Dominus.")).toBe(true);
  });

  test("Psalm 22 joins Gallican verses into nine Sunday Matins office lines", () => {
    const verses = sliceVerses({ psalm: 22 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    const first = verses[0];
    expect(first.latin.startsWith("Dominus regit me")).toBe(true);
    expect(first.latin.includes("Psalmus David")).toBe(false);
    expect(first.latin.endsWith("ibi me collocavit.")).toBe(true);
    expect(verses[1].latin.startsWith("Super aquam refectionis")).toBe(true);
    expect(verses[1].latin.endsWith("animam meam convertit.")).toBe(true);
    expect(verses[2].latin.startsWith("Deduxit me super semitas iustitiae")).toBe(true);
    expect(verses[2].latin.endsWith("propter nomen suum.")).toBe(true);
    expect(verses[3].latin.startsWith("Nam etsi ambulavero")).toBe(true);
    expect(verses[3].latin.endsWith("quoniam tu mecum es.")).toBe(true);
    expect(verses[4].latin.startsWith("Virga tua")).toBe(true);
    expect(verses[4].latin.endsWith("ipsa me consolata sunt.")).toBe(true);
    expect(verses[5].latin.startsWith("Parasti in conspectu meo mensam")).toBe(true);
    expect(verses[5].latin.endsWith("qui tribulant me ;")).toBe(true);
    expect(verses[6].latin.startsWith("impinguasti in oleo caput meum")).toBe(true);
    expect(verses[6].latin.endsWith("quam praeclarus est !")).toBe(true);
    expect(verses[7].latin.startsWith("Et misericordia tua")).toBe(true);
    expect(verses[7].latin.endsWith("omnibus diebus vitae meae ;")).toBe(true);
    expect(verses[8].latin.startsWith("et ut inhabitem")).toBe(true);
    expect(verses[8].latin.endsWith("longitudinem dierum.")).toBe(true);
    // English: title dropped on line 1, joins and cuts track the Latin
    expect(first.english.startsWith("The Lord ruleth me")).toBe(true);
    expect(first.english.includes("A psalm for David")).toBe(false);
    expect(first.english.endsWith("in a place of pasture.")).toBe(true);
    expect(verses[1].english.startsWith("He hath brought me up")).toBe(true);
    expect(verses[1].english.endsWith("He hath converted my soul.")).toBe(true);
    expect(verses[2].english.startsWith("He hath led me")).toBe(true);
    expect(verses[3].english.endsWith("for thou art with me.")).toBe(true);
    expect(verses[6].english.startsWith("Thou hast anointed my head with oil")).toBe(true);
    expect(verses[7].english.startsWith("And thy mercy will follow me")).toBe(true);
    expect(verses[8].english.startsWith("And that I may dwell")).toBe(true);
    // the cursus says it whole at Sunday Matins
    const sundayVigils = hourSlots("sun", "vigils").flatMap((slot) => slot.slices.map((s) => [s.psalm, s.from, s.to]));
    expect(sundayVigils).toContainEqual([22, undefined, undefined]);
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

  test("Psalm 5 is lined into its fifteen Monday Lauds office lines", () => {
    const verses = sliceVerses({ psalm: 5 });
    expect(verses).toHaveLength(15);
    expect(verses[0].latin.startsWith("Verba mea auribus percipe")).toBe(true);
    expect(verses[0].latin.includes("haereditatem")).toBe(false);
    expect(verses[5].latin.endsWith("loquuntur mendacium.")).toBe(true);
    expect(verses[5].english.endsWith("speak a lie.")).toBe(true);
    expect(verses[6].latin.startsWith("Virum sanguinum")).toBe(true);
    expect(verses[6].latin.endsWith("misericordiae tuae")).toBe(true);
    expect(verses[7].latin.startsWith("introibo in domum tuam")).toBe(true);
    expect(verses[10].latin.endsWith("iudica illos, Deus.")).toBe(true);
    expect(verses[11].latin.startsWith("Decidant a cogitationibus")).toBe(true);
    expect(verses[12].latin.endsWith("habitabis in eis.")).toBe(true);
    expect(verses[13].latin.startsWith("Et gloriabuntur")).toBe(true);
    expect(verses[13].latin.endsWith("benedices iusto.")).toBe(true);
    expect(verses[13].english.endsWith("bless the just.")).toBe(true);
    expect(verses[14].latin.startsWith("Domine, ut scuto")).toBe(true);
    expect(verses[14].english.startsWith("O Lord, thou hast crowned us,")).toBe(true);
    expect(hourSlots("mon", "lauds")[2].slices).toEqual([{ psalm: 5 }]);
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

  test("Psalm 102 drops its title and joins Gallican 13–15 and 17–18", () => {
    const verses = sliceVerses({ psalm: 102 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22",
    ]);
    expect(verses[0].latin.startsWith("Benedic, anima mea, Domino")).toBe(true);
    expect(verses[0].latin.includes("Ipsi David")).toBe(false);
    expect(verses[0].english.startsWith("Bless the Lord")).toBe(true);
    // line 13 = Gallican 13 + head of 14
    expect(verses[12].latin.startsWith("Quomodo miseretur pater")).toBe(true);
    expect(verses[12].latin.endsWith("figmentum nostrum")).toBe(true);
    expect(verses[12].latin.includes("recordatus est")).toBe(false);
    // line 14 = tail of 14 + Gallican 15
    expect(verses[13].latin.startsWith("recordatus est quoniam pulvis")).toBe(true);
    expect(verses[13].latin.endsWith("sic efflorebit :")).toBe(true);
    // line 16/17/18 split of 17 and 18
    expect(verses[15].latin.startsWith("Misericordia autem Domini")).toBe(true);
    expect(verses[15].latin.endsWith("super timentes eum.")).toBe(true);
    expect(verses[16].latin.startsWith("Et iustitia illius")).toBe(true);
    expect(verses[16].latin.endsWith("testamentum eius")).toBe(true);
    expect(verses[17].latin.startsWith("et memores sunt mandatorum")).toBe(true);
    expect(verses[17].latin.endsWith("ad faciendum ea.")).toBe(true);
    expect(verses[21].latin.startsWith("Benedicite Domino, omnia opera")).toBe(true);
    expect(verses[16].english.startsWith("And his justice")).toBe(true);
    expect(verses[17].english.startsWith("And are mindful")).toBe(true);
  });

  test("Psalm 103 is lined out in its two Saturday Matins halves", () => {
    const first = sliceVerses({ psalm: 103, from: 1, to: 24 });
    const second = sliceVerses({ psalm: 103, from: 25, to: 35 });
    expect(first.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25",
    ]);
    expect(second.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
    ]);
    // first half: title drop and the v1–v3 re-lining
    expect(first[0].latin.startsWith("Benedic, anima mea, Domino")).toBe(true);
    expect(first[0].latin.includes("Ipsi David")).toBe(false);
    expect(first[1].latin.startsWith("Confessionem et decorem")).toBe(true);
    expect(first[1].latin.endsWith("sicut vestimento")).toBe(true);
    expect(first[3].latin.startsWith("qui ponis nubem")).toBe(true);
    // divisio boundary: part 1 ends with the Quam magnificata verse, part 2 begins with Hoc mare
    expect(first[24].latin.startsWith("Quam magnificata sunt opera tua")).toBe(true);
    expect(second[0].latin.startsWith("Hoc mare magnum")).toBe(true);
    expect(second[0].latin.endsWith("quorum non est numerus")).toBe(true);
    expect(second[1].latin.startsWith("animalia pusilla cum magnis")).toBe(true);
    expect(second[1].latin.endsWith("naves pertransibunt")).toBe(true);
    expect(second[2].latin.startsWith("draco iste")).toBe(true);
    expect(second[10].latin.startsWith("Deficiant peccatores")).toBe(true);
    expect(second[0].english.startsWith("So is this great sea")).toBe(true);
    // the cursus splits psalm 103 at Saturday Vigils
    const satVigils = hourSlots("sat", "vigils");
    const slices = satVigils.flatMap((slot) => slot.slices.map((s) => [s.psalm, s.from, s.to]));
    expect(slices).toContainEqual([103, 1, 24]);
    expect(slices).toContainEqual([103, 25, 35]);
  });

  test("Psalm 104 is lined out in its two Saturday Matins halves", () => {
    const first = sliceVerses({ psalm: 104, from: 1, to: 22 });
    const second = sliceVerses({ psalm: 104, from: 23, to: 45 });
    expect(first.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21",
    ]);
    expect(second.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
    ]);
    // Alleluia dropped from line 1
    expect(first[0].latin.startsWith("Confitemini Domino")).toBe(true);
    expect(first[0].latin.includes("Alleluia")).toBe(false);
    // re-lining of Gallican 18–20
    expect(first[17].latin.startsWith("Humiliaverunt")).toBe(true);
    expect(first[17].latin.endsWith("veniret verbum eius")).toBe(true);
    expect(first[17].latin.includes("Eloquium Domini")).toBe(false);
    expect(first[18].latin.startsWith("Eloquium Domini")).toBe(true);
    expect(first[18].latin.endsWith("dimisit eum.")).toBe(true);
    // divisio boundary
    expect(first[20].latin.startsWith("ut erudiret principes")).toBe(true);
    expect(second[0].latin.startsWith("Et intravit Israël")).toBe(true);
    expect(second[22].latin.startsWith("ut custodiant iustificationes")).toBe(true);
    expect(second[0].english.startsWith("And Israel went into Egypt")).toBe(true);
    expect(first[17].english.endsWith("Until his word came.")).toBe(true);
    // the cursus splits psalm 104 at Saturday Vigils
    const satVigils = hourSlots("sat", "vigils");
    const slices = satVigils.flatMap((slot) => slot.slices.map((s) => [s.psalm, s.from, s.to]));
    expect(slices).toContainEqual([104, 1, 22]);
    expect(slices).toContainEqual([104, 23, 45]);
  });

  test("Psalm 68 is lined into its two Wednesday Vigils parts", () => {
    const first = sliceVerses({ psalm: 68, from: 1, to: 19 });
    const second = sliceVerses({ psalm: 68, from: 20, to: 37 });
    expect(first).toHaveLength(22);
    expect(second).toHaveLength(20);
    expect(first[0].latin.startsWith("Salvum me fac, Deus")).toBe(true);
    expect(first[0].latin.includes("commutabuntur")).toBe(false);
    expect(first[1].latin.endsWith("non est substantia.")).toBe(true);
    expect(first[2].latin.startsWith("Veni in altitudinem maris")).toBe(true);
    expect(first[4].latin.endsWith("oderunt me gratis.")).toBe(true);
    expect(first[5].latin.startsWith("Confortati sunt")).toBe(true);
    expect(first[7].latin.endsWith("Domine virtutum ;")).toBe(true);
    expect(first[7].english.endsWith("the Lord of hosts.")).toBe(true);
    expect(first[8].latin.startsWith("non confundantur super me")).toBe(true);
    expect(first[15].latin.endsWith("beneplaciti, Deus.")).toBe(true);
    expect(first[16].latin.startsWith("In multitudine misericordiae")).toBe(true);
    expect(first[21].latin.startsWith("Intende animae meae")).toBe(true);
    expect(second[0].latin.startsWith("Tu scis improperium meum")).toBe(true);
    expect(second[1].latin.endsWith("et miseriam :")).toBe(true);
    expect(second[1].english.endsWith("reproach and misery.")).toBe(true);
    expect(second[2].latin.startsWith("et sustinui qui simul")).toBe(true);
    expect(second[17].latin.endsWith("civitates Iuda,")).toBe(true);
    expect(second[18].latin.startsWith("et inhabitabunt ibi")).toBe(true);
    expect(second[18].english.startsWith("And they shall dwell there,")).toBe(true);
    expect(second[19].latin.startsWith("Et semen servorum eius")).toBe(true);
    expect(sliceLabel({ psalm: 68, from: 1, to: 19 })).toBe("Psalmus 68 · 1–19");
    expect(sliceLabel({ psalm: 68, from: 20, to: 37 })).toBe("Psalmus 68 · 20–37");
    const wednesday = hourSlots("wed", "vigils").flatMap((slot) => slot.slices);
    expect(wednesday).toContainEqual({ psalm: 68, from: 1, to: 19 });
    expect(wednesday).toContainEqual({ psalm: 68, from: 20, to: 37 });
  });

  test("Psalm 105 is lined out in its two Saturday Matins halves", () => {
    const first = sliceVerses({ psalm: 105, from: 1, to: 31 });
    const second = sliceVerses({ psalm: 105, from: 32, to: 48 });
    expect(first).toHaveLength(31);
    expect(second).toHaveLength(16);
    expect(first[0].latin.startsWith("Confitemini Domino")).toBe(true);
    expect(first[0].latin.includes("Alleluia")).toBe(false);
    expect(first[6].latin.endsWith("misericordiae tuae.")).toBe(true);
    expect(first[7].latin.startsWith("Et irritaverunt")).toBe(true);
    expect(first[21].latin.startsWith("Obliti sunt Deum")).toBe(true);
    expect(first[21].latin.endsWith("mari Rubro.")).toBe(true);
    expect(first[23].latin.startsWith("ut averteret iram eius")).toBe(true);
    expect(first[23].latin).toContain("terram desiderabilem");
    expect(first[24].latin.startsWith("non crediderunt verbo eius.")).toBe(true);
    expect(first[30].latin.startsWith("Et reputatum est ei")).toBe(true);
    expect(second[0].latin.startsWith("Et irritaverunt eum ad aquas")).toBe(true);
    expect(second[0].latin.endsWith("spiritum eius,")).toBe(true);
    expect(second[1].latin.startsWith("et distinxit in labiis suis.")).toBe(true);
    expect(second[2].latin.startsWith("et commisti sunt")).toBe(true);
    expect(second[2].latin.endsWith("in scandalum.")).toBe(true);
    expect(second[14].latin.startsWith("ut confiteamur")).toBe(true);
    expect(second[15].latin.startsWith("Benedictus Dominus")).toBe(true);
    expect(second[0].english.endsWith("his spirit.")).toBe(true);
    const sat = hourSlots("sat", "vigils").flatMap((slot) => slot.slices);
    expect(sat).toContainEqual({ psalm: 105, from: 1, to: 31 });
    expect(sat).toContainEqual({ psalm: 105, from: 32, to: 48 });
  });

  test("Psalm 106 keeps each Gallican verse and divides before Dixit, et stetit", () => {
    const first = sliceVerses({ psalm: 106, from: 1, to: 24 });
    const second = sliceVerses({ psalm: 106, from: 25, to: 43 });
    expect(first).toHaveLength(24);
    expect(second).toHaveLength(19);
    expect(first[0].latin.startsWith("Confitemini Domino")).toBe(true);
    expect(first[0].latin.includes("Alleluia")).toBe(false);
    expect(first[23].latin.startsWith("ipsi viderunt opera Domini")).toBe(true);
    expect(second[0].latin.startsWith("Dixit, et stetit spiritus procellae")).toBe(true);
    expect(second[18].latin.startsWith("Quis sapiens")).toBe(true);
    const sat = hourSlots("sat", "vigils").flatMap((slot) => slot.slices);
    expect(sat).toContainEqual({ psalm: 106, from: 1, to: 24 });
    expect(sat).toContainEqual({ psalm: 106, from: 25, to: 43 });
  });

  test("Psalm 107 drops the title and joins the Gallican verses into fourteen lines", () => {
    const verses = sliceVerses({ psalm: 107 });
    expect(verses).toHaveLength(14);
    expect(verses[0].latin.startsWith("Paratum cor meum")).toBe(true);
    expect(verses[0].latin.includes("Canticum")).toBe(false);
    expect(verses[4].latin.startsWith("Exaltare super caelos")).toBe(true);
    expect(verses[4].latin.endsWith("dilecti tui.")).toBe(true);
    expect(verses[5].latin.startsWith("Salvum fac dextera tua")).toBe(true);
    expect(verses[5].latin.endsWith("in sancto suo :")).toBe(true);
    expect(verses[6].latin.startsWith("Exsultabo, et dividam Sichimam")).toBe(true);
    expect(verses[8].latin.startsWith("Iuda rex meus")).toBe(true);
    expect(verses[8].latin).toContain("spei meae");
    expect(verses[9].latin.startsWith("in Idumaeam extendam")).toBe(true);
    expect(verses[13].latin.startsWith("In Deo faciemus virtutem")).toBe(true);
    expect(verses[4].english.endsWith("may be delivered.")).toBe(true);
    expect(verses[8].english.startsWith("Juda is my king:")).toBe(true);
  });

  test("Psalm 108 drops the title and keeps thirty office lines", () => {
    const verses = sliceVerses({ psalm: 108 });
    expect(verses).toHaveLength(30);
    expect(verses[0].latin.startsWith("Deus, laudem meam")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[13].latin.startsWith("Fiant contra Dominum")).toBe(true);
    expect(verses[13].latin.endsWith("facere misericordiam,")).toBe(true);
    expect(verses[15].latin.endsWith("elongabitur ab eo.")).toBe(true);
    expect(verses[16].latin.startsWith("Et induit maledictionem")).toBe(true);
    expect(verses[16].latin.endsWith("ossibus eius.")).toBe(true);
    expect(verses[19].latin.startsWith("Et tu, Domine, Domine")).toBe(true);
    expect(verses[20].latin.startsWith("Libera me")).toBe(true);
    expect(verses[29].latin.startsWith("quia astitit a dextris")).toBe(true);
    expect(verses[15].english.endsWith("far from him.")).toBe(true);
    expect(verses[16].english.startsWith("And he put on cursing")).toBe(true);
  });

  test("Psalm 109 opens Sunday Vespers in eight office lines", () => {
    const verses = sliceVerses(hourSlots("sun", "vespers")[0].slices[0]);
    expect(verses).toHaveLength(8);
    expect(verses[0].latin.startsWith("Dixit Dominus Domino meo")).toBe(true);
    expect(verses[0].latin.endsWith("Sede a dextris meis,")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].english.startsWith("The Lord said to my Lord")).toBe(true);
    expect(verses[0].english.endsWith("at my right hand:")).toBe(true);
    expect(verses[1].latin.startsWith("donec ponam inimicos tuos")).toBe(true);
    expect(verses[1].english.startsWith("Until I make thy enemies")).toBe(true);
    expect(verses[7].latin.startsWith("De torrente in via bibet")).toBe(true);
  });

  test("Psalm 110 is lined out into ten Sunday Vespers lines", () => {
    const verses = sliceVerses(hourSlots("sun", "vespers")[1].slices[0]);
    expect(verses).toHaveLength(10);
    expect(verses[0].latin.startsWith("Confitebor tibi, Domine")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[3].latin.startsWith("Memoriam fecit")).toBe(true);
    expect(verses[3].latin.endsWith("timentibus se ;")).toBe(true);
    expect(verses[4].latin.startsWith("memor erit")).toBe(true);
    expect(verses[4].latin.endsWith("populo suo,")).toBe(true);
    expect(verses[7].latin.endsWith("testamentum suum.")).toBe(true);
    expect(verses[8].latin.startsWith("Sanctum et terribile")).toBe(true);
    expect(verses[8].latin.endsWith("timor Domini ;")).toBe(true);
    expect(verses[9].latin.startsWith("intellectus bonus")).toBe(true);
    expect(verses[3].english.endsWith("them that fear him.")).toBe(true);
    expect(verses[9].english.startsWith("A good understanding")).toBe(true);
  });

  test("Psalm 111 is lined out into nine Sunday Vespers lines", () => {
    const verses = sliceVerses(hourSlots("sun", "vespers")[2].slices[0]);
    expect(verses).toHaveLength(9);
    expect(verses[0].latin.startsWith("Beatus vir qui timet")).toBe(true);
    expect(verses[0].latin.includes("Aggaei")).toBe(false);
    expect(verses[4].latin.startsWith("Iucundus homo")).toBe(true);
    expect(verses[4].latin.endsWith("non commovebitur.")).toBe(true);
    expect(verses[5].latin.endsWith("non timebit.")).toBe(true);
    expect(verses[6].latin.startsWith("Paratum cor eius")).toBe(true);
    expect(verses[6].latin.endsWith("inimicos suos.")).toBe(true);
    expect(verses[8].latin.startsWith("Peccator videbit")).toBe(true);
    expect(verses[5].english.endsWith("the evil hearing.")).toBe(true);
    expect(verses[6].english.startsWith("His heart is ready to hope")).toBe(true);
  });

  test("Psalm 112 is lined out into eight Sunday Vespers lines", () => {
    const verses = sliceVerses(hourSlots("sun", "vespers")[3].slices[0]);
    expect(verses).toHaveLength(8);
    expect(verses[0].latin.startsWith("Laudate, pueri, Dominum")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[4].latin.startsWith("Quis sicut Dominus")).toBe(true);
    expect(verses[4].latin.endsWith("in terra ?")).toBe(true);
    expect(verses[7].latin.startsWith("Qui habitare facit sterilem")).toBe(true);
    expect(verses[4].english).toContain("looketh down on the low things");
  });

  test("Psalm 113 is lined out into twenty-seven Monday Vespers lines", () => {
    const verses = sliceVerses(hourSlots("mon", "vespers")[0].slices[0]);
    expect(verses).toHaveLength(27);
    expect(verses[0].latin.startsWith("In exitu Israël")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[12].latin.startsWith("Os habent")).toBe(true);
    expect(verses[19].latin.startsWith("Dominus memor fuit nostri")).toBe(true);
    expect(verses[19].latin.endsWith("benedixit nobis.")).toBe(true);
    expect(verses[20].latin.startsWith("Benedixit domui Israël")).toBe(true);
    expect(verses[21].latin.startsWith("Benedixit omnibus qui timent")).toBe(true);
    expect(verses[25].latin.startsWith("Non mortui laudabunt")).toBe(true);
    expect(verses[26].latin.startsWith("sed nos qui vivimus")).toBe(true);
    expect(verses[19].english.endsWith("hath blessed us.")).toBe(true);
    expect(verses[20].english.startsWith("He hath blessed the house of Israel")).toBe(true);
  });

  test("Psalm 114 is lined out into nine Monday Vespers lines", () => {
    const verses = sliceVerses(hourSlots("mon", "vespers")[1].slices[0]);
    expect(verses).toHaveLength(9);
    expect(verses[0].latin.startsWith("Dilexi, quoniam exaudiet")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[2].latin.endsWith("invenerunt me.")).toBe(true);
    expect(verses[3].latin.startsWith("Tribulationem et dolorem inveni,")).toBe(true);
    expect(verses[3].latin.endsWith("invocavi :")).toBe(true);
    expect(verses[4].latin.startsWith("o Domine, libera animam meam.")).toBe(true);
    expect(verses[4].latin).toContain("Deus noster miseretur.");
    expect(verses[8].latin.startsWith("Placebo Domino")).toBe(true);
    expect(verses[3].english.startsWith("I met with trouble and sorrow:")).toBe(true);
    expect(verses[3].english.endsWith("name of the Lord.")).toBe(true);
    expect(verses[4].english.startsWith("O Lord, deliver my soul.")).toBe(true);
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

  test("Psalm 28 drops its title and joins the flame of fire with the desert of Cades", () => {
    const verses = sliceVerses({ psalm: 28 });
    expect(verses.map((verse) => verse.n)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    expect(verses[0].latin.startsWith("Afferte Domino, filii Dei")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].english.startsWith("Bring to the Lord")).toBe(true);
    expect(verses[6].latin.startsWith("Vox Domini intercidentis flammam ignis")).toBe(true);
    expect(verses[6].latin).toContain("vox Domini concutientis desertum");
    expect(verses[6].latin.endsWith("desertum Cades.")).toBe(true);
    expect(verses[6].english).toContain("divideth the flame of fire");
    expect(verses[6].english.endsWith("desert of Cades.")).toBe(true);
    expect(verses[9].latin.startsWith("Dominus virtutem populo suo")).toBe(true);
    expect(verses[9].latin.endsWith("in pace.")).toBe(true);
  });

  test("Psalm 29 drops its title and splits Gallican verses 6, 8, and 10", () => {
    const verses = sliceVerses({ psalm: 29 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15",
    ]);
    expect(verses[0].latin.startsWith("Exaltabo te, Domine")).toBe(true);
    expect(verses[0].latin.includes("Psalmus cantici")).toBe(false);
    expect(verses[0].english.startsWith("I will extol thee")).toBe(true);
    expect(verses[4].latin.endsWith("in voluntate eius :")).toBe(true);
    expect(verses[4].latin.includes("ad vesperum")).toBe(false);
    expect(verses[4].english.endsWith("in his good will.")).toBe(true);
    expect(verses[5].latin.startsWith("ad vesperum demorabitur")).toBe(true);
    expect(verses[5].latin.endsWith("laetitia.")).toBe(true);
    expect(verses[5].english.startsWith("In the evening weeping")).toBe(true);
    expect(verses[7].latin.endsWith("decori meo virtutem ;")).toBe(true);
    expect(verses[7].english.endsWith("to my beauty.")).toBe(true);
    expect(verses[8].latin.startsWith("avertisti faciem tuam")).toBe(true);
    expect(verses[8].english.startsWith("Thou turnedst away thy face")).toBe(true);
    expect(verses[10].latin.endsWith("in corruptionem ?")).toBe(true);
    expect(verses[10].english.endsWith("to corruption?")).toBe(true);
    expect(verses[11].latin.startsWith("numquid confitebitur")).toBe(true);
    expect(verses[11].english.startsWith("Shall dust confess")).toBe(true);
    expect(verses[14].latin.startsWith("ut cantet tibi gloria mea")).toBe(true);
    expect(verses[14].latin.endsWith("confitebor tibi.")).toBe(true);
  });

  test("Psalm 30 drops its title and lines the Benedictine thirty-one verses", () => {
    const verses = sliceVerses({ psalm: 30 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
      "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
      "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
      "31",
    ]);
    expect(verses[0].latin.startsWith("In te, Domine, speravi")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].latin.endsWith("libera me.")).toBe(true);
    expect(verses[0].english.startsWith("In thee, O Lord, have I hoped")).toBe(true);
    // Gallican 3 splits after eruas me.
    expect(verses[1].latin.endsWith("eruas me.")).toBe(true);
    expect(verses[1].latin.includes("Esto mihi")).toBe(false);
    expect(verses[2].latin.startsWith("Esto mihi in Deum protectorem")).toBe(true);
    expect(verses[2].english.startsWith("Be thou unto me a God")).toBe(true);
    // Gallican 7 joins the head of Gallican 8.
    expect(verses[6].latin.endsWith("supervacue ;")).toBe(true);
    expect(verses[7].latin.startsWith("ego autem in Domino speravi.")).toBe(true);
    expect(verses[7].latin.endsWith("in misericordia tua,")).toBe(true);
    expect(verses[7].english.startsWith("But I have hoped in the Lord:")).toBe(true);
    expect(verses[7].english.endsWith("in thy mercy.")).toBe(true);
    expect(verses[8].latin.startsWith("quoniam respexisti humilitatem meam")).toBe(true);
    // Gallican 11 splits after gemitibus.
    expect(verses[11].latin.endsWith("in gemitibus.")).toBe(true);
    expect(verses[12].latin.startsWith("Infirmata est in paupertate")).toBe(true);
    expect(verses[12].english.startsWith("My strength is weakened")).toBe(true);
    // Gallican 12–14 re-line the reproach and the snare.
    expect(verses[13].latin.endsWith("notis meis ;")).toBe(true);
    expect(verses[14].latin.startsWith("qui videbant me")).toBe(true);
    expect(verses[14].latin.endsWith("a corde ;")).toBe(true);
    expect(verses[14].english.endsWith("from the heart.")).toBe(true);
    expect(verses[15].latin.startsWith("factus sum tamquam vas perditum")).toBe(true);
    expect(verses[15].latin.endsWith("in circuitu.")).toBe(true);
    expect(verses[16].latin.startsWith("In eo dum convenirent")).toBe(true);
    // Gallican 15 joins the head of Gallican 16.
    expect(verses[17].latin.startsWith("Ego autem in te speravi")).toBe(true);
    expect(verses[17].latin.endsWith("sortes meae :")).toBe(true);
    expect(verses[17].english.endsWith("in thy hands.")).toBe(true);
    expect(verses[18].latin.startsWith("eripe me de manu")).toBe(true);
    // Gallican 17 joins the head of Gallican 18; the rest joins the head of 19.
    expect(verses[19].latin.startsWith("Illustra faciem tuam")).toBe(true);
    expect(verses[19].latin.endsWith("invocavi te.")).toBe(true);
    expect(verses[20].latin.startsWith("Erubescant impii")).toBe(true);
    expect(verses[20].latin.endsWith("labia dolosa,")).toBe(true);
    expect(verses[21].latin.startsWith("quae loquuntur adversus iustum")).toBe(true);
    expect(verses[21].english.startsWith("Which speak iniquity")).toBe(true);
    // Gallican 20, 21, and 23 each split once.
    expect(verses[22].latin.endsWith("timentibus te ;")).toBe(true);
    expect(verses[23].latin.startsWith("perfecisti eis")).toBe(true);
    expect(verses[24].latin.endsWith("hominum ;")).toBe(true);
    expect(verses[25].latin.startsWith("proteges eos in tabernaculo")).toBe(true);
    expect(verses[27].latin.endsWith("oculorum tuorum :")).toBe(true);
    expect(verses[28].latin.startsWith("ideo exaudisti vocem")).toBe(true);
    expect(verses[28].english.startsWith("Therefore thou hast heard")).toBe(true);
    expect(verses[30].latin.startsWith("Viriliter agite")).toBe(true);
    expect(verses[30].latin.endsWith("speratis in Domino.")).toBe(true);
  });

  test("Psalm 31 drops its title and splits Gallican verses 5, 6, and 9", () => {
    const verses = sliceVerses({ psalm: 31 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8",
      "9", "10", "11", "12", "13", "14",
    ]);
    expect(verses[0].latin.startsWith("Beati quorum remissae sunt iniquitates")).toBe(true);
    expect(verses[0].latin.includes("Ipsi David")).toBe(false);
    expect(verses[0].english.startsWith("Blessed are they")).toBe(true);
    // Gallican 5 splits after non abscondi.
    expect(verses[4].latin.endsWith("non abscondi.")).toBe(true);
    expect(verses[4].latin.includes("Dixi :")).toBe(false);
    expect(verses[5].latin.startsWith("Dixi :")).toBe(true);
    expect(verses[5].latin.endsWith("impietatem peccati mei.")).toBe(true);
    expect(verses[5].english.startsWith("I said I will confess")).toBe(true);
    // Gallican 6 splits after in tempore opportuno.
    expect(verses[6].latin.endsWith("in tempore opportuno.")).toBe(true);
    expect(verses[7].latin.startsWith("Verumtamen")).toBe(true);
    expect(verses[7].latin.endsWith("non approximabunt.")).toBe(true);
    expect(verses[7].english.startsWith("And yet")).toBe(true);
    // Gallican 9 splits after non est intellectus.
    expect(verses[10].latin.endsWith("non est intellectus.")).toBe(true);
    expect(verses[11].latin.startsWith("In camo et freno")).toBe(true);
    expect(verses[11].latin.endsWith("non approximant ad te.")).toBe(true);
    expect(verses[11].english.startsWith("With bit and bridle")).toBe(true);
    // verses 2, 3, 4, 7, 8, 10, 11 stay whole
    expect(verses[1].latin.startsWith("Beatus vir cui")).toBe(true);
    expect(verses[2].latin.startsWith("Quoniam tacui")).toBe(true);
    expect(verses[8].latin.startsWith("Tu es refugium meum")).toBe(true);
    expect(verses[9].latin.startsWith("Intellectum tibi dabo")).toBe(true);
    expect(verses[12].latin.startsWith("Multa flagella peccatoris")).toBe(true);
    expect(verses[13].latin.startsWith("Laetamini in Domino")).toBe(true);
    expect(verses[13].latin.endsWith("omnes recti corde.")).toBe(true);
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

  test("Psalm 139 is lined into its thirteen Thursday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 139 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
    ]);
    expect(verses[0].latin.startsWith("Eripe me, Domine")).toBe(true);
    expect(verses[0].latin.includes("In finem")).toBe(false);
    expect(verses[0].english.startsWith("Deliver me, O Lord")).toBe(true);
    expect(verses[0].english.includes("a psalm of David")).toBe(false);
    expect(verses[1].latin.startsWith("Qui cogitaverunt iniquitates in corde")).toBe(true);
    expect(verses[2].latin.startsWith("Acuerunt linguas suas")).toBe(true);
    expect(verses[9].latin.startsWith("Cadent super eos carbones")).toBe(true);
    expect(verses[12].latin.startsWith("Verumtamen iusti confitebuntur nomini tuo")).toBe(true);
    expect(verses[12].english.startsWith("But as for the just, they shall give glory to thy name")).toBe(true);
  });

  test("Psalm 140 is lined into its eleven Thursday Vespers office lines", () => {
    const verses = sliceVerses({ psalm: 140 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
    ]);
    expect(verses[0].latin.startsWith("Domine, clamavi ad te")).toBe(true);
    expect(verses[0].latin.includes("Psalmus David")).toBe(false);
    expect(verses[0].english.startsWith("I have cried to thee")).toBe(true);
    expect(verses[2].latin.startsWith("Pone, Domine, custodiam")).toBe(true);
    expect(verses[3].latin.endsWith("in peccatis ;")).toBe(true);
    expect(verses[3].english.endsWith("in sins.")).toBe(true);
    expect(verses[4].latin.startsWith("cum hominibus operantibus iniquitatem")).toBe(true);
    expect(verses[4].english.startsWith("With men that work iniquity")).toBe(true);
    expect(verses[5].latin.endsWith("caput meum.")).toBe(true);
    expect(verses[5].english.endsWith("fatten my head.")).toBe(true);
    expect(verses[6].latin.startsWith("Quoniam adhuc")).toBe(true);
    expect(verses[6].latin.endsWith("iudices eorum.")).toBe(true);
    expect(verses[7].latin.startsWith("Audient verba mea")).toBe(true);
    expect(verses[7].latin.endsWith("super terram,")).toBe(true);
    expect(verses[8].latin.startsWith("dissipata sunt ossa nostra secus infernum")).toBe(true);
    expect(verses[8].latin.endsWith("non auferas animam meam.")).toBe(true);
    expect(verses[9].latin.startsWith("Custodi me a laqueo")).toBe(true);
    expect(verses[10].latin.startsWith("Cadent in retiaculo eius peccatores")).toBe(true);
    expect(verses[10].english.startsWith("The wicked shall fall in his net")).toBe(true);
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

  test("Psalm 138 is lined into two Thursday Vespers halves", () => {
    const first = sliceVerses(hourSlots("thu", "vespers")[0].slices[0]);
    const second = sliceVerses(hourSlots("thu", "vespers")[1].slices[0]);
    // Psalmus 138 · 1: nine lines from Gallican 1–10 (1 joins 2).
    expect(first.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    // Psalmus 138 · 2: fourteen lines from Gallican 11–24.
    expect(second.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14",
    ]);
    expect(first[0].latin.startsWith("Domine, probasti me")).toBe(true);
    expect(first[0].latin.includes("In finem")).toBe(false);
    expect(first[0].latin.endsWith("tu cognovisti sessionem meam et resurrectionem meam.")).toBe(true);
    expect(first[0].english.startsWith("Lord, thou hast proved me")).toBe(true);
    expect(first[0].english.includes("a psalm of David")).toBe(false);
    expect(first[5].latin.startsWith("Quo ibo a spiritu tuo ?")).toBe(true);
    expect(first[6].latin.startsWith("Si ascendero in caelum, tu illic es ;")).toBe(true);
    expect(first[8].latin.startsWith("etenim illuc manus tua deducet me")).toBe(true);
    expect(second[0].latin.startsWith("Et dixi : Forsitan tenebrae")).toBe(true);
    expect(second[2].latin.startsWith("Quia tu possedisti renes meos")).toBe(true);
    expect(second[8].latin.startsWith("Si occideris, Deus, peccatores, viri sanguinum, declinate a me :")).toBe(true);
    expect(second[11].latin.startsWith("Perfecto odio oderam illos, et inimici facti sunt mihi.")).toBe(true);
    expect(second[13].latin.startsWith("Et vide si via iniquitatis in me est")).toBe(true);
  });

  test("Psalm 138 halves are labelled by part, not Gallican range", () => {
    expect(sliceLabel(hourSlots("thu", "vespers")[0].slices[0])).toBe("Psalmus 138 · 1");
    expect(sliceLabel(hourSlots("thu", "vespers")[1].slices[0])).toBe("Psalmus 138 · 2");
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

  test("Psalm 117 is lined out into twenty-nine Sunday Lauds lines", () => {
    const verses = sliceVerses(hourSlots("sun", "lauds")[2].slices[0]);
    expect(verses).toHaveLength(29);
    expect(verses[0].latin.startsWith("Confitemini Domino")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[17].latin.startsWith("Castigans castigavit")).toBe(true);
    expect(verses[18].latin.startsWith("Aperite mihi portas")).toBe(true);
    expect(verses[18].latin.endsWith("intrabunt in eam.")).toBe(true);
    expect(verses[19].latin.startsWith("Confitebor tibi quoniam exaudisti")).toBe(true);
    expect(verses[22].latin.startsWith("Haec est dies")).toBe(true);
    expect(verses[23].latin.startsWith("O Domine, salvum me fac")).toBe(true);
    expect(verses[23].latin.endsWith("nomine Domini :")).toBe(true);
    expect(verses[24].latin.startsWith("benediximus vobis")).toBe(true);
    expect(verses[24].latin.endsWith("illuxit nobis.")).toBe(true);
    expect(verses[25].latin.startsWith("Constituite diem solemnem")).toBe(true);
    expect(verses[25].latin.endsWith("cornu altaris.")).toBe(true);
    expect(verses[26].latin.endsWith("exaltabo te.")).toBe(true);
    expect(verses[27].latin.startsWith("Confitebor tibi quoniam exaudisti me")).toBe(true);
    expect(verses[28].latin.startsWith("Confitemini Domino, quoniam bonus")).toBe(true);
    expect(verses[23].english.endsWith("name of the Lord.")).toBe(true);
    expect(verses[24].english.startsWith("We have blessed you")).toBe(true);
    expect(verses[24].english.endsWith("shone upon us.")).toBe(true);
    expect(verses[26].english.endsWith("exalt thee.")).toBe(true);
    expect(verses[27].english.startsWith("I will praise thee, because thou hast heard me")).toBe(true);
  });

  test("Psalms 120 and 121 keep each Gallican verse after the title drop", () => {
    const oneTwenty = sliceVerses(hourSlots("tue", "terce")[1].slices[0]);
    const oneTwentyOne = sliceVerses(hourSlots("tue", "terce")[2].slices[0]);
    expect(oneTwenty).toHaveLength(8);
    expect(oneTwentyOne).toHaveLength(9);
    expect(oneTwenty[0].latin.startsWith("Levavi oculos meos")).toBe(true);
    expect(oneTwenty[0].latin.includes("Canticum graduum")).toBe(false);
    expect(oneTwenty[7].latin.startsWith("Dominus custodiat introitum")).toBe(true);
    expect(oneTwentyOne[0].latin.startsWith("Laetatus sum in his")).toBe(true);
    expect(oneTwentyOne[0].latin.includes("Canticum graduum")).toBe(false);
    expect(oneTwentyOne[8].latin.startsWith("Propter domum Domini")).toBe(true);
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

  test("Psalm 118 keeps each Hebrew letter in the section title and out of the verses", () => {
    const he = hourSlots("sun", "terce")[0].slices[0];
    expect(sliceLabel(he)).toBe("Psalmus 118 · He · 33–40");
    const verses = sliceVerses(he);
    expect(verses).toHaveLength(8);
    expect(verses[0].latin.startsWith("Legem pone mihi")).toBe(true);
    expect(verses[0].latin.includes("<He>")).toBe(false);
    expect(verses[7].latin.startsWith("Ecce concupivi")).toBe(true);
    expect(verses[7].english.endsWith("quicken me in thy justice.")).toBe(true);
    expect(verses[7].english.includes("VAU")).toBe(false);

    const aleph = sliceVerses(hourSlots("sun", "prime")[0].slices[0]);
    expect(aleph[0].latin.startsWith("Beati immaculati")).toBe(true);
    expect(aleph[0].latin.includes("Alleluia")).toBe(false);

    const daleth = hourSlots("sun", "prime")[3].slices[0];
    expect(sliceLabel(daleth)).toBe("Psalmus 118 · Daleth · 25–32");
    const before = sliceVerses(daleth);
    expect(before[7].english.endsWith("when thou didst enlarge my heart.")).toBe(true);
    expect(before[7].english.includes("HE")).toBe(false);
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

  test("Psalm 145 (146) is lined out into Kate's nine Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 145 });
    expect(verses.map((verse) => verse.n)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ]);
    expect(verses[0].latin.startsWith("Lauda, anima mea")).toBe(true);
    expect(verses[0].latin.endsWith("quamdiu fuero.")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[1].latin.startsWith("Nolite confidere")).toBe(true);
    expect(verses[1].latin.endsWith("in quibus non est salus.")).toBe(true);
    expect(verses[3].latin.startsWith("Beatus cuius Deus Iacob")).toBe(true);
    expect(verses[3].latin.endsWith("quae in eis sunt.")).toBe(true);
    expect(verses[4].latin.startsWith("Qui custodit veritatem")).toBe(true);
    expect(verses[4].latin.endsWith("dat escam esurientibus.")).toBe(true);
    expect(verses[5].latin.startsWith("Dominus solvit compeditos")).toBe(true);
    expect(verses[5].latin.endsWith("Dominus illuminat caecos.")).toBe(true);
    expect(verses[6].latin.startsWith("Dominus erigit elisos")).toBe(true);
    expect(verses[6].latin.endsWith("Dominus diligit iustos.")).toBe(true);
    expect(verses[7].latin.startsWith("Dominus custodit advenas")).toBe(true);
    expect(verses[8].latin.startsWith("Regnabit Dominus in saecula")).toBe(true);
    expect(verses[8].latin.endsWith("in generationem et generationem.")).toBe(true);
    expect(verses[8].english.endsWith("unto generation and generation.")).toBe(true);
  });

  test("Psalm 146 (147a) is lined out into its twelve Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 146 });
    expect(verses).toHaveLength(12);
    expect(verses[0].latin.startsWith("Laudate Dominum, quoniam bonus")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[0].latin.endsWith("decoraque laudatio.")).toBe(true);
    expect(verses[0].english.startsWith("Praise ye the Lord")).toBe(true);
    expect(verses[7].latin.startsWith("Qui operit caelum nubibus")).toBe(true);
    expect(verses[7].latin.endsWith("pluviam ;")).toBe(true);
    expect(verses[7].english.endsWith("prepareth rain for the earth.")).toBe(true);
    expect(verses[8].latin.startsWith("qui producit in montibus")).toBe(true);
    expect(verses[8].latin.endsWith("servituti hominum ;")).toBe(true);
    expect(verses[8].english.startsWith("Who maketh grass")).toBe(true);
    expect(verses[11].latin.startsWith("Beneplacitum est Domino")).toBe(true);
    expect(verses[11].latin.endsWith("super misericordia eius.")).toBe(true);
  });

  test("Psalm 147 is lined out into its nine Benedictine office lines", () => {
    const verses = sliceVerses({ psalm: 147 });
    expect(verses).toHaveLength(9);
    expect(verses[0].latin.startsWith("Lauda, Ierusalem, Dominum")).toBe(true);
    expect(verses[0].latin.includes("Alleluia")).toBe(false);
    expect(verses[0].english.startsWith("Praise the Lord, O Jerusalem")).toBe(true);
    expect(verses[8].latin.startsWith("Non fecit taliter omni nationi")).toBe(true);
    expect(verses[8].latin.endsWith("non manifestavit eis.")).toBe(true);
    expect(verses[8].latin.includes("Alleluia")).toBe(false);
    expect(verses[8].english.endsWith("made manifest to them.")).toBe(true);
    expect(verses[8].english.includes("Alleluia")).toBe(false);
  });
});
