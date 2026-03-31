"use client";

import { cn } from "@/lib/utils";

const PLATFORM_OPTIONS = [
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "pinterest", label: "Pinterest" },
  { id: "discord", label: "Discord" },
  { id: "x", label: "Twitter / X" },
  { id: "slack", label: "Slack" },
];

const STATUS_OPTIONS = ["all", "scheduled", "published", "draft", "failed"] as const;

interface CalendarFiltersProps {
  connectedPlatforms: string[];
  selectedPlatforms: string[];
  onTogglePlatform: (platform: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function CalendarFilters({
  connectedPlatforms,
  selectedPlatforms,
  onTogglePlatform,
  statusFilter,
  onStatusChange,
}: CalendarFiltersProps) {
  const availablePlatforms = PLATFORM_OPTIONS.filter((p) =>
    connectedPlatforms.includes(p.id)
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status filter */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              statusFilter === s
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Platform filter chips */}
      {availablePlatforms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availablePlatforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => onTogglePlatform(platform.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isSelected ? "bg-primary" : "bg-muted-foreground/40"
                  )}
                />
                {platform.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
