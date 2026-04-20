import type { CoverParams, Design } from './types';

export function buildCoverParams(design: Design, name: string): CoverParams {
  return { ...design.params, name, style: design.params.style ?? 'solid' };
}

export function coverSearchParams(params: CoverParams): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  return sp;
}

export function coverPath(params: CoverParams): string {
  return `/api/cover?${coverSearchParams(params).toString()}`;
}

export function absoluteCoverUrl(origin: string, params: CoverParams): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}${coverPath(params)}`;
}
