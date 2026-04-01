import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasEventKey: !!process.env.INNGEST_EVENT_KEY,
    eventKeyLength: process.env.INNGEST_EVENT_KEY?.length || 0,
    eventKeyStart: process.env.INNGEST_EVENT_KEY?.slice(0, 5) || "MISSING",
    hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
    signingKeyStart: process.env.INNGEST_SIGNING_KEY?.slice(0, 12) || "MISSING",
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
