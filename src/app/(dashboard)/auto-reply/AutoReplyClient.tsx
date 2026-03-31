"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RuleForm } from "@/components/auto-reply/rule-form";
import { RulesList } from "@/components/auto-reply/rules-list";
import { CommentEventsTable } from "@/components/auto-reply/comment-events-table";

interface Rule {
  id: string;
  name: string;
  platforms: string[];
  keywords: string[];
  tone: string;
  custom_instructions: string | null;
  is_active: boolean;
  created_at: string;
}

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

interface AutoReplyClientProps {
  rules: Rule[];
  commentEvents: CommentEvent[];
}

const TABS = ["Rules", "Comment Log"] as const;

export function AutoReplyClient({ rules, commentEvents }: AutoReplyClientProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Rules");

  return (
    <div className="space-y-4">
      {/* Tab switcher + Create button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Rules" && <RuleForm />}
      </div>

      {/* Tab content */}
      {activeTab === "Rules" && <RulesList rules={rules} />}
      {activeTab === "Comment Log" && (
        <CommentEventsTable
          events={commentEvents}
          rules={rules.map((r) => ({ id: r.id, name: r.name }))}
        />
      )}
    </div>
  );
}
