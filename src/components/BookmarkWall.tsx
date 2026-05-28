import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import SectionCard from "./SectionCard";
import HackerClock from "./HackerClock";
import { useTheme } from "../hooks/useTheme";
import { useWallpaper } from "../hooks/useWallpaper";
import { useWorkspace } from "../hooks/useWorkspace";
import BookmarkEditorModal from "./BookmarkEditorModal";
import type { Bookmark, Section } from "../lib/types";
import defaultBackground from "../../background/background_1.jpg";

function toRgb(color: string) {
  const normalized = color.trim().toLowerCase();
  const sixDigit = /^#[0-9a-f]{6}$/;
  if (!sixDigit.test(normalized)) return null;
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

/* ---------- Main ---------- */
export default function BookmarkWall() {
  const { workspace, actions } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const { wallpaper, updateWallpaper } = useWallpaper();

  const [searchTerm, setSearchTerm] = useState("");
  const [wallpaperFailed, setWallpaperFailed] = useState(false);
  const [editorState, setEditorState] = useState<
    | {
        mode: "create" | "edit";
        sectionId: string;
        bookmark?: Bookmark;
      }
    | null
  >(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const freeCanvasRef = useRef<HTMLDivElement | null>(null);

  const setWall = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const input = e.currentTarget;
    setWallpaperFailed(false);

    const r = new FileReader();
    r.onload = () => {
      if (typeof r.result === "string") {
        setWallpaperFailed(false);
        updateWallpaper(r.result);
      }
    };
    r.onerror = () => {
      setWallpaperFailed(true);
    };
    r.readAsDataURL(f);
    // Allow selecting the same file again.
    input.value = "";
  };
  const clearWall = () => {
    setWallpaperFailed(false);
    updateWallpaper(null);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditorState(null);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.getElementById("bookmark-search-input") as HTMLInputElement | null;
        input?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setWallpaperFailed(false);
  }, [wallpaper]);

  const defaultSectionPosition = (index: number) => ({
    x: (index % 3) * 388,
    y: Math.floor(index / 3) * 390,
  });

  const getSectionPosition = (section: Section, index: number) =>
    section.position ?? defaultSectionPosition(index);

  const startFreeSectionDrag = (event: React.PointerEvent, section: Section, index: number) => {
    if (!workspace.preferences.freeLayoutMode || event.button !== 0) return;
    const canvas = freeCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentPosition = getSectionPosition(section, index);
    dragOffsetRef.current = {
      x: event.clientX - rect.left - currentPosition.x,
      y: event.clientY - rect.top - currentPosition.y,
    };
    setDraggingSectionId(section.id);
    event.preventDefault();
  };

  useEffect(() => {
    if (!workspace.preferences.freeLayoutMode || !draggingSectionId) return;

    const onPointerMove = (event: PointerEvent) => {
      const canvas = freeCanvasRef.current;
      const offset = dragOffsetRef.current;
      if (!canvas || !offset) return;
      const rect = canvas.getBoundingClientRect();
      const nextX = Math.max(0, event.clientX - rect.left - offset.x);
      const nextY = Math.max(0, event.clientY - rect.top - offset.y);
      actions.setSectionPosition(draggingSectionId, { x: nextX, y: nextY });
    };

    const onPointerUp = () => {
      dragOffsetRef.current = null;
      setDraggingSectionId(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [actions, draggingSectionId, workspace.preferences.freeLayoutMode]);

  const visualStyle = {
    "--clock-color": workspace.preferences.accentColor,
    "--clock-rgb": (() => {
      const rgb = toRgb(workspace.preferences.accentColor);
      return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "226, 232, 240";
    })(),
    "--card-radius": `${workspace.preferences.cardRadius}px`,
    "--accent-glow-alpha": `${workspace.preferences.accentGlow / 100}`,
    "--ui-text-scale": `${workspace.preferences.textScale / 100}`,
    "--section-scale": `${workspace.preferences.sectionScale / 100}`,
  } as React.CSSProperties;
  const backgroundDimOpacity = workspace.preferences.backgroundDim / 100;
  const wallpaperBrightness = 1 - workspace.preferences.backgroundDim / 250;

  const wallpaperStyle: React.CSSProperties = {
    filter: `brightness(${wallpaperBrightness}) blur(${workspace.preferences.wallpaperBlur}px)`,
    transform: workspace.preferences.wallpaperBlur > 0 ? "scale(1.04)" : undefined,
  };

  return (
    <div className="relative min-h-dvh text-text-primary" style={visualStyle}>
      <img
        src={wallpaper && !wallpaperFailed ? wallpaper : defaultBackground}
        alt=""
        className="fixed inset-0 z-0 h-full w-full object-cover transition-[filter] duration-200"
        style={wallpaperStyle}
        onError={() => setWallpaperFailed(true)}
      />
      <div
        className="fixed inset-0 z-10 transition-opacity duration-200"
        style={{
          background: "var(--canvas-overlay)",
          opacity: backgroundDimOpacity,
        }}
      />

      <div className="relative z-20 px-6 py-8">
        <Header
          fileRef={fileRef}
          onSetWall={setWall}
          onClearWall={clearWall}
          wallpaper={wallpaper}
          theme={theme}
          toggleTheme={toggleTheme}
          onAddSection={() => actions.addSection("links")}
          onOpenBookmarkModal={() => {
            const firstSection = workspace.sections[0];
            if (!firstSection) return;
            setEditorState({ mode: "create", sectionId: firstSection.id });
          }}
          preferences={workspace.preferences}
          onToggleCompactMode={() => actions.setCompactMode(!workspace.preferences.compactMode)}
          onToggleFreeLayoutMode={() =>
            actions.setFreeLayoutMode(!workspace.preferences.freeLayoutMode)
          }
          onToggleFavicons={() => actions.setShowFavicons(!workspace.preferences.showFavicons)}
          onAccentColorChange={actions.setAccentColor}
          onCardRadiusChange={actions.setCardRadius}
          onAccentGlowChange={actions.setAccentGlow}
          onTextScaleChange={actions.setTextScale}
          onSectionScaleChange={actions.setSectionScale}
          onBackgroundDimChange={actions.setBackgroundDim}
          onWallpaperBlurChange={actions.setWallpaperBlur}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {workspace.preferences.freeLayoutMode ? (
          <div
            ref={freeCanvasRef}
            className={`section-free-canvas mx-auto max-w-[1700px] ${draggingSectionId ? "select-none" : ""}`}
            style={{
              height: Math.max(
                920,
                ...workspace.sections.map((section, index) => getSectionPosition(section, index).y + 420)
              ),
            }}
          >
            {workspace.sections.map((section, index) => {
              const position = getSectionPosition(section, index);
              return (
                <div
                  key={section.id}
                  className={`absolute w-[360px] transition-shadow ${draggingSectionId === section.id ? "z-30" : "z-20"}`}
                  style={{ left: position.x, top: position.y }}
                >
                  <SectionCard
                    section={section}
                    sectionIndex={index}
                    compactMode={workspace.preferences.compactMode}
                    showFavicons={workspace.preferences.showFavicons}
                    searchTerm={searchTerm}
                    freeLayoutMode={workspace.preferences.freeLayoutMode}
                    isBeingDragged={draggingSectionId === section.id}
                    onStartFreeSectionDrag={(event) => startFreeSectionDrag(event, section, index)}
                    onRenameSection={actions.renameSection}
                    onRemoveSection={actions.removeSection}
                    onMoveSection={actions.moveSection}
                    onOpenAddBookmark={(sectionId) => setEditorState({ mode: "create", sectionId })}
                    onOpenEditBookmark={(sectionId, bookmark) =>
                      setEditorState({ mode: "edit", sectionId, bookmark })
                    }
              onRemoveBookmark={actions.removeBookmark}
                    onDropBookmark={(targetSectionId, bookmarkId, sourceSectionId) =>
                      actions.moveBookmarkAcrossSections(sourceSectionId, targetSectionId, bookmarkId, 0)
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="section-grid mx-auto grid max-w-[1700px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {workspace.sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                sectionIndex={index}
                compactMode={workspace.preferences.compactMode}
                showFavicons={workspace.preferences.showFavicons}
                searchTerm={searchTerm}
                freeLayoutMode={workspace.preferences.freeLayoutMode}
                isBeingDragged={false}
                onStartFreeSectionDrag={() => {}}
                onRenameSection={actions.renameSection}
                onRemoveSection={actions.removeSection}
                onMoveSection={actions.moveSection}
                onOpenAddBookmark={(sectionId) => setEditorState({ mode: "create", sectionId })}
                onOpenEditBookmark={(sectionId, bookmark) =>
                  setEditorState({ mode: "edit", sectionId, bookmark })
                }
                onRemoveBookmark={actions.removeBookmark}
                onDropBookmark={(targetSectionId, bookmarkId, sourceSectionId) =>
                  actions.moveBookmarkAcrossSections(sourceSectionId, targetSectionId, bookmarkId, 0)
                }
              />
            ))}
          </div>
        )}
      </div>

      <HackerClock />

      <BookmarkEditorModal
        open={Boolean(editorState)}
        title={editorState?.mode === "edit" ? "Edit bookmark" : "Add bookmark"}
        sectionId={editorState?.sectionId ?? workspace.sections[0]?.id ?? ""}
        sections={workspace.sections}
        initialValue={
          editorState?.bookmark
            ? {
                label: editorState.bookmark.label,
                url: editorState.bookmark.url,
                icon: editorState.bookmark.icon,
              }
            : undefined
        }
        onClose={() => setEditorState(null)}
        onSave={(value, selectedSectionId) => {
          if (!editorState) return false;
          if (editorState.mode === "edit" && editorState.bookmark) {
            if (selectedSectionId !== editorState.sectionId) {
              const created = actions.addBookmark(selectedSectionId, value);
              if (!created) return false;
              actions.removeBookmark(editorState.sectionId, editorState.bookmark.id);
              return true;
            }
            return actions.updateBookmark(editorState.sectionId, editorState.bookmark.id, value);
          }
          return actions.addBookmark(selectedSectionId, value);
        }}
      />
    </div>
  );
}
