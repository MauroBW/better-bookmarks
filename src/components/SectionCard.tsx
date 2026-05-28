import React, { useMemo, useState } from "react";
import Card from "./Card";
import Favicon from "./Favicon";
import { getColor } from "../data/sections";
import type { Bookmark, Section } from "../lib/types";
import { createPortal } from "react-dom";
import { getRepoMeta } from "../lib/utils";

type Props = {
  section: Section;
  sectionIndex: number;
  compactMode: boolean;
  showFavicons: boolean;
  searchTerm: string;
  freeLayoutMode: boolean;
  isBeingDragged: boolean;
  onStartFreeSectionDrag: (event: React.PointerEvent) => void;
  onRenameSection: (sectionId: string, title: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
  onOpenAddBookmark: (sectionId: string) => void;
  onOpenEditBookmark: (sectionId: string, bookmark: Bookmark) => void;
  onRemoveBookmark: (sectionId: string, bookmarkId: string) => void;
  onDropBookmark: (targetSectionId: string, bookmarkId: string, sourceSectionId: string) => void;
};

const SectionCard: React.FC<Props> = ({
  section,
  sectionIndex,
  compactMode,
  showFavicons,
  searchTerm,
  freeLayoutMode,
  isBeingDragged,
  onStartFreeSectionDrag,
  onRenameSection,
  onRemoveSection,
  onMoveSection,
  onOpenAddBookmark,
  onOpenEditBookmark,
  onRemoveBookmark,
  onDropBookmark,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [menuPos, setMenuPos] = useState<DOMRect | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBookmarkDropActive, setBookmarkDropActive] = useState(false);

  const filteredBookmarks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return section.bookmarks;
    return section.bookmarks.filter((bookmark) => {
      const base = `${bookmark.label} ${bookmark.url}`.toLowerCase();
      return base.includes(q);
    });
  }, [searchTerm, section.bookmarks]);

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

  const submitTitle = () => {
    onRenameSection(section.id, titleDraft);
    setEditingTitle(false);
  };

  const onSectionDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (freeLayoutMode) return;
    event.preventDefault();
    const payload = event.dataTransfer.getData("application/bookmark-section");
    if (!payload) return;
    const fromIndex = Number(payload);
    if (Number.isNaN(fromIndex)) return;
    onMoveSection(fromIndex, sectionIndex);
  };

  const onBookmarkDrop: React.DragEventHandler<HTMLUListElement> = (event) => {
    event.preventDefault();
    setBookmarkDropActive(false);
    const payload = event.dataTransfer.getData("application/bookmark-id");
    const sourceSection = event.dataTransfer.getData("application/bookmark-section-id");
    if (!payload || !sourceSection) return;
    onDropBookmark(section.id, payload, sourceSection);
  };

  const compactClass = compactMode ? "space-y-1" : "space-y-2";
  const cardTone = section.kind === "repos" ? "section-card section-card-repos" : "section-card";

  return (
    <Card
      className={`${cardTone} ${isBookmarkDropActive ? "ring-2 ring-[color:var(--accent)]/70" : ""} ${isBeingDragged ? "section-dragging" : ""}`}
    >
      <div onDragOver={(event) => event.preventDefault()} onDrop={onSectionDrop}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="section-drag-handle"
              aria-hidden
              draggable={!freeLayoutMode}
              onPointerDown={freeLayoutMode ? onStartFreeSectionDrag : undefined}
              onDragStart={
                freeLayoutMode
                  ? undefined
                  : (event) => {
                      event.dataTransfer.setData("application/bookmark-section", String(sectionIndex));
                      event.dataTransfer.effectAllowed = "move";
                    }
              }
            >
              ⋮⋮
            </span>
            {editingTitle ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-[color:var(--surface-strong)] px-2 py-1 text-sm"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitTitle();
                  }}
                  autoFocus
                />
                <button className="text-xs text-text-secondary" onClick={submitTitle}>
                  Save
                </button>
              </div>
            ) : (
              <>
                <h3 className="section-title truncate text-text-primary">
                  {section.title}
                </h3>
                <span className={`section-badge ${section.kind === "repos" ? "section-badge-repos" : "section-badge-links"}`}>
                  {section.kind}
                </span>
              </>
            )}
          </div>

          <div className="section-actions relative flex items-center gap-1 text-[color:var(--text-soft)]">
            <button className="action-icon" onClick={() => setEditingTitle(true)} aria-label="Edit section title">
              ✎
            </button>
            {!freeLayoutMode ? (
              <>
                <button className="action-icon" onClick={() => onMoveSection(sectionIndex, sectionIndex - 1)} aria-label="Move section left">
                  ‹
                </button>
                <button className="action-icon" onClick={() => onMoveSection(sectionIndex, sectionIndex + 1)} aria-label="Move section right">
                  ›
                </button>
              </>
            ) : null}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const willOpen = !menuOpen;
                setMenuPos(willOpen ? rect : null);
                setMenuOpen(willOpen);
              }}
              className="action-icon"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              ⋯
            </button>

            {menuOpen &&
              renderPortal(
                <div role="menu" className="w-44 overflow-hidden rounded-xl border border-white/10 bg-[color:var(--surface)] p-1 text-sm shadow-lg backdrop-blur">
                  <button
                    className="menu-item"
                    onClick={() => {
                      setEditingTitle(true);
                      setMenuOpen(false);
                    }}
                  >
                    Rename section
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => {
                      onOpenAddBookmark(section.id);
                      setMenuOpen(false);
                    }}
                  >
                    Add bookmark
                  </button>
                  <button className="menu-item text-red-400 hover:bg-red-500/15" onClick={() => onRemoveSection(section.id)}>
                    Remove section
                  </button>
                </div>,
                menuPos
              )}
          </div>
        </div>

        <ul
          className={compactClass}
          onDragOver={(event) => {
            event.preventDefault();
            setBookmarkDropActive(true);
          }}
          onDragLeave={() => setBookmarkDropActive(false)}
          onDrop={onBookmarkDrop}
        >
          {filteredBookmarks.length === 0 ? (
            <li className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-5 text-center text-sm text-text-muted">
              {searchTerm ? "No bookmarks found. Try another search." : "No bookmarks yet. Drop a link here or add your first bookmark."}
            </li>
          ) : (
            filteredBookmarks.map((bookmark, index) => {
              return (
                <li
                  key={bookmark.id}
                  className={`bookmark-row ${compactMode ? "bookmark-row-compact" : ""}`}
                  draggable
                  onDragStart={(event) => {
                    event.stopPropagation();
                    event.dataTransfer.setData("application/bookmark-id", bookmark.id);
                    event.dataTransfer.setData("application/bookmark-section-id", section.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                >
                  {showFavicons ? (
                    <Favicon url={bookmark.url} color={getColor(index)} className="h-8 w-8 rounded-lg" />
                  ) : null}
                  <a href={bookmark.url} target="_blank" rel="noreferrer" className="bookmark-content">
                    {section.kind === "repos" ? (
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <RepoBadge url={bookmark.url} />
                          <p className="bookmark-title min-w-0 [word-break:break-word]">
                            {bookmark.label}
                          </p>
                        </div>
                        <p className="bookmark-url mt-0.5">{bookmark.url}</p>
                      </div>
                    ) : (
                      <>
                        <p className="bookmark-title [word-break:break-word]">
                          {bookmark.icon ? `${bookmark.icon} ` : ""}
                          {bookmark.label}
                        </p>
                        <p className="bookmark-url mt-0.5">{bookmark.url}</p>
                      </>
                    )}
                  </a>
                  <button
                    className="bookmark-edit-btn"
                    onClick={() => onOpenEditBookmark(section.id, bookmark)}
                    aria-label={`Edit ${bookmark.label}`}
                  >
                    ✎
                  </button>
                  <button
                    className="bookmark-edit-btn bookmark-delete-btn"
                    onClick={() => onRemoveBookmark(section.id, bookmark.id)}
                    aria-label={`Delete ${bookmark.label}`}
                  >
                    🗑
                  </button>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bookmark-open-btn"
                    aria-label={`Open ${bookmark.label}`}
                  >
                    ↗
                  </a>
              </li>
            );
          })
        )}

        {isBookmarkDropActive ? (
          <li className="dropzone active">Drop here to add to this section</li>
        ) : null}
      </ul>

      {!searchTerm && filteredBookmarks.length > 0 ? (
        <button
          className="add-bookmark-row add-bookmark-row-hover mt-3 w-full"
          onClick={() => onOpenAddBookmark(section.id)}
        >
          + Add Bookmark
        </button>
      ) : null}
      </div>
    </Card>
  );
};

const RepoBadge: React.FC<{ url: string }> = ({ url }) => {
  const { provider } = getRepoMeta(url);
  const mapping: Record<string, { label: string; className: string }> = {
    github: { label: "GitHub", className: "provider-badge provider-github" },
    gitlab: { label: "GitLab", className: "provider-badge provider-gitlab" },
    bitbucket: { label: "Bitbucket", className: "provider-badge provider-bitbucket" },
    other: { label: "Other", className: "provider-badge provider-other" },
  };
  const item = mapping[provider] ?? mapping.other;
  return (
    <span className={item.className}>{item.label}</span>
  );
};

export default SectionCard;
