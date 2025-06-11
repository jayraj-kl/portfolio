import BlurFade from "@/components/ui/blur-fade";
import BlurFadeText from "@/components/ui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import { TextAnimate } from "@/components/ui/text-animate";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

export function AboutSection() {
  return (
    <>
      <section id="hero">
        {" "}
        <div className="mx-auto w-full max-w-7xl space-y-8 px-2 xl:px-3">
          <div className="gap-1 flex justify-between items-start">
            {" "}
            <div className="flex-col flex flex-1 space-y-1.5">
              {" "}
              <div className="flex items-baseline gap-2 flex-wrap">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className="text-xl font-bold tracking-tighter sm:text-2xl xl:text-3xl/none"
                  yOffset={8}
                  text={`Hi, I'm ${DATA.name.split(" ")[0]}`}
                />
                <div className="-translate-y-3">
                  <ContainerTextFlip
                    className="text-sm sm:text-base xl:text-lg font-medium"
                    words={["Software Engineer", "Full stack Web Developer"]}
                  />
                </div>
              </div>
              <BlurFadeText
                className="max-w-[600px] md:text-lg"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
            </div>{" "}
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className="size-50 border">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>
      <section id="about" className="py-4 sm:py-6 md:py-8">
        <div className="mx-auto w-full max-w-7xl px-2 xl:px-3">
          {" "}
          <TextAnimate
            animation="slideLeft"
            by="character"
            className="text-heading text-balance text-xl font-bold leading-none tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4"
          >
            About
          </TextAnimate>
          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            {" "}
            <div className="prose max-w-full text-pretty font-sans text-base text-muted-foreground dark:prose-invert">
              <Markdown>{DATA.summary}</Markdown>
            </div>
          </BlurFade>
        </div>
      </section>
    </>
  );
}
