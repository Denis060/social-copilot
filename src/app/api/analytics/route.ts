import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);
  const platform = searchParams.get("platform") || "all";

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const prevStartDate = new Date();
  prevStartDate.setDate(prevStartDate.getDate() - days * 2);

  // Fetch posts in date range
  let postsQuery = supabase
    .from("posts")
    .select("id, content, status, scheduled_at, media_urls")
    .eq("user_id", user.id)
    .gte("scheduled_at", startDate.toISOString())
    .order("scheduled_at", { ascending: false });

  const { data: posts } = await postsQuery;
  const postIds = (posts || []).map((p) => p.id);

  // Fetch analytics for these posts
  let analytics: Array<{
    post_id: string;
    platform: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
    fetched_at: string;
  }> = [];

  if (postIds.length > 0) {
    let analyticsQuery = supabase
      .from("post_analytics")
      .select("*")
      .in("post_id", postIds);

    if (platform !== "all") {
      analyticsQuery = analyticsQuery.eq("platform", platform);
    }

    const { data } = await analyticsQuery;
    analytics = data || [];
  }

  // Fetch previous period posts for comparison
  const { data: prevPosts } = await supabase
    .from("posts")
    .select("id")
    .eq("user_id", user.id)
    .gte("scheduled_at", prevStartDate.toISOString())
    .lt("scheduled_at", startDate.toISOString());

  const prevPostIds = (prevPosts || []).map((p) => p.id);
  let prevAnalytics: typeof analytics = [];

  if (prevPostIds.length > 0) {
    let prevQuery = supabase
      .from("post_analytics")
      .select("*")
      .in("post_id", prevPostIds);

    if (platform !== "all") {
      prevQuery = prevQuery.eq("platform", platform);
    }

    const { data } = await prevQuery;
    prevAnalytics = data || [];
  }

  // Aggregate KPIs
  const totalLikes = analytics.reduce((sum, a) => sum + a.likes, 0);
  const totalComments = analytics.reduce((sum, a) => sum + a.comments, 0);
  const totalShares = analytics.reduce((sum, a) => sum + a.shares, 0);
  const totalReach = analytics.reduce((sum, a) => sum + a.reach, 0);

  const prevLikes = prevAnalytics.reduce((sum, a) => sum + a.likes, 0);
  const prevComments = prevAnalytics.reduce((sum, a) => sum + a.comments, 0);
  const prevShares = prevAnalytics.reduce((sum, a) => sum + a.shares, 0);
  const prevReach = prevAnalytics.reduce((sum, a) => sum + a.reach, 0);

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  // Engagement over time (daily)
  const dailyMap: Record<string, Record<string, { likes: number; comments: number; shares: number }>> = {};
  for (const a of analytics) {
    const day = a.fetched_at.split("T")[0];
    if (!dailyMap[day]) dailyMap[day] = {};
    if (!dailyMap[day][a.platform]) {
      dailyMap[day][a.platform] = { likes: 0, comments: 0, shares: 0 };
    }
    dailyMap[day][a.platform].likes += a.likes;
    dailyMap[day][a.platform].comments += a.comments;
    dailyMap[day][a.platform].shares += a.shares;
  }

  const engagementOverTime = Object.entries(dailyMap)
    .map(([date, platforms]) => ({ date, ...platforms }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Posts by platform
  const platformCounts: Record<string, number> = {};
  for (const a of analytics) {
    platformCounts[a.platform] = (platformCounts[a.platform] || 0) + 1;
  }
  const postsByPlatform = Object.entries(platformCounts).map(
    ([name, value]) => ({ name, value })
  );

  // Top performing posts
  const postAnalyticsMap: Record<string, {
    likes: number; comments: number; shares: number; reach: number; platform: string;
  }> = {};
  for (const a of analytics) {
    if (!postAnalyticsMap[a.post_id]) {
      postAnalyticsMap[a.post_id] = {
        likes: 0, comments: 0, shares: 0, reach: 0, platform: a.platform,
      };
    }
    postAnalyticsMap[a.post_id].likes += a.likes;
    postAnalyticsMap[a.post_id].comments += a.comments;
    postAnalyticsMap[a.post_id].shares += a.shares;
    postAnalyticsMap[a.post_id].reach += a.reach;
  }

  const topPosts = (posts || [])
    .filter((p) => postAnalyticsMap[p.id])
    .map((p) => ({
      id: p.id,
      content: p.content,
      media_urls: p.media_urls,
      scheduled_at: p.scheduled_at,
      ...postAnalyticsMap[p.id],
      engagement_rate:
        postAnalyticsMap[p.id].reach > 0
          ? (
              ((postAnalyticsMap[p.id].likes +
                postAnalyticsMap[p.id].comments +
                postAnalyticsMap[p.id].shares) /
                postAnalyticsMap[p.id].reach) *
              100
            ).toFixed(2)
          : "0.00",
    }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10);

  // Comment activity (fetch from comment_events)
  const { data: commentEvents } = await supabase
    .from("comment_events")
    .select("created_at, reply_sent")
    .gte("created_at", startDate.toISOString());

  const commentDailyMap: Record<string, { received: number; replied: number }> = {};
  for (const ce of commentEvents || []) {
    const day = ce.created_at.split("T")[0];
    if (!commentDailyMap[day]) commentDailyMap[day] = { received: 0, replied: 0 };
    commentDailyMap[day].received++;
    if (ce.reply_sent) commentDailyMap[day].replied++;
  }

  const commentActivity = Object.entries(commentDailyMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    kpis: {
      totalPosts: postIds.length,
      prevTotalPosts: prevPostIds.length,
      totalLikes,
      prevLikes,
      totalComments,
      prevComments,
      totalShares,
      prevShares,
      totalReach,
      prevReach,
      likesChange: pctChange(totalLikes, prevLikes),
      commentsChange: pctChange(totalComments, prevComments),
      sharesChange: pctChange(totalShares, prevShares),
      reachChange: pctChange(totalReach, prevReach),
      postsChange: pctChange(postIds.length, prevPostIds.length),
    },
    engagementOverTime,
    postsByPlatform,
    topPosts,
    commentActivity,
  });
}
