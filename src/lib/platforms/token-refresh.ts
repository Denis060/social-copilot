import { PLATFORMS } from "@/lib/platforms";
import { encrypt } from "@/lib/encryption";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

async function exchangeRefreshToken(
  platform: string,
  refreshToken: string
): Promise<TokenData> {
  const config = PLATFORMS[platform];
  if (!config) throw new Error(`Unknown platform: ${platform}`);

  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    throw new Error(`Missing credentials for ${platform}`);
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed for ${platform}: ${text}`);
  }

  return res.json();
}

export async function refreshTokenIfNeeded(
  accountId: string,
  platform: string,
  accessTokenEncrypted: string,
  refreshTokenEncrypted: string | null,
  tokenExpiresAt: string | null
): Promise<string> {
  // If no expiry tracked or not expiring soon, return current token
  if (!tokenExpiresAt || !refreshTokenEncrypted) {
    return accessTokenEncrypted;
  }

  const expiresAt = new Date(tokenExpiresAt);
  const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000);

  if (expiresAt > fiveMinFromNow) {
    return accessTokenEncrypted;
  }

  // Token is expiring soon — refresh it
  const { decrypt } = await import("@/lib/encryption");
  const plainRefreshToken = decrypt(refreshTokenEncrypted);

  const tokenData = await exchangeRefreshToken(platform, plainRefreshToken);

  const newAccessTokenEncrypted = encrypt(tokenData.access_token);
  const newRefreshTokenEncrypted = tokenData.refresh_token
    ? encrypt(tokenData.refresh_token)
    : refreshTokenEncrypted;

  const updates: Record<string, string> = {
    access_token_encrypted: newAccessTokenEncrypted,
    refresh_token_encrypted: newRefreshTokenEncrypted,
  };

  if (tokenData.expires_in) {
    updates.token_expires_at = new Date(
      Date.now() + tokenData.expires_in * 1000
    ).toISOString();
  }

  await supabase
    .from("social_accounts")
    .update(updates)
    .eq("id", accountId);

  return newAccessTokenEncrypted;
}
