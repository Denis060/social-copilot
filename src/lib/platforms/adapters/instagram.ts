import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const instagramAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      // Step 1: Get Instagram Business Account ID
      const meRes = await fetch(
        `https://graph.instagram.com/v19.0/me?fields=id&access_token=${token}`
      );
      const me = await meRes.json();
      if (!me.id) throw new Error("Failed to get Instagram account ID");

      const igUserId = me.id;

      // Step 2: Create media container
      const containerParams: Record<string, string> = {
        caption: postData.content,
        access_token: token,
      };

      if (postData.mediaUrls.length > 0) {
        containerParams.image_url = postData.mediaUrls[0];
      }

      const containerRes = await fetch(
        `https://graph.instagram.com/v19.0/${igUserId}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(containerParams),
        }
      );
      const container = await containerRes.json();
      if (!container.id) throw new Error(container.error?.message || "Failed to create media container");

      // Step 3: Publish the container
      const publishRes = await fetch(
        `https://graph.instagram.com/v19.0/${igUserId}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: container.id,
            access_token: token,
          }),
        }
      );
      const published = await publishRes.json();

      return {
        success: !!published.id,
        externalId: published.id,
        error: published.error?.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Instagram publish failed",
      };
    }
  },
};
