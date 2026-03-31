"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  full_name: string;
  avatar_url: string;
  bio: string;
  website_url: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      website_url: data.website_url,
    })
    .eq("id", user.id);

  if (error) throw new Error("Failed to update profile");

  revalidatePath("/settings/profile");
}
