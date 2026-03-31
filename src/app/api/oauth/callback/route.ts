import { NextResponse } from 'next/server';
import { PLATFORMS } from '@/lib/platforms';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/accounts?error=${error}`, origin));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/accounts?error=invalid_request', origin));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL('/accounts?error=invalid_state', origin));
  }
  
  cookieStore.delete('oauth_state');

  let platformId = '';
  try {
    const decodedState = Buffer.from(state, 'base64').toString('utf8');
    platformId = decodedState.split(':')[0];
  } catch (e) {
    return NextResponse.redirect(new URL('/accounts?error=invalid_state_format', origin));
  }

  if (!platformId || !PLATFORMS[platformId]) {
    return NextResponse.redirect(new URL('/accounts?error=invalid_platform', origin));
  }

  const platform = PLATFORMS[platformId];
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  // Plan enforcement check
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  if (profile?.plan === 'free') {
    const { count } = await supabase
      .from('social_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
      
    if (count && count >= 1) {
      return NextResponse.redirect(new URL('/accounts?error=upgrade_required', origin));
    }
  }

  // Exchange code for token
  const clientId = process.env[platform.clientIdEnv];
  const clientSecret = process.env[platform.clientSecretEnv];
  const redirectUri = `${origin}/api/oauth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/accounts?error=config_missing', origin));
  }

  const tokenResponse = await fetch(platform.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error('Token exchange error:', tokenData);
    return NextResponse.redirect(new URL('/accounts?error=token_exchange_failed', origin));
  }

  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token || null;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/accounts?error=no_access_token', origin));
  }

  const accessEncrypted = encrypt(accessToken);
  const refreshEncrypted = refreshToken ? encrypt(refreshToken) : null;

  // Fetch platform profile info (name + avatar)
  const platformProfile = await fetchPlatformProfile(platformId, accessToken);

  const { data: existing } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', platformId)
    .maybeSingle();

  if (existing) {
    await supabase.from('social_accounts').update({
      access_token_encrypted: accessEncrypted,
      refresh_token_encrypted: refreshEncrypted,
      platform_username: platformProfile.username,
      platform_avatar_url: platformProfile.avatarUrl,
    }).eq('id', existing.id);
  } else {
    await supabase.from('social_accounts').insert({
      user_id: user.id,
      platform: platformId,
      access_token_encrypted: accessEncrypted,
      refresh_token_encrypted: refreshEncrypted,
      platform_username: platformProfile.username,
      platform_avatar_url: platformProfile.avatarUrl,
    });
  }

  return NextResponse.redirect(new URL('/accounts?success=true', origin));
}

async function fetchPlatformProfile(
  platform: string,
  accessToken: string
): Promise<{ username: string; avatarUrl: string }> {
  const empty = { username: "", avatarUrl: "" };
  try {
    switch (platform) {
      case "youtube": {
        const res = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        const channel = data.items?.[0];
        return {
          username: channel?.snippet?.title || "",
          avatarUrl: channel?.snippet?.thumbnails?.default?.url || "",
        };
      }
      case "instagram": {
        const res = await fetch(
          `https://graph.instagram.com/me?fields=username,profile_picture_url&access_token=${accessToken}`
        );
        const data = await res.json();
        return {
          username: data.username || "",
          avatarUrl: data.profile_picture_url || "",
        };
      }
      case "facebook": {
        const res = await fetch(
          `https://graph.facebook.com/me?fields=name,picture.type(large)&access_token=${accessToken}`
        );
        const data = await res.json();
        return {
          username: data.name || "",
          avatarUrl: data.picture?.data?.url || "",
        };
      }
      case "linkedin": {
        const res = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        return {
          username: data.name || "",
          avatarUrl: data.picture || "",
        };
      }
      case "x": {
        const res = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        return {
          username: data.data?.username || "",
          avatarUrl: data.data?.profile_image_url || "",
        };
      }
      case "discord": {
        const res = await fetch("https://discord.com/api/v10/users/@me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        const avatarHash = data.avatar;
        return {
          username: data.username || "",
          avatarUrl: avatarHash
            ? `https://cdn.discordapp.com/avatars/${data.id}/${avatarHash}.png`
            : "",
        };
      }
      case "tiktok": {
        const res = await fetch(
          "https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        return {
          username: data.data?.user?.display_name || "",
          avatarUrl: data.data?.user?.avatar_url || "",
        };
      }
      case "pinterest": {
        const res = await fetch("https://api.pinterest.com/v5/user_account", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        return {
          username: data.username || "",
          avatarUrl: data.profile_image || "",
        };
      }
      case "slack": {
        const res = await fetch("https://slack.com/api/auth.test", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        return {
          username: data.user || "",
          avatarUrl: "",
        };
      }
      default:
        return empty;
    }
  } catch (err) {
    console.error(`Failed to fetch profile for ${platform}:`, err);
    return empty;
  }
}
