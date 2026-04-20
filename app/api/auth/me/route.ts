import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await readSession();
  if (!s) {
    return NextResponse.json({ authed: false });
  }
  return NextResponse.json({
    authed: true,
    workspaceName: s.workspaceName ?? null,
    workspaceIcon: s.workspaceIcon ?? null,
  });
}
