export type ThemePref = "light" | "dark";

export const THEME_KEY = "lectio.theme";

/** Status-bar and browser chrome, matching the parchment and night paper. */
export const THEME_CHROME: Record<ThemePref, string> = {
  light: "#f3ead8",
  dark: "#16110a",
};

/** Saved choice wins. With nothing saved, follow the operating system. */
export function resolveTheme(stored: string | null, osDark: boolean): ThemePref {
  if (stored === "light" || stored === "dark") return stored;
  return osDark ? "dark" : "light";
}

/** True until the user has chosen a theme of their own. */
export function themeFollowsOs(stored: string | null): boolean {
  return stored !== "light" && stored !== "dark";
}

export function nextTheme(current: ThemePref): ThemePref {
  return current === "dark" ? "light" : "dark";
}

export function themeTooltip(pref: ThemePref): string {
  return pref === "dark"
    ? "Dark theme. Click for light."
    : "Light theme. Click for dark.";
}

export function chromeColor(pref: ThemePref): string {
  return THEME_CHROME[pref];
}

function osDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Stamp the resolved theme on <html data-theme>. CSS keys the night
 * palette off that attribute.
 */
export function applyTheme(): ThemePref {
  const pref = resolveTheme(localStorage.getItem(THEME_KEY), osDark());
  document.documentElement.setAttribute("data-theme", pref);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", chromeColor(pref));
  window.dispatchEvent(new CustomEvent("lectio:themechange"));
  return pref;
}

export function setThemePref(pref: ThemePref): void {
  localStorage.setItem(THEME_KEY, pref);
  applyTheme();
}

/** Flip light and dark, returning the new preference. */
export function cycleTheme(): ThemePref {
  const next = nextTheme(resolveTheme(localStorage.getItem(THEME_KEY), osDark()));
  setThemePref(next);
  return next;
}

/** Keep a first visit in step with the OS. A saved choice stays put. */
export function watchOsTheme(): void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", () => {
    if (themeFollowsOs(localStorage.getItem(THEME_KEY))) applyTheme();
  });
}
