import type { Section } from "./types";

const WALL_KEY = "bookmark-wall-wallpaper";
const SECTIONS_KEY = "bookmark-wall-sections";

export function loadWallpaper(): string | null {
  try {
    return localStorage.getItem(WALL_KEY);
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

export function loadSections(): Section[] | null {
  try {
    const raw = localStorage.getItem(SECTIONS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Section[];
  } catch {
    return null;
  }
}

export function saveSections(sections: Section[]) {
  try {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
  } catch {
    // ignore
  }
}

const THEME_KEY = "bookmark-wall-theme";

export function loadTheme(): "dark" | "light" | null {
  try {
    return (localStorage.getItem(THEME_KEY) as "dark" | "light" | null) ?? null;
  } catch {
    return null;
  }
}

export function saveTheme(value: "dark" | "light") {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch {
    // ignore
  }
}
