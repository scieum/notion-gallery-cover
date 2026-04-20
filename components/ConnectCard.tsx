'use client';

import { LogIn } from 'lucide-react';

export default function ConnectCard() {
  return (
    <div className="ngc-card p-8 max-w-[520px] mx-auto">
      <div className="mb-6">
        <div className="ngc-display">노션에 연결</div>
        <div className="ngc-caption mt-2">
          데이터베이스를 읽고 각 페이지의 커버 이미지를 업데이트할 권한이 필요합니다.
        </div>
      </div>

      <a
        href="/api/auth/login"
        className="ngc-btn-primary inline-flex items-center gap-2 w-full justify-center"
      >
        <LogIn size={18} />
        Notion으로 연결하기
      </a>

      <p className="ngc-caption mt-4">
        Notion 인증 화면에서 사용할 페이지·데이터베이스를 선택하면 해당 항목에만 권한이 부여됩니다.
      </p>
    </div>
  );
}
