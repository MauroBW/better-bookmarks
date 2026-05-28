import React, { useEffect, useRef, useState } from "react";
import type { WorkspacePreferences } from "../lib/types";

type Props = {
  fileRef: React.RefObject<HTMLInputElement | null>;
  onSetWall: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearWall: () => void;
  wallpaper: string | null;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onAddSection: () => void;
  onOpenBookmarkModal: () => void;
  preferences: WorkspacePreferences;
  onToggleCompactMode: () => void;
  onToggleFavicons: () => void;
  onCardRadiusChange: (value: number) => void;
  onAccentGlowChange: (value: number) => void;
  onTextScaleChange: (value: number) => void;
  onSectionScaleChange: (value: number) => void;
  onBackgroundDimChange: (value: number) => void;
  onWallpaperBlurChange: (value: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const Header: React.FC<Props> = ({
  fileRef,
  onSetWall,
  onClearWall,
  wallpaper,
  theme,
  toggleTheme,
  onAddSection,
  onOpenBookmarkModal,
  preferences,
  onToggleCompactMode,
  onToggleFavicons,
  onCardRadiusChange,
  onAccentGlowChange,
  onTextScaleChange,
  onSectionScaleChange,
  onBackgroundDimChange,
  onWallpaperBlurChange,
  searchValue,
  onSearchChange,
}) => {
  const getClosestIndex = (value: number, options: number[]) =>
    options.reduce((bestIndex, option, index) => {
      const currentDistance = Math.abs(option - value);
      const bestDistance = Math.abs(options[bestIndex] - value);
      return currentDistance < bestDistance ? index : bestIndex;
    }, 0);

  const textScaleOptions = [85, 95, 100, 110, 120, 130];
  const sectionScaleOptions = [80, 90, 100, 110, 120, 130];
  const textScaleIndex = getClosestIndex(preferences.textScale, textScaleOptions);
  const sectionScaleIndex = getClosestIndex(preferences.sectionScale, sectionScaleOptions);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const shortcutLabel = typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
    ? "⌘ K"
    : "Ctrl K";

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div className="sticky top-3 z-20 mx-auto mb-6 max-w-[1700px] rounded-2xl border border-white/10 bg-[color:var(--header-bg)] px-4 py-3 shadow-2xl backdrop-blur-xl">
      <div className="flex min-h-[56px] flex-wrap items-center gap-3">
        <div className="mr-2 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--accent-gradient)] text-white shadow-lg">
            🔖
          </div>
          <h1 className="text-lg font-semibold text-text-primary">Better Bookmarks Canvas</h1>
        </div>

        <div className="flex min-w-[320px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[color:var(--surface-strong)] px-4 py-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--text-soft)]">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="bookmark-search-input"
            className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[color:var(--text-soft)] text-text-primary"
            placeholder="Search bookmarks or URLs..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <span className="rounded-md border border-white/10 bg-black/10 px-2 py-1 text-xs text-[color:var(--text-soft)]">
            {shortcutLabel}
          </span>
        </div>

        <button onClick={onAddSection} className="btn-outline">
          + New Section
        </button>
        <button onClick={onOpenBookmarkModal} className="btn-primary">
          + Bookmark
        </button>
        <button onClick={toggleTheme} className="btn-ghost">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-ghost">
          Wallpaper
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((current) => !current)}
            className="btn-ghost px-2"
            aria-label="Visual settings"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            ⚙ Visual
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 rounded-xl border border-white/10 bg-[color:var(--surface)] p-3 shadow-2xl backdrop-blur-xl"
            >
              <div className="space-y-2 border-b border-white/10 pb-3">
                <button onClick={onToggleCompactMode} className="menu-item">
                  {preferences.compactMode ? "Desactivar compacto" : "Activar compacto"}
                </button>
                <button onClick={onToggleFavicons} className="menu-item">
                  {preferences.showFavicons ? "Ocultar favicons" : "Mostrar favicons"}
                </button>
              </div>

              <label className="mt-3 block text-xs font-semibold tracking-wide text-text-secondary">
                Tamano de texto ({preferences.textScale}%)
                <input
                  type="range"
                  min={0}
                  max={textScaleOptions.length - 1}
                  step={1}
                  value={textScaleIndex}
                  onChange={(event) => onTextScaleChange(textScaleOptions[Number(event.target.value)] ?? 100)}
                  className="visual-range"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold tracking-wide text-text-secondary">
                Tamano de sections ({preferences.sectionScale}%)
                <input
                  type="range"
                  min={0}
                  max={sectionScaleOptions.length - 1}
                  step={1}
                  value={sectionScaleIndex}
                  onChange={(event) => onSectionScaleChange(sectionScaleOptions[Number(event.target.value)] ?? 100)}
                  className="visual-range"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold tracking-wide text-text-secondary">
                Oscurecer fondo ({preferences.backgroundDim}%)
                <input
                  type="range"
                  min={20}
                  max={90}
                  step={1}
                  value={preferences.backgroundDim}
                  onChange={(event) => onBackgroundDimChange(Number(event.target.value))}
                  className="visual-range"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold tracking-wide text-text-secondary">
                Blur wallpaper ({preferences.wallpaperBlur}px)
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  value={preferences.wallpaperBlur}
                  onChange={(event) => onWallpaperBlurChange(Number(event.target.value))}
                  className="visual-range"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold tracking-wide text-text-secondary">
                Redondeo de tarjetas
                <input
                  type="range"
                  min={8}
                  max={26}
                  step={1}
                  value={preferences.cardRadius}
                  onChange={(event) => onCardRadiusChange(Number(event.target.value))}
                  className="visual-range"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold tracking-wide text-text-secondary">
                Intensidad neon
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={preferences.accentGlow}
                  onChange={(event) => onAccentGlowChange(Number(event.target.value))}
                  className="visual-range"
                />
              </label>
            </div>
          ) : null}
        </div>
        {wallpaper ? (
          <button onClick={onClearWall} className="btn-ghost">
            Clear
          </button>
        ) : null}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onSetWall} />
    </div>
  );
};

export default Header;
