'use client';

import { useEffect, useState } from 'react';
import { Database, RefreshCw, Plus } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  icon: string | null;
  url: string;
}

interface Props {
  onPick: (db: Item) => void;
}

export default function DatabasePicker({ onPick }: Props) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      {loading && !items && <div className="ngc-caption">불러오는 중…</div>}
      {error && (
        <div className="ngc-card p-4 text-[13px]" style={{ color: '#dd5b00' }}>
          {error}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="ngc-card p-6">
          <div className="text-[15px] font-semibold mb-1">접근 가능한 데이터베이스가 없습니다</div>
          <div className="ngc-caption mb-4">
            Notion 인증 화면에서 <strong>데이터베이스 자체</strong> 또는 <strong>데이터베이스를 포함한 페이지</strong>를 선택해야 보입니다. 일반 페이지만 선택하면 여기에 아무것도 안 떠요.
          </div>
          <a
            href="/api/auth/login"
            className="ngc-btn-primary inline-flex items-center gap-2"
          >
            <Plus size={16} /> 다시 선택해서 추가
          </a>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onPick(it)}
              className="ngc-card ngc-card-hoverable p-4 text-left flex items-start gap-3"
            >
              <div className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center ngc-section-warm text-[18px]">
                {it.icon && !it.icon.startsWith('http') ? (
                  <span>{it.icon}</span>
                ) : (
                  <Database size={16} />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold truncate">{it.title}</div>
                <div className="ngc-caption truncate">{it.id}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
