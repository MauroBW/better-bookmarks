import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import SectionCard from "./SectionCard";
import HackerClock from "./HackerClock";
import { useTheme } from "../hooks/useTheme";
import { useWallpaper } from "../hooks/useWallpaper";
import { useWorkspace } from "../hooks/useWorkspace";
import BookmarkEditorModal from "./BookmarkEditorModal";
import type { Bookmark } from "../lib/types";
import defaultBackground from "../../background/background_1.jpg";

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

  const fileRef = useRef<HTMLInputElement>(null);

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

  const visualStyle = {
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
          onToggleFavicons={() => actions.setShowFavicons(!workspace.preferences.showFavicons)}
          onCardRadiusChange={actions.setCardRadius}
          onAccentGlowChange={actions.setAccentGlow}
          onTextScaleChange={actions.setTextScale}
          onSectionScaleChange={actions.setSectionScale}
          onBackgroundDimChange={actions.setBackgroundDim}
          onWallpaperBlurChange={actions.setWallpaperBlur}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div className="section-grid mx-auto grid max-w-[1700px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {workspace.sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              sectionIndex={index}
              compactMode={workspace.preferences.compactMode}
              showFavicons={workspace.preferences.showFavicons}
              searchTerm={searchTerm}
              onRenameSection={actions.renameSection}
              onRemoveSection={actions.removeSection}
              onMoveSection={actions.moveSection}
              onOpenAddBookmark={(sectionId) => setEditorState({ mode: "create", sectionId })}
              onOpenEditBookmark={(sectionId, bookmark) =>
                setEditorState({ mode: "edit", sectionId, bookmark })
              }
              onDropBookmark={(targetSectionId, bookmarkId, sourceSectionId) =>
                actions.moveBookmarkAcrossSections(sourceSectionId, targetSectionId, bookmarkId, 0)
              }
            />
          ))}
        </div>
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
