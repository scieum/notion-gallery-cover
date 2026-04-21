'use client';

import { useEffect, useMemo, useState } from 'react';
import { Database, RefreshCw, Plus, X, EyeOff, Link2 } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  icon: string | null;
  url: string;
}

interface Props {
  onPick: (db: Item) => void;
}

const HIDDEN_KEY = 'ngc:hidden-dbs:v1';
const MANUAL_KEY = 'ngc:manual-dbs:v1';

/**
 * Pull a Notion object id out of a free-form string. Accepts:
 *   - "2e5137a3-05b8-812b-b4a9-000b2327f4d3"  (hyphenated)
 *   - "2e5137a305b8812bb4a9000b2327f4d3"      (32 hex chars)
 *   - "https://www.notion.so/Workspace/2e5137a305b8812bb4a9000b2327f4d3?v=..."
 * Returns the 32-char un-hyphenated id, or null if no id-shaped substring
 * is found. Caller can pass the result to Notion's API as-is — both
 * formats are accepted server-side.
 */
function extractDatabaseId(input: string): string | null {
  const cleaned = input.trim();
  // Try hyphenated first.
  const hyphenated = cleaned.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  if (hyphenated) return hyphenated[0].toLowerCase();
  // Then bare 32-char hex.
  const bare = cleaned.match(/[0-9a-fA-F]{32}/);
  if (bare) return bare[0].toLowerCase();
  return null;
}

