import type { Metadata } from "next";
import "./globals.css";
import { display, mono, sans } from "./fonts";
import { GyroscopeCursor } from "@/components/ui/gyroscope-cursor";
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
