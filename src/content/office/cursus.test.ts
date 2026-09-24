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

  test("Songs of Ascents 120–133 drop the Canticum graduum title", () => {
    expect(sliceVerses({ psalm: 120 })[0].latin.startsWith("Levavi oculos")).toBe(true);
    expect(sliceVerses({ psalm: 126 })[0].latin.startsWith("Nisi Dominus")).toBe(true);
    expect(sliceVerses({ psalm: 130 })[0].latin.startsWith("Domine, non est")).toBe(true);
    expect(sliceVerses({ psalm: 132 })[0].latin.startsWith("Ecce quam bonum")).toBe(true);
    expect(sliceVerses({ psalm: 133 })[0].latin.includes("Canticum graduum")).toBe(false);
    expect(sliceVerses({ psalm: 120 })[1].n).toBe("2");
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
