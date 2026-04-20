# Notion Gallery Cover

노션 데이터베이스의 각 페이지에 대해, 이름(제목)을 기반으로 **깔끔하고 일관된 갤러리 커버 이미지**를 자동 생성·적용하는 도구.

## 구조

- `app/api/cover` — `@vercel/og` 로 PNG 커버 이미지를 동적 생성 (`/api/cover?name=...&style=...`)
- `app/api/auth/*` — Notion OAuth 로그인, httpOnly 쿠키 세션
- `app/api/notion/*` — DB 목록 · 페이지 목록 · 커버 일괄 적용
- `lib/designs.ts` — 내장 프리셋 (단색 / 그라데이션 / 패턴 / 이모지)
- `components/` — 디자인 시스템에 맞춘 UI (ConnectCard · DatabasePicker · DesignGallery · DesignEditor · PageList · CoverPreview)

## 시작하기

```bash
npm install
cp .env.example .env.local   # 필요시 값 채우기
npm run dev
```

`http://localhost:3000` 에서 확인.

> 주의: 노션은 `cover.external.url`에 넣은 이미지 URL을 **노션 서버가 직접 fetch** 합니다. 로컬 `localhost`는 노션에서 닿을 수 없어, 실제 적용 테스트는 Vercel 배포 또는 ngrok 등 공개 URL이 필요합니다.

## 인증 방식

Notion → [My integrations](https://www.notion.so/my-integrations) → **New integration** → Type: **Public**.

- Redirect URI: `https://<배포-도메인>/api/auth/callback`
- 받은 Client ID / Secret을 env로:
  ```
  NOTION_OAUTH_CLIENT_ID=...
  NOTION_OAUTH_CLIENT_SECRET=...
  NOTION_OAUTH_REDIRECT_URI=https://<배포-도메인>/api/auth/callback
  ```

사용자는 "Notion으로 연결하기" 버튼 한 번으로 인증하고, 인증 화면에서 직접 선택한 페이지·데이터베이스만 권한이 부여됩니다.

## 커버 URL 규약

`GET /api/cover?name=<text>&style=<solid|gradient|pattern|emoji>&...`

공통: `name`, `style`, `fg`, `align` (`left`|`center`), `size`, `w`, `h` (기본 1500×600)

| style    | 추가 파라미터 |
|----------|--------------|
| solid    | `bg` |
| gradient | `bg`, `bg2`, `angle` |
| pattern  | `bg`, `fg`, `pattern` (`dots`/`lines`/`grid`/`waves`/`circles`) |
| emoji    | `emoji`, `bg`, `layout` (`side`/`stack`) |

한글 렌더링은 Pretendard 폰트를 edge 런타임에서 fetch 해서 embed.

## 커스텀 디자인

UI에서 "+ 새 디자인" → 색상/이모지/패턴 조정 → 저장.
브라우저 `localStorage` 에 저장됩니다 (기기/브라우저별).

## 디자인 시스템

이 프로젝트의 UI는 `DESIGN.md` (Notion 스타일) 를 따릅니다:
- 웜 뉴트럴 팔레트, 위스퍼 보더(`1px solid rgba(0,0,0,0.1)`)
- `rgba(0,0,0,0.95)` 근사-블랙, `#171717` 단일 액센트
- Pretendard / Inter 4-weight, 음수 letter-spacing on display
- lucide-react 아이콘 (UI 크롬에 이모지 미사용)

## 배포

Vercel에 그대로 배포하면 됩니다.
- 환경 변수: `NOTION_OAUTH_CLIENT_ID`, `NOTION_OAUTH_CLIENT_SECRET`, `NOTION_OAUTH_REDIRECT_URI`
- `NEXT_PUBLIC_APP_URL` 을 배포 URL로 설정해두면 클라이언트에서 절대 URL을 안정적으로 만듭니다.

## Troubleshooting

- **커버가 적용되어도 노션에서 안 보임**: URL이 공개적으로 reachable 한지 확인. `/api/cover?...` 를 브라우저 시크릿 모드에서 직접 열어보기.
- **한글이 깨짐**: `lib/fonts.ts` 의 폰트 fetch 가 실패했을 수 있음. 폰트 CDN이 차단된 환경이면 `public/fonts/` 에 직접 드롭하고 `loadFonts()` 를 로컬 읽기로 수정.
- **`unauthorized` 에러**: OAuth 인증 시 해당 데이터베이스를 선택하지 않았을 수 있음. 헤더의 "데이터베이스 추가"로 다시 인증해 권한을 확장.
