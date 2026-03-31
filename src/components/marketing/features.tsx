import {
  PenBox,
  CalendarDays,
  Sparkles,
  MessageSquareReply,
  BarChart3,
  Shield,
  Globe,
  Zap,
  Image,
} from "lucide-react";

const FEATURES = [
  {
    icon: PenBox,
    title: "Post Composer",
    description:
      "Rich editor with multi-platform selection, character limits, and drag-and-drop media uploads via ImageKit.",
  },
  {
    icon: Sparkles,
    title: "AI Caption Magic",
    description:
      "Generate platform-optimized captions in seconds with Gemini AI. Pick your tone and let AI do the writing.",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    description:
      "Visual calendar with month, week, and day views. Drag-and-drop to reschedule posts instantly.",
  },
  {
    icon: MessageSquareReply,
    title: "AI Auto-Reply",
    description:
      "Set keyword-based rules and let AI handle your comment replies 24/7 with customizable tones.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track likes, reach, comments, and engagement rates across all platforms with beautiful charts.",
  },
  {
    icon: Globe,
    title: "9 Platforms",
    description:
      "Instagram, Twitter/X, LinkedIn, YouTube, TikTok, Facebook, Pinterest, Discord, and Slack.",
  },
  {
    icon: Image,
    title: "Media Management",
    description:
      "Upload images and videos with AI transformations. Supports drag-and-drop and bulk uploads.",
  },
  {
    icon: Shield,
    title: "Token Encryption",
    description:
      "AES-256-GCM encryption for all OAuth tokens. Your social accounts are always secure.",
  },
  {
    icon: Zap,
    title: "Background Jobs",
    description:
      "Precise scheduling with Inngest. Posts publish exactly when you set them — never late.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t bg-muted/30 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Everything You Need to Win Social
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            A complete toolkit for creators, agencies, and teams who want to
            manage social media smarter — not harder.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${i * 80}ms`, animationDuration: "500ms" }}
              >
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
