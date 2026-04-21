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
  const params: CoverParams = useMemo(
    () => ({
      ...design.params,
      name,
      subtitle,
      caption,
      style: design.params.style ?? 'solid',
    }),
    [design, name, subtitle, caption],
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
