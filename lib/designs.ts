import type { Design } from './types';

// Notion palette (approximate)
const notionPalette: Array<{ id: string; label: string; bg: string; fg: string }> = [
  { id: 'gray', label: 'Gray', bg: '#787774', fg: '#ffffff' },
  { id: 'brown', label: 'Brown', bg: '#9F6B53', fg: '#ffffff' },
  { id: 'orange', label: 'Orange', bg: '#D9730D', fg: '#ffffff' },
  { id: 'yellow', label: 'Yellow', bg: '#CB912F', fg: '#ffffff' },
  { id: 'green', label: 'Green', bg: '#448361', fg: '#ffffff' },
  { id: 'blue', label: 'Blue', bg: '#337EA9', fg: '#ffffff' },
  { id: 'purple', label: 'Purple', bg: '#9065B0', fg: '#ffffff' },
  { id: 'pink', label: 'Pink', bg: '#C14C8A', fg: '#ffffff' },
  { id: 'red', label: 'Red', bg: '#D44C47', fg: '#ffffff' },
  { id: 'black', label: 'Black', bg: '#1F1F1F', fg: '#ffffff' },
  { id: 'paper', label: 'Paper', bg: '#F7F6F3', fg: '#1F1F1F' },
];

const gradients: Array<{ id: string; label: string; bg: string; bg2: string; angle: number; fg: string }> = [
  { id: 'sunset', label: 'Sunset', bg: '#ff8a3c', bg2: '#ff3d7f', angle: 135, fg: '#ffffff' },
  { id: 'ocean', label: 'Ocean', bg: '#2c6ef2', bg2: '#00c2cb', angle: 135, fg: '#ffffff' },
  { id: 'forest', label: 'Forest', bg: '#2d8659', bg2: '#6bb39c', angle: 135, fg: '#ffffff' },
  { id: 'lavender', label: 'Lavender', bg: '#8a5cf6', bg2: '#f472b6', angle: 135, fg: '#ffffff' },
  { id: 'dawn', label: 'Dawn', bg: '#f8b4b4', bg2: '#fde68a', angle: 135, fg: '#1f1f1f' },
  { id: 'mono', label: 'Mono', bg: '#2b2b2b', bg2: '#111111', angle: 135, fg: '#ffffff' },
  { id: 'mint', label: 'Mint', bg: '#a7f3d0', bg2: '#bae6fd', angle: 135, fg: '#0f172a' },
  { id: 'plum', label: 'Plum', bg: '#4c1d95', bg2: '#be185d', angle: 135, fg: '#ffffff' },
];

const patterns: Array<{ pattern: 'dots' | 'lines' | 'grid' | 'waves' | 'circles'; label: string }> = [
  { pattern: 'dots', label: 'Dots' },
  { pattern: 'lines', label: 'Lines' },
  { pattern: 'grid', label: 'Grid' },
  { pattern: 'waves', label: 'Waves' },
  { pattern: 'circles', label: 'Circles' },
];

const patternBases: Array<{ id: string; bg: string; fg: string }> = [
  { id: 'paper', bg: '#F7F6F3', fg: '#1F1F1F' },
  { id: 'ink', bg: '#1F1F1F', fg: '#F7F6F3' },
  { id: 'sky', bg: '#DCE7F5', fg: '#1E3A8A' },
];

const emojiBases: Array<{ id: string; bg: string; fg: string }> = [
  { id: 'peach', bg: '#FFE4D6', fg: '#1F1F1F' },
  { id: 'mint', bg: '#D6F5E4', fg: '#1F1F1F' },
  { id: 'sky', bg: '#DCE7F5', fg: '#1F1F1F' },
  { id: 'lilac', bg: '#EADCF5', fg: '#1F1F1F' },
  { id: 'lemon', bg: '#FFF4C2', fg: '#1F1F1F' },
];

// Curated background images — served from public/covers/{key}.png, inlined by
// the cover route as base64 data URIs so satori can rasterize them.
const imagePresets: Array<{ key: string; label: string; fg: string; bg: string }> = [
  { key: '1', label: 'Ember', fg: '#ffffff', bg: '#1F1F1F' },
  { key: '2', label: 'Haze', fg: '#ffffff', bg: '#6f7bf0' },
  { key: '3', label: 'Mint Loop', fg: '#1F1F1F', bg: '#7be0b6' },
  { key: '4', label: 'Chalk', fg: '#ffffff', bg: '#1F1F1F' },
  { key: '5', label: 'Drift', fg: '#1F1F1F', bg: '#eaeef2' },
  { key: '6', label: 'Studio', fg: '#1F1F1F', bg: '#f6f2ea' },
  { key: '7', label: 'Sugar', fg: '#1F1F1F', bg: '#fbf2d9' },
  { key: '8', label: 'Cobalt', fg: '#ffffff', bg: '#4a5cf2' },
  { key: '9', label: 'Halo', fg: '#1F1F1F', bg: '#f3f1ff' },
  { key: '10', label: 'Echo', fg: '#1F1F1F', bg: '#ffffff' },
];

export const BUILTIN_DESIGNS: Design[] = [
  // --- Image presets (rendered first in the gallery) ---
  ...imagePresets.map<Design>((p) => ({
    id: `image-${p.key}`,
    label: `Image · ${p.label}`,
    category: 'image',
    params: {
      style: 'image',
      bgImage: p.key,
      bg: p.bg,
      fg: p.fg,
      align: 'left',
      size: 96,
    },
  })),


  // --- Solid ---
  ...notionPalette.map<Design>((c) => ({
    id: `solid-${c.id}`,
    label: `Solid · ${c.label}`,
    category: 'solid',
    params: { style: 'solid', bg: c.bg, fg: c.fg, align: 'left', size: 96 },
  })),

  // --- Gradient ---
  ...gradients.map<Design>((g) => ({
    id: `gradient-${g.id}`,
    label: `Gradient · ${g.label}`,
    category: 'gradient',
    params: { style: 'gradient', bg: g.bg, bg2: g.bg2, angle: g.angle, fg: g.fg, align: 'left', size: 96 },
  })),

  // --- Pattern --- (pattern × base)
  ...patterns.flatMap<Design>((p) =>
    patternBases.map<Design>((b) => ({
      id: `pattern-${p.pattern}-${b.id}`,
      label: `Pattern · ${p.label} · ${b.id}`,
      category: 'pattern',
      params: { style: 'pattern', pattern: p.pattern, bg: b.bg, fg: b.fg, align: 'left', size: 96 },
    })),
  ),

  // --- Emoji ---
  ...emojiBases.flatMap<Design>((b) => [
    {
      id: `emoji-side-${b.id}`,
      label: `Emoji · Side · ${b.id}`,
      category: 'emoji',
      params: { style: 'emoji', layout: 'side', emoji: '✨', bg: b.bg, fg: b.fg, size: 88 },
    },
    {
      id: `emoji-stack-${b.id}`,
      label: `Emoji · Stack · ${b.id}`,
      category: 'emoji',
      params: { style: 'emoji', layout: 'stack', emoji: '🌿', bg: b.bg, fg: b.fg, size: 72 },
    },
  ]),
];

export function findDesign(id: string, customs: Design[] = []): Design | undefined {
  return BUILTIN_DESIGNS.find((d) => d.id === id) ?? customs.find((d) => d.id === id);
}
