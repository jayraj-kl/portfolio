import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { TECH_STACK } from "@/lib/constants";

// TODO: correct the icons for dark mode similar to https://miyoko-portfolio.vercel.app/ and start adding motion.
export function TechStack() {
  return (
    <section className="overflow-hidden py-16">
      <div className="group relative m-auto max-w-7xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm">Tech Stack</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
              {TECH_STACK.flatMap((category) =>
                category.skills.map((skill) => (
                  <div className="flex" key={skill.slug}>
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src={`https://cdn.simpleicons.org/${skill.slug}`}
                      alt={`${skill.name}`}
                      loading="lazy"
                    />
                  </div>
                )),
              )}
            </InfiniteSlider>

            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-20"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-20"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
