import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationsForm } from "./NotificationsForm";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  const prefs = (profile?.notification_preferences as Record<string, boolean>) || {};

  return <NotificationsForm preferences={prefs} />;
}
