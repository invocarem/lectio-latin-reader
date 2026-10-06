import type { ReactNode } from "react";

/**
 * Top-bar marks. Same stroke as the lectio arrows: 18×18 in a 24 view box,
 * currentColor, round caps, no emoji baseline.
 */

type MarkProps = {
  children: ReactNode;
};

function Mark({ children }: MarkProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Three equal rules: open or close the session list. */
export function SessionIcon() {
  return (
    <Mark>
      <path d="M5 7h14M5 12h14M5 17h14" />
    </Mark>
  );
}

/** A short heading rule over two lines: the chapter list. */
export function CapitaIcon() {
  return (
    <Mark>
      <path d="M5 7h8M5 12h14M5 17h14" />
    </Mark>
  );
}

/** A capital A: show or hide the English. */
export function EnglishIcon() {
  return (
    <Mark>
      <path d="M6.5 19 12 5l5.5 14M8.7 14h6.6" />
    </Mark>
  );
}

/** A framed plate: show or hide the facsimile. */
export function PlateIcon() {
  return (
    <Mark>
      <rect x="4.5" y="5" width="15" height="14" rx="1.5" />
      <circle cx="9" cy="9.5" r="1.15" />
      <path d="M4.5 16.2 9 12.4l3 2.6 3.2-2.8 4.3 4" />
    </Mark>
  );
}

/** Circle and four rays: the light theme. */
export function SunIcon() {
  return (
    <Mark>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20" />
    </Mark>
  );
}

/** A crescent: the dark theme. */
export function MoonIcon() {
  return (
    <Mark>
      <path d="M15.5 4.8a8 8 0 0 1 0 14.4" />
    </Mark>
  );
}
