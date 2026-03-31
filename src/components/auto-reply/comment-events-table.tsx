"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

interface CommentEvent {
  id: string;
  platform: string | null;
  content: string;
  reply_text: string | null;
  reply_sent: boolean;
  rule_id: string | null;
  created_at: string;
  posts: { content: string } | null;
  auto_reply_rules: { name: string } | null;
}

interface CommentEventsTableProps {
  events: CommentEvent[];
  rules: { id: string; name: string }[];
}

export function CommentEventsTable({ events, rules }: CommentEventsTableProps) {
  const [platformFilter, setPlatformFilter] = useState("all");
  const [ruleFilter, setRuleFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (platformFilter !== "all" && e.platform !== platformFilter) return false;
      if (ruleFilter !== "all" && e.rule_id !== ruleFilter) return false;
      if (dateFrom && new Date(e.created_at) < new Date(dateFrom)) return false;
      return true;
    });
  }, [events, platformFilter, ruleFilter, dateFrom]);

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No comment events yet. Comments will appear here once they are detected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={platformFilter}
          onValueChange={(v) => v && setPlatformFilter(v)}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={ruleFilter}
          onValueChange={(v) => v && setRuleFilter(v)}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Rule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rules</SelectItem>
            {rules.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-auto"
          placeholder="From date"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Platform
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Comment
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Reply
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Rule
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => (
              <tr key={event.id} className="border-b last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
                    {event.platform
                      ? PLATFORM_LABELS[event.platform] || event.platform
                      : "—"}
                  </span>
                </td>
                <td className="max-w-48 truncate px-3 py-2" title={event.content}>
                  {event.content}
                </td>
                <td
                  className="max-w-48 truncate px-3 py-2 text-muted-foreground"
                  title={event.reply_text || ""}
                >
                  {event.reply_text || "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {event.auto_reply_rules?.name || "—"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      event.reply_sent
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {event.reply_sent ? "Replied" : "Pending"}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No events match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {events.length} events
      </p>
    </div>
  );
}
