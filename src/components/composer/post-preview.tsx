"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface PostPreviewProps {
  accounts: SocialAccount[];
  selectedIds: string[];
  content: string;
  mediaUrls: string[];
  userName?: string;
}

export function PostPreview({
  accounts,
  selectedIds,
  content,
  mediaUrls,
  userName = "You",
}: PostPreviewProps) {
  const selectedAccounts = accounts.filter((a) => selectedIds.includes(a.id));
  const [activeTab, setActiveTab] = useState(selectedAccounts[0]?.platform || "");

  const activePlatform = selectedAccounts.find((a) => a.platform === activeTab)
    ? activeTab
    : selectedAccounts[0]?.platform || "";

  if (selectedAccounts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Select a platform to see a preview
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Platform tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/50 p-1">
        {selectedAccounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => setActiveTab(account.platform)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              activePlatform === account.platform
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {PLATFORM_LABELS[account.platform] || account.platform}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="rounded-lg border bg-card p-4">
        {activePlatform === "instagram" && (
          <InstagramPreview
            content={content}
            mediaUrls={mediaUrls}
            userName={userName}
          />
        )}
        {activePlatform === "x" && (
          <TwitterPreview
            content={content}
            mediaUrls={mediaUrls}
            userName={userName}
          />
        )}
        {activePlatform === "linkedin" && (
          <LinkedInPreview
            content={content}
            mediaUrls={mediaUrls}
            userName={userName}
          />
        )}
        {!["instagram", "x", "linkedin"].includes(activePlatform) && (
          <GenericPreview
            platform={activePlatform}
            content={content}
            mediaUrls={mediaUrls}
            userName={userName}
          />
        )}
      </div>
    </div>
  );
}

function InstagramPreview({
  content,
  mediaUrls,
  userName,
}: {
  content: string;
  mediaUrls: string[];
  userName: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{userName[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-semibold">{userName}</span>
      </div>
      {mediaUrls.length > 0 ? (
        <div className="aspect-square w-full overflow-hidden rounded-sm bg-muted">
          <img
            src={mediaUrls[0]}
            alt=""
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square w-full rounded-sm bg-muted flex items-center justify-center text-xs text-muted-foreground">
          No media
        </div>
      )}
      <p className="text-sm whitespace-pre-wrap">
        <span className="font-semibold">{userName}</span>{" "}
        {content || "Your caption will appear here..."}
      </p>
    </div>
  );
}

function TwitterPreview({
  content,
  mediaUrls,
  userName,
}: {
  content: string;
  mediaUrls: string[];
  userName: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold">{userName}</span>
            <span className="text-xs text-muted-foreground">@{userName.toLowerCase().replace(/\s/g, "")} · now</span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap">
            {content || "Your tweet will appear here..."}
          </p>
          {mediaUrls.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border">
              <img
                src={mediaUrls[0]}
                alt=""
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({
  content,
  mediaUrls,
  userName,
}: {
  content: string;
  mediaUrls: string[];
  userName: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Avatar className="size-12">
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{userName}</p>
          <p className="text-xs text-muted-foreground">Professional · Just now</p>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap leading-relaxed">
        {content || "Your post will appear here..."}
      </p>
      {mediaUrls.length > 0 && (
        <div className="overflow-hidden rounded border">
          <img
            src={mediaUrls[0]}
            alt=""
            className="w-full max-h-72 object-cover"
          />
        </div>
      )}
    </div>
  );
}

function GenericPreview({
  platform,
  content,
  mediaUrls,
  userName,
}: {
  platform: string;
  content: string;
  mediaUrls: string[];
  userName: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{userName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <span className="text-sm font-semibold">{userName}</span>
          <span className="ml-2 text-xs capitalize text-muted-foreground">
            on {PLATFORM_LABELS[platform] || platform}
          </span>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap">
        {content || "Your post will appear here..."}
      </p>
      {mediaUrls.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <img
            src={mediaUrls[0]}
            alt=""
            className="w-full max-h-64 object-cover"
          />
        </div>
      )}
    </div>
  );
}
