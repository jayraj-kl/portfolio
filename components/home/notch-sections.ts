// Shared by the server page and the client notch. Kept out of notch.tsx because exports of a
// "use client" module reach server components as client references, not values.

export type NotchSection = { id: string; label: string };

// The intro is the top of the page rather than a section element.
export const INTRO_ID = "intro";

// Brief status the notch shows in place of the section name, like a Live Activity on an island:
// anything on the page can report a finished action ("Email copied") without a toast of its own.
export const NOTCH_STATUS_EVENT = "home:notch-status";

// How long a status holds the notch before it gives the section name back. Whatever reported it
// holds its own confirmation for the same time, so the two revert together.
export const STATUS_HOLD_MS = 2200;

export function notchStatus(text: string) {
  window.dispatchEvent(new CustomEvent<string>(NOTCH_STATUS_EVENT, { detail: text }));
}
