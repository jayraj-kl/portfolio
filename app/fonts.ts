import { Fragment_Mono, Funnel_Display, Funnel_Sans } from "next/font/google";

// The site's type, set on <html>: Funnel Display for names, Funnel Sans for text, Fragment Mono for data.
export const display = Funnel_Display({ subsets: ["latin"], variable: "--home-display", display: "swap" });
export const sans = Funnel_Sans({ subsets: ["latin"], variable: "--home-sans", display: "swap" });
// latin-ext carries the IPA letters of the pronunciation line.
export const mono = Fragment_Mono({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--home-mono",
  display: "swap",
});
