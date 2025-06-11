import { NavBar } from "@/components/navbar";
import {
  AuroraBackground,
  ParticlesBackground,
} from "@/components/backgrounds/background";
import { ProjectsSection } from "@/components/section/projects";
import { EducationSection } from "@/components/section/education";
import { ContactSection } from "@/components/section/contact";
import { ExperienceSection } from "@/components/section/experience";
import { AboutSection } from "@/components/section/about";

export default function Home() {
  return (
    <>
      {/* Fixed navbar at the top */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <div className="px-10 sm:px-15 md:px-20 lg:px-24 xl:px-32 2xl:px-42 py-8">
          <NavBar />
        </div>
      </div>

      {/* Aurora background section - till Experience section */}
      <div className="relative w-full top-0">
        <div className="absolute inset-0 z-0 hidden dark:block">
          <AuroraBackground />
        </div>
        <div className="relative z-10">
          <div className="px-10 sm:px-15 md:px-20 lg:px-24 xl:px-32 2xl:px-42 pt-20">
            <div className="mt-16" />
            <AboutSection />
            <ExperienceSection />
          </div>
        </div>
      </div>

      {/* Projects and Education sections with Particles background */}
      <div className="relative w-full">
        <ParticlesBackground />
        <div className="relative z-50">
          <div className="px-10 sm:px-15 md:px-20 lg:px-24 xl:px-32 2xl:px-42">
            <ProjectsSection />
            <EducationSection />
          </div>
        </div>
      </div>

      {/* Contact section without background */}
      <div className="relative w-full">
        <div className="relative z-50">
          <div className="px-10 sm:px-15 md:px-20 lg:px-24 xl:px-32 2xl:px-42">
            <ContactSection />
          </div>
        </div>
      </div>
    </>
  );
}
