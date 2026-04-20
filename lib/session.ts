import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'ngc_token';
const WS_COOKIE = 'ngc_ws';

export interface SessionInfo {
  token: string;
  workspaceName?: string;
  workspaceIcon?: string;
  botId?: string;
}

export async function readSession(): Promise<SessionInfo | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const wsRaw = c.get(WS_COOKIE)?.value;
  let ws: Partial<SessionInfo> = {};
  if (wsRaw) {
    try {
      ws = JSON.parse(wsRaw);
    } catch {
      /* ignore */
    }
  }
  return {
    token,
    workspaceName: ws.workspaceName,
    workspaceIcon: ws.workspaceIcon,
    botId: ws.botId,
  };
}

export async function writeSession(info: SessionInfo, maxAgeSeconds = 60 * 60 * 24 * 30) {
  const c = await cookies();
  const common = {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
  c.set(COOKIE_NAME, info.token, common);
  const { token, ...rest } = info;
  c.set(WS_COOKIE, JSON.stringify(rest), { ...common, httpOnly: false });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
  c.delete(WS_COOKIE);
}

export function readTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}
