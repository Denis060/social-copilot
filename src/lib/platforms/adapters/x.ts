import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const xAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: postData.content }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.detail || data.title || "Twitter/X publish failed",
        };
      }

      return { success: true, externalId: data.data?.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Twitter/X publish failed",
      };
    }
  },
};
