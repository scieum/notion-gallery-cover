'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LogOut, Image as ImageIcon, PlayCircle, ArrowLeft, Zap, ZapOff, Loader2 } from 'lucide-react';
import ConnectCard from '@/components/ConnectCard';
import DatabasePicker from '@/components/DatabasePicker';
import DesignGallery from '@/components/DesignGallery';
import DesignEditor from '@/components/DesignEditor';
import PageList from '@/components/PageList';
import { BUILTIN_DESIGNS, findDesign } from '@/lib/designs';
import { absoluteCoverUrl } from '@/lib/cover-url';
import type { Design, NotionPageLite } from '@/lib/types';

interface DBItem {
  id: string;
  title: string;
  icon: string | null;
  url: string;
}

const CUSTOM_KEY = 'ngc:custom-designs:v1';
const LAST_DB_KEY = 'ngc:last-db:v1';
const AUTO_KEY = 'ngc:auto-apply:v1';
const AUTO_APPLY_DEBOUNCE_MS = 1500;

export default function Page() {
  const [authState, setAuthState] = useState<'loading' | 'anon' | 'authed'>('loading');
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  const [db, setDb] = useState<DBItem | null>(null);
  const [pages, setPages] = useState<NotionPageLite[] | null>(null);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [pagesLoading, setPagesLoading] = useState(false);

  const [customs, setCustoms] = useState<Design[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);

  const [defaultDesignId, setDefaultDesignId] = useState<string | null>(null);
  const [perPageDesign, setPerPageDesign] = useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [applying, setApplying] = useState(false);
  const [autoApply, setAutoApply] = useState(true);
  const [lastAutoAt, setLastAutoAt] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, { ok: boolean; error?: string }>>({});
  const lastAppliedRef = useRef<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- auth
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setAuthState(data.authed ? 'authed' : 'anon');
        setWorkspaceName(data.workspaceName ?? null);
      } catch {
        setAuthState('anon');
      }
    })();
  }, []);

  // --- persisted customs / last db
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      if (raw) setCustoms(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem(LAST_DB_KEY);
      if (raw) setDb(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customs));
  }, [customs]);
  useEffect(() => {
    if (db) localStorage.setItem(LAST_DB_KEY, JSON.stringify(db));
  }, [db]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTO_KEY);
      if (raw !== null) setAutoApply(raw === '1');
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(AUTO_KEY, autoApply ? '1' : '0');
  }, [autoApply]);

  // --- pages
  useEffect(() => {
    if (!db) return;
    setPagesLoading(true);
    setPagesError(null);
    fetch(`/api/notion/pages?database_id=${encodeURIComponent(db.id)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error ?? 'Failed');
        return d.pages as NotionPageLite[];
      })
      .then((ps) => {
        setPages(ps);
        setSelected(new Set(ps.map((p) => p.id)));
      })
      .catch((e) => setPagesError(e?.message ?? String(e)))
      .finally(() => setPagesLoading(false));
  }, [db]);

  const allDesigns = useMemo(() => [...BUILTIN_DESIGNS, ...customs], [customs]);
  const defaultDesign = useMemo(
    () => (defaultDesignId ? findDesign(defaultDesignId, customs) ?? null : null),
    [defaultDesignId, customs],
  );

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthState('anon');
    setDb(null);
    setPages(null);
    localStorage.removeItem(LAST_DB_KEY);
  }

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll(checked: boolean) {
    if (!pages) return;
    setSelected(new Set(checked ? pages.map((p) => p.id) : []));
  }

  function buildItems() {
    if (!pages || !defaultDesign) return [] as { pageId: string; coverUrl: string }[];
    const origin =
      (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    return pages
      .filter((p) => selected.has(p.id))
      .map((p) => {
        const d =
          (perPageDesign[p.id] && findDesign(perPageDesign[p.id]!, customs)) || defaultDesign;
        const params = { ...d.params, name: p.title, style: d.params.style ?? 'solid' };
        return { pageId: p.id, coverUrl: absoluteCoverUrl(origin, params as any) };
      });
  }

  async function applyItems(items: { pageId: string; coverUrl: string }[], silent = false) {
    if (items.length === 0) return;
    if (!silent) setResults({});
    setApplying(true);
    try {
      const res = await fetch('/api/notion/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Apply failed');
      const map: Record<string, { ok: boolean; error?: string }> = silent ? { ...results } : {};
      for (const r of data.results as any[]) {
        map[r.pageId] = { ok: r.ok, error: r.error };
      }
      setResults(map);
      setLastAutoAt(Date.now());
    } catch (e: any) {
      if (!silent) alert(e?.message ?? String(e));
      else console.warn('Auto-apply failed:', e);
    } finally {
      setApplying(false);
    }
  }

  async function apply() {
    await applyItems(buildItems(), false);
  }

  // --- auto-apply: debounced effect that fires when inputs change
  useEffect(() => {
    if (!autoApply) return;
    if (!pages || !defaultDesign) return;
    if (selected.size === 0) return;

    const items = buildItems();
    // Fingerprint current set; skip if unchanged from last applied
    const fp = JSON.stringify(items);
    if (fp === lastAppliedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastAppliedRef.current = fp;
      applyItems(items, true);
    }, AUTO_APPLY_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoApply, pages, defaultDesignId, perPageDesign, selected, customs]);

  // ---- render
  if (authState === 'loading') {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="ngc-caption">로딩 중…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-[var(--ngc-border)]">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} />
            <div className="font-semibold tracking-tight">Notion Gallery Cover</div>
          </div>
          {authState === 'authed' && (
            <div className="flex items-center gap-3">
              {workspaceName && <span className="ngc-caption">{workspaceName}</span>}
              <button onClick={logout} className="ngc-btn-ghost inline-flex items-center gap-1.5">
                <LogOut size={14} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 py-8">
        {authState === 'anon' && <ConnectCard />}

        {authState === 'authed' && !db && (
          <DatabasePicker onPick={(d) => setDb(d)} />
        )}

        {authState === 'authed' && db && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="ngc-btn-ghost inline-flex items-center gap-1.5"
                  onClick={() => {
                    setDb(null);
                    setPages(null);
                    setResults({});
                  }}
                >
                  <ArrowLeft size={14} /> 다른 DB 선택
                </button>
                <div>
                  <div className="ngc-display text-[28px]">{db.title}</div>
                  <div className="ngc-caption">{db.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoApply((v) => !v)}
                  className={
                    'inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full border ' +
                    (autoApply
                      ? 'bg-[var(--ngc-badge-bg)] text-[var(--ngc-badge-fg)] border-transparent'
                      : 'bg-white text-[var(--ngc-fg-muted)] border-[var(--ngc-border)]')
                  }
                  title={autoApply ? '자동 적용 ON' : '자동 적용 OFF'}
                >
                  {autoApply ? <Zap size={14} /> : <ZapOff size={14} />}
                  자동 적용 {autoApply ? 'ON' : 'OFF'}
                </button>
                {applying && (
                  <span className="ngc-caption inline-flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> 동기화
                  </span>
                )}
                {!applying && lastAutoAt && autoApply && (
                  <span className="ngc-caption">
                    {new Date(lastAutoAt).toLocaleTimeString()} 적용됨
                  </span>
                )}
                <button
                  onClick={apply}
                  disabled={applying || !defaultDesign || selected.size === 0}
                  className="ngc-btn-primary inline-flex items-center gap-2"
                >
                  <PlayCircle size={16} />
                  {applying ? '적용 중…' : `지금 적용 (${selected.size})`}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <div className="ngc-h2">디자인 선택</div>
                <div className="ngc-caption mt-1">
                  선택한 디자인이 기본값으로 쓰이고, 아래 테이블에서 페이지별로 변경할 수 있습니다.
                </div>
              </div>
              <DesignGallery
                customs={customs}
                selectedId={defaultDesignId}
                sampleName={pages?.[0]?.title ?? '예시 텍스트'}
                onSelect={(d) => setDefaultDesignId(d.id)}
                onAddCustomClick={() => setEditorOpen(true)}
                onDeleteCustom={(id) => setCustoms((cs) => cs.filter((c) => c.id !== id))}
              />
            </div>

            {pagesLoading && <div className="ngc-caption">페이지 불러오는 중…</div>}
            {pagesError && (
              <div className="ngc-card p-4 text-[13px]" style={{ color: '#dd5b00' }}>
                {pagesError}
              </div>
            )}

            {pages && (
              <PageList
                pages={pages}
                selected={selected}
                onToggle={toggle}
                onToggleAll={toggleAll}
                perPageDesign={perPageDesign}
                onPickDesignForPage={(pageId, designId) =>
                  setPerPageDesign((m) => ({ ...m, [pageId]: designId ?? undefined }))
                }
                defaultDesign={defaultDesign}
                allDesigns={allDesigns}
                applying={applying}
                results={results}
              />
            )}
          </div>
        )}
      </section>

      <DesignEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={(d) => setCustoms((cs) => [...cs, d])}
        sampleName={pages?.[0]?.title ?? '예시 텍스트'}
      />
    </main>
  );
}
