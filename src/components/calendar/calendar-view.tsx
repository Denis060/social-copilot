"use client";

import { useState, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg, EventClickArg } from "@fullcalendar/core";
import { toast } from "sonner";

import { CalendarFilters } from "@/components/calendar/calendar-filters";
import { MiniCalendar } from "@/components/calendar/mini-calendar";
import {
  PostDetailSheet,
  type CalendarPost,
} from "@/components/calendar/post-detail-sheet";
import { reschedulePost } from "@/app/(dashboard)/calendar/actions";

interface PostRow {
  id: string;
  content: string;
  scheduled_at: string;
  status: string;
  media_urls?: string[];
  platforms: string[];
}

interface CalendarViewProps {
  posts: PostRow[];
  connectedPlatforms: string[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  scheduled: "#6366f1",
  published: "#22c55e",
  failed: "#ef4444",
};

export function CalendarView({ posts, connectedPlatforms }: CalendarViewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(connectedPlatforms);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarRef, setCalendarRef] = useState<FullCalendar | null>(null);

  const togglePlatform = useCallback((platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (
        selectedPlatforms.length > 0 &&
        !post.platforms.some((p) => selectedPlatforms.includes(p))
      )
        return false;
      return true;
    });
  }, [posts, statusFilter, selectedPlatforms]);

  const events = useMemo(
    () =>
      filteredPosts.map((post) => ({
        id: post.id,
        title: post.content.length > 50 ? post.content.slice(0, 50) + "..." : post.content,
        start: post.scheduled_at,
        backgroundColor: STATUS_COLORS[post.status] || STATUS_COLORS.draft,
        borderColor: STATUS_COLORS[post.status] || STATUS_COLORS.draft,
        extendedProps: post,
      })),
    [filteredPosts]
  );

  const handleEventClick = useCallback((info: EventClickArg) => {
    const post = info.event.extendedProps as CalendarPost;
    setSelectedPost({
      id: info.event.id,
      content: post.content,
      scheduled_at: post.scheduled_at,
      status: post.status,
      media_urls: post.media_urls,
      platforms: post.platforms,
    });
    setSheetOpen(true);
  }, []);

  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    const postId = info.event.id;
    const newDate = info.event.start?.toISOString();
    if (!newDate) return;

    try {
      await reschedulePost(postId, newDate);
      toast.success("Post rescheduled.");
    } catch {
      info.revert();
      toast.error("Failed to reschedule post.");
    }
  }, []);

  const handleMiniDateSelect = useCallback(
    (date: Date) => {
      setCalendarDate(date);
      const api = calendarRef?.getApi();
      if (api) {
        api.gotoDate(date);
      }
    },
    [calendarRef]
  );

  return (
    <div className="flex gap-6">
      {/* Mini calendar sidebar */}
      <div className="hidden w-52 shrink-0 space-y-4 lg:block">
        <MiniCalendar
          selectedDate={calendarDate}
          onDateSelect={handleMiniDateSelect}
        />
        <div className="rounded-lg border bg-card p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Legend
          </p>
          <div className="space-y-1.5">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main calendar */}
      <div className="min-w-0 flex-1 space-y-4">
        <CalendarFilters
          connectedPlatforms={connectedPlatforms}
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={togglePlatform}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <div className="rounded-lg border bg-card p-4 [&_.fc]:text-sm [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-button]:rounded-md [&_.fc-button]:border [&_.fc-button]:border-input [&_.fc-button]:bg-background [&_.fc-button]:px-2.5 [&_.fc-button]:py-1 [&_.fc-button]:text-xs [&_.fc-button]:font-medium [&_.fc-button]:text-foreground [&_.fc-button]:shadow-none [&_.fc-button:hover]:bg-muted [&_.fc-button-active]:bg-primary [&_.fc-button-active]:text-primary-foreground [&_.fc-button-active:hover]:bg-primary/90 [&_.fc-daygrid-event]:cursor-pointer [&_.fc-daygrid-event]:rounded-md [&_.fc-daygrid-event]:px-1.5 [&_.fc-daygrid-event]:py-0.5 [&_.fc-daygrid-event]:text-xs [&_.fc-event]:border-0 [&_.fc-col-header-cell]:py-2 [&_.fc-col-header-cell]:text-xs [&_.fc-col-header-cell]:font-medium [&_.fc-col-header-cell]:text-muted-foreground [&_.fc-day-today]:bg-primary/5 [&_.fc-scrollgrid]:border-border [&_.fc-scrollgrid td]:border-border [&_.fc-scrollgrid th]:border-border [&_.fc-theme-standard .fc-scrollgrid]:border-border [&_.fc-theme-standard td]:border-border [&_.fc-theme-standard th]:border-border">
          <FullCalendar
            ref={(el) => setCalendarRef(el)}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            editable={true}
            droppable={true}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            height="auto"
            dayMaxEvents={3}
            nowIndicator={true}
          />
        </div>
      </div>

      <PostDetailSheet
        post={selectedPost}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
