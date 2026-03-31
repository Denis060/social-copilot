"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarIcon, Clock, Save, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PlatformSelector } from "@/components/composer/platform-selector";
import { MediaUpload } from "@/components/composer/media-upload";
import { CaptionMagicSheet } from "@/components/composer/caption-magic-sheet";
import { PostPreview } from "@/components/composer/post-preview";

const CHAR_LIMITS: Record<string, number> = {
  x: 280,
  instagram: 2200,
  youtube: 5000,
  tiktok: 4000,
  facebook: 63206,
  linkedin: 3000,
  pinterest: 500,
  discord: 2000,
  slack: 40000,
};

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

interface SocialAccount {
  id: string;
  platform: string;
}

interface ComposerFormProps {
  accounts: SocialAccount[];
  userName: string;
}

export function ComposerForm({ accounts, userName }: ComposerFormProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlatforms = accounts
    .filter((a) => selectedIds.includes(a.id))
    .map((a) => a.platform);

  // Find the strictest character limit among selected platforms
  const activeLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((p) => CHAR_LIMITS[p] || 5000))
    : Infinity;

  const isOverLimit = content.length > activeLimit;

  const handleToggle = (accountId: string) => {
    setSelectedIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSubmit = async (status: "draft" | "scheduled") => {
    if (!content.trim()) {
      toast.error("Please write some content.");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Please select at least one platform.");
      return;
    }
    if (status === "scheduled" && (!scheduleDate || !scheduleTime)) {
      toast.error("Please set a schedule date and time.");
      return;
    }
    if (isOverLimit) {
      toast.error("Caption exceeds character limit.");
      return;
    }

    setIsSubmitting(true);

    let scheduledAt: string;
    if (status === "scheduled") {
      scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    } else {
      scheduledAt = new Date().toISOString();
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          scheduledAt,
          mediaUrls,
          accountIds: selectedIds,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create post.");
        return;
      }

      toast.success(
        status === "draft" ? "Draft saved!" : "Post scheduled!"
      );
      router.push("/calendar");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Left column — Editor */}
      <div className="space-y-6">
        {/* Platform selector */}
        <div className="space-y-2">
          <Label>Platforms</Label>
          <PlatformSelector
            accounts={accounts}
            selected={selectedIds}
            onToggle={handleToggle}
          />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="caption">Caption</Label>
            <div className="flex items-center gap-2">
              <CaptionMagicSheet
                platforms={selectedPlatforms}
                onInsert={(caption) => setContent(caption)}
              />
              <span
                className={`text-xs tabular-nums ${
                  isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
                }`}
              >
                {content.length}
                {activeLimit !== Infinity && ` / ${activeLimit}`}
              </span>
            </div>
          </div>
          <textarea
            id="caption"
            placeholder="Write your post content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none resize-y dark:bg-input/30"
          />
          {isOverLimit && (
            <p className="text-xs text-destructive">
              Exceeds the {activeLimit}-character limit for{" "}
              {selectedPlatforms
                .filter((p) => content.length > (CHAR_LIMITS[p] || 5000))
                .join(", ")}
            </p>
          )}
        </div>

        {/* Media */}
        <div className="space-y-2">
          <Label>Media</Label>
          <MediaUpload
            mediaUrls={mediaUrls}
            onUpload={(url) => setMediaUrls((prev) => [...prev, url])}
            onRemove={(url) => setMediaUrls((prev) => prev.filter((u) => u !== url))}
          />
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <Label>Schedule</Label>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-auto"
              />
            </div>
            <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Save className="size-4" data-icon="inline-start" />
            )}
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit("scheduled")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Send className="size-4" data-icon="inline-start" />
            )}
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Right column — Live Preview */}
      <div className="space-y-2">
        <Label>Live Preview</Label>
        <div className="sticky top-24">
          <PostPreview
            accounts={accounts}
            selectedIds={selectedIds}
            content={content}
            mediaUrls={mediaUrls}
            userName={userName}
          />
        </div>
      </div>
    </div>
  );
}
