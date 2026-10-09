import { BottomBlurOverlay } from "@/components/sections/bottom-blur-overlay";
import { GradientDivider } from "@/components/sections/gradient-divider";
import { GridLines } from "@/components/sections/grid-lines";
import { HeroSection } from "@/components/sections/hero-section";
import { NavigationDock } from "@/components/sections/navigation-dock";

export default function Home() {
  return (
    <>
      <GridLines />
      <main className="relative mx-auto w-full max-w-7xl px-6">
        <HeroSection />
        <GradientDivider />
      </main>
      <NavigationDock />
      <BottomBlurOverlay />
    </>
  );
}