export default function DatabasePicker({ onPick }: Props) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [manualItems, setManualItems] = useState<Item[]>([]);

  // ID input
  const [idInput, setIdInput] = useState('');
  const [idAdding, setIdAdding] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);

  // Load persisted state on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_KEY);
      if (raw) setHiddenIds(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    try {
      const raw = localStorage.getItem(MANUAL_KEY);
      if (raw) setManualItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function persistHidden(next: Set<string>) {
    setHiddenIds(next);
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(next)));
    } catch {
      /* ignore */
    }
  }
  function persistManual(next: Item[]) {
    setManualItems(next);
    try {
      localStorage.setItem(MANUAL_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function hide(id: string) {
    const next = new Set(hiddenIds);
    next.add(id);
    persistHidden(next);
  }
  function unhide(id: string) {
    const next = new Set(hiddenIds);
    next.delete(id);
    persistHidden(next);
  }
  function unhideAll() {
    persistHidden(new Set());
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notion/databases');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed');
      setItems(data.databases);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addById(e: React.FormEvent) {
    e.preventDefault();
    setIdError(null);
    const id = extractDatabaseId(idInput);
    if (!id) {
      setIdError('데이터베이스 ID를 인식할 수 없습니다 (32자리 hex 또는 하이픈 형식).');
      return;
    }
    setIdAdding(true);
    try {
      const res = await fetch(`/api/notion/databases/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? '조회 실패');
      const db: Item = data.database;
      // Dedupe by id within manual list.
      const next = [db, ...manualItems.filter((m) => m.id !== db.id)];
      persistManual(next);
      // Also un-hide it if previously hidden, so it shows up immediately.
      if (hiddenIds.has(db.id)) unhide(db.id);
      setIdInput('');
    } catch (err: any) {
      setIdError(err?.message ?? String(err));
    } finally {
      setIdAdding(false);
    }
  }

  function removeManual(id: string) {
    persistManual(manualItems.filter((m) => m.id !== id));
  }

  // Merge searched + manual, dedupe by id (search wins for title/icon freshness).
  const mergedItems = useMemo<Item[] | null>(() => {
    if (!items && manualItems.length === 0) return null;
    const seen = new Set<string>();
    const out: Item[] = [];
    for (const it of items ?? []) {
      seen.add(it.id);
      out.push(it);
    }
    for (const it of manualItems) {
      if (!seen.has(it.id)) out.push(it);
    }
    return out;
  }, [items, manualItems]);

  const visibleItems = useMemo(() => {
    if (!mergedItems) return null;
    return showHidden ? mergedItems : mergedItems.filter((i) => !hiddenIds.has(i.id));
  }, [mergedItems, hiddenIds, showHidden]);

  const hiddenCount = mergedItems
    ? mergedItems.filter((i) => hiddenIds.has(i.id)).length
    : 0;

  const manualIdSet = useMemo(() => new Set(manualItems.map((m) => m.id)), [manualItems]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="ngc-h2">데이터베이스 선택</div>
          <div className="ngc-caption mt-1">
            인증 시 선택한 페이지에 포함된 데이터베이스 목록입니다.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/auth/login"
            className="ngc-btn-ghost inline-flex items-center gap-1.5"
            title="Notion 인증을 다시 거쳐 페이지/데이터베이스를 추가합니다"
          >
            <Plus size={14} /> 데이터베이스 추가
          </a>
          <button
            type="button"
            onClick={load}
            className="ngc-btn-ghost inline-flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> 새로고침
          </button>
        </div>
      </div>

      {/* Add by ID — for DBs that Notion search misses (e.g. inline DBs). */}
      <form
        onSubmit={addById}
        className="ngc-soft p-4 mb-5 flex flex-wrap items-center gap-2"
      >
        <Link2 size={16} className="text-[var(--ngc-fg-muted)] shrink-0" />
        <input
          type="text"
          className="ngc-input flex-1 min-w-[260px]"
          placeholder="데이터베이스 ID 또는 URL 붙여넣기 (예: 2e5137a3-05b8-...)"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="ngc-btn-primary inline-flex items-center gap-1.5"
          disabled={idAdding || idInput.trim().length === 0}
        >
          <Plus size={14} />
          {idAdding ? '확인 중…' : '추가'}
        </button>
        {idError && (
          <div className="basis-full text-[12px] mt-1" style={{ color: '#dd5b00' }}>
            {idError}
          </div>
        )}
      </form>

      {loading && !mergedItems && <div className="ngc-caption">불러오는 중…</div>}
      {error && (
        <div className="ngc-card p-4 text-[13px]" style={{ color: '#dd5b00' }}>
          {error}
        </div>
      )}

      {visibleItems && visibleItems.length === 0 && (
        <div className="ngc-card p-6">
          <div className="text-[15px] font-semibold mb-1">접근 가능한 데이터베이스가 없습니다</div>
          <div className="ngc-caption mb-4">
            Notion 인증 화면에서 <strong>데이터베이스 자체</strong> 또는{' '}
            <strong>데이터베이스를 포함한 페이지</strong>를 선택해야 보입니다. 일반 페이지만 선택하면
            여기에 아무것도 안 떠요.
          </div>
          <a href="/api/auth/login" className="ngc-btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> 다시 선택해서 추가
          </a>
        </div>
      )}

      {visibleItems && visibleItems.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((it) => {
            const isHidden = hiddenIds.has(it.id);
            const isManual = manualIdSet.has(it.id);
            return (
              <div key={it.id} className="relative group">
                <button
                  onClick={() => onPick(it)}
                  className={
                    'ngc-card ngc-card-hoverable p-4 text-left flex items-start gap-3 w-full ' +
                    (isHidden ? 'opacity-50' : '')
                  }
                >
                  <div className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center ngc-section-warm text-[18px]">
                    {it.icon && !it.icon.startsWith('http') ? (
                      <span>{it.icon}</span>
                    ) : (
                      <Database size={16} />
                    )}
                  </div>
                  <div className="min-w-0 pr-6">
                    <div className="text-[15px] font-semibold truncate flex items-center gap-1.5">
                      {it.title}
                      {isManual && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 text-[var(--ngc-fg-muted)] font-medium"
                          title="ID로 직접 추가됨"
                        >
                          수동
                        </span>
                      )}
                    </div>
                    <div className="ngc-caption truncate">{it.id}</div>
                  </div>
                </button>
                {isHidden ? (
                  <button
                    type="button"
                    onClick={() => unhide(it.id)}
                    className="absolute top-2 right-2 px-2 py-1 rounded-md bg-white/95 backdrop-blur border border-[var(--ngc-border)] text-[12px] opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="다시 표시"
                    title="목록에 다시 표시"
                  >
                    되돌리기
                  </button>
                ) : (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isManual && (
                      <button
                        type="button"
                        onClick={() => removeManual(it.id)}
                        className="px-2 py-1 rounded-md bg-white/95 backdrop-blur border border-[var(--ngc-border)] text-[12px]"
                        aria-label="수동 추가 항목 삭제"
                        title="수동 추가 항목을 목록에서 제거"
                      >
                        제거
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => hide(it.id)}
                      className="p-1.5 rounded-md bg-white/95 backdrop-blur border border-[var(--ngc-border)]"
                      aria-label="목록에서 숨기기"
                      title="이 데이터베이스를 목록에서 숨기기"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hiddenCount > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowHidden((v) => !v)}
            className="ngc-btn-ghost inline-flex items-center gap-1.5 text-[13px]"
          >
            <EyeOff size={14} />
            {showHidden ? `숨긴 DB 다시 가리기` : `숨긴 DB ${hiddenCount}개 보기`}
          </button>
          {showHidden && (
            <button type="button" onClick={unhideAll} className="ngc-btn-ghost text-[13px]">
              전체 복구
            </button>
          )}
        </div>
      )}
    </div>
  );
}
