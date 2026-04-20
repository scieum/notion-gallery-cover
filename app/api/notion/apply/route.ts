import { NextRequest, NextResponse } from 'next/server';
import { setPageCover } from '@/lib/notion';
import { readTokenFromRequest } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ApplyItem {
  pageId: string;
  coverUrl: string;
}

export async function POST(req: NextRequest) {
  const token = readTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: { items?: ApplyItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const items = body.items ?? [];
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: 'items is empty' }, { status: 400 });

  const results: Array<{ pageId: string; ok: boolean; error?: string }> = [];
  for (const it of items) {
    try {
      await setPageCover(token, it.pageId, it.coverUrl);
      results.push({ pageId: it.pageId, ok: true });
    } catch (err: any) {
      results.push({ pageId: it.pageId, ok: false, error: err?.message ?? String(err) });
    }
    // gentle rate limit — Notion allows ~3 rps
    await new Promise((r) => setTimeout(r, 350));
  }

  return NextResponse.json({ results });
}
