"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Zap, Check } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BillingClientProps {
  plan: string;
  postsThisMonth: number;
  connectedAccounts?: number;
  hasSubscription: boolean;
}

const FREE_FEATURES = [
  "1 social account",
  "10 posts per month",
  "Basic scheduling",
];

const PREMIUM_FEATURES = [
  "Unlimited social accounts",
  "Unlimited posts",
  "AI Caption Magic",
  "AI Auto-Reply engine",
  "Priority support",
  "Advanced analytics",
];

export function BillingClient({
  plan,
  postsThisMonth,
  hasSubscription,
  connectedAccounts = 0,
}: BillingClientProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    return data.clientSecret;
  }, []);

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error("Failed to open billing portal");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Current Plan
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
              {plan === "premium" && <Zap className="mr-1 size-3" />}
              {plan}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan === "free" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You've used <strong>{postsThisMonth}/10</strong> posts this
                month.
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min((postsThisMonth / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You have unlimited access to all features.
              </p>
              <p className="text-sm text-muted-foreground">
                Posts this month: <strong>{postsThisMonth}</strong>
              </p>
            </div>
          )}

          {plan === "premium" && hasSubscription && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={isLoadingPortal}
            >
              {isLoadingPortal ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 size-4" />
              )}
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      {plan === "free" && !showCheckout && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Free</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-2xl font-bold">
                $0<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-muted-foreground" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="ring-2 ring-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Premium
                <Zap className="size-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-2xl font-bold">
                $29<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className="mt-4 w-full"
                onClick={() => setShowCheckout(true)}
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Embedded Checkout */}
      {showCheckout && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Complete Your Upgrade
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
