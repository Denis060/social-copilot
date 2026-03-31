"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { KpiCards } from "./kpi-cards";
import { EngagementChart } from "./engagement-chart";
import { PlatformPieChart } from "./platform-pie-chart";
import { CommentActivityChart } from "./comment-activity-chart";
import { TopPostsTable } from "./top-posts-table";

const DATE_RANGES = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

interface DashboardClientProps {
  connectedPlatforms: string[];
}

interface AnalyticsData {
  kpis: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    postsChange: number;
    likesChange: number;
    commentsChange: number;
    sharesChange: number;
    reachChange: number;
  };
  engagementOverTime: Array<Record<string, unknown>>;
  postsByPlatform: Array<{ name: string; value: number }>;
  topPosts: Array<{
    id: string;
    content: string;
    media_urls?: string[];
    platform: string;
    likes: number;
    reach: number;
    engagement_rate: string;
  }>;
  commentActivity: Array<{ date: string; received: number; replied: number }>;
}

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  discord: "Discord",
  x: "Twitter / X",
  slack: "Slack",
};

export function DashboardClient({ connectedPlatforms }: DashboardClientProps) {
  const [days, setDays] = useState("30");
  const [platform, setPlatform] = useState("all");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ days, platform });
      const res = await fetch(`/api/analytics?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, [days, platform]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={days} onValueChange={(v) => v && setDays(v)}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => setPlatform("all")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              platform === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {connectedPlatforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                platform === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {PLATFORM_LABELS[p] || p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          <KpiCards kpis={data.kpis} />

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <EngagementChart data={data.engagementOverTime} />
            <PlatformPieChart data={data.postsByPlatform} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TopPostsTable posts={data.topPosts} />
            <CommentActivityChart data={data.commentActivity} />
          </div>
        </>
      ) : null}
    </div>
  );
}
