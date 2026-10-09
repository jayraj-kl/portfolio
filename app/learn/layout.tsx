import { JetBrains_Mono } from "next/font/google";
import "./learn.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={jetbrainsMono.variable}>{children}</div>;
}
