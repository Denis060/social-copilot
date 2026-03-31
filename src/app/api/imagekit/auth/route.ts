import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { error: "ImageKit not configured" },
      { status: 500 }
    );
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 600; // 10 minutes
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return NextResponse.json({ token, expire, signature });
}
