import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    text: "Social-Copilot replaced 3 tools for me. The AI captions alone save me hours every week, and the auto-reply keeps my audience engaged even when I'm asleep.",
    initials: "SC",
  },
  {
    name: "Marcus Rodriguez",
    role: "Agency Owner",
    text: "We manage 20+ clients. The multi-platform scheduler and analytics dashboard give us a single pane of glass. Our team efficiency doubled.",
    initials: "MR",
  },
  {
    name: "Priya Patel",
    role: "E-Commerce Founder",
    text: "The drag-and-drop calendar is a game changer. I plan a whole month of content in one sitting, and the AI writes captions that actually convert.",
    initials: "PP",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Loved by Creators & Teams
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            See what our users have to say about Social-Copilot.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="rounded-xl border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${i * 100}ms`, animationDuration: "500ms" }}
            >
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
