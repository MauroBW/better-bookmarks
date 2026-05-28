import { useState } from "react";
import { loadWallpaper, saveWallpaper } from "../lib/storage";

export function useWallpaper() {
  const [wallpaper, setWallpaper] = useState<string | null>(() => loadWallpaper());

  const updateWallpaper = (next: string | null) => {
    setWallpaper(next);
    saveWallpaper(next);
  };

  return { wallpaper, updateWallpaper };
}
