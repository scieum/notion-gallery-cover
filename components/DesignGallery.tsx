'use client';

import { useMemo, useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { BUILTIN_DESIGNS } from '@/lib/designs';
import type { Design, DesignCategory } from '@/lib/types';
import CoverPreview from './CoverPreview';

interface Props {
  customs: Design[];
  selectedId: string | null;
  sampleName: string;
  /** width/height of the cover output. Default 2.5 (page cover 1500x600). */
  previewRatio?: number;
  onSelect: (d: Design) => void;
  onAddCustomClick: () => void;
  onDeleteCustom: (id: string) => void;
}

const TABS: { id: DesignCategory | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'image', label: '이미지' },
  { id: 'solid', label: '단색' },
  { id: 'gradient', label: '그라데이션' },
  { id: 'pattern', label: '패턴' },
  { id: 'emoji', label: '이모지' },
  { id: 'custom', label: '커스텀' },
];

export default function DesignGallery({
  customs,
  selectedId,
  sampleName,
  previewRatio,
  onSelect,
  onAddCustomClick,
  onDeleteCustom,
}: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all');

  const items = useMemo(() => {
    const all = [...BUILTIN_DESIGNS, ...customs];
    if (tab === 'all') return all;
    if (tab === 'custom') return customs;
    return all.filter((d) => d.category === tab);
  }, [tab, customs]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex gap-1 flex-wrap min-w-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                'text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ' +
                (tab === t.id
                  ? 'bg-[var(--ngc-accent)] text-white'
                  : 'hover:bg-black/5 text-[var(--ngc-fg-muted)]')
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={onAddCustomClick}
          className="ngc-btn-secondary inline-flex items-center gap-1.5 text-[13px] py-1.5 px-3 shrink-0 whitespace-nowrap"
        >
          <Plus size={14} /> 새 디자인
        </button>
      </div>

      {items.length === 0 && (
        <div className="ngc-card p-6 text-center">
          <div className="ngc-caption">
            {tab === 'custom' ? (
              <>
                저장된 커스텀 디자인이 없습니다. &quot;새 디자인&quot;으로 추가해보세요.
                <div className="mt-2">
                  <span className="ngc-badge">권장 사이즈</span>{' '}
                  갤러리 커버 1200×900px · 페이지 커버 1500×600px
                </div>
              </>
            ) : (
              '해당 카테고리에 디자인이 없습니다.'
            )}
          </div>
        </div>
      )}

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
      >
        {items.map((d) => {
          const isSelected = d.id === selectedId;
          return (
            <div key={d.id} className="relative group">
              <button
                onClick={() => onSelect(d)}
                className={
                  'block w-full text-left transition-shadow ' +
                  (isSelected ? 'ring-2 ring-[var(--ngc-accent)] rounded-[10px]' : '')
                }
                style={{ borderRadius: 10 }}
              >
                <CoverPreview design={d} name={sampleName} ratio={previewRatio} />
                <div className="mt-1.5 flex items-center justify-between gap-1.5">
                  <div className="text-[12px] font-medium truncate text-[var(--ngc-fg-muted)]">
                    {d.label}
                  </div>
                  {isSelected && <Check size={12} className="shrink-0" />}
                </div>
              </button>
              {d.category === 'custom' && (
                <button
                  type="button"
                  onClick={() => onDeleteCustom(d.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 backdrop-blur border border-[var(--ngc-border)] opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
