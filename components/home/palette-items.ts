// Shared by the server page (which builds the palette's items), the notch (which can open it) and
// the palette itself. Kept free of "use client" for the same reason as notch-sections.ts: a server
// component imports values from here, not client references.

import type { NotchSection } from "./notch-sections";

/** Something on the page the palette can jump to: a project card or a paper. */
export type PaletteTarget = {
  /** The element's id on the page. */
  id: string;
  label: string;
  /** Shown faintly on the right. */
  hint: string;
  /** Matched by the search but not shown. */
  keywords: string[];
};

export type PaletteData = {
  sections: NotchSection[];
  work: PaletteTarget[];
  papers: PaletteTarget[];
  email: string;
  cv: { label: string; href: string };
  socials: { label: string; href: string }[];
  /** The page's other content set, e.g. the research version of the site. */
  otherProfile: { label: string; href: string };
};

/** Asks the palette to open, from anything that isn't the keyboard shortcut (the notch's row). */
export const PALETTE_OPEN_EVENT = "home:palette-open";

/** Sent once the palette has opened, however it was opened, so the notch can fold away. */
export const PALETTE_OPENED_EVENT = "home:palette-opened";

export function openPalette() {
  window.dispatchEvent(new Event(PALETTE_OPEN_EVENT));
}

/** "⌘K" on Apple devices, "Ctrl K" elsewhere. Browser only. */
export function shortcutLabel() {
  return /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";
}
