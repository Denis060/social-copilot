"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "1 social account",
  "10 posts per month",
  "Basic scheduling",
  "Content calendar",
  "Post analytics",
];

const PREMIUM_FEATURES = [
  "Unlimited social accounts",
  "Unlimited posts",
  "AI Caption Magic",
  "AI Auto-Reply engine",
  "Advanced analytics",
  "Priority support",
  "All 9 platforms",
  "Media uploads with ImageKit",
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  const monthlyPrice = 29;
  const annualPrice = Math.round(monthlyPrice * 0.8);

  return (
    <section id="pricing" className="border-t bg-muted/30 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Start free. Upgrade when you're ready. No hidden fees.
          </p>

          {/* Annual/Monthly toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-background p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-1 text-lg font-semibold">Free</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Perfect for getting started
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="mb-6 space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full rounded-lg border py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
            >
              Get Started
            </Link>
          </div>

          {/* Premium */}
          <div className="relative rounded-xl border-2 border-primary bg-card p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
              Most Popular
            </div>
            <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              Premium <Zap className="size-4 text-primary" />
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              For creators and teams
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${annual ? annualPrice : monthlyPrice}
              </span>
              <span className="text-muted-foreground">/month</span>
              {annual && (
                <span className="ml-2 text-sm text-muted-foreground line-through">
                  ${monthlyPrice}
                </span>
              )}
            </div>
            <ul className="mb-6 space-y-2.5">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] hover:bg-primary/90"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
