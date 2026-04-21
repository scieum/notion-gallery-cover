'use client';

import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import type { Design, NotionPageLite } from '@/lib/types';
import CoverPreview from './CoverPreview';

interface Props {
  pages: NotionPageLite[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  perPageDesign: Record<string, string | undefined>;
  onPickDesignForPage: (pageId: string, designId: string | null) => void;
  defaultDesign: Design | null;
  allDesigns: Design[];
  applying: boolean;
  results: Record<string, { ok: boolean; error?: string }>;
  /** width/height of the cover output. Default 2.5 (page cover 1500x600). */
  previewRatio?: number;
}

export default function PageList({
  pages,
  selected,
  onToggle,
  onToggleAll,
  perPageDesign,
  onPickDesignForPage,
  defaultDesign,
  allDesigns,
  applying,
  results,
  previewRatio,
}: Props) {
  const allChecked = pages.length > 0 && pages.every((p) => selected.has(p.id));
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="ngc-h2">페이지 ({pages.length})</div>
          <div className="ngc-caption mt-1">
            체크된 페이지에만 커버가 적용됩니다. 행별로 다른 디자인을 지정할 수 있습니다.
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-[13px] select-none cursor-pointer">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => onToggleAll(e.target.checked)}
          />
          전체 선택
        </label>
      </div>

      <div className="ngc-card overflow-hidden">
        <table className="w-full text-[14px] border-collapse">
          <thead className="ngc-section-warm">
            <tr className="text-left">
              <th className="py-2 px-3 w-[44px]"></th>
              <th className="py-2 px-3">이름</th>
              <th className="py-2 px-3 w-[220px]">프리뷰</th>
              <th className="py-2 px-3 w-[220px]">디자인</th>
              <th className="py-2 px-3 w-[120px]">상태</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => {
              const chosenId = perPageDesign[p.id] ?? defaultDesign?.id;
              const chosen =
                chosenId ? allDesigns.find((d) => d.id === chosenId) ?? defaultDesign : defaultDesign;
              const res = results[p.id];
              return (
                <tr key={p.id} className="border-t border-[var(--ngc-border)] align-middle">
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => onToggle(p.id)}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[260px]">{p.title}</span>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ngc-btn-ghost p-1"
                        aria-label="노션에서 열기"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    {p.currentCoverUrl && (
                      <div className="ngc-caption mt-0.5 inline-flex items-center gap-1">
                        <ImageIcon size={12} /> 기존 커버 있음
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {chosen ? (
                      <CoverPreview design={chosen} name={p.title} ratio={previewRatio} />
                    ) : (
                      <div className="ngc-caption">디자인 미지정</div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <select
                      className="w-full text-[13px] py-1.5 px-2 rounded-md border border-[var(--ngc-border)] bg-white"
                      value={perPageDesign[p.id] ?? ''}
                      onChange={(e) =>
                        onPickDesignForPage(p.id, e.target.value ? e.target.value : null)
                      }
                    >
                      <option value="">(기본값 사용)</option>
                      {allDesigns.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    {applying && selected.has(p.id) && !res && (
                      <span className="ngc-caption">적용 중…</span>
                    )}
                    {res?.ok && <span className="ngc-badge">적용됨</span>}
                    {res && !res.ok && (
                      <span className="text-[12px]" style={{ color: '#dd5b00' }}>
                        {res.error}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
