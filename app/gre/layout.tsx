import "./gre.css";

// A private tool: nothing under /gre is linked from the site, and the page
// sets its own noindex.
export default function GreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
