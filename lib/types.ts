export type CoverStyle = 'solid' | 'gradient' | 'pattern' | 'emoji';
export type PatternName = 'dots' | 'lines' | 'grid' | 'waves' | 'circles';
export type EmojiLayout = 'side' | 'stack';
export type Align = 'left' | 'center';

/** Output target. Page covers are wide banners; gallery covers are 4:3 cards. */
export type CoverMode = 'page' | 'gallery';

export const COVER_DIMENSIONS: Record<CoverMode, { w: number; h: number; label: string }> = {
  page: { w: 1500, h: 600, label: '페이지 커버 (1500×600)' },
  gallery: { w: 1200, h: 900, label: '갤러리 커버 (1200×900)' },
};

export interface CoverParams {
  /** 대제목 — main title (largest line). Required. */
  name: string;
  /** 중제목 — optional secondary line, rendered ~55% of `size`. */
  subtitle?: string;
  /** 소제목 — optional tertiary line, rendered ~35% of `size`. */
  caption?: string;
  style: CoverStyle;
  bg?: string;
  bg2?: string;
  angle?: number;
  fg?: string;
  align?: Align;
  size?: number;
  pattern?: PatternName;
  emoji?: string;
  layout?: EmojiLayout;
  w?: number;
  h?: number;
  /** Font registry key — see lib/fonts.ts FONT_REGISTRY. */
  font?: string;
}

/** Which Notion property feeds each title slot on a cover. `null` = unused. */
export interface PropertyMapping {
  title: string | null; // 대제목 (defaults to the page's title property)
  subtitle: string | null; // 중제목
  caption: string | null; // 소제목
}

/** Description of one Notion DB property — type + display name. */
export interface PropertyMeta {
  name: string;
  type: string;
}

export type DesignCategory = 'solid' | 'gradient' | 'pattern' | 'emoji' | 'custom';

export interface Design {
  id: string;
  label: string;
  category: DesignCategory;
  params: Omit<CoverParams, 'name'>;
}

export interface NotionPageLite {
  id: string;
  title: string;
  currentCoverUrl: string | null;
  url: string;
  /** All readable properties on this page, name → string-coerced value. */
  properties?: Record<string, string>;
}
