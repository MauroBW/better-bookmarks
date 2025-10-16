import React, { useEffect, useRef, useState } from "react";
import { SECTIONS as INITIAL } from "../data/sections";
import { loadWallpaper, saveWallpaper, loadSections, saveSections, loadTheme, saveTheme } from "../lib/storage";
import Header from "./Header";
import SectionCard from "./SectionCard";
import type { Section } from "../lib/types";

/* ---------- Main ---------- */
export default function BookmarkWall() {
  /* datos + orden de secciones */
  const [sections, setSections] = useState<Section[]>(INITIAL);
  /* edición y menú */
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [menuIdx, setMenuIdx] = useState<number | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<{
    sectionIdx: number;
    itemIdx: number;
    label: string;
    url?: string;
  } | null>(null);
  const [bookmarkMenu, setBookmarkMenu] = useState<{ s: number; i: number } | null>(null);
  /* wallpaper */
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme() ?? 'light');
  const fileRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = loadWallpaper();
    if (saved) setWallpaper(saved);

    const savedSections = loadSections();
    if (savedSections) setSections(savedSections);
    // apply theme
    const savedTheme = loadTheme();
    const t = savedTheme ?? theme;
    setTheme(t);
    if (t === 'dark') document.documentElement.classList.add('dark-theme');
    else document.documentElement.classList.remove('dark-theme');
  }, []);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      // if click is inside the root container, but not inside an open menu, close menus
      const el = e.target as Node | null;
      if (!rootRef.current) return;
      if (!el) return;
      // if click is inside root but not within any [role="menu"] element, close menus
      const menu = rootRef.current.querySelector('[role="menu"]');
      if (!menu) return setMenuIdx(null), setBookmarkMenu(null);
      if (!menu.contains(el)) {
        setMenuIdx(null);
        setBookmarkMenu(null);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuIdx(null);
        setBookmarkMenu(null);
      }
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [setMenuIdx, setBookmarkMenu]);

  const setWall = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      setWallpaper(url);
      saveWallpaper(url);
    };
    r.readAsDataURL(f);
  };
  const clearWall = () => {
    saveWallpaper(null);
    setWallpaper(null);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    saveTheme(next);
    if (next === 'dark') document.documentElement.classList.add('dark-theme');
    else document.documentElement.classList.remove('dark-theme');
  };

  /* acciones menú */
  const move = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= sections.length) return;
    const next = sections.slice();
    [next[idx], next[to]] = [next[to], next[idx]];
    setSections(next);
    setMenuIdx(null);
    saveSections(next);
  };
  const remove = (idx: number) => {
    setSections((s) => s.filter((_, i) => i !== idx));
    setMenuIdx(null);
    // persist
    saveSections(sections.filter((_, i) => i !== idx));
  };
  const toggleEdit = (idx: number) => {
    setEditingIdx((e) => (e === idx ? null : idx));
    setMenuIdx(null);
  };

  const startEditBookmark = (sectionIdx: number, itemIdx: number) => {
    const item = sections[sectionIdx].items?.[itemIdx];
    if (!item) return;
    setEditingBookmark({ sectionIdx, itemIdx, label: item.label, url: item.url });
  };

  const saveEditBookmark = () => {
    if (!editingBookmark) return;
    const { sectionIdx, itemIdx, label, url } = editingBookmark;
    const next = sections.map((s, si) =>
      si === sectionIdx
        ? {
            ...s,
            items: s.items?.map((it, ii) => (ii === itemIdx ? { ...it, label, url } : it)),
          }
        : s
    );
    setSections(next);
    saveSections(next);
    setEditingBookmark(null);
  };

  const moveBookmark = (sectionIdx: number, itemIdx: number, dir: -1 | 1) => {
    const items = sections[sectionIdx].items ?? [];
    const to = itemIdx + dir;
    if (to < 0 || to >= items.length) return;
    const nextItems = items.slice();
    [nextItems[itemIdx], nextItems[to]] = [nextItems[to], nextItems[itemIdx]];
    const next = sections.map((s, si) => (si === sectionIdx ? { ...s, items: nextItems } : s));
    setSections(next);
    saveSections(next);
  };

  /* añadir bookmark (simple con prompt para prototipo) */
  const addBookmark = (idx: number) => {
    const label = window.prompt("Bookmark title:");
    if (!label) return;
    const url = 'https://' + window.prompt("URL (https://…):") || undefined;
    const next = sections.map((s, i) =>
      i === idx
        ? {
            ...s,
            items: [{ label, url }, ...(s.items || [])],
          }
        : s
    );
    setSections(next);
    saveSections(next);
  };

  return (
    <div className="relative min-h-dvh text-text-primary bg-[color:var(--bg)]">
      {/* Fondo */}
      {wallpaper && (
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
      )}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_500px_at_0%_0%,rgba(120,120,120,0.18),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(100,110,130,0.22),transparent),linear-gradient(180deg,rgba(245,246,248,0.88),rgba(245,246,248,0.88))]" />

    <div ref={rootRef} className="relative px-8 py-10">
        <Header fileRef={fileRef} onSetWall={setWall} onClearWall={clearWall} wallpaper={wallpaper} theme={theme} toggleTheme={toggleTheme} />

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, idx) => (
            <SectionCard
              key={`${section.title}-${idx}`}
              section={section}
              idx={idx}
              menuIdx={menuIdx}
              editingIdx={editingIdx}
              bookmarkMenu={bookmarkMenu}
              editingBookmark={editingBookmark}
              setMenuIdx={setMenuIdx}
              toggleEdit={toggleEdit}
              addBookmark={addBookmark}
              startEditBookmark={startEditBookmark}
              setBookmarkMenu={setBookmarkMenu}
              moveBookmark={moveBookmark}
              move={move}
              remove={remove}
              setEditingBookmark={setEditingBookmark}
              saveEditBookmark={saveEditBookmark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
