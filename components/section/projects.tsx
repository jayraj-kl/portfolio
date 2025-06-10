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
          className="text-heading text-balance text-xl font-bold leading-none tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6"
        >
          Projects
        </TextAnimate>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-2xl">
          Check out my latest work
        </h2>
        <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed py-3">
          I&apos;ve worked on a variety of projects, from simple websites to
          complex web applications. Here are a few of my favorites.
        </p>

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
