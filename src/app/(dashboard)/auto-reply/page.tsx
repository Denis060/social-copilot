import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AutoReplyClient } from "./AutoReplyClient";

export default async function AutoReplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "free";

  // Premium gate
  if (plan !== "premium") {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            AI Auto-Reply
          </h2>
          <p className="text-muted-foreground mt-1">
            Automatically respond to comments with AI-powered replies.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <svg
              className="size-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Premium Feature</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            AI Auto-Reply is available on the Premium plan. Upgrade to
            automatically respond to comments across all your platforms.
          </p>
          <a
            href="/dashboard/settings"
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upgrade to Premium
          </a>
        </div>
      </div>
    );
  }

  // Fetch rules
  const { data: rules } = await supabase
    .from("auto_reply_rules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch comment events
  const { data: commentEvents } = await supabase
    .from("comment_events")
    .select("*, posts(content), auto_reply_rules(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Auto-Reply</h2>
        <p className="text-muted-foreground mt-1">
          Manage auto-reply rules and view comment activity.
        </p>
      </div>

      <AutoReplyClient
        rules={rules || []}
        commentEvents={commentEvents || []}
      />
    </div>
  );
}
