// Server-only: fetches the binary for each font weight, decompresses WOFF2
// when needed (via wawoff2's wasm decoder), and caches the result. Pure
// metadata lives in lib/font-registry.ts so client components can read it
// without dragging Node-only modules into the browser bundle.

import { DEFAULT_FONT_KEY, FONT_REGISTRY } from './font-registry';

export { DEFAULT_FONT_KEY, FONT_REGISTRY };

export interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: number;
  style: 'normal';
}

const cache = new Map<string, Promise<SatoriFont[]>>();

/**
 * Detect WOFF2 by magic bytes ("wOF2" = 0x77 0x4F 0x46 0x32). Anything else
 * we hand to satori as-is — TTF/OTF go through directly, WOFF is unwrapped
 * by opentype.js inside satori.
 */
function isWoff2(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 4) return false;
  const view = new Uint8Array(buf, 0, 4);
  return view[0] === 0x77 && view[1] === 0x4f && view[2] === 0x46 && view[3] === 0x32;
}

async function fetchAndDecompress(url: string): Promise<ArrayBuffer> {
  const buf = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Font fetch failed (${r.status}): ${url}`);
    return r.arrayBuffer();
  });
  if (!isWoff2(buf)) return buf;
  // Lazy-load wawoff2 only when we hit a WOFF2. Triggers wasm initialization
  // which we want to avoid on cold starts that just serve TTF/OTF fonts.
  const mod: any = await import('wawoff2');
  const wawoff2 = mod.default ?? mod;
  const decompressed: Uint8Array = await wawoff2.decompress(new Uint8Array(buf));
  // Copy into a fresh ArrayBuffer to satisfy the satori type (and to detach
  // from any underlying SharedArrayBuffer the wasm runtime may have used).
  const out = new ArrayBuffer(decompressed.byteLength);
  new Uint8Array(out).set(decompressed);
  return out;
}

/**
 * Load every weight registered for `key`, returning the satori-ready array.
 * Result is cached at module scope for the lifetime of the serverless
 * instance, so subsequent requests are free.
 */
export function loadFontByKey(key: string): Promise<SatoriFont[]> {
  const def = FONT_REGISTRY[key] ?? FONT_REGISTRY[DEFAULT_FONT_KEY];
  const cacheKey = FONT_REGISTRY[key] ? key : DEFAULT_FONT_KEY;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  const p = (async () => {
    const entries = Object.entries(def.weights);
    const datas = await Promise.all(entries.map(([, url]) => fetchAndDecompress(url)));
    return entries.map(([wStr], i) => ({
      name: def.family,
      data: datas[i],
      weight: Number(wStr),
      style: 'normal' as const,
    }));
  })();
  cache.set(cacheKey, p);
  return p;
}

/** Backwards-compatible: returns Pretendard {regular, bold, extrabold}. */
export async function loadFonts() {
  const fonts = await loadFontByKey('pretendard');
  const byWeight = (w: number) => fonts.find((f) => f.weight === w)!.data;
  return {
    regular: byWeight(400),
    bold: byWeight(700),
    extrabold: byWeight(800),
  };
}
