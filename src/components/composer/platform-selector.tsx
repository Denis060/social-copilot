"use client";

import { cn } from "@/lib/utils";

interface SocialAccount {
  id: string;
  platform: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  discord: "Discord",
  x: "Twitter / X",
  slack: "Slack",
};

interface PlatformSelectorProps {
  accounts: SocialAccount[];
  selected: string[];
  onToggle: (accountId: string) => void;
}

export function PlatformSelector({
  accounts,
  selected,
  onToggle,
}: PlatformSelectorProps) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No connected accounts.{" "}
        <a href="/accounts" className="text-primary underline">
          Connect one
        </a>{" "}
        to start posting.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {accounts.map((account) => {
        const isSelected = selected.includes(account.id);
        return (
          <button
            key={account.id}
            type="button"
            onClick={() => onToggle(account.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                isSelected ? "bg-primary" : "bg-muted-foreground/40"
              )}
            />
            {PLATFORM_LABELS[account.platform] || account.platform}
          </button>
        );
      })}
    </div>
  );
}
