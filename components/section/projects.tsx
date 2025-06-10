import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";
import BlurFade from "@/components/ui/blur-fade";
import { TextAnimate } from "../ui/text-animate";

const BLUR_FADE_DELAY = 0.04;

export function ProjectsSection() {
  return (
    <>
      <section className="py-4 sm:py-6 md:py-8">
        <TextAnimate
          animation="slideLeft"
          by="character"
          className="text-balance text-xl font-semibold leading-none tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6"
        >
          Projects
        </TextAnimate>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DATA.projects.map((project, id) => (
            <BlurFade
              key={project.title}
              delay={BLUR_FADE_DELAY * 12 + id * 0.05}
            >
              <ProjectCard
                href={project.href}
                key={project.title}
                title={project.title}
                description={project.description}
                tags={project.technologies}
                image={project.image}
                video={project.video}
                links={project.links}
              />
            </BlurFade>
          ))}
        </div>
      </section>
    </>
  );
}
