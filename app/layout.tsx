import type { Metadata } from "next";
import "./globals.css";
import { display, mono, sans } from "./fonts";
import { GyroscopeCursor } from "@/components/ui/gyroscope-cursor";
import { ThemeFavicon } from "@/components/theme-favicon";
import { ThemeProvider } from "@/components/theme-provider";
import { DEFAULT_THEME, METADATA, WEBSITE_URL } from "@/lib/constants";
import { PROFILES, getContent } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(WEBSITE_URL),
  title: { default: METADATA.title, template: `%s | ${METADATA.title}` },
  description: getContent().content.meta.description,
  openGraph: {
    type: "website",
    siteName: METADATA.title,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  // Until the page loads, the tab icon follows the browser's light or dark mode; then ThemeFavicon
  // switches it with the site's theme. Browsers that ignore both get /favicon.ico, white stars on black.
  icons: {
    icon: [
      {
        url: "/icons/star-light.png",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/star-dark.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/icons/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_THEME}
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ThemeFavicon />
          <GyroscopeCursor
            scopedPaths={{
              "/learn": "[data-arrow-cursor]",
              // The home page, under either profile, keeps the native cursor.
              "/": "[data-arrow-cursor]",
              ...Object.fromEntries(
                PROFILES.map((p) => [`/${p}`, "[data-arrow-cursor]"]),
              ),
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
