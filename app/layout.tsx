import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NotionTalk Cover Maker',
  description:
    '노션 데이터베이스의 각 페이지에 깔끔한 갤러리 커버 이미지를 자동으로 생성·적용합니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
