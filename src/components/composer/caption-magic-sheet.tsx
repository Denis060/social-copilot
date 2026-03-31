"use client";

import { useState } from "react";
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
import { Sparkles, Loader2 } from "lucide-react";

const TONES = [
  "Professional",
  "Casual",
  "Humorous",
  "Inspiring",
  "Educational",
  "Promotional",
  "Storytelling",
];

interface CaptionMagicSheetProps {
  platforms: string[];
  onInsert: (caption: string) => void;
}

export function CaptionMagicSheet({
  platforms,
  onInsert,
}: CaptionMagicSheetProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [isLoading, setIsLoading] = useState(false);
  const [captions, setCaptions] = useState<Record<string, string> | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || platforms.length === 0) return;
    setIsLoading(true);
    setCaptions(null);

    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platforms, tone: tone.toLowerCase() }),
      });
      const data = await res.json();
      if (data.captions) {
        setCaptions(data.captions);
      }
    } catch (error) {
      console.error("Caption generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = (caption: string) => {
    onInsert(caption);
    setOpen(false);
    setTopic("");
    setCaptions(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button type="button" variant="outline" size="sm" disabled={platforms.length === 0} />
        }
      >
        <Sparkles className="size-4" data-icon="inline-start" />
        AI Caption Magic
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>AI Caption Magic</SheetTitle>
          <SheetDescription>
            Generate platform-optimized captions with AI.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., New product launch, Summer sale..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
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

          <div className="text-xs text-muted-foreground">
            Generating for: {platforms.join(", ") || "No platforms selected"}
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim() || platforms.length === 0}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
            {isLoading ? "Generating..." : "Generate Captions"}
          </Button>

          {captions && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Generated Captions</p>
              {Object.entries(captions).map(([platform, caption]) => (
                <div
                  key={platform}
                  className="space-y-1.5 rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize text-muted-foreground">
                      {platform}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleInsert(caption)}
                    >
                      Use this
                    </Button>
                  </div>
                  <p className="text-sm">{caption}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
