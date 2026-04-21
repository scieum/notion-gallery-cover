import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';
import { DEFAULT_FONT_KEY, FONT_REGISTRY, loadFontByKey } from '@/lib/fonts';
import type { CoverParams, PatternName } from '@/lib/types';

// Node runtime so we can use wawoff2 (loads a wasm decoder for WOFF2 fonts).
export const runtime = 'nodejs';

// Only 1..10 are valid preset keys — see public/covers/{n}.png.
const BG_IMAGE_PRESETS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
const bgImageDataCache = new Map<string, string>();
function bgImageDataUri(key: string): string | null {
  if (!BG_IMAGE_PRESETS.has(key)) return null;
  const cached = bgImageDataCache.get(key);
  if (cached) return cached;
  try {
    const buf = readFileSync(path.join(process.cwd(), 'public', 'covers', `${key}.png`));
    const uri = `data:image/png;base64,${buf.toString('base64')}`;
    bgImageDataCache.set(key, uri);
    return uri;
  } catch {
    return null;
  }
}

function parse(req: NextRequest): CoverParams {
  const q = req.nextUrl.searchParams;
  const num = (k: string) => {
    const v = q.get(k);
    return v ? Number(v) : undefined;
  };
  return {
    name: q.get('name') ?? 'Untitled',
    subtitle: q.get('subtitle') ?? undefined,
    caption: q.get('caption') ?? undefined,
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
    font: q.get('font') ?? undefined,
    letterSpacing: num('letterSpacing'),
    lineHeight: num('lineHeight'),
    italic: q.get('italic') === 'true' ? true : undefined,
    weight: num('weight'),
    bgImage: q.get('bgImage') ?? undefined,
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

// Estimate per-character width at a given font size. CJK glyphs are ~1em wide,
// Latin averages ~0.55em. Used to shrink font sizes so long titles never clip.
function estimateTextWidth(text: string, fontSize: number, letterSpacingEm: number): number {
  let units = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const wide =
      (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
      (code >= 0x2e80 && code <= 0x9fff) || // CJK Unified, Radicals, Hiragana, Katakana
      (code >= 0xa960 && code <= 0xa97f) || // Hangul Jamo Extended-A
      (code >= 0xac00 && code <= 0xd7ff) || // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility
      (code >= 0xff00 && code <= 0xffef);   // Halfwidth/Fullwidth
    units += wide ? 1 : 0.55;
  }
  return units * fontSize + Math.max(0, text.length - 1) * letterSpacingEm * fontSize;
}

export async function GET(req: NextRequest) {
  const p = parse(req);
  const width = p.w ?? 1500;
  const height = p.h ?? 600;
  const fg = p.fg ?? '#ffffff';
  const size = p.size ?? 96;
  const fontKey = p.font && FONT_REGISTRY[p.font] ? p.font : DEFAULT_FONT_KEY;
  const fontFamily = FONT_REGISTRY[fontKey].family;
  const fonts = await loadFontByKey(fontKey);

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

  // Title stack — 대제목 / 중제목 / 소제목. Empty slots are filtered.
  const subSize = Math.round(size * 0.55);
  const capSize = Math.round(size * 0.35);
  const stackGap = Math.round(size * 0.18);
  const baseWeight = p.weight ?? 800;
  const subWeight = Math.max(400, baseWeight - 100);
  const capWeight = Math.max(400, baseWeight - 300);
  const lineHeight = p.lineHeight ?? 1.1;
  const letterSpacingEm = p.letterSpacing ?? -0.02;
  const letterSpacing = `${letterSpacingEm}em`;
  const fontStyle = p.italic ? 'italic' : 'normal';
  const lines: Array<{ text: string; fontSize: number; fontWeight: number }> = [];
  if (p.name) lines.push({ text: p.name, fontSize: size, fontWeight: baseWeight });
  if (p.subtitle) lines.push({ text: p.subtitle, fontSize: subSize, fontWeight: subWeight });
  if (p.caption) lines.push({ text: p.caption, fontSize: capSize, fontWeight: capWeight });

  function TitleStack({ maxWidthPx }: { maxWidthPx: number }) {
    // 6% safety buffer — our per-glyph estimate is approximate (decorative
    // Korean fonts and bold weights run slightly wider than 1.0em per CJK
    // glyph), so we shrink a touch more than the naive fit demands.
    const safeWidthPx = maxWidthPx * 0.94;
    let widthScale = 1;
    for (const l of lines) {
      const est = estimateTextWidth(l.text, l.fontSize, letterSpacingEm);
      if (est > safeWidthPx) widthScale = Math.min(widthScale, safeWidthPx / est);
    }
    // Also guarantee the vertical stack fits inside the available height.
    const availableHeight = height - padding * 2;
    const stackHeightAt = (s: number) =>
      lines.reduce((acc, l) => acc + l.fontSize * s * lineHeight, 0) +
      Math.max(0, lines.length - 1) * stackGap;
    let heightScale = 1;
    if (stackHeightAt(1) > availableHeight) {
      heightScale = availableHeight / stackHeightAt(1);
    }
    const scale = Math.min(widthScale, heightScale);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Math.round(stackGap * scale),
          maxWidth: maxWidthPx,
        }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: Math.max(12, Math.floor(l.fontSize * scale)),
              fontWeight: l.fontWeight,
              lineHeight,
              letterSpacing,
              fontStyle,
              textAlign: 'center',
              display: 'flex',
              color: fg,
              whiteSpace: 'nowrap',
            }}
          >
            {l.text}
          </div>
        ))}
      </div>
    );
  }

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
          <TitleStack
            maxWidthPx={width - padding * 2 - emojiSize - Math.round(padding * 0.6)}
          />
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
          <TitleStack maxWidthPx={width - padding * 2} />
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
        <TitleStack maxWidthPx={width - padding * 2} />
      </div>
    );
  }

  const bgImageUri = p.style === 'image' && p.bgImage ? bgImageDataUri(p.bgImage) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: bg,
          fontFamily,
        }}
      >
        {bgImageUri && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImageUri}
            alt=""
            width={width}
            height={height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <div style={{ position: 'relative', display: 'flex', width: '100%', height: '100%' }}>
          {body}
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: fonts as any,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
