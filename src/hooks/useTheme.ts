import { useEffect, useState } from "react";
import { loadTheme, saveTheme } from "../lib/storage";
import type { Theme } from "../lib/types";

function getInitialTheme(): Theme {
  const stored = loadTheme();
  if (stored) return stored;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark-theme");
    else document.documentElement.classList.remove("dark-theme");
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}
