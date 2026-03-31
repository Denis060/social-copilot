import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const slackAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      // Get list of channels to find a default one
      const channelsRes = await fetch(
        "https://slack.com/api/conversations.list?types=public_channel&limit=10",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const channels = await channelsRes.json();
      const channel = channels.channels?.[0];

      if (!channel) {
        return { success: false, error: "No Slack channels found" };
      }

      const body: Record<string, unknown> = {
        channel: channel.id,
        text: postData.content,
      };

      if (postData.mediaUrls.length > 0) {
        body.blocks = [
          { type: "section", text: { type: "mrkdwn", text: postData.content } },
          {
            type: "image",
            image_url: postData.mediaUrls[0],
            alt_text: "Post media",
          },
        ];
      }

      const res = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.ok) {
        return { success: false, error: data.error || "Slack publish failed" };
      }

      return { success: true, externalId: data.ts };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Slack publish failed",
      };
    }
  },
};
