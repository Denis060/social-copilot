"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateNotificationPreferences } from "./actions";
import { cn } from "@/lib/utils";

const NOTIFICATION_OPTIONS = [
  {
    key: "post_published",
    label: "Post Published",
    description: "Get notified when a scheduled post is successfully published.",
  },
  {
    key: "post_failed",
    label: "Post Failed",
    description: "Get notified when a post fails to publish on any platform.",
  },
  {
    key: "new_comment",
    label: "New Comments",
    description: "Get notified when new comments are detected on your posts.",
  },
  {
    key: "auto_reply_sent",
    label: "Auto-Reply Sent",
    description: "Get notified when an AI auto-reply is sent on your behalf.",
  },
  {
    key: "weekly_digest",
    label: "Weekly Digest",
    description: "Receive a weekly email summary of your analytics and activity.",
  },
  {
    key: "billing_alerts",
    label: "Billing Alerts",
    description: "Get notified about upcoming renewals, payment failures, and plan changes.",
  },
];

interface NotificationsFormProps {
  preferences: Record<string, boolean>;
}

export function NotificationsForm({ preferences }: NotificationsFormProps) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const opt of NOTIFICATION_OPTIONS) {
      defaults[opt.key] = preferences[opt.key] ?? true;
    }
    return defaults;
  });
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNotificationPreferences(prefs);
      toast.success("Notification preferences saved!");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you'd like to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {NOTIFICATION_OPTIONS.map((opt) => (
          <div
            key={opt.key}
            className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(opt.key)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                prefs[opt.key] ? "bg-primary" : "bg-input"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg transition-transform",
                  prefs[opt.key] ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        ))}

        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
