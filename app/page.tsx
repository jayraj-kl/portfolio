import { NavbarDemo } from "@/components/navbar";
import { DummyContent } from "@/components/dummy-content";
import Background from "@/components/backgrounds/background";

export default function Home() {
  return (
    <>
      <div className="relative w-full h-screen">
        <Background />
        <div className="relative z-50">
          <NavbarDemo />
          <DummyContent />
        </div>
      </div>
    </>
  );
}
