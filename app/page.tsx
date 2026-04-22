'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LogOut, Image as ImageIcon, PlayCircle, ArrowLeft, Zap, ZapOff, Loader2 } from 'lucide-react';
import ConnectCard from '@/components/ConnectCard';
import DatabasePicker from '@/components/DatabasePicker';
import DesignGallery from '@/components/DesignGallery';
import DesignEditor from '@/components/DesignEditor';
import FontFacesStyle from '@/components/FontFacesStyle';
import PageList from '@/components/PageList';
import TweakPanel from '@/components/TweakPanel';
import { BUILTIN_DESIGNS, findDesign } from '@/lib/designs';
import { absoluteCoverUrl } from '@/lib/cover-url';
import { COVER_DIMENSIONS } from '@/lib/types';
import type {
  CoverMode,
  CoverParams,
  Design,
  NotionPageLite,
  PropertyMapping,
  PropertyMeta,
} from '@/lib/types';

interface DBItem {
  id: string;
  title: string;
  icon: string | null;
  url: string;
}

const CUSTOM_KEY = 'ngc:custom-designs:v1';
const LAST_DB_KEY = 'ngc:last-db:v1';
const AUTO_KEY = 'ngc:auto-apply:v1';
const MODE_KEY = 'ngc:cover-mode:v1';
const AUTO_APPLY_DEBOUNCE_MS = 1500;

