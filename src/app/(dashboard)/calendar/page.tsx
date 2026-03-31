import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all posts for this user
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, scheduled_at, status, media_urls")
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true });

  // Fetch post destinations to map platforms per post
  const postIds = (posts || []).map((p) => p.id);

  let destinationsMap: Record<string, string[]> = {};

  if (postIds.length > 0) {
    const { data: destinations } = await supabase
      .from("post_destinations")
      .select("post_id, account_id, social_accounts:account_id(platform)")
      .in("post_id", postIds);

    if (destinations) {
      for (const dest of destinations) {
        const platform =
          (dest.social_accounts as unknown as { platform: string })?.platform ||
          "unknown";
        if (!destinationsMap[dest.post_id]) {
          destinationsMap[dest.post_id] = [];
        }
        destinationsMap[dest.post_id].push(platform);
      }
    }
  }

  const postsWithPlatforms = (posts || []).map((post) => ({
    ...post,
    media_urls: (post.media_urls as string[]) || [],
    platforms: destinationsMap[post.id] || [],
  }));

  // Get connected platforms for filters
  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("platform")
    .eq("user_id", user.id);

  const connectedPlatforms = [
    ...new Set((accounts || []).map((a) => a.platform)),
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Calendar</h2>
        <p className="text-muted-foreground mt-1">
          View and manage your scheduled posts.
        </p>
      </div>

      <CalendarView
        posts={postsWithPlatforms}
        connectedPlatforms={connectedPlatforms}
      />
    </div>
  );
}
