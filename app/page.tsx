import { NavBar } from "@/components/navbar";
// import { AuroraBackground } from "@/components/backgrounds/background";
import { ProjectsSection } from "@/components/section/projects";
import { EducationSection } from "@/components/section/education";
import { ContactSection } from "@/components/section/contact";

export default function Home() {
  return (
    <>
      <div className="relative w-full min-h-screen">
        {/* <AuroraBackground /> */}
        <div className="relative z-50">
          <div className="px-10 sm:px-15 md:px-16 lg:px-24 xl:px-32 2xl:px-42">
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
