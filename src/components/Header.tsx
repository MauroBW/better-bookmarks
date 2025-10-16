import React from "react";

type Props = {
  fileRef: React.RefObject<HTMLInputElement | null>;
  onSetWall: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearWall: () => void;
  wallpaper: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

const Header: React.FC<Props> = ({ fileRef, onSetWall, onClearWall, wallpaper, theme, toggleTheme }) => {
  return (
    <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
      <div className="flex w-full max-w-lg items-center gap-3 rounded-xl border border-card bg-card-elevated px-4 py-3 shadow-sm backdrop-blur">
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
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 text-text-primary"
          placeholder="Google"
        />
      </div>

      <div className="ml-4 flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onSetWall} />
        <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-card bg-card-elevated px-3 py-2 text-sm shadow-sm backdrop-blur hover:shadow">
          Set wallpaper
        </button>
        {wallpaper && (
          <button onClick={onClearWall} className="rounded-lg border border-card bg-card px-3 py-2 text-sm hover:shadow">
            Clear
          </button>
        )}
        <button onClick={toggleTheme} className="rounded-lg border border-card bg-card px-3 py-2 text-sm hover:shadow">
          {theme === 'dark' ? 'Light' : 'Dark'} mode
        </button>
      </div>
    </div>
  );
};

export default Header;
