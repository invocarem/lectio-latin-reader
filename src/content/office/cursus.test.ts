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

  test("Psalm 13 drops its title", () => {
    expect(sliceVerses({ psalm: 13 })[0].latin.startsWith("Dixit insipiens")).toBe(true);
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

  test("Psalm 4 drops the title verse and splits Gallican verse 2", () => {
    const verses = sliceVerses({ psalm: 4 });
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
