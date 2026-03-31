import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ComposerForm } from "./ComposerForm";

export default async function ComposerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .single();

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id, platform")
    .eq("user_id", user.id);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Composer</h2>
        <p className="text-muted-foreground mt-1">
          Create and schedule posts across your social platforms.
        </p>
      </div>

      <ComposerForm
        accounts={accounts || []}
        userName={profile?.full_name || "You"}
      />
    </div>
  );
}
