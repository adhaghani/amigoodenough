import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "@/lib/landing-content";

export default function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Built for fast resume iteration</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="min-h-52 border-border/70">
              <CardHeader>
                <feature.icon className="size-5 text-foreground" />
                <CardTitle className="pt-4 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
