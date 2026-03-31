import type { PlatformAdapter } from "./types";
import { instagramAdapter } from "./instagram";
import { xAdapter } from "./x";
import { linkedinAdapter } from "./linkedin";
import { facebookAdapter } from "./facebook";
import { youtubeAdapter } from "./youtube";
import { tiktokAdapter } from "./tiktok";
import { pinterestAdapter } from "./pinterest";
import { discordAdapter } from "./discord";
import { slackAdapter } from "./slack";

export const platformAdapters: Record<string, PlatformAdapter> = {
  instagram: instagramAdapter,
  x: xAdapter,
  linkedin: linkedinAdapter,
  facebook: facebookAdapter,
  youtube: youtubeAdapter,
  tiktok: tiktokAdapter,
  pinterest: pinterestAdapter,
  discord: discordAdapter,
  slack: slackAdapter,
};

export type { PlatformAdapter, PostData, PublishResult } from "./types";
