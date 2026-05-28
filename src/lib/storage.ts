import { DEFAULT_WORKSPACE } from "../data/sections";
import type { LegacySection, SectionKind, Theme, Workspace } from "./types";

const WALL_KEY = "bookmark-wall-wallpaper";
const WORKSPACE_KEY = "bookmark-wall-workspace-v2";
const LEGACY_SECTIONS_KEY = "bookmark-wall-sections";
const THEME_KEY = "bookmark-wall-theme";

function normalizePreferences(workspace: Workspace): Workspace {
  return {
    ...workspace,
    preferences: {
      ...DEFAULT_WORKSPACE.preferences,
      ...workspace.preferences,
      cardRadius: Number.isFinite(workspace.preferences?.cardRadius)
        ? Math.max(8, Math.min(26, workspace.preferences.cardRadius))
        : DEFAULT_WORKSPACE.preferences.cardRadius,
      accentGlow: Number.isFinite(workspace.preferences?.accentGlow)
        ? Math.max(0, Math.min(100, workspace.preferences.accentGlow))
        : DEFAULT_WORKSPACE.preferences.accentGlow,
      textScale: Number.isFinite(workspace.preferences?.textScale)
        ? Math.max(85, Math.min(130, workspace.preferences.textScale))
        : DEFAULT_WORKSPACE.preferences.textScale,
      sectionScale: Number.isFinite(workspace.preferences?.sectionScale)
        ? Math.max(80, Math.min(130, workspace.preferences.sectionScale))
        : DEFAULT_WORKSPACE.preferences.sectionScale,
      backgroundDim: Number.isFinite(workspace.preferences?.backgroundDim)
        ? Math.max(20, Math.min(90, workspace.preferences.backgroundDim))
        : DEFAULT_WORKSPACE.preferences.backgroundDim,
      wallpaperBlur: Number.isFinite(workspace.preferences?.wallpaperBlur)
        ? Math.max(0, Math.min(24, workspace.preferences.wallpaperBlur))
        : DEFAULT_WORKSPACE.preferences.wallpaperBlur,
    },
  };
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeUrl(raw: string | undefined) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return "";
    }
  }
}

export function loadWallpaper(): string | null {
  try {
    const value = localStorage.getItem(WALL_KEY);
    // Blob URLs are session-scoped and become invalid after reload.
    if (value?.startsWith("blob:")) return null;
    return value;
  } catch {
    return null;
  }
}

export function saveWallpaper(data: string | null) {
  try {
    if (data === null) localStorage.removeItem(WALL_KEY);
    else localStorage.setItem(WALL_KEY, data);
  } catch {
    // ignore
  }
}

function migrateLegacySections(legacy: LegacySection[]): Workspace {
  const sections = legacy.map((section) => {
    const links = [...(section.items ?? []), ...(section.icons ?? [])]
      .map((item) => {
        const url = normalizeUrl(item.url);
        if (!url) return null;
        return {
          id: uid("bm"),
          label: item.label?.trim() || "Untitled",
          url,
          icon: item.icon,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      id: uid("sec"),
      title: section.title?.trim() || "New section",
      kind: (section.icons?.length ? "repos" : "links") as SectionKind,
      bookmarks: links,
    };
  });

  return {
    version: 2,
    preferences: DEFAULT_WORKSPACE.preferences,
    sections,
  };
}

export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Workspace;
      if (parsed?.version === 2 && Array.isArray(parsed.sections)) return normalizePreferences(parsed);
    }

    const legacyRaw = localStorage.getItem(LEGACY_SECTIONS_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as LegacySection[];
      if (Array.isArray(legacy)) {
        const migrated = migrateLegacySections(legacy);
        saveWorkspace(migrated);
        return migrated;
      }
    }

    return DEFAULT_WORKSPACE;
  } catch {
    return DEFAULT_WORKSPACE;
  }
}

export function saveWorkspace(workspace: Workspace) {
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  } catch {
    // ignore
  }
}

export function loadTheme(): Theme | null {
  try {
    return (localStorage.getItem(THEME_KEY) as Theme | null) ?? null;
  } catch {
    return null;
  }
}

export function saveTheme(value: Theme) {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch {
    // ignore
  }
}
