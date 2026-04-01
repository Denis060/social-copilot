import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function GET() {
  // Test sending an event
  let sendResult: unknown = null;
  let sendError: string | null = null;

  try {
    sendResult = await inngest.send({
      name: "post/schedule",
      data: { postId: "test-debug", scheduledAt: new Date().toISOString() },
    });
  } catch (err) {
    sendError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    hasEventKey: !!process.env.INNGEST_EVENT_KEY,
    eventKeyLength: process.env.INNGEST_EVENT_KEY?.length || 0,
    hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    sendResult,
    sendError,
  });
}
