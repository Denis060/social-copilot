import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, scheduledAt, mediaUrls, accountIds, status } = body as {
    content: string;
    scheduledAt: string;
    mediaUrls: string[];
    accountIds: string[];
    status: "draft" | "scheduled";
  };

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  if (!accountIds?.length) {
    return NextResponse.json(
      { error: "At least one platform must be selected" },
      { status: 400 }
    );
  }

  if (status === "scheduled" && !scheduledAt) {
    return NextResponse.json(
      { error: "Schedule date is required for scheduled posts" },
      { status: 400 }
    );
  }

  // Check plan limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, posts_this_month")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "free" && profile.posts_this_month >= 10) {
    return NextResponse.json(
      { error: "Free plan limit reached (10 posts/month). Please upgrade." },
      { status: 403 }
    );
  }

  // Create post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      content,
      scheduled_at: scheduledAt || new Date().toISOString(),
      status,
      media_urls: mediaUrls || [],
    })
    .select("id")
    .single();

  if (postError) {
    console.error("Post creation failed:", postError);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }

  // Create post destinations
  const destinations = accountIds.map((accountId) => ({
    post_id: post.id,
    account_id: accountId,
    status: "pending",
  }));

  const { error: destError } = await supabase
    .from("post_destinations")
    .insert(destinations);

  if (destError) {
    console.error("Post destinations failed:", destError);
    return NextResponse.json(
      { error: "Failed to set post destinations" },
      { status: 500 }
    );
  }

  // Increment posts_this_month
  await supabase
    .from("profiles")
    .update({ posts_this_month: (profile?.posts_this_month || 0) + 1 })
    .eq("id", user.id);

  // Store media assets
  if (mediaUrls?.length) {
    const assets = mediaUrls.map((url) => ({
      user_id: user.id,
      file_url: url,
      file_type: url.match(/\.(mp4|mov|webm)$/i) ? "video" : "image",
    }));
    await supabase.from("media_assets").insert(assets);
  }

  // Send Inngest event for scheduled posts
  if (status === "scheduled") {
    await inngest.send({
      name: "post/schedule",
      data: {
        postId: post.id,
        scheduledAt: scheduledAt || new Date().toISOString(),
      },
    });
  }

  return NextResponse.json({ id: post.id, status });
}
