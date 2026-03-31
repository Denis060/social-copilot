import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/encryption";
import { generateCommentReply } from "@/lib/gemini";
import { refreshTokenIfNeeded } from "@/lib/platforms/token-refresh";
import {
  matchRule,
  buildReplyInstructions,
  type AutoReplyRule,
} from "@/lib/auto-reply/rules-engine";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const monitorComments = inngest.createFunction(
  {
    id: "monitor-comments",
    retries: 1,
    triggers: [{ cron: "*/15 * * * *" }],
  },
  async ({ step }) => {
    // Step 1: Fetch all premium users who have published posts
    const posts = await step.run("fetch-published-posts", async () => {
      // Only fetch posts belonging to premium users
      const { data: premiumUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("plan", "premium");

      if (!premiumUsers?.length) return [];

      const premiumUserIds = premiumUsers.map((u) => u.id);

      const { data } = await supabase
        .from("posts")
        .select(
          "id, content, user_id, post_destinations(id, external_id, account_id, social_accounts(id, platform, access_token_encrypted, refresh_token_encrypted, token_expires_at))"
        )
        .eq("status", "published")
        .in("user_id", premiumUserIds)
        .not("post_destinations.external_id", "is", null);

      return data || [];
    });

    let totalNewComments = 0;

    // Group posts by user to fetch rules once per user
    const userIds = [...new Set(posts.map((p) => p.user_id))];

    for (const userId of userIds) {
      // Fetch rules for this user
      const rules = await step.run(
        `fetch-rules-${userId}`,
        async () => {
          const { data } = await supabase
            .from("auto_reply_rules")
            .select("*")
            .eq("user_id", userId)
            .eq("is_active", true);
          return (data || []) as AutoReplyRule[];
        }
      );

      const userPosts = posts.filter((p) => p.user_id === userId);

      for (const post of userPosts) {
        const destinations = (post.post_destinations as unknown as Array<{
          id: string;
          external_id: string | null;
          account_id: string;
          social_accounts: {
            id: string;
            platform: string;
            access_token_encrypted: string;
            refresh_token_encrypted: string | null;
            token_expires_at?: string | null;
          };
        }>) || [];

        for (const dest of destinations) {
          if (!dest.external_id || !dest.social_accounts) continue;

          const account = dest.social_accounts;

          const comments = await step.run(
            `fetch-comments-${post.id}-${account.platform}`,
            async () => {
              const currentTokenEnc = await refreshTokenIfNeeded(
                account.id,
                account.platform,
                account.access_token_encrypted,
                account.refresh_token_encrypted,
                account.token_expires_at || null
              );

              const token = decrypt(currentTokenEnc);
              return fetchCommentsForPlatform(
                account.platform,
                token,
                dest.external_id!
              );
            }
          );

          for (const comment of comments) {
            // Check if we already processed this comment
            const existing = await step.run(
              `check-comment-${comment.id}`,
              async () => {
                const { data } = await supabase
                  .from("comment_events")
                  .select("id")
                  .eq("platform_comment_id", comment.id)
                  .single();
                return data;
              }
            );

            if (existing) continue;

            // Match against rules
            const matchedRule = matchRule(
              { text: comment.text, platform: account.platform },
              rules
            );

            // Store the comment and generate a reply if a rule matches
            await step.run(`process-comment-${comment.id}`, async () => {
              if (!matchedRule) {
                // No rule matched — log but don't reply
                await supabase.from("comment_events").insert({
                  post_id: post.id,
                  platform_comment_id: comment.id,
                  content: comment.text,
                  platform: account.platform,
                  reply_sent: false,
                  rule_id: null,
                });
                return;
              }

              const replyInstructions = buildReplyInstructions(matchedRule);

              const reply = await generateCommentReply(
                comment.text,
                post.content,
                replyInstructions
              );

              // Store the comment event with rule reference and reply text
              await supabase.from("comment_events").insert({
                post_id: post.id,
                platform_comment_id: comment.id,
                content: comment.text,
                reply_text: reply,
                platform: account.platform,
                reply_sent: false,
                rule_id: matchedRule.id,
              });

              // Post the reply
              const currentTokenEnc = await refreshTokenIfNeeded(
                account.id,
                account.platform,
                account.access_token_encrypted,
                account.refresh_token_encrypted,
                account.token_expires_at || null
              );
              const token = decrypt(currentTokenEnc);

              await replyToComment(
                account.platform,
                token,
                dest.external_id!,
                comment.id,
                reply
              );

              // Mark as replied
              await supabase
                .from("comment_events")
                .update({ reply_sent: true })
                .eq("platform_comment_id", comment.id);
            });

            totalNewComments++;
          }
        }
      }
    }

    return { processedComments: totalNewComments };
  }
);

interface PlatformComment {
  id: string;
  text: string;
}

async function fetchCommentsForPlatform(
  platform: string,
  token: string,
  externalId: string
): Promise<PlatformComment[]> {
  try {
    switch (platform) {
      case "instagram": {
        const res = await fetch(
          `https://graph.instagram.com/v19.0/${externalId}/comments?fields=id,text&access_token=${token}`
        );
        const data = await res.json();
        return (data.data || []).map((c: { id: string; text: string }) => ({
          id: c.id,
          text: c.text,
        }));
      }
      case "facebook": {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${externalId}/comments?fields=id,message&access_token=${token}`
        );
        const data = await res.json();
        return (data.data || []).map(
          (c: { id: string; message: string }) => ({
            id: c.id,
            text: c.message,
          })
        );
      }
      case "youtube": {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${externalId}&maxResults=20`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        return (data.items || []).map(
          (item: {
            id: string;
            snippet: {
              topLevelComment: {
                snippet: { textDisplay: string };
              };
            };
          }) => ({
            id: item.id,
            text: item.snippet.topLevelComment.snippet.textDisplay,
          })
        );
      }
      case "linkedin": {
        const res = await fetch(
          `https://api.linkedin.com/v2/socialActions/${externalId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Restli-Protocol-Version": "2.0.0",
            },
          }
        );
        const data = await res.json();
        return (data.elements || []).map(
          (c: { $URN: string; message: { text: string } }) => ({
            id: c.$URN,
            text: c.message?.text || "",
          })
        );
      }
      default:
        return [];
    }
  } catch (error) {
    console.error(`Failed to fetch comments for ${platform}:`, error);
    return [];
  }
}

async function replyToComment(
  platform: string,
  token: string,
  _externalPostId: string,
  commentId: string,
  replyText: string
): Promise<void> {
  try {
    switch (platform) {
      case "instagram":
        await fetch(
          `https://graph.instagram.com/v19.0/${commentId}/replies`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: replyText,
              access_token: token,
            }),
          }
        );
        break;
      case "facebook":
        await fetch(
          `https://graph.facebook.com/v19.0/${commentId}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: replyText,
              access_token: token,
            }),
          }
        );
        break;
      case "youtube":
        await fetch(
          "https://www.googleapis.com/youtube/v3/comments?part=snippet",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              snippet: {
                parentId: commentId,
                textOriginal: replyText,
              },
            }),
          }
        );
        break;
      case "linkedin":
        await fetch(
          `https://api.linkedin.com/v2/socialActions/${commentId}/comments`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify({
              actor: "urn:li:person:me",
              message: { text: replyText },
            }),
          }
        );
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Failed to reply on ${platform}:`, error);
  }
}
