// Pure font metadata — safe to import from client components.
// Server-only loading logic lives in lib/fonts.ts (imports wawoff2 for
// WOFF2 decoding, pulls in `fs` and other Node-only modules).

export interface FontDef {
  /** Font family name passed to satori (also the CSS family name). */
  family: string;
  /** Display label shown in the UI picker. */
  label: string;
  /** Weight → URL. Any of TTF/OTF/WOFF/WOFF2 accepted. */
  weights: { [weight: number]: string };
}

export const DEFAULT_FONT_KEY = 'pretendard';

export const FONT_REGISTRY: Record<string, FontDef> = {
  pretendard: {
    family: 'Pretendard',
    label: 'Pretendard',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Regular.otf',
      700: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf',
      800: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-ExtraBold.otf',
    },
  },
  suit: {
    family: 'SUIT',
    label: 'SUIT',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT/fonts/static/woff2/SUIT-Regular.woff2',
      700: 'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT/fonts/static/woff2/SUIT-Bold.woff2',
      800: 'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT/fonts/static/woff2/SUIT-ExtraBold.woff2',
    },
  },
  // Paperozi (Paperlogy) — disabled. The projectnoonnu woff2 builds
  // decompress fine via wawoff2 but satori errors when parsing the
  // resulting TTF for every weight (still under investigation).
  gmarketsans: {
    family: 'GMarketSans',
    label: 'G마켓 산스',
    weights: {
      300: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff',
      500: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff',
    },
  },
  scoredream: {
    family: 'Escoredream',
    label: 'S-Core Dream',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/S-CoreDream-4Regular.woff',
      600: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/S-CoreDream-6Bold.woff',
      800: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/S-CoreDream-8Heavy.woff',
    },
  },
  kkubulim: {
    family: 'KkuBulLim',
    label: 'BM 꾸불림',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-1@1.0/BMkkubulimTTF-Regular.woff2',
    },
  },
  ongleip: {
    family: 'OngleipKonkon',
    label: '온글잎 콘콘',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2412-1@1.0/Ownglyph_corncorn-Rg.woff2',
    },
  },
  gangwon: {
    family: 'GangwonEducationModuche',
    label: '강원교육모두체',
    weights: {
      300: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/GangwonEdu_OTFLightA.woff',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/GangwonEdu_OTFBoldA.woff',
    },
  },
  gangwonpower: {
    family: 'GangwonEducationTteontteon',
    label: '강원교육튼튼체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/GangwonEduPowerExtraBoldA.woff',
    },
  },
  juache: {
    family: 'Juache',
    label: '배민 주아체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff',
    },
  },
  hakgyo: {
    family: 'SchoolSafetyNotification',
    label: '학교안심 알림장',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2408-5@1.0/HakgyoansimAllimjangTTF-R.woff2',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2408-5@1.0/HakgyoansimAllimjangTTF-B.woff2',
    },
  },
  lotteria: {
    family: 'LotteriaChwapttaenggyeo',
    label: '롯데리아 촵땡겨체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/LOTTERIACHAB.woff2',
    },
  },
  // Mona pixel font removed — server returns a 200 PNG but the image
  // turns out broken in browser (likely a satori/opentype pixel-font
  // glyph issue at our render sizes). Revisit if a clean Korean-capable
  // pixel font shows up.
};

/** UI helper — list of { key, label, family } for a <select>. */
export const FONT_OPTIONS = Object.entries(FONT_REGISTRY).map(([key, def]) => ({
  key,
  label: def.label,
  family: def.family,
}));
