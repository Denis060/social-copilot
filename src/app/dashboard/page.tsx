import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Button } from "@/components/ui/button";
import { PenBox } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has any posts
  const { count: postCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get connected platforms for filters
  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("platform")
    .eq("user_id", user.id);

  const connectedPlatforms = [
    ...new Set((accounts || []).map((a) => a.platform)),
  ];

  // Empty state
  if (!postCount || postCount === 0) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Your analytics overview.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <PenBox className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No posts yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first post to start seeing analytics and engagement
            metrics across your platforms.
          </p>
          <Link href="/composer" className="mt-4">
            <Button>
              <PenBox className="mr-2 size-4" />
              Create Your First Post
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Your analytics overview.
        </p>
      </div>

      <DashboardClient connectedPlatforms={connectedPlatforms} />
    </div>
  );
}
