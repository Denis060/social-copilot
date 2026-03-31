import { NextResponse } from 'next/server';
import { PLATFORMS } from '@/lib/platforms';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { searchParams, origin } = new URL(req.url);
  const platformId = searchParams.get('platform');

  if (!platformId || !PLATFORMS[platformId]) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  const platform = PLATFORMS[platformId];
  const clientId = process.env[platform.clientIdEnv];

  if (!clientId) {
    return NextResponse.json({ error: 'Platform not configured' }, { status: 500 });
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const state = Buffer.from(`${platformId}:${nonce}`).toString('base64');
  
  const cookieStore = await cookies();
  cookieStore.set(`oauth_state`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  const redirectUri = `${origin}/api/oauth/callback`;
  const authUrl = new URL(platform.authUrl);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  if (platformId === 'tiktok') {
    authUrl.searchParams.set('client_key', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', platform.scopes.join(','));
  } else {
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', platform.scopes.join(' '));
  }

  if (platformId === 'youtube') {
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
  }

  return NextResponse.redirect(authUrl.toString());
}
