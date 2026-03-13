import { ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { landingContent } from "@/lib/landing-content";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-24">
      <div className="absolute inset-0 -z-10" aria-hidden="true" />
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-5 rounded-full px-4 py-1 text-xs tracking-[0.14em] uppercase">
          {landingContent.eyebrow}
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          {landingContent.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          {landingContent.description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="#resume-checker">{landingContent.primaryCta}</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="#how-it-works">
              {landingContent.secondaryCta}
              <ArrowDownRight className="ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
