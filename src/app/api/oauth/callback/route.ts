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
    }).eq('id', existing.id);
  } else {
    await supabase.from('social_accounts').insert({
      user_id: user.id,
      platform: platformId,
      access_token_encrypted: accessEncrypted,
      refresh_token_encrypted: refreshEncrypted,
    });
  }

  return NextResponse.redirect(new URL('/accounts?success=true', origin));
}
