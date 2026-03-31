"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createAutoReplyRule, type RuleFormData } from "@/app/(dashboard)/auto-reply/actions";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "Twitter / X" },
  { id: "tiktok", label: "TikTok" },
  { id: "pinterest", label: "Pinterest" },
  { id: "discord", label: "Discord" },
  { id: "slack", label: "Slack" },
];

const TONES = [
  "Friendly",
  "Professional",
  "Casual",
  "Humorous",
  "Supportive",
  "Informative",
];

export function RuleForm() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [customInstructions, setCustomInstructions] = useState("");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a rule name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: RuleFormData = {
        name: name.trim(),
        platforms: selectedPlatforms,
        keywords,
        tone: tone.toLowerCase(),
        custom_instructions: customInstructions.trim() || null,
      };
      await createAutoReplyRule(data);
      toast.success("Rule created!");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create rule."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedPlatforms([]);
    setKeywords([]);
    setKeywordInput("");
    setTone("Friendly");
    setCustomInstructions("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button size="sm" />}>
        <Plus className="size-4" data-icon="inline-start" />
        Create Rule
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create Auto-Reply Rule</SheetTitle>
          <SheetDescription>
            Define when and how to auto-reply to comments.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              placeholder="e.g., FAQ responses, Thank you replies..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label>Platforms (empty = all)</Label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label>Keywords (empty = match all comments)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a keyword..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={addKeyword}
              >
                Add
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label>Reply Tone</Label>
            <Select value={tone} onValueChange={(v) => v && setTone(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="custom-instructions">
              Custom Instructions (optional)
            </Label>
            <textarea
              id="custom-instructions"
              placeholder="e.g., Always include a link to our FAQ page..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none resize-y dark:bg-input/30"
            />
            <p className="text-xs text-muted-foreground">
              {customInstructions.length}/500
            </p>
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            )}
            {isSubmitting ? "Creating..." : "Create Rule"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
