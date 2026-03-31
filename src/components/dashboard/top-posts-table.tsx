"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface TopPost {
  id: string;
  content: string;
  media_urls?: string[];
  platform: string;
  likes: number;
  reach: number;
  engagement_rate: string;
}

interface TopPostsTableProps {
  posts: TopPost[];
}

export function TopPostsTable({ posts }: TopPostsTableProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No post performance data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Performing Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Post
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Platform
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Likes
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Reach
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Eng. Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="size-8 shrink-0 overflow-hidden rounded border">
                          <img
                            src={post.media_urls[0]}
                            alt=""
                            className="size-full object-cover"
                          />
                        </div>
                      )}
                      <span className="max-w-48 truncate" title={post.content}>
                        {post.content}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
                      {PLATFORM_LABELS[post.platform] || post.platform}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {post.likes.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {post.reach.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {post.engagement_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
