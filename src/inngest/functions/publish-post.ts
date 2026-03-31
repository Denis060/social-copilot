import { inngest } from "@/inngest/client";
import { getServiceClient } from "@/lib/supabase/service";
import { decrypt } from "@/lib/encryption";
import { platformAdapters } from "@/lib/platforms/adapters";
import { refreshTokenIfNeeded } from "@/lib/platforms/token-refresh";

export const publishPost = inngest.createFunction(
  {
    id: "publish-post",
    retries: 2,
    triggers: [{ event: "post/schedule" }],
  },
  async ({ event, step }) => {
    const supabase = getServiceClient();
    const { postId, scheduledAt } = event.data as { postId: string; scheduledAt: string };

    // Step 1: Wait until the scheduled time
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate.getTime() > Date.now()) {
        await step.sleepUntil("wait-until-scheduled", scheduledDate);
      }
    }

    // Step 2: Fetch post and destinations
    const { post, destinations } = await step.run(
      "fetch-post-data",
      async () => {
        const { data: post } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (!post) throw new Error(`Post ${postId} not found`);

        const { data: destinations } = await supabase
          .from("post_destinations")
          .select("*, social_accounts(*)")
          .eq("post_id", postId);

        return { post, destinations: destinations || [] };
      }
    );

    if (destinations.length === 0) {
      await step.run("mark-failed-no-destinations", async () => {
        await supabase
          .from("posts")
          .update({ status: "failed" })
          .eq("id", postId);
      });
      return { status: "failed", reason: "No destinations" };
    }

    // Step 2: Publish to each platform
    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const dest of destinations) {
      const account = dest.social_accounts as {
        id: string;
        platform: string;
        access_token_encrypted: string;
        refresh_token_encrypted: string | null;
        token_expires_at?: string | null;
      };

      if (!account) continue;

      const result = await step.run(
        `publish-to-${account.platform}-${dest.id}`,
        async () => {
          const adapter = platformAdapters[account.platform];
          if (!adapter) {
            return { success: false, error: `No adapter for ${account.platform}` };
          }

          // Refresh token if needed
          const currentTokenEnc = await refreshTokenIfNeeded(
            account.id,
            account.platform,
            account.access_token_encrypted,
            account.refresh_token_encrypted,
            account.token_expires_at || null
          );

          const token = decrypt(currentTokenEnc);

          const publishResult = await adapter.publish(token, {
            content: post.content,
            mediaUrls: (post.media_urls as string[]) || [],
          });

          // Update destination status
          await supabase
            .from("post_destinations")
            .update({
              status: publishResult.success ? "published" : "failed",
              external_id: publishResult.externalId || null,
            })
            .eq("id", dest.id);

          return publishResult;
        }
      );

      results[account.platform] = result;
    }

    // Step 3: Update overall post status
    await step.run("update-post-status", async () => {
      const allResults = Object.values(results);
      const anySuccess = allResults.some((r) => r.success);
      const allFailed = allResults.every((r) => !r.success);

      const status = allFailed ? "failed" : anySuccess ? "published" : "failed";

      await supabase
        .from("posts")
        .update({ status })
        .eq("id", postId);
    });

    // Step 4: Trigger analytics fetch
    await step.sendEvent("trigger-analytics", {
      name: "analytics/fetch",
      data: { postId },
    });

    return { status: "completed", results };
  }
);
