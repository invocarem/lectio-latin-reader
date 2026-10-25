import { parseTextLang, showsEnglish, showsLatin } from "./textLang";

describe("parseTextLang", () => {
  test("keeps a saved reading language", () => {
    expect(parseTextLang("latin")).toBe("latin");
    expect(parseTextLang("both")).toBe("both");
    expect(parseTextLang("english")).toBe("english");
  });

  test("opens on Latin and English together", () => {
    expect(parseTextLang(null)).toBe("both");
    expect(parseTextLang("")).toBe("both");
    expect(parseTextLang("en")).toBe("both");
  });
});

describe("showsLatin and showsEnglish", () => {
  test("latin hides the translation", () => {
    expect(showsLatin("latin")).toBe(true);
    expect(showsEnglish("latin")).toBe(false);
  });

  test("both shows the two languages", () => {
    expect(showsLatin("both")).toBe(true);
    expect(showsEnglish("both")).toBe(true);
  });

  test("english hides the Latin", () => {
    expect(showsLatin("english")).toBe(false);
    expect(showsEnglish("english")).toBe(true);
  });
});
