import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';
import { loadFonts } from '@/lib/fonts';
import type { CoverParams, PatternName } from '@/lib/types';

export const runtime = 'edge';

function parse(req: NextRequest): CoverParams {
  const q = req.nextUrl.searchParams;
  const num = (k: string) => {
    const v = q.get(k);
    return v ? Number(v) : undefined;
  };
  return {
    name: q.get('name') ?? 'Untitled',
    style: (q.get('style') as CoverParams['style']) ?? 'solid',
    bg: q.get('bg') ?? undefined,
    bg2: q.get('bg2') ?? undefined,
    angle: num('angle'),
    fg: q.get('fg') ?? undefined,
    align: (q.get('align') as CoverParams['align']) ?? undefined,
    size: num('size'),
    pattern: (q.get('pattern') as PatternName) ?? undefined,
    emoji: q.get('emoji') ?? undefined,
    layout: (q.get('layout') as CoverParams['layout']) ?? undefined,
    w: num('w'),
    h: num('h'),
  };
}

function background(p: CoverParams): string {
  const bg = p.bg ?? '#1F1F1F';
  if (p.style === 'gradient') {
    const bg2 = p.bg2 ?? bg;
    const angle = p.angle ?? 135;
    return `linear-gradient(${angle}deg, ${bg} 0%, ${bg2} 100%)`;
  }
  return bg;
}

function patternSvgDataUri(pattern: PatternName, fg: string): string {
  // Subtle overlay pattern encoded as SVG data URI (used as background-image).
  const c = encodeURIComponent(fg);
  switch (pattern) {
    case 'dots':
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='2' cy='2' r='2' fill='${c}' fill-opacity='0.18'/></svg>`;
    case 'lines':
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M-10 30 L30 -10 M0 40 L40 0 M10 50 L50 10' stroke='${c}' stroke-opacity='0.18' stroke-width='2'/></svg>`;
    case 'grid':
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><path d='M0 0H48V48' fill='none' stroke='${c}' stroke-opacity='0.16' stroke-width='1.5'/></svg>`;
    case 'waves':
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'><path d='M0 20 Q20 0 40 20 T80 20' fill='none' stroke='${c}' stroke-opacity='0.22' stroke-width='2'/></svg>`;
    case 'circles':
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><circle cx='40' cy='40' r='30' fill='none' stroke='${c}' stroke-opacity='0.16' stroke-width='2'/><circle cx='40' cy='40' r='14' fill='none' stroke='${c}' stroke-opacity='0.16' stroke-width='2'/></svg>`;
  }
}

export async function GET(req: NextRequest) {
  const p = parse(req);
  const width = p.w ?? 1500;
  const height = p.h ?? 600;
  const fg = p.fg ?? '#ffffff';
  const size = p.size ?? 96;
  const fonts = await loadFonts();

  const bg = background(p);
  const overlayStyle: Record<string, string> =
    p.style === 'pattern' && p.pattern
      ? {
          backgroundImage: `url("${patternSvgDataUri(p.pattern, fg)}")`,
          backgroundRepeat: 'repeat',
        }
      : {};

  // Padding scales with the smaller dimension so 1200x900 (gallery) and
  // 1500x600 (page banner) both look balanced.
  const padding = Math.round(Math.min(width, height) * 0.12);

  let body: React.ReactElement;

  if (p.style === 'emoji') {
    const emoji = p.emoji ?? '✨';
    const layout = p.layout ?? 'side';
    // Scale the emoji glyph to the available height so it doesn't dominate
    // square-ish gallery covers.
    const emojiSize = layout === 'side'
      ? Math.round(Math.min(height * 0.55, width * 0.32))
      : Math.round(height * 0.4);

    if (layout === 'side') {
      body = (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding,
            gap: Math.round(padding * 0.6),
          }}
        >
          <div style={{ fontSize: emojiSize, lineHeight: 1, display: 'flex' }}>{emoji}</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: fg,
              fontSize: size,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: width - padding * 2 - emojiSize - Math.round(padding * 0.6),
            }}
          >
            {p.name}
          </div>
        </div>
      );
    } else {
      body = (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding,
            gap: Math.round(padding * 0.3),
          }}
        >
          <div style={{ fontSize: emojiSize, lineHeight: 1, display: 'flex' }}>{emoji}</div>
          <div
            style={{
              color: fg,
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {p.name}
          </div>
        </div>
      );
    }
  } else {
    body = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding,
          justifyContent: 'center',
          alignItems: 'center',
          color: fg,
          ...overlayStyle,
        }}
      >
        <div
          style={{
            fontSize: size,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: width - padding * 2,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          {p.name}
        </div>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: bg,
          fontFamily: 'Pretendard',
        }}
      >
        {body}
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: 'Pretendard', data: fonts.regular, style: 'normal', weight: 400 },
        { name: 'Pretendard', data: fonts.bold, style: 'normal', weight: 700 },
        { name: 'Pretendard', data: fonts.extrabold, style: 'normal', weight: 800 },
      ],
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
