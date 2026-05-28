import { useEffect, useMemo, useState } from "react";
import { DEFAULT_WORKSPACE } from "../data/sections";
import { loadWorkspace, saveWorkspace } from "../lib/storage";
import { normalizeUrl, uid } from "../lib/utils";
import type { Bookmark, Section, SectionKind, SectionPosition, Workspace } from "../lib/types";

function normalizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim();
  const sixDigit = /^#[0-9a-fA-F]{6}$/;
  if (sixDigit.test(trimmed)) return trimmed.toLowerCase();
  const threeDigit = /^#[0-9a-fA-F]{3}$/;
  if (threeDigit.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

function reorder<T>(items: T[], from: number, to: number) {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace());

  useEffect(() => {
    const t = setTimeout(() => saveWorkspace(workspace), 250);
    return () => clearTimeout(t);
  }, [workspace]);

  const actions = useMemo(
    () => ({
      addSection(kind: SectionKind) {
        const newSection: Section = {
          id: uid("sec"),
          title: kind === "repos" ? "New repositories" : "New section",
          kind,
          bookmarks: [],
        };
        setWorkspace((prev) => ({ ...prev, sections: [newSection, ...prev.sections] }));
      },
      renameSection(sectionId: string, title: string) {
        setWorkspace((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section.id === sectionId ? { ...section, title: title.trim() || "Untitled section" } : section
          ),
        }));
      },
      removeSection(sectionId: string) {
        setWorkspace((prev) => ({
          ...prev,
          sections: prev.sections.filter((section) => section.id !== sectionId),
        }));
      },
      moveSection(fromIndex: number, toIndex: number) {
        if (toIndex < 0) return;
        setWorkspace((prev) => ({
          ...prev,
          sections: reorder(prev.sections, fromIndex, toIndex),
        }));
      },
      addBookmark(sectionId: string, draft: { label: string; url: string; icon?: string }) {
        const url = normalizeUrl(draft.url);
        if (!url) return false;
        const nextBookmark: Bookmark = {
          id: uid("bm"),
          label: draft.label.trim() || "Untitled",
          url,
          icon: draft.icon?.trim() || undefined,
        };
        setWorkspace((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section.id === sectionId
              ? { ...section, bookmarks: [nextBookmark, ...section.bookmarks] }
              : section
          ),
        }));
        return true;
      },
      updateBookmark(
        sectionId: string,
        bookmarkId: string,
        draft: { label: string; url: string; icon?: string }
      ) {
        const url = normalizeUrl(draft.url);
        if (!url) return false;
        setWorkspace((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  bookmarks: section.bookmarks.map((bookmark) =>
                    bookmark.id === bookmarkId
                      ? {
                          ...bookmark,
                          label: draft.label.trim() || "Untitled",
                          url,
                          icon: draft.icon?.trim() || undefined,
                        }
                      : bookmark
                  ),
                }
              : section
          ),
        }));
        return true;
      },
      removeBookmark(sectionId: string, bookmarkId: string) {
        setWorkspace((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  bookmarks: section.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
                }
              : section
          ),
        }));
      },
      moveBookmark(sectionId: string, fromIndex: number, toIndex: number) {
        if (toIndex < 0) return;
        setWorkspace((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section.id === sectionId
              ? { ...section, bookmarks: reorder(section.bookmarks, fromIndex, toIndex) }
              : section
          ),
        }));
      },
      moveBookmarkAcrossSections(
        fromSectionId: string,
        toSectionId: string,
        bookmarkId: string,
        toIndex: number
      ) {
        if (fromSectionId === toSectionId) return;
        setWorkspace((prev) => {
          const fromSection = prev.sections.find((section) => section.id === fromSectionId);
          const movingBookmark = fromSection?.bookmarks.find((bookmark) => bookmark.id === bookmarkId);
          if (!movingBookmark) return prev;

          return {
            ...prev,
            sections: prev.sections.map((section) => {
              if (section.id === fromSectionId) {
                return {
                  ...section,
                  bookmarks: section.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
                };
              }
              if (section.id === toSectionId) {
                const nextBookmarks = section.bookmarks.slice();
                nextBookmarks.splice(Math.max(0, toIndex), 0, movingBookmark);
                return {
                  ...section,
                  bookmarks: nextBookmarks,
                };
              }
              return section;
            }),
          };
        });
      },
      resetWorkspace() {
        setWorkspace(DEFAULT_WORKSPACE);
      },
      setCompactMode(compactMode: boolean) {
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, compactMode },
        }));
      },
      setFreeLayoutMode(freeLayoutMode: boolean) {
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, freeLayoutMode },
        }));
      },
      setShowFavicons(showFavicons: boolean) {
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, showFavicons },
        }));
      },
      setAccentColor(accentColor: string) {
        setWorkspace((prev) => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            accentColor: normalizeHexColor(accentColor, prev.preferences.accentColor),
          },
        }));
      },
      setSectionPosition(sectionId: string, position: SectionPosition) {
        setWorkspace((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section.id === sectionId ? { ...section, position } : section
          ),
        }));
      },
      setCardRadius(cardRadius: number) {
        const clamped = Math.max(8, Math.min(26, cardRadius));
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, cardRadius: clamped },
        }));
      },
      setAccentGlow(accentGlow: number) {
        const clamped = Math.max(0, Math.min(100, accentGlow));
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, accentGlow: clamped },
        }));
      },
      setTextScale(textScale: number) {
        const clamped = Math.max(85, Math.min(130, textScale));
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, textScale: clamped },
        }));
      },
      setSectionScale(sectionScale: number) {
        const clamped = Math.max(80, Math.min(130, sectionScale));
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, sectionScale: clamped },
        }));
      },
      setBackgroundDim(backgroundDim: number) {
        const clamped = Math.max(20, Math.min(90, backgroundDim));
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, backgroundDim: clamped },
        }));
      },
      setWallpaperBlur(wallpaperBlur: number) {
        const clamped = Math.max(0, Math.min(24, wallpaperBlur));
        setWorkspace((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, wallpaperBlur: clamped },
        }));
      },
    }),
    []
  );

  return { workspace, actions };
}
