import Link from "next/link";
import { Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
          <Zap className="size-3.5 fill-primary text-primary" />
          AI-Powered Social Media Management
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          One Dashboard.
          <br />
          <span className="text-primary">Nine Platforms.</span>
          <br />
          Zero Hassle.
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Schedule posts, generate AI captions, auto-reply to comments, and
          track performance across Instagram, Twitter, LinkedIn, YouTube, and
          more — all from a single copilot.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-medium transition-transform hover:scale-105 hover:bg-muted"
          >
            See Features
          </a>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Free plan includes 1 account &amp; 10 posts/month. No credit card required.
        </p>
      </div>
    </section>
  );
}
