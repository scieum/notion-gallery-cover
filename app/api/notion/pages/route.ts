import { NextRequest, NextResponse } from 'next/server';
import { listDatabasePages } from '@/lib/notion';
import { readTokenFromRequest } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = readTokenFromRequest(req);
  const databaseId =
    req.nextUrl.searchParams.get('database_id') || process.env.NOTION_DATABASE_ID || '';

  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!databaseId)
    return NextResponse.json({ error: 'Missing database_id' }, { status: 400 });

  try {
    const pages = await listDatabasePages(token, databaseId);
    return NextResponse.json({ pages });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error', code: err?.code },
      { status: 500 },
    );
  }
}
