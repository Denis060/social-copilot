import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const facebookAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      // Get user's pages
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`
      );
      const pages = await pagesRes.json();
      const page = pages.data?.[0];

      if (!page) {
        return { success: false, error: "No Facebook pages found" };
      }

      const pageId = page.id;
      const pageToken = page.access_token;

      const body: Record<string, string> = {
        message: postData.content,
        access_token: pageToken,
      };

      if (postData.mediaUrls.length > 0) {
        body.link = postData.mediaUrls[0];
      }

      const res = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error?.message || "Facebook publish failed",
        };
      }

      return { success: true, externalId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Facebook publish failed",
      };
    }
  },
};
