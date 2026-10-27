import "./gre.css";

// A private tool: nothing under /gre is linked from the site. Each page sets
// its own noindex so a signed-out 404 here matches any other 404.
export default function GreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
