import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const tiktokAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      if (postData.mediaUrls.length === 0) {
        return { success: false, error: "TikTok requires a video to post" };
      }

      // Step 1: Initialize video upload
      const initRes = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_info: {
              title: postData.content.slice(0, 150),
              privacy_level: "PUBLIC_TO_EVERYONE",
            },
            source_info: {
              source: "PULL_FROM_URL",
              video_url: postData.mediaUrls[0],
            },
          }),
        }
      );

      const initData = await initRes.json();

      if (initData.error?.code) {
        return {
          success: false,
          error: initData.error.message || "TikTok upload init failed",
        };
      }

      return {
        success: true,
        externalId: initData.data?.publish_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "TikTok publish failed",
      };
    }
  },
};
