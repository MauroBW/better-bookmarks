import React, { useEffect, useRef, useState } from "react";
import { SECTIONS as INITIAL, getColor } from "../data/sections";
import { motion } from "framer-motion";

type LinkItem = { label: string; url?: string; icon?: string };
type Section = { title: string; items?: LinkItem[]; icons?: LinkItem[] };

const WALL_KEY = "bookmark-wall-wallpaper";

/* ---------- UI primitives ---------- */
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative rounded-2xl border border-black/5 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md ${className}`}
  >
    {children}
  </motion.div>
);

/* Favicon por hostname (fallback a puntito) */
const Favicon: React.FC<{ url?: string; color?: string }> = ({ url, color }) => {
  if (url) {
    try {
      const { hostname } = new URL(url);
      const src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      return (
        <img
          src={src}
          alt=""
          className="mt-[2px] h-4 w-4 rounded-sm shadow-sm"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      );
    } catch {}
  }
  return (
    <span
      className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: color ?? "#60a5fa" }}
    />
  );
};

/* ---------- Main ---------- */
export default function BookmarkWall() {
  /* datos + orden de secciones */
  const [sections, setSections] = useState<Section[]>(INITIAL);
  /* edición y menú */
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [menuIdx, setMenuIdx] = useState<number | null>(null);
  /* wallpaper */
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(WALL_KEY);
    if (saved) setWallpaper(saved);
  }, []);

  const setWall = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      setWallpaper(url);
      localStorage.setItem(WALL_KEY, url);
    };
    r.readAsDataURL(f);
  };
  const clearWall = () => {
    localStorage.removeItem(WALL_KEY);
    setWallpaper(null);
  };

  /* acciones menú */
  const move = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= sections.length) return;
    const next = sections.slice();
    [next[idx], next[to]] = [next[to], next[idx]];
    setSections(next);
    setMenuIdx(null);
  };
  const remove = (idx: number) => {
    setSections((s) => s.filter((_, i) => i !== idx));
    setMenuIdx(null);
  };
  const toggleEdit = (idx: number) => {
    setEditingIdx((e) => (e === idx ? null : idx));
    setMenuIdx(null);
  };

  /* añadir bookmark (simple con prompt para prototipo) */
  const addBookmark = (idx: number) => {
    const label = window.prompt("Bookmark title:");
    if (!label) return;
    const url = 'https://' + window.prompt("URL (https://…):") || undefined;
    setSections((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              items: [{ label, url }, ...(s.items || [])],
            }
          : s
      )
    );
  };

  return (
    <div className="relative min-h-dvh text-neutral-900  bg-black/30">
      {/* Fondo */}
      {wallpaper && (
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
      )}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_500px_at_0%_0%,rgba(120,120,120,0.18),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(100,110,130,0.22),transparent),linear-gradient(180deg,rgba(245,246,248,0.88),rgba(245,246,248,0.88))]" />

      <div className="relative px-8 py-10">
        {/* Header + acciones wallpaper */}
        <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
          <div className="flex w-full max-w-lg items-center gap-3 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-70"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              placeholder="Google"
            />
          </div>

          <div className="ml-4 flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={setWall}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur hover:shadow"
            >
              Set wallpaper
            </button>
            {wallpaper && (
              <button
                onClick={clearWall}
                className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm hover:shadow"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, idx) => (
            <Card key={`${section.title}-${idx}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-800">
                  {section.title}
                </h3>

                {/* Botón menú */}
                <div className="relative">
                  <button
                    onClick={() => setMenuIdx((m) => (m === idx ? null : idx))}
                    className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                    aria-haspopup="menu"
                    aria-expanded={menuIdx === idx}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>

                  {menuIdx === idx && (
                    <div
                      role="menu"
                      className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-xl border border-black/10 bg-white/95 p-1 text-sm shadow-lg backdrop-blur"
                    >
                      <button
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100"
                        onClick={() => toggleEdit(idx)}
                      >
                        {editingIdx === idx ? "Stop editing" : "Edit section"}
                      </button>
                      <button
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100"
                        onClick={() => move(idx, -1)}
                      >
                        Move left
                      </button>
                      <button
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100"
                        onClick={() => move(idx, +1)}
                      >
                        Move right
                      </button>
                      <button
                        className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                        onClick={() => remove(idx)}
                      >
                        Remove section
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de bookmarks */}
              {section.items && (
                <ul className="space-y-2">
                  {/* Placeholder cuando está en edición */}
                  {editingIdx === idx && (
                    <li className="flex items-center justify-between rounded-lg border border-dashed border-neutral-300 bg-neutral-100/70 px-3 py-2 text-sm text-neutral-600">
                      <span className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-sm bg-neutral-300" />
                        New bookmark…
                      </span>
                      <button
                        onClick={() => addBookmark(idx)}
                        className="rounded-md border border-black/10 bg-white/80 px-2 py-1 text-xs hover:shadow"
                      >
                        Add
                      </button>
                    </li>
                  )}

                  {section.items.map((item, i) => (
                    <li
                      key={`${item.label}-${i}`}
                      className="flex items-start gap-3 text-sm text-neutral-700"
                    >
                      <Favicon url={item.url} color={getColor(i)} />
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Grid de íconos (se mantiene igual) */}
              {section.icons && (
                <div className="grid grid-cols-4 gap-4 pt-3">
                  {section.icons.map((app) => (
                    <a
                      key={app.label}
                      href={app.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col items-center gap-2 rounded-xl border border-transparent bg-white/60 p-3 text-center text-xs text-neutral-700 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 text-2xl shadow-inner">
                        {app.icon || "🔗"}
                      </div>
                      <span className="line-clamp-1">{app.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
