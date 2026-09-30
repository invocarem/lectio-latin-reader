import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Shortest CSS side, in points. iPad mini is 744; no iPhone exceeds about 440,
 * including landscape. Physical pixels are the wrong unit: a 3× phone can
 * outscore a 2× iPad.
 */
export const STUDY_MIN_SHORT_SIDE = 700;

/** Browser always. On a device, only when the screen is iPad-sized. */
export function screenSupportsStudy(native: boolean, shortSide: number): boolean {
  if (!native) return true;
  return shortSide >= STUDY_MIN_SHORT_SIDE;
}

/** Study and plates on desktop and iPad. Lectio only on iPhone. */
export function platformSupportsStudy(): boolean {
  const shortSide = Math.min(screen.width, screen.height);
  return screenSupportsStudy(isNative(), shortSide);
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
