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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      <BillingClient
        plan={profile?.plan || "free"}
        postsThisMonth={profile?.posts_this_month || 0}
        hasSubscription={!!profile?.stripe_subscription_id}
      />
    </div>
  );
}
