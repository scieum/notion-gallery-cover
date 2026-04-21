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

/**
 * GET /api/notion/databases/<id>
 * Returns { database: { id, title, icon, url } } if the OAuth integration
 * has access to that database. Used to manually add a database by ID when
 * Notion's search index hasn't picked it up.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = readTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const notion = new Client({ auth: token });
    const db: any = await notion.databases.retrieve({ database_id: id });
    return NextResponse.json({
      database: {
        id: db.id,
        title: pickTitle(db),
        icon: pickIcon(db),
        url: db.url,
      },
    });
  } catch (err: any) {
    const code = err?.code === 'object_not_found' || err?.status === 404 ? 404 : 500;
    const message =
      code === 404
        ? '해당 ID의 데이터베이스를 찾을 수 없거나, OAuth 통합에 권한이 없습니다.'
        : err?.message ?? 'Unknown error';
    return NextResponse.json({ error: message, code: err?.code }, { status: code });
  }
}
