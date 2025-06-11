import "./globals.css";
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jayraj Ladkat - Developer Portfolio",
  keywords: [
    "Jayraj Ladkat",
    "Jayraj K. Ladkat",
    "Jayraj",
    "Ladkat",
    "Portfolio",
  ],
  authors: [
    {
      name: "Jayraj K. Ladkat",
      url: "https://jayrajladkat.com",
    },
    {
      name: "Jayraj Ladkat",
      url: "https://jayrajladkat.com",
    },
  ],
  creator: "Jayraj K. Ladkat",
  description: "Jayraj K. Ladkat's Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
