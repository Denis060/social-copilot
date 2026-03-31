import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, posts_this_month, stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  // Get connected account count for usage display
  const { count: accountCount } = await supabase
    .from("social_accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <BillingClient
      plan={profile?.plan || "free"}
      postsThisMonth={profile?.posts_this_month || 0}
      connectedAccounts={accountCount || 0}
      hasSubscription={!!profile?.stripe_subscription_id}
    />
  );
}
