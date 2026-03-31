"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toggleAutoReplyRule,
  deleteAutoReplyRule,
} from "@/app/(dashboard)/auto-reply/actions";

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

export function RulesList({ rules }: { rules: Rule[] }) {
  if (rules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No auto-reply rules yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} />
      ))}
    </div>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleAutoReplyRule(rule.id, !rule.is_active);
      toast.success(rule.is_active ? "Rule deactivated." : "Rule activated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle rule."
      );
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAutoReplyRule(rule.id);
      toast.success("Rule deleted.");
    } catch {
      toast.error("Failed to delete rule.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm">{rule.name}</CardTitle>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              rule.is_active ? "bg-primary" : "bg-input"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                rule.is_active ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Platforms */}
        <div className="flex flex-wrap gap-1">
          {rule.platforms.length === 0 ? (
            <span className="text-xs text-muted-foreground">All platforms</span>
          ) : (
            rule.platforms.map((p) => (
              <span
                key={p}
                className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
              >
                {PLATFORM_LABELS[p] || p}
              </span>
            ))
          )}
        </div>

        {/* Keywords */}
        {rule.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rule.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px]"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Tone + Instructions */}
        <p className="text-xs text-muted-foreground capitalize">
          Tone: {rule.tone}
          {rule.custom_instructions && " · Has custom instructions"}
        </p>

        {/* Actions */}
        <div className="flex gap-2 border-t pt-2">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="xs"
                  disabled={isDeleting}
                />
              }
            >
              {isDeleting ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : (
                <Trash2 className="mr-1 size-3" />
              )}
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{rule.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This rule will be permanently removed. Comments already replied
                  to won't be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
