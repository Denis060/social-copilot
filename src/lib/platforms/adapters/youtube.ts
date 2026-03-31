import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const youtubeAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      // YouTube community posts (text posts) via YouTube Data API v3
      // For video uploads, a resumable upload flow is needed
      const hasVideo = postData.mediaUrls.some((url) =>
        /\.(mp4|mov|webm|avi)$/i.test(url)
      );

      if (hasVideo) {
        // Step 1: Initialize resumable upload
        const metadata = {
          snippet: {
            title: postData.content.slice(0, 100),
            description: postData.content,
            categoryId: "22", // People & Blogs
          },
          status: {
            privacyStatus: "public",
          },
        };

        const initRes = await fetch(
          "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
          }
        );

        if (!initRes.ok) {
          const err = await initRes.json();
          return {
            success: false,
            error: err.error?.message || "YouTube upload init failed",
          };
        }

        const uploadUrl = initRes.headers.get("Location");
        if (!uploadUrl) {
          return { success: false, error: "No upload URL returned" };
        }

        // Step 2: Upload the video file
        const videoRes = await fetch(postData.mediaUrls[0]);
        const videoBlob = await videoRes.blob();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": videoBlob.type || "video/mp4",
          },
          body: videoBlob,
        });

        const video = await uploadRes.json();
        return {
          success: !!video.id,
          externalId: video.id,
          error: video.error?.message,
        };
      }

      // Text-only: create a community post via activities API
      // Note: Community posts API is limited; return a descriptive message
      return {
        success: false,
        error: "YouTube requires a video for posting. Community posts are not supported via API.",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "YouTube publish failed",
      };
    }
  },
};
