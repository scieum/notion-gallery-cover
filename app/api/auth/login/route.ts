import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Redirects to Notion's OAuth authorize page.
 * Requires env:
 *   NOTION_OAUTH_CLIENT_ID
 *   NOTION_OAUTH_REDIRECT_URI  (must match the one registered at notion.so)
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error:
          'OAuth not configured. Set NOTION_OAUTH_CLIENT_ID and NOTION_OAUTH_REDIRECT_URI in your environment.',
      },
      { status: 500 },
    );
  }
  const url = new URL('https://api.notion.com/v1/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('owner', 'user');
  // optional `state` could be added here for CSRF — kept minimal for brevity
  return NextResponse.redirect(url.toString());
}
