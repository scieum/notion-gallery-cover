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
  okdandan: {
    family: 'OkDandan',
    label: 'OK단단',
    weights: {
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2508-2@1.0/OkDanDan-Bold.woff2',
    },
  },
  kbo: {
    family: 'KboDiamondGothic',
    label: 'KBO 다이아 고딕',
    weights: {
      300: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-2@1.0/KBO-Dia-Gothic_light.woff',
      500: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-2@1.0/KBO-Dia-Gothic_medium.woff',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-2@1.0/KBO-Dia-Gothic_bold.woff',
    },
  },
  dohyun: {
    family: 'Dohyun',
    label: '배민 도현체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMDOHYEON.woff',
    },
  },
  giranghaerang: {
    family: 'Giranghaerang',
    label: '배민 기랑해랑체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMKIRANGHAERANG.woff',
    },
  },
  hanna: {
    family: 'Hanna',
    label: '배민 한나체',
    weights: {
      400: 'https://fonts.gstatic.com/ea/hanna/v3/BM-HANNA.ttf',
    },
  },
  joseon: {
    family: 'JoseonGulim',
    label: '조선굴림체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/ChosunGu.woff',
    },
  },
  eoyeonce: {
    family: 'OngleipEoyeonce',
    label: '온글잎 의연체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105@1.1/Uiyeun.woff',
    },
  },
  ryuryu: {
    family: 'OngleipRyuryu',
    label: '온글잎 류류체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2405-2@1.0/Ownglyph_ryurue-Rg.woff2',
    },
  },
  parkdahyun: {
    family: 'OngleipParkDahyeon',
    label: '온글잎 박다현체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2411-3@1.0/Ownglyph_ParkDaHyun.woff2',
    },
  },
  bookk: {
    family: 'BookkMyungjo',
    label: '부크크 명조체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/BookkMyungjo-Lt.woff2',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/BookkMyungjo-Bd.woff2',
    },
  },
  yoon: {
    family: 'YoonChoWooSan',
    label: '윤초우산체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2408@1.0/YoonChildfundkoreaManSeh.woff2',
    },
  },
  cafe24: {
    family: 'Cafe24Danjeonghae',
    label: 'Cafe24 단정해체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Danjunghae.woff',
    },
  },
  hssummer: {
    family: 'HsSummerWaterLight',
    label: 'HS 여름물빛체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/HSSummer.woff',
    },
  },
  hakgyobunpil: {
    family: 'SchoolSafetyChalk',
    label: '학교안심 분필체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2307-2@1.0/HakgyoansimBunpilR.woff2',
    },
  },
  // 둘기마요 고딕 — disabled. Same failure mode as Paperozi: the WOFF2
  // decompresses cleanly but satori errors when parsing the resulting TTF.
  // Other projectnoonnu woff2 fonts work fine, so this seems to be a per-
  // font issue rather than a wawoff2/satori pipeline bug.
  jejudoldam: {
    family: 'JejuStoneWall',
    label: '제주 돌담체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2210-EF@1.0/EF_jejudoldam.woff2',
    },
  },
  monaemoji: {
    family: 'Mona12emoji',
    label: 'Mona 12 이모지',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2603-1@1.0/Mona12Emoji.woff2',
    },
  },
  ria: {
    family: 'Ria',
    label: '리아 산스 (ExtraBold)',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-1@1.0/RiaSans-ExtraBold.woff2',
    },
  },
  yidstreet: {
    family: 'Yidstreet',
    label: '이드스트리트체',
    weights: {
      300: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2110@1.0/YdestreetL.woff2',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2110@1.0/YdestreetB.woff2',
    },
  },
  kotrabold: {
    family: 'KotraBold',
    label: 'KOTRA 볼드',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-10-21@1.1/KOTRA_BOLD-Bold.woff',
    },
  },
  kotrahope: {
    family: 'KotraHope',
    label: 'KOTRA HOPE',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2110@1.0/KOTRAHOPE.woff2',
    },
  },
  gyeonggititle: {
    family: 'GyeonggiMillenniumTitle',
    label: '경기천년 제목체',
    weights: {
      300: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-3@1.0/Title_Light.woff',
      500: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-3@1.0/Title_Medium.woff',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-3@1.0/Title_Bold.woff',
      800: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-3@1.0/TitleV.woff',
    },
  },
  gyeonggibatang: {
    family: 'GyeonggiMillenniumBackground',
    label: '경기천년 바탕체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-3@1.0/Batang_Regular.woff',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2410-3@1.0/Batang_Bold.woff',
    },
  },
  gangwonsaeum: {
    family: 'GangwonEducationSaeum',
    label: '강원교육새음체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/GangwonEduSaeeum_OTFMediumA.woff',
    },
  },
  beloved: {
    family: 'BelovedMyoeunttobak',
    label: '그리운 묘은또박',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2601-1@1.0/Griun_Myoeunddobak-Rg.woff2',
    },
  },
  nostalgicheullim: {
    family: 'NostalgicMyoeunHeullim',
    label: '그리운 묘은흘림',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2601-1@1.0/Griun_MyoeunHeullim-Rg.woff2',
    },
  },
  ssukssuk: {
    family: 'Cafe24Ssukssuk',
    label: 'Cafe24 쑥쑥체',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Ssukssuk.woff',
    },
  },
  freesentation: {
    family: 'Presentation',
    // 9 weights available — registering 400/700/800 keeps cold-start fetches
    // light while still covering body / bold / extrabold use cases.
    label: 'Freesentation (자유의 소리)',
    weights: {
      400: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-4Regular.woff2',
      700: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-7Bold.woff2',
      800: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-8ExtraBold.woff2',
    },
  },
  notosans: {
    family: 'Noto Sans KR',
    label: '노토 산스 KR',
    // Direct TTF from gstatic — no woff2 decode step needed. Keeping just
    // 400/700/800 to bound cold-start fetch size.
    weights: {
      400: 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoySLPg9A.ttf',
      700: 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01SLPg9A.ttf',
      800: 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzmo1SLPg9A.ttf',
    },
  },
  // Mona pixel font removed — server returns a 200 PNG but the image
  // turns out broken in browser (likely a satori/opentype pixel-font
  // glyph issue at our render sizes). Revisit if a clean Korean-capable
  // pixel font shows up.
};

/**
 * UI helper — list of { key, label, family } for the picker.
 * Sorted by label using Korean locale collation, which puts ㄱ-ㅎ first
 * then A-Z (so 한글 fonts cluster, English fonts follow naturally).
 */
export const FONT_OPTIONS = Object.entries(FONT_REGISTRY)
  .map(([key, def]) => ({
    key,
    label: def.label,
    family: def.family,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'ko'));

function urlFormat(u: string): string {
  if (u.endsWith('.woff2')) return 'woff2';
  if (u.endsWith('.woff')) return 'woff';
  if (u.endsWith('.otf')) return 'opentype';
  if (u.endsWith('.ttf')) return 'truetype';
  return 'woff2';
}

/** CSS @font-face rules for all registered fonts — used to render the picker
 * with each option in its own typeface. Emitted by `<FontFacesStyle />`. */
export const FONT_FACE_CSS = Object.values(FONT_REGISTRY)
  .map((def) =>
    Object.entries(def.weights)
      .map(
        ([w, url]) =>
          `@font-face{font-family:"${def.family}";font-style:normal;font-weight:${w};` +
          `font-display:swap;src:url(${url}) format("${urlFormat(url)}");}`,
      )
      .join(''),
  )
  .join('');
