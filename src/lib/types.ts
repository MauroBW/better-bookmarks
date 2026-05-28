export type Theme = "light" | "dark";

export type SectionKind = "links" | "repos" | "mixed";

export type Bookmark = {
  id: string;
  label: string;
  url: string;
  icon?: string;
  tags?: string[];
  pinned?: boolean;
};

export type SectionPosition = {
  x: number;
  y: number;
};

export type Section = {
  id: string;
  title: string;
  kind: SectionKind;
  color?: string;
  icon?: string;
  position?: SectionPosition;
  bookmarks: Bookmark[];
};

export type WorkspacePreferences = {
  showFavicons: boolean;
  compactMode: boolean;
  cardRadius: number;
  accentGlow: number;
  textScale: number;
  sectionScale: number;
  backgroundDim: number;
  wallpaperBlur: number;
};

export type Workspace = {
  version: 2;
  sections: Section[];
  preferences: WorkspacePreferences;
};

// Legacy v1 shape for migrations
export type LegacyLinkItem = {
  label: string;
  url?: string;
  icon?: string;
};

export type LegacySection = {
  title: string;
  items?: LegacyLinkItem[];
  icons?: LegacyLinkItem[];
};