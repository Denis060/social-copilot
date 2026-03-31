import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { publishPost } from "@/inngest/functions/publish-post";
import { monitorComments } from "@/inngest/functions/monitor-comments";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishPost, monitorComments],
});
