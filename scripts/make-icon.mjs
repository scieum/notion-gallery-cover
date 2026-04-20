// One-shot script: render the Notion integration icon as 512x512 PNG.
// Uses @resvg/resvg-wasm (already a transitive dep of @vercel/og) so no
// native bindings are needed.
// Usage: node scripts/make-icon.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

const __dirname = dirname(fileURLToPath(import.meta.url));

const wasmPath = resolve(__dirname, '..', 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm');
await initWasm(readFileSync(wasmPath));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8a3c"/>
      <stop offset="100%" stop-color="#ff3d7f"/>
    </linearGradient>
    <linearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2c6ef2"/>
      <stop offset="100%" stop-color="#00c2cb"/>
    </linearGradient>
    <clipPath id="pageClip">
      <rect x="96" y="92" width="320" height="332" rx="28" ry="28"/>
    </clipPath>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="112" ry="112" fill="url(#bg)"/>

  <g filter="url(#shadow)">
    <rect x="96" y="92" width="320" height="332" rx="28" ry="28" fill="#ffffff"/>
    <g clip-path="url(#pageClip)">
      <rect x="96" y="92" width="320" height="136" fill="url(#cover)"/>
    </g>
    <rect x="128" y="260" width="220" height="22" rx="11" fill="#1F1F1F"/>
    <rect x="128" y="304" width="256" height="12" rx="6" fill="#787774" opacity="0.45"/>
    <rect x="128" y="328" width="200" height="12" rx="6" fill="#787774" opacity="0.45"/>
    <rect x="128" y="352" width="232" height="12" rx="6" fill="#787774" opacity="0.45"/>
  </g>
</svg>`;

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } });
const png = resvg.render().asPng();

const outDir = resolve(__dirname, '..', 'public');
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, 'integration-icon.png');
writeFileSync(outPath, png);

console.log('wrote', outPath, '(' + png.length + ' bytes)');
