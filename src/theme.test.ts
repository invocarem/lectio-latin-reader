import {
  chromeColor,
  nextTheme,
  resolveTheme,
  themeFollowsOs,
  themeTooltip,
} from "./theme";

describe("resolveTheme", () => {
  test("a saved choice wins over the operating system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  test("the first visit follows the operating system", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
    expect(resolveTheme("system", true)).toBe("dark");
  });
});

describe("themeFollowsOs", () => {
  test("only an explicit light or dark choice stops following the OS", () => {
    expect(themeFollowsOs(null)).toBe(true);
    expect(themeFollowsOs("nope")).toBe(true);
    expect(themeFollowsOs("light")).toBe(false);
    expect(themeFollowsOs("dark")).toBe(false);
  });
});

describe("nextTheme", () => {
  test("flips between light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});

describe("theme chrome", () => {
  test("tooltips and chrome colors match the active theme", () => {
    expect(themeTooltip("dark")).toMatch(/Click for light/);
    expect(themeTooltip("light")).toMatch(/Click for dark/);
    expect(chromeColor("light")).toBe("#f3ead8");
    expect(chromeColor("dark")).toBe("#16110a");
  });
});
