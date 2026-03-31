import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const discordAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      // Use webhook URL stored as the token for Discord
      // Discord OAuth gives webhook.incoming scope which provides a webhook URL
      const webhookUrl = token;

      const body: Record<string, unknown> = {
        content: postData.content,
      };

      if (postData.mediaUrls.length > 0) {
        body.embeds = [
          {
            image: { url: postData.mediaUrls[0] },
          },
        ];
      }

      const res = await fetch(`${webhookUrl}?wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.message || "Discord publish failed",
        };
      }

      return { success: true, externalId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Discord publish failed",
      };
    }
  },
};
