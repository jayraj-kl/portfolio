import { FloatingDock } from "@/components/ui/floating-dock";
import { links } from "@/lib/constants";

export function NavigationDock() {
  return (
    <nav className="fixed left-1/2 -translate-x-1/2 top-[75%] z-50">
      <FloatingDock items={links} />
    </nav>
  );
}
