import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const monthlyPostReset = inngest.createFunction(
  {
    id: "monthly-post-reset",
    triggers: [{ cron: "0 0 1 * *" }], // 1st of every month at midnight
  },
  async ({ step }) => {
    const result = await step.run("reset-post-counts", async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ posts_this_month: 0 })
        .gte("posts_this_month", 0);

      if (error) throw new Error(`Reset failed: ${error.message}`);
      return { success: true };
    });

    return result;
  }
);