export default function Page() {
  const [authState, setAuthState] = useState<'loading' | 'anon' | 'authed'>('loading');
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  const [db, setDb] = useState<DBItem | null>(null);
  const [pages, setPages] = useState<NotionPageLite[] | null>(null);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [schema, setSchema] = useState<PropertyMeta[]>([]);
  const [mapping, setMapping] = useState<PropertyMapping>({
    title: null,
    subtitle: null,
    caption: null,
  });

  const [customs, setCustoms] = useState<Design[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);

  const [defaultDesignId, setDefaultDesignId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Partial<CoverParams>>({});
  const [perPageDesign, setPerPageDesign] = useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [coverMode, setCoverMode] = useState<CoverMode>('gallery');
  const [applying, setApplying] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
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
    try {
      const raw = localStorage.getItem(MODE_KEY);
      if (raw === 'page' || raw === 'gallery') setCoverMode(raw);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(AUTO_KEY, autoApply ? '1' : '0');
  }, [autoApply]);
  useEffect(() => {
    localStorage.setItem(MODE_KEY, coverMode);
  }, [coverMode]);

  // --- pages + schema (in parallel)
  useEffect(() => {
    if (!db) return;
    setPagesLoading(true);
    setPagesError(null);
    setMapping({ title: null, subtitle: null, caption: null });
    Promise.all([
      fetch(`/api/notion/pages?database_id=${encodeURIComponent(db.id)}`).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error ?? 'Failed');
        return d.pages as NotionPageLite[];
      }),
      fetch(`/api/notion/databases/${encodeURIComponent(db.id)}`).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error ?? 'Failed');
        return (d.schema ?? []) as PropertyMeta[];
      }),
    ])
      .then(([ps, sch]) => {
        setPages(ps);
        setSelected(new Set(ps.map((p) => p.id)));
        setSchema(sch);
        // Default 대제목 → the title-type property if present.
        const titleProp = sch.find((p) => p.type === 'title');
        setMapping({
          title: titleProp?.name ?? null,
          subtitle: null,
          caption: null,
        });
      })
      .catch((e) => setPagesError(e?.message ?? String(e)))
      .finally(() => setPagesLoading(false));
  }, [db]);

  /** Resolve the three text slots for a page using the current mapping. */
  function pageTexts(p: NotionPageLite) {
    const get = (propName: string | null): string => {
      if (!propName) return '';
      return p.properties?.[propName] ?? '';
    };
    return {
      // Always fall back to the page's title — never let 대제목 be empty.
      name: get(mapping.title) || p.title,
      subtitle: get(mapping.subtitle),
      caption: get(mapping.caption),
    };
  }

  const allDesigns = useMemo(() => [...BUILTIN_DESIGNS, ...customs], [customs]);
  const defaultDesign = useMemo(
    () => (defaultDesignId ? findDesign(defaultDesignId, customs) ?? null : null),
    [defaultDesignId, customs],
  );
  /**
   * The default design with the inline tweak overrides merged on top. This
   * is what the right-side preview renders and what every "default" page
   * cover gets generated from. Per-page design swaps still bypass this.
   */
  const effectiveDefaultDesign = useMemo<Design | null>(() => {
    if (!defaultDesign) return null;
    return {
      ...defaultDesign,
      params: { ...defaultDesign.params, ...overrides },
    };
  }, [defaultDesign, overrides]);

  // Auto-pick the first preset on first load so the right-side preview is
  // never blank when the user lands on the design step.
  useEffect(() => {
    if (!defaultDesignId && BUILTIN_DESIGNS.length > 0) {
      setDefaultDesignId(BUILTIN_DESIGNS[0].id);
    }
  }, [defaultDesignId]);

  function pickDesign(d: Design) {
    // Keep the user's typography overrides (font, size, fg, weight, etc.)
    // when switching presets — only the underlying bg/style changes.
    // The "되돌리기" button in TweakPanel is the explicit way to reset.
    setDefaultDesignId(d.id);
  }

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
  /**
   * Add or remove a specific set of page ids from the selection. Pre-filter
   * decides which ids are visible; "전체 선택" only affects those.
   */
  function toggleAll(checked: boolean, ids: string[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function buildItems() {
    if (!pages || !effectiveDefaultDesign) return [] as { pageId: string; coverUrl: string }[];
    const origin =
      (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    const dim = COVER_DIMENSIONS[coverMode];
    return pages
      .filter((p) => selected.has(p.id))
      .map((p) => {
        // Per-page design swaps bypass the inline tweak overrides — the user
        // explicitly chose a different preset for this row.
        const d =
          (perPageDesign[p.id] && findDesign(perPageDesign[p.id]!, customs)) ||
          effectiveDefaultDesign;
        const t = pageTexts(p);
        const params = {
          ...d.params,
          ...t,
          style: d.params.style ?? 'solid',
          w: dim.w,
          h: dim.h,
        };
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
        body: JSON.stringify({
          items,
          mode: coverMode,
          databaseId: db?.id,
        }),
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
    if (!pages || !effectiveDefaultDesign) return;
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
  }, [autoApply, pages, defaultDesignId, perPageDesign, selected, customs, coverMode, overrides, mapping]);

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
      <FontFacesStyle />
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-[var(--ngc-border)]">
        <div className="max-w-[1800px] mx-auto px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              // Logo → "home" = the post-auth DB picker. Clears the
              // currently-open DB and any per-DB state so the picker view
              // shows fresh.
              setDb(null);
              setPages(null);
              setResults({});
            }}
            className="flex items-center gap-2 -ml-2 px-2 py-1 rounded-md hover:bg-black/5 transition-colors"
            aria-label="홈으로"
          >
            <ImageIcon size={18} />
            <div className="font-semibold tracking-tight">NotionTalk Cover Maker</div>
          </button>
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

      <section className="max-w-[1800px] mx-auto px-8 py-12">
        {authState === 'anon' && <ConnectCard />}

        {authState === 'authed' && !db && (
          <DatabasePicker onPick={(d) => setDb(d)} />
        )}

        {authState === 'authed' && db && (
          <div className="space-y-10">
            <div>
              <button
                className="ngc-btn-ghost inline-flex items-center gap-1.5 -ml-2 mb-3"
                onClick={() => {
                  setDb(null);
                  setPages(null);
                  setResults({});
                }}
              >
                <ArrowLeft size={14} /> 다른 DB 선택
              </button>
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div className="min-w-0">
                  <div className="ngc-display text-[32px] truncate">{db.title}</div>
                  <div className="ngc-caption truncate">{db.id}</div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                <div
                  className="inline-flex items-center rounded-full border border-[var(--ngc-border)] bg-white p-0.5 text-[13px] font-medium"
                  role="group"
                  aria-label="커버 종류"
                >
                  {(['gallery', 'page'] as CoverMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCoverMode(m)}
                      className={
                        'px-3 py-1 rounded-full transition-colors ' +
                        (coverMode === m
                          ? 'bg-[var(--ngc-accent)] text-white'
                          : 'text-[var(--ngc-fg-muted)]')
                      }
                      title={COVER_DIMENSIONS[m].label}
                    >
                      {m === 'page' ? '페이지' : '갤러리'}
                    </button>
                  ))}
                </div>
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
                  disabled={applying || !effectiveDefaultDesign || selected.size === 0}
                  className="ngc-btn-primary inline-flex items-center gap-2"
                >
                  <PlayCircle size={16} />
                  {applying ? '적용 중…' : `지금 적용 (${selected.size})`}
                </button>
                </div>
              </div>
            </div>

            {/* Property → text-slot mapping. 대제목/중제목/소제목 = name/subtitle/caption. */}
            {schema.length > 0 && (
              <div className="ngc-soft p-4 flex flex-wrap items-end gap-4">
                <div className="text-[13px]">
                  <div className="font-semibold mb-0.5">표시할 텍스트</div>
                  <div className="ngc-caption">
                    각 슬롯에 보여줄 데이터베이스 속성을 선택하세요.
                  </div>
                </div>
                <PropertyMapField
                  label="대제목"
                  value={mapping.title}
                  schema={schema}
                  onChange={(v) => setMapping((m) => ({ ...m, title: v }))}
                  required
                />
                <PropertyMapField
                  label="중제목"
                  value={mapping.subtitle}
                  schema={schema}
                  onChange={(v) => setMapping((m) => ({ ...m, subtitle: v }))}
                />
                <PropertyMapField
                  label="소제목"
                  value={mapping.caption}
                  schema={schema}
                  onChange={(v) => setMapping((m) => ({ ...m, caption: v }))}
                />
              </div>
            )}

            {/* Tweak + design grid (left) | page list (right) */}
            <div className="grid gap-10 lg:grid-cols-[minmax(380px,460px)_1fr]">
              <div className="space-y-8 min-w-0">
                <TweakPanel
                  params={effectiveDefaultDesign?.params ?? null}
                  onChange={(patch) => setOverrides((o) => ({ ...o, ...patch }))}
                  onReset={() => setOverrides({})}
                />
                <div>
                  <div className="ngc-h2">디자인 선택</div>
                  <div className="ngc-caption mt-1">
                    프리셋을 고르고 위쪽 조정 패널에서 폰트·크기·색을 덮어 씁니다.
                  </div>
                  <div className="mt-4">
                    <DesignGallery
                      customs={customs}
                      selectedId={defaultDesignId}
                      sampleName={pages?.[0]?.title ?? '예시 텍스트'}
                      previewRatio={COVER_DIMENSIONS[coverMode].w / COVER_DIMENSIONS[coverMode].h}
                      onSelect={pickDesign}
                      onAddCustomClick={() => setEditorOpen(true)}
                      onDeleteCustom={(id) => setCustoms((cs) => cs.filter((c) => c.id !== id))}
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-0">
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
                    defaultDesign={effectiveDefaultDesign}
                    allDesigns={allDesigns}
                    applying={applying}
                    results={results}
                    previewRatio={COVER_DIMENSIONS[coverMode].w / COVER_DIMENSIONS[coverMode].h}
                    pageTexts={pageTexts}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <DesignEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={(d) => setCustoms((cs) => [...cs, d])}
        sampleName={pages?.[0]?.title ?? '예시 텍스트'}
        previewRatio={COVER_DIMENSIONS[coverMode].w / COVER_DIMENSIONS[coverMode].h}
      />

      <footer className="border-t border-[var(--ngc-border)] mt-16">
        <div className="max-w-[1800px] mx-auto px-8 py-6 ngc-caption flex items-center justify-center gap-3">
          <span>© 2026 𝐍𝐨𝐭𝐢𝐨𝐧𝐓𝐚𝐥𝐤. All rights reserved.</span>
          <a
            href="https://open.kakao.com/o/gpSvPKGg"
            target="_blank"
            rel="noopener noreferrer"
            title="노션하는 교사톡 오픈채팅방 참여"
            aria-label="노션하는 교사톡 오픈채팅방 참여"
            className="text-[var(--ngc-fg-faint)] hover:text-[var(--ngc-fg-muted)] transition-colors inline-flex"
          >
            <KakaoIcon />
          </a>
        </div>
      </footer>
    </main>
  );
}

/** Inline KakaoTalk speech-bubble glyph. Inherits color from parent (currentColor). */
function KakaoIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 4C6.48 4 2 7.58 2 12c0 2.86 1.86 5.36 4.65 6.78l-.95 3.46c-.08.3.25.55.5.39l4.13-2.74c.55.06 1.11.11 1.67.11 5.52 0 10-3.58 10-8S17.52 4 12 4z" />
    </svg>
  );
}

function PropertyMapField({
  label,
  value,
  schema,
  onChange,
  required,
}: {
  label: string;
  value: string | null;
  schema: PropertyMeta[];
  onChange: (v: string | null) => void;
  required?: boolean;
}) {
  return (
    <label className="block min-w-[180px] flex-1">
      <div className="ngc-caption mb-1">{label}</div>
      <select
        className="w-full text-[13px] py-2 px-2.5 rounded-md border border-[var(--ngc-border)] bg-white"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      >
        {!required && <option value="">사용 안 함</option>}
        {schema.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name} · {p.type}
          </option>
        ))}
      </select>
    </label>
  );
}
