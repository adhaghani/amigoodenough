import { Separator } from "@/components/ui/separator";
import { landingContent } from "@/lib/landing-content";

export default function HomeFooter() {
  return (
    <footer className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Separator />
        <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{landingContent.brand}</p>
          <p>Built with Next.js, Tailwind, shadcn/ui, and OpenRouter.</p>
        </div>
      </div>
    </footer>
  );
}
