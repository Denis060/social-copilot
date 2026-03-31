import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { publishPost } from "@/inngest/functions/publish-post";
import { monitorComments } from "@/inngest/functions/monitor-comments";
import { monthlyPostReset } from "@/inngest/functions/monthly-reset";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishPost, monitorComments, monthlyPostReset],
});
