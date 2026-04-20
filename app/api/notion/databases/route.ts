import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { readTokenFromRequest } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pickTitle(db: any): string {
  const parts = db?.title ?? [];
  const text = parts
    .map((t: any) => t?.plain_text ?? '')
    .join('')
    .trim();
  return text || 'Untitled database';
}

function pickIcon(db: any): string | null {
  const icon = db?.icon;
  if (!icon) return null;
  if (icon.type === 'emoji') return icon.emoji;
  if (icon.type === 'external') return icon.external?.url ?? null;
  if (icon.type === 'file') return icon.file?.url ?? null;
  return null;
}

export async function GET(req: NextRequest) {
  const token = readTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const notion = new Client({ auth: token });
    const out: Array<{ id: string; title: string; icon: string | null; url: string }> = [];
    let cursor: string | undefined = undefined;
    do {
      const resp: any = await notion.search({
        filter: { value: 'database', property: 'object' },
        page_size: 100,
        start_cursor: cursor,
      });
      for (const db of resp.results) {
        if (db.object !== 'database') continue;
        out.push({
          id: db.id,
          title: pickTitle(db),
          icon: pickIcon(db),
          url: db.url,
        });
      }
      cursor = resp.has_more ? resp.next_cursor : undefined;
    } while (cursor);
    return NextResponse.json({ databases: out });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error', code: err?.code },
      { status: 500 },
    );
  }
}
