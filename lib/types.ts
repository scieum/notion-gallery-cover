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
  name: string;
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
}
