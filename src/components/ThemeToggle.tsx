import { useEffect, useState } from "react";
import {
  cycleTheme,
  resolveTheme,
  THEME_KEY,
  themeTooltip,
  type ThemePref,
} from "../theme";
import { MoonIcon, SunIcon } from "./icons";

function currentTheme(): ThemePref {
  if (
    typeof localStorage === "undefined" ||
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }
  const stored = localStorage.getItem(THEME_KEY);
  const osDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveTheme(stored, osDark);
}

/** Sun or moon, last in the switch row. */
export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>(currentTheme);

  useEffect(() => {
    const onChange = () => setPref(currentTheme());
    window.addEventListener("lectio:themechange", onChange);
    return () => window.removeEventListener("lectio:themechange", onChange);
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light and dark theme"
      title={themeTooltip(pref)}
      onClick={() => setPref(cycleTheme())}
    >
      {pref === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
