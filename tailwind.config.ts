import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          'Inter',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
