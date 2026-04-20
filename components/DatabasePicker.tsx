'use client';

import { useEffect, useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';

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
            integration에 연결된 데이터베이스 목록입니다.
          </div>
        </div>
        <button type="button" onClick={load} className="ngc-btn-ghost inline-flex items-center gap-1.5">
          <RefreshCw size={14} /> 새로고침
        </button>
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
          <div className="ngc-caption">
            Notion에서 해당 integration을 데이터베이스에 초대했는지 확인해주세요.
          </div>
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
