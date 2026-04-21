import type { CoverParams, Design } from './types';

export function buildCoverParams(design: Design, name: string): CoverParams {
  return { ...design.params, name, style: design.params.style ?? 'solid' };
}

export function coverSearchParams(params: CoverParams): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    // Skip empty / unset / explicit-false so the URL stays compact.
    if (v === undefined || v === null || v === '' || v === false) continue;
    sp.set(k, String(v));
  }
  return sp;
}

export function coverPath(params: CoverParams): string {
  // /cover.png is a rewrite to /api/cover (see next.config.mjs). The .png
  // suffix is what gets Notion's gallery card preview to render the image.
  return `/cover.png?${coverSearchParams(params).toString()}`;
}

export function absoluteCoverUrl(origin: string, params: CoverParams): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}${coverPath(params)}`;
}
