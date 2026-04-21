'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { CoverStyle, Design, PatternName } from '@/lib/types';
import { DEFAULT_FONT_KEY, FONT_OPTIONS, FONT_REGISTRY } from '@/lib/font-registry';
import CoverPreview from './CoverPreview';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (d: Design) => void;
  sampleName: string;
  /** width/height of the cover output. Default 2.5 (page cover 1500x600). */
  previewRatio?: number;
}

const PATTERNS: PatternName[] = ['dots', 'lines', 'grid', 'waves', 'circles'];

export default function DesignEditor({ open, onClose, onSave, sampleName, previewRatio }: Props) {
  const [label, setLabel] = useState('내 디자인');
  const [style, setStyle] = useState<CoverStyle>('gradient');
  const [bg, setBg] = useState('#2c6ef2');
  const [bg2, setBg2] = useState('#00c2cb');
  const [angle, setAngle] = useState(135);
  const [fg, setFg] = useState('#ffffff');
  const [pattern, setPattern] = useState<PatternName>('dots');
  const [emoji, setEmoji] = useState('✨');
  const [layout, setLayout] = useState<'side' | 'stack'>('side');
  const [font, setFont] = useState<string>(DEFAULT_FONT_KEY);

  if (!open) return null;

  const tempDesign: Design = {
    id: 'preview',
    label,
    category: 'custom',
    params: {
      style,
      bg,
      bg2: style === 'gradient' ? bg2 : undefined,
      angle: style === 'gradient' ? angle : undefined,
      fg,
      pattern: style === 'pattern' ? pattern : undefined,
      emoji: style === 'emoji' ? emoji : undefined,
      layout: style === 'emoji' ? layout : undefined,
      align: 'left',
      size: style === 'emoji' && layout === 'stack' ? 72 : 96,
      font,
    },
  };

  function save() {
    const d: Design = {
      ...tempDesign,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    onSave(d);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="ngc-card w-full max-w-[760px] max-h-[90vh] overflow-auto"
        style={{ boxShadow: 'var(--ngc-shadow-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--ngc-border)]">
          <div className="ngc-h2">커스텀 디자인 만들기</div>
          <button onClick={onClose} className="ngc-btn-ghost" aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <CoverPreview design={tempDesign} name={sampleName} ratio={previewRatio} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="ngc-caption block mb-1">이름</label>
              <input className="ngc-input" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div>
              <label className="ngc-caption block mb-1">폰트</label>
              <select
                className="ngc-input"
                value={font}
                onChange={(e) => setFont(e.target.value)}
                style={{ fontFamily: `"${FONT_REGISTRY[font]?.family ?? 'Pretendard'}"` }}
              >
                {FONT_OPTIONS.map((f) => (
                  <option
                    key={f.key}
                    value={f.key}
                    style={{ fontFamily: `"${f.family}"`, fontSize: 16 }}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="ngc-caption block mb-2">스타일</label>
            <div className="flex gap-2 flex-wrap">
              {(['solid', 'gradient', 'pattern', 'emoji'] as CoverStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={
                    'text-[13px] px-3 py-1.5 rounded-full font-medium ' +
                    (style === s
                      ? 'bg-[var(--ngc-accent)] text-white'
                      : 'bg-black/5 text-[var(--ngc-fg)]')
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField label="배경색" value={bg} onChange={setBg} />
            {style === 'gradient' && (
              <>
                <ColorField label="배경색 2" value={bg2} onChange={setBg2} />
                <div>
                  <label className="ngc-caption block mb-1">각도 ({angle}°)</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}
            <ColorField label="텍스트 색" value={fg} onChange={setFg} />
          </div>

          {style === 'pattern' && (
            <div>
              <label className="ngc-caption block mb-2">패턴</label>
              <div className="flex gap-2 flex-wrap">
                {PATTERNS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPattern(p)}
                    className={
                      'text-[13px] px-3 py-1.5 rounded-full font-medium ' +
                      (pattern === p
                        ? 'bg-[var(--ngc-accent)] text-white'
                        : 'bg-black/5 text-[var(--ngc-fg)]')
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {style === 'emoji' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="ngc-caption block mb-1">이모지</label>
                <input
                  className="ngc-input"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div>
                <label className="ngc-caption block mb-2">레이아웃</label>
                <div className="flex gap-2">
                  {(['side', 'stack'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLayout(l)}
                      className={
                        'text-[13px] px-3 py-1.5 rounded-full font-medium ' +
                        (layout === l
                          ? 'bg-[var(--ngc-accent)] text-white'
                          : 'bg-black/5 text-[var(--ngc-fg)]')
                      }
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-[var(--ngc-border)]">
          <button onClick={onClose} className="ngc-btn-ghost">취소</button>
          <button onClick={save} className="ngc-btn-primary">저장</button>
        </div>
      </div>
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
    <div>
      <label className="ngc-caption block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-md border border-[var(--ngc-border)] cursor-pointer"
          style={{ padding: 0, background: 'transparent' }}
        />
        <input
          className="ngc-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
