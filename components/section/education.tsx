import { DATA } from "@/data/resume";
import BlurFade from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { MagnetLinesBackground } from "../backgrounds/background";
import { EducationCard } from "@/components/education-card";

const BLUR_FADE_DELAY = 0.04;

export function EducationSection() {
  return (
    <>
      <section id="education" className="py-4 sm:py-6 md:py-8">
        <div className="flex min-h-0 flex-col gap-y-3">
          {" "}
          <TextAnimate
            animation="slideLeft"
            by="character"
            className="text-heading text-balance text-xl font-bold leading-none tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4"
          >
            Education
          </TextAnimate>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-5 flex flex-col gap-y-2 sm:gap-y-3 h-full">
              {DATA.education.map((education, id) => (
                <BlurFade
                  key={education.school}
                  delay={BLUR_FADE_DELAY * 8 + id * 0.05}
                >
                  <EducationCard
                    key={education.school}
                    href={education.href}
                    logoUrl={education.logoUrl}
                    altText={education.school}
                    title={education.school}
                    subtitle={education.degree}
                    period={`${education.start} - ${education.end}`}
                  />
                </BlurFade>
              ))}{" "}
            </div>
            <div className="hidden lg:flex lg:col-span-5 h-full items-stretch">
              <div className="w-full">
                <MagnetLinesBackground />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
