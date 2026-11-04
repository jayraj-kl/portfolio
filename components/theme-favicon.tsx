"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const ICONS = {
  light: "/icons/star-light.png",
  dark: "/icons/star-dark.png",
};

// Points the tab icon at the site's own theme, so it switches with the toggle.
// Before this runs, the icon tags in the root layout's metadata follow the browser's mode.
export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    const href = ICONS[resolvedTheme];
    // Covers "icon" and "shortcut icon", not "apple-touch-icon".
    for (const link of document.querySelectorAll<HTMLLinkElement>(
      'link[rel~="icon"]',
    )) {
      link.removeAttribute("media");
      link.type = "image/png";
      if (link.getAttribute("href") !== href) link.href = href;
    }
  }, [resolvedTheme]);

  return null;
}
