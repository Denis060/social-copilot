"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  console.log("completeOnboarding Server Action called!");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const fullName = formData.get("fullName") as string;
  const useCase = formData.get("useCase") as string;
  const avatarFile = formData.get("avatar") as File | null;

  let avatarUrl = "";
  
  // Basic mock of ImageKit upload if a file is provided
  // In a real application, you would upload this file to ImageKit using their SDK or REST API
  if (avatarFile && avatarFile.size > 0) {
    avatarUrl = `https://ik.imagekit.io/demo/${avatarFile.name}`;
  }

  if (!fullName || !useCase) {
    throw new Error("Missing required fields");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      use_case: useCase,
      avatar_url: avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/dashboard/accounts");
}
