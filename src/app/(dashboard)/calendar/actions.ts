"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";

export async function reschedulePost(postId: string, newDate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("posts")
    .update({ scheduled_at: newDate })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to reschedule post");

  revalidatePath("/calendar");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete post");

  revalidatePath("/calendar");
}

export async function publishNow(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("posts")
    .update({ status: "scheduled", scheduled_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to publish post");

  // Trigger immediate publishing via Inngest
  await inngest.send({
    name: "post/schedule",
    data: {
      postId,
      scheduledAt: new Date().toISOString(),
    },
  });

  revalidatePath("/calendar");
}
