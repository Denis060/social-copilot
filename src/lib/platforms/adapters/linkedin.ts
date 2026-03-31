import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const linkedinAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      // Get the user's LinkedIn URN
      const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const me = await meRes.json();
      const personUrn = `urn:li:person:${me.sub}`;

      const ugcPost: Record<string, unknown> = {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: postData.content },
            shareMediaCategory: postData.mediaUrls.length > 0 ? "IMAGE" : "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(ugcPost),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.message || "LinkedIn publish failed",
        };
      }

      return { success: true, externalId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "LinkedIn publish failed",
      };
    }
  },
};
