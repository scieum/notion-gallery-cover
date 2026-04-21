'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { FONT_OPTIONS, FONT_REGISTRY, DEFAULT_FONT_KEY } from '@/lib/font-registry';

interface Props {
  value: string;
  onChange: (key: string) => void;
}

/**
 * Searchable font picker that always opens DOWNWARD. Native <select> can
 * flip its menu upward when there's not enough space below the trigger;
 * we want a predictable downward expansion so the layout doesn't jump
 * when the user clicks near the bottom of the panel.
 *
 * Each option renders in its own font family so the user previews the
 * typeface before picking. Search filters by label or family name.
 */
export default function FontPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Reset search and scroll back to the top each time we open.
  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = 0;
      });
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FONT_OPTIONS;
    return FONT_OPTIONS.filter(
      (f) => f.label.toLowerCase().includes(q) || f.family.toLowerCase().includes(q),
    );
  }, [query]);

  const currentKey = FONT_REGISTRY[value] ? value : DEFAULT_FONT_KEY;
  const current = FONT_REGISTRY[currentKey];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="ngc-input w-full flex items-center justify-between gap-2 cursor-pointer text-left"
        style={{ fontFamily: `"${current.family}", Pretendard, sans-serif` }}
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown
          size={16}
          className={
            'shrink-0 text-[var(--ngc-fg-muted)] transition-transform ' +
            (open ? 'rotate-180' : '')
          }
        />
      </button>
      {open && (
        <div
          // Always positioned below the trigger — top:100% guarantees
          // downward expansion regardless of viewport space.
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 rounded-lg border border-[var(--ngc-border)] bg-white shadow-lg flex flex-col"
          style={{ maxHeight: 360 }}
          role="listbox"
        >
          <div className="p-2 border-b border-[var(--ngc-border)] relative shrink-0">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ngc-fg-muted)] pointer-events-none"
            />
            <input
              type="text"
              autoFocus
              placeholder="폰트 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-[13px] py-1.5 pl-7 pr-2 rounded-md border border-[var(--ngc-border)] bg-white outline-none focus:border-[var(--ngc-accent)]"
              autoComplete="off"
            />
          </div>
          <div ref={listRef} className="overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-3 ngc-caption">검색 결과 없음</div>
            )}
            {filtered.map((f) => {
              const active = f.key === currentKey;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(f.key);
                    setOpen(false);
                  }}
                  className={
                    'w-full text-left px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-black/5 ' +
                    (active ? 'bg-[var(--ngc-badge-bg)]' : '')
                  }
                  style={{ fontFamily: `"${f.family}", Pretendard, sans-serif`, fontSize: 15 }}
                >
                  <span className="truncate">{f.label}</span>
                  {active && (
                    <Check size={14} className="shrink-0 text-[var(--ngc-accent)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
