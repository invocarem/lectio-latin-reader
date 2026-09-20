import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** True when running inside a built mobile app (e.g. iOS), false in the browser. */
export function platformSupportsStudy(): boolean {
  return !isNative();
}

/** Theme the status bar to match the parchment chrome; no-op in the browser. */
export async function initNative(): Promise<void> {
  if (!isNative()) return;

  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#f3ead8" });
  } catch {
    /* plugin unavailable */
  }

  try {
    await SplashScreen.hide();
  } catch {
    /* plugin unavailable */
  }
}
