'use client';

import { useMemo } from 'react';
import type { CoverParams, Design } from '@/lib/types';
import { coverPath, coverSearchParams } from '@/lib/cover-url';

interface Props {
  design: Design;
  name: string;
  subtitle?: string;
  caption?: string;
  className?: string;
  ratio?: number; // width/height. default 2.5 (1500/600)
}

/** Lightweight server-rendered preview via <img src="/api/cover?..."> */
export default function CoverPreview({
  design,
  name,
  subtitle,
  caption,
  className,
  ratio = 2.5,
}: Props) {
  // Derive w/h from `ratio` so the rendered cover matches the container's
  // aspect exactly. Without this, design.params has no w/h and the cover
  // route falls back to 1500x600 (2.5) — making 4:3 gallery thumbnails
  // letterbox a wide image inside a tall container.
  const previewW = 1200;
  const previewH = Math.round(previewW / ratio);
  const params: CoverParams = useMemo(
    () => ({
      ...design.params,
      name,
      subtitle,
      caption,
      style: design.params.style ?? 'solid',
      w: previewW,
      h: previewH,
    }),
    [design, name, subtitle, caption, previewW, previewH],
  );
  const src = coverPath(params);
  const sp = coverSearchParams(params);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${ratio} / 1`,
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px solid var(--ngc-border)',
        background: 'var(--ngc-bg-warm)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={sp.toString()}
        src={src}
        alt={name}
        // contain (not cover) so the whole rendered cover stays visible —
        // sub-pixel aspect mismatches between container and image were
        // clipping characters at the right edge with `cover`.
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}
