import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { steps } from "@/lib/landing-content";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A straightforward 3-step flow designed for fast decisions before you apply.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-border/70 bg-card/80">
              <CardHeader>
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-background text-foreground">
                  <step.icon className="size-4" />
                </div>
                <CardDescription className="font-mono text-xs tracking-widest uppercase">
                  Step {index + 1}
                </CardDescription>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
