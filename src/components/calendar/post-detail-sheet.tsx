"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
import { Pencil, Trash2, Zap, Loader2 } from "lucide-react";
import { deletePost, publishNow } from "@/app/(dashboard)/calendar/actions";

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

export interface CalendarPost {
  id: string;
  content: string;
  scheduled_at: string;
  status: string;
  media_urls?: string[];
  platforms: string[];
}

interface PostDetailSheetProps {
  post: CalendarPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailSheet({
  post,
  open,
  onOpenChange,
}: PostDetailSheetProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!post) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      toast.success("Post deleted.");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    try {
      await publishNow(post.id);
      toast.success("Post published!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to publish post.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    onOpenChange(false);
    router.push(`/composer?edit=${post.id}`);
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-primary/10 text-primary",
    published: "bg-green-500/10 text-green-600",
    failed: "bg-destructive/10 text-destructive",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Post Details</SheetTitle>
          <SheetDescription>
            {new Date(post.scheduled_at).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[post.status] || statusColor.draft}`}
            >
              {post.status}
            </span>
          </div>

          {/* Platforms */}
          <div className="flex flex-wrap gap-1.5">
            {post.platforms.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
              >
                {PLATFORM_LABELS[p] || p}
              </span>
            ))}
          </div>

          {/* Caption preview */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm whitespace-pre-wrap">
              {post.content || "No caption"}
            </p>
          </div>

          {/* Media thumbnail */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {post.media_urls.map((url) => (
                <div
                  key={url}
                  className="size-20 shrink-0 overflow-hidden rounded-lg border"
                >
                  <img
                    src={url}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="mr-2 size-4" />
              Edit Post
            </Button>

            {post.status === "scheduled" && (
              <Button
                size="sm"
                onClick={handlePublishNow}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 size-4" />
                )}
                Publish Now
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="sm" disabled={isDeleting} />
                }
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Delete Post
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The post and all its destinations
                    will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
