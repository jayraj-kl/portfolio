import { NavBar } from "@/components/navbar";
import { AuroraBackground } from "@/components/backgrounds/background";
import { ProjectsSection } from "@/components/section/projects";
import { EducationSection } from "@/components/section/education";
import { ContactSection } from "@/components/section/contact";

export default function Home() {
  return (
    <>
      <div className="relative w-full min-h-screen">
        <AuroraBackground />
        <div className="relative z-50">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
            <NavBar />
            <ProjectsSection />
            <EducationSection />
            <ContactSection />
          </div>
        </div>
      </div>
    </>
  );
}
