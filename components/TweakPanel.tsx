'use client';

import { FONT_OPTIONS } from '@/lib/font-registry';
import type { CoverParams } from '@/lib/types';

/** Same as CoverParams sans `name`, which the apply step always injects. */
type DesignParams = Omit<CoverParams, 'name'>;

interface Props {
  /** Effective params (design defaults merged with current overrides). */
  params: DesignParams | null;
  /** Patch to merge into the override layer. */
  onChange: (patch: Partial<CoverParams>) => void;
  /** Wipe overrides back to the underlying design's defaults. */
  onReset: () => void;
}

const SIZE_MIN = 48;
const SIZE_MAX = 220;

export default function TweakPanel({ params, onChange, onReset }: Props) {
  if (!params) {
    return (
      <div className="ngc-soft p-6">
        <div className="ngc-caption">디자인을 먼저 선택하면 여기서 조정할 수 있어요.</div>
      </div>
    );
  }

  const style = params.style;
  const size = params.size ?? 96;
  const fg = params.fg ?? '#ffffff';
  const bg = params.bg ?? '#1F1F1F';
  const bg2 = params.bg2 ?? bg;
  const angle = params.angle ?? 135;
  const fontKey = params.font ?? 'pretendard';
  const letterSpacing = params.letterSpacing ?? -0.02;
  const lineHeight = params.lineHeight ?? 1.1;
  const italic = params.italic ?? false;
  const weight = params.weight ?? 800;

  return (
    <div className="ngc-soft p-6 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="ngc-h2 text-[15px]">조정</div>
          <div className="ngc-caption mt-0.5">선택한 디자인 위에 덮어 씁니다.</div>
        </div>
        <button type="button" onClick={onReset} className="ngc-btn-ghost text-[12px]">
          되돌리기
        </button>
      </div>

      <Field label="폰트">
        <select
          className="ngc-input"
          value={fontKey}
          onChange={(e) => onChange({ font: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={`글자 크기 · ${size}px`}>
        <input
          type="range"
          min={SIZE_MIN}
          max={SIZE_MAX}
          step={2}
          value={size}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="w-full"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={`자간 · ${letterSpacing.toFixed(2)}em`}>
          <input
            type="range"
            min={-0.1}
            max={0.2}
            step={0.01}
            value={letterSpacing}
            onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Field label={`행간 · ${lineHeight.toFixed(2)}`}>
          <input
            type="range"
            min={0.9}
            max={2}
            step={0.05}
            value={lineHeight}
            onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
      </div>

      <Field label="굵기 · 기울임">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { v: 400, label: '보통' },
              { v: 600, label: '진하게' },
              { v: 800, label: '매우' },
              { v: 900, label: '블랙' },
            ] as const
          ).map((w) => (
            <button
              key={w.v}
              type="button"
              onClick={() => onChange({ weight: w.v })}
              className={
                'text-[12px] px-2.5 py-1 rounded-full font-medium ' +
                (weight === w.v
                  ? 'bg-[var(--ngc-accent)] text-white'
                  : 'bg-white text-[var(--ngc-fg)] border border-[var(--ngc-border)]')
              }
              style={{ fontWeight: w.v }}
            >
              {w.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ italic: !italic })}
            className={
              'text-[12px] px-2.5 py-1 rounded-full font-medium italic ' +
              (italic
                ? 'bg-[var(--ngc-accent)] text-white'
                : 'bg-white text-[var(--ngc-fg)] border border-[var(--ngc-border)]')
            }
          >
            기울임
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <ColorField label="글자 색" value={fg} onChange={(v) => onChange({ fg: v })} />
        <ColorField label="배경색" value={bg} onChange={(v) => onChange({ bg: v })} />
      </div>

      {style === 'gradient' && (
        <div className="grid grid-cols-2 gap-4">
          <ColorField label="배경색 2" value={bg2} onChange={(v) => onChange({ bg2: v })} />
          <Field label={`각도 · ${angle}°`}>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={angle}
              onChange={(e) => onChange({ angle: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
        </div>
      )}

      {style === 'emoji' && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="이모지">
            <input
              className="ngc-input"
              maxLength={4}
              value={params.emoji ?? '✨'}
              onChange={(e) => onChange({ emoji: e.target.value })}
            />
          </Field>
          <Field label="레이아웃">
            <div className="flex gap-2">
              {(['side', 'stack'] as const).map((l) => {
                const active = (params.layout ?? 'side') === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onChange({ layout: l })}
                    className={
                      'text-[13px] px-3 py-1.5 rounded-full font-medium ' +
                      (active
                        ? 'bg-[var(--ngc-accent)] text-white'
                        : 'bg-white text-[var(--ngc-fg)]')
                    }
                  >
                    {l === 'side' ? '나란히' : '위·아래'}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="ngc-caption block mb-2">{label}</label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-md border border-[var(--ngc-border)] cursor-pointer shrink-0 bg-white"
          style={{ padding: 0 }}
        />
        <input
          className="ngc-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </Field>
  );
}
