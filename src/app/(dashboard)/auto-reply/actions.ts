"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ruleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  platforms: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  tone: z.string().min(1).default("friendly"),
  custom_instructions: z.string().max(500).nullable().default(null),
});

export type RuleFormData = z.infer<typeof ruleSchema>;

export async function createAutoReplyRule(data: RuleFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Plan enforcement
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "premium") {
    throw new Error("Auto-reply rules require a Premium plan.");
  }

  const parsed = ruleSchema.parse(data);

  const { error } = await supabase.from("auto_reply_rules").insert({
    user_id: user.id,
    ...parsed,
  });

  if (error) throw new Error("Failed to create rule");

  revalidatePath("/auto-reply");
}

export async function updateAutoReplyRule(
  ruleId: string,
  data: Partial<RuleFormData>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("auto_reply_rules")
    .update(data)
    .eq("id", ruleId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to update rule");

  revalidatePath("/auto-reply");
}

export async function toggleAutoReplyRule(ruleId: string, isActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Plan enforcement for activation
  if (isActive) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan !== "premium") {
      throw new Error("Auto-reply rules require a Premium plan.");
    }
  }

  const { error } = await supabase
    .from("auto_reply_rules")
    .update({ is_active: isActive })
    .eq("id", ruleId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to toggle rule");

  revalidatePath("/auto-reply");
}

export async function deleteAutoReplyRule(ruleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("auto_reply_rules")
    .delete()
    .eq("id", ruleId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete rule");

  revalidatePath("/auto-reply");
}
