export type CoverStyle = 'solid' | 'gradient' | 'pattern' | 'emoji';
export type PatternName = 'dots' | 'lines' | 'grid' | 'waves' | 'circles';
export type EmojiLayout = 'side' | 'stack';
export type Align = 'left' | 'center';

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
