// Shared by the server page and the client notch. Kept out of notch.tsx because exports of a
// "use client" module reach server components as client references, not values.

export type NotchSection = { id: string; label: string };

// The intro is the top of the page rather than a section element.
export const INTRO_ID = "intro";
