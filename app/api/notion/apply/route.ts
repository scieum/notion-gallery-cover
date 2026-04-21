import { NextRequest, NextResponse } from 'next/server';
import {
  ensureGalleryCoverProperty,
  setPageCover,
  setPageGalleryCover,
  GALLERY_COVER_PROPERTY,
} from '@/lib/notion';
import { readTokenFromRequest } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ApplyItem {
  pageId: string;
  coverUrl: string;
}

interface Body {
  items?: ApplyItem[];
  /** 'page' = page.cover banner. 'gallery' = files & media property on the DB. */
  mode?: 'page' | 'gallery';
  /** Required when mode === 'gallery' so we can ensure the target property exists. */
  databaseId?: string;
  /** Override the property name for gallery mode. Defaults to "갤러리 커버". */
  propertyName?: string;
}

export async function POST(req: NextRequest) {
  const token = readTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const items = body.items ?? [];
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: 'items is empty' }, { status: 400 });

  const mode = body.mode ?? 'page';
  const propertyName = body.propertyName ?? GALLERY_COVER_PROPERTY;

  // Gallery mode requires a one-time property setup on the database before
  // we can write per-page values.
  let propertyEnsured: { existed: boolean; propertyName: string } | null = null;
  if (mode === 'gallery') {
    if (!body.databaseId) {
      return NextResponse.json(
        { error: 'gallery mode requires databaseId' },
        { status: 400 },
      );
    }
    try {
      propertyEnsured = await ensureGalleryCoverProperty(token, body.databaseId, propertyName);
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.message ?? '속성 생성 실패' },
        { status: 500 },
      );
    }
  }

  const results: Array<{ pageId: string; ok: boolean; error?: string }> = [];
  for (const it of items) {
    try {
      if (mode === 'gallery') {
        await setPageGalleryCover(token, it.pageId, it.coverUrl, propertyName);
      } else {
        await setPageCover(token, it.pageId, it.coverUrl);
      }
      results.push({ pageId: it.pageId, ok: true });
    } catch (err: any) {
      results.push({ pageId: it.pageId, ok: false, error: err?.message ?? String(err) });
    }
    // gentle rate limit — Notion allows ~3 rps
    await new Promise((r) => setTimeout(r, 350));
  }

  return NextResponse.json({ results, propertyEnsured });
}
