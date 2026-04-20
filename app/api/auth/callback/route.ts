import { NextRequest, NextResponse } from 'next/server';
import { writeSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  if (error) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error)}`, req.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=missing_code', req.url));
  }

  const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
  const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/?auth_error=oauth_not_configured', req.url));
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const resp = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(`token_exchange_failed: ${text}`)}`, req.url),
    );
  }
  const data = (await resp.json()) as {
    access_token: string;
    workspace_name?: string;
    workspace_icon?: string;
    bot_id?: string;
  };

  await writeSession({
    token: data.access_token,
    workspaceName: data.workspace_name,
    workspaceIcon: data.workspace_icon,
    botId: data.bot_id,
  });

  return NextResponse.redirect(new URL('/', req.url));
}
