import { GithubGraph } from "@/components/github-graph";
import { TechStack } from "@/components/tech-stack";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export function HeroSection() {
  return (
    <section>
      <div>
        <GithubGraph />
        <TechStack />
        <div className="h-160 flex items-center justify-center">
          <TextHoverEffect text="JAYRAJ" />
        </div>
      </div>
    </section>
  );
}
