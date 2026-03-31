import { UserPlus, Link2, PenBox, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account in seconds with email or social login.",
  },
  {
    icon: Link2,
    title: "Connect Accounts",
    description: "Link your Instagram, Twitter, LinkedIn, YouTube, and more via OAuth.",
  },
  {
    icon: PenBox,
    title: "Create & Schedule",
    description: "Compose posts with AI captions, upload media, and pick your schedule.",
  },
  {
    icon: Rocket,
    title: "Publish & Grow",
    description: "Posts go live on time. AI replies to comments. You watch the analytics.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            From sign-up to published post in under 5 minutes.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative text-center animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${i * 120}ms`, animationDuration: "500ms" }}
              >
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Step {i + 1}
                </div>
                <h3 className="mb-1.5 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
