import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCaption } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { topic, platforms, tone } = body as {
    topic: string;
    platforms: string[];
    tone: string;
  };

  if (!topic || !platforms?.length || !tone) {
    return NextResponse.json(
      { error: "topic, platforms, and tone are required" },
      { status: 400 }
    );
  }

  try {
    const captions = await generateCaption(topic, platforms, tone);
    return NextResponse.json({ captions });
  } catch (error) {
    console.error("Caption generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate captions" },
      { status: 500 }
    );
  }
}
