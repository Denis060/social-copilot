import Link from "next/link";
import { Zap } from "lucide-react";

export function CTASection() {
  return (
    <section className="border-t bg-muted/30 px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
          <Zap className="size-6 fill-primary text-primary" />
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          Ready to Take Control of Your Social Media?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
          Join thousands of creators and teams using Social-Copilot to save
          time, grow their audience, and stay consistent across every platform.
        </p>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90"
        >
          Get Started Free
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          No credit card required. Upgrade anytime.
        </p>
      </div>
    </section>
  );
}
