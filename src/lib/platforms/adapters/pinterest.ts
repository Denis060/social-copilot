import type { PlatformAdapter, PostData, PublishResult } from "./types";

export const pinterestAdapter: PlatformAdapter = {
  async publish(token: string, postData: PostData): Promise<PublishResult> {
    try {
      // Get user's boards
      const boardsRes = await fetch(
        "https://api.pinterest.com/v5/boards",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const boards = await boardsRes.json();
      const board = boards.items?.[0];

      if (!board) {
        return { success: false, error: "No Pinterest boards found" };
      }

      const pinBody: Record<string, unknown> = {
        board_id: board.id,
        title: postData.content.slice(0, 100),
        description: postData.content,
      };

      if (postData.mediaUrls.length > 0) {
        pinBody.media_source = {
          source_type: "image_url",
          url: postData.mediaUrls[0],
        };
      }

      const res = await fetch("https://api.pinterest.com/v5/pins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pinBody),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.message || "Pinterest publish failed",
        };
      }

      return { success: true, externalId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Pinterest publish failed",
      };
    }
  },
};
