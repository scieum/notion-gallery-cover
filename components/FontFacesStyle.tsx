'use client';

import { FONT_FACE_CSS, FONT_OPTIONS } from '@/lib/font-registry';

/** Inlines @font-face rules so the picker can render each option in its own
 * typeface. The hidden probes force the browser to actually fetch each font —
 * without a rendered node, browsers skip lazy @font-face sources. */
export default function FontFacesStyle() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONT_FACE_CSS }} />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        {FONT_OPTIONS.map((f) => (
          <span key={f.key} style={{ fontFamily: `"${f.family}"` }}>
            {f.label}
          </span>
        ))}
      </div>
    </>
  );
}
