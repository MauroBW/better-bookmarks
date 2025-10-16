import React, { useState } from "react";
import Card from "./Card";
import Favicon from "./Favicon";
import { getColor } from "../data/sections";
import type { LinkItem, Section } from "../lib/types";
import { createPortal } from "react-dom";

type Props = {
  section: Section;
  idx: number;
  menuIdx: number | null;
  editingIdx: number | null;
  bookmarkMenu: { s: number; i: number } | null;
  editingBookmark: { sectionIdx: number; itemIdx: number; label: string; url?: string } | null;
  setMenuIdx: React.Dispatch<React.SetStateAction<number | null>>;
  toggleEdit: (idx: number) => void;
  addBookmark: (idx: number) => void;
  startEditBookmark: (s: number, i: number) => void;
  setBookmarkMenu: React.Dispatch<React.SetStateAction<{ s: number; i: number } | null>>;
  moveBookmark: (s: number, i: number, dir: -1 | 1) => void;
  move: (idx: number, dir: -1 | 1) => void;
  remove: (idx: number) => void;
  setEditingBookmark: React.Dispatch<React.SetStateAction<{ sectionIdx: number; itemIdx: number; label: string; url?: string } | null>>;
  saveEditBookmark: () => void;
};

const SectionCard: React.FC<Props> = ({
  section,
  idx,
  menuIdx,
  editingIdx,
  bookmarkMenu,
  editingBookmark,
  setMenuIdx,
  toggleEdit,
  addBookmark,
  startEditBookmark,
  setBookmarkMenu,
  moveBookmark,
  move,
  remove,
  setEditingBookmark,
  saveEditBookmark,
}) => {
  const [menuPos, setMenuPos] = useState<DOMRect | null>(null);
  const [bmPos, setBmPos] = useState<DOMRect | null>(null);

  const renderPortal = (content: React.ReactNode, pos: DOMRect | null) => {
    if (typeof document === "undefined" || !pos) return null;
    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.left,
      top: pos.bottom + 8,
      zIndex: 9999,
    };
    return createPortal(
      <div style={style} onClick={(e) => e.stopPropagation()}>
        {content}
      </div>,
      document.body
    );
  };

  return (
    <Card key={`${section.title}-${idx}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">{section.title}</h3>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const willOpen = !(menuIdx === idx);
              setMenuPos(willOpen ? rect : null);
              setMenuIdx((m) => (m === idx ? null : idx));
            }}
            className="rounded-md p-1.5 text-text-muted hover:bg-card-hover"
            aria-haspopup="menu"
            aria-expanded={menuIdx === idx}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>

          {menuIdx === idx && renderPortal(
            <div role="menu" className="w-44 overflow-hidden rounded-xl border border-card bg-card p-1 text-sm shadow-lg backdrop-blur">
              <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100" onClick={() => toggleEdit(idx)}>
                {editingIdx === idx ? "Stop editing" : "Edit section"}
              </button>
              <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100" onClick={() => addBookmark(idx)}>
                Add bookmark
              </button>
              <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100" onClick={() => move(idx, -1)}>
                Move left
              </button>
              <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100" onClick={() => move(idx, +1)}>
                Move right
              </button>
              <button className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50" onClick={() => remove(idx)}>
                Remove section
              </button>
            </div>
          , menuPos)}
        </div>
      </div>

      {section.items && (
        <ul className="space-y-2">
          {editingIdx === idx && (
            <li className="flex items-center justify-between rounded-lg border border-dashed border-card bg-card px-3 py-2 text-sm text-text-muted">
              <span className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-sm bg-card-hover" />
                New bookmark…
              </span>
              <button onClick={() => addBookmark(idx)} className="rounded-md border border-card bg-card-elevated px-2 py-1 text-xs hover:shadow">Add</button>
            </li>
          )}

          {section.items.map((item: LinkItem, i: number) => (
            <li key={`${item.label}-${i}`} className="flex items-center gap-3 text-sm text-text-secondary">
              <Favicon url={item.url} color={getColor(i)} />
              <div className="flex items-center gap-3 w-full">
                {editingBookmark && editingBookmark.sectionIdx === idx && editingBookmark.itemIdx === i ? (
                  <div className="flex w-full items-center gap-2">
                    <input value={editingBookmark.label} onChange={(e) => setEditingBookmark((s: any) => (s ? { ...s, label: e.target.value } : s))} className="flex-1 rounded-md px-2 py-1" />
                    <input value={editingBookmark.url ?? ''} onChange={(e) => setEditingBookmark((s: any) => (s ? { ...s, url: e.target.value } : s))} className="flex-1 rounded-md px-2 py-1" />
                    <button onClick={saveEditBookmark} className="ml-2 text-sm">Save</button>
                    <button onClick={() => setEditingBookmark(null)} className="ml-2 text-sm">Cancel</button>
                  </div>
                ) : (
                  <>
                    <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline flex-1">{item.label}</a>
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); const willOpen = !(bookmarkMenu && bookmarkMenu.s === idx && bookmarkMenu.i === i); setBmPos(willOpen ? rect : null); setBookmarkMenu((m: any) => (m && m.s === idx && m.i === i ? null : { s: idx, i })); }} className="text-text-muted hover:bg-card-hover" aria-haspopup="menu" aria-expanded={bookmarkMenu?.s === idx && bookmarkMenu?.i === i}>
                        <svg width="13" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="5" cy="12" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                        </svg>
                      </button>

                      {bookmarkMenu?.s === idx && bookmarkMenu?.i === i && renderPortal(
                        <div role="menu" className="w-30 overflow-visible rounded-s border border-card bg-card p-1 text-sm shadow-lg">
                          <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100" onClick={() => { startEditBookmark(idx, i); setBookmarkMenu(null); setBmPos(null); }}>
                            Edit
                          </button>
                          <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100" onClick={() => { moveBookmark(idx, i, -1); setBookmarkMenu(null); setBmPos(null); }}>
                            Move up
                          </button>
                          <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100" onClick={() => { moveBookmark(idx, i, +1); setBookmarkMenu(null); setBmPos(null); }}>
                            Move down
                          </button>
                        </div>
                      , bmPos)}
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {section.icons && (
        <div className="grid grid-cols-4 gap-4 pt-3">
          {section.icons.map((app: LinkItem) => (
            <a key={app.label} href={app.url} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 rounded-xl border border-transparent bg-card p-3 text-center text-xs text-text-secondary shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 text-2xl shadow-inner">{app.icon || "🔗"}</div>
              <span className="line-clamp-1">{app.label}</span>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SectionCard;
