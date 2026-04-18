import { useState, useEffect, useCallback } from "react";
import { loadTheme, saveTheme, loadMode, saveMode, loadFontStyle, saveFontStyle } from "@/lib/store";
import type { TimerMode } from "@/lib/types";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => loadTheme());
  const [mode, setMode] = useState<TimerMode>(() => loadMode());
  const [fontStyle, setFontStyle] = useState<"default" | "mono">(() => loadFontStyle());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveMode(mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    if (fontStyle === "mono") {
      root.classList.add("font-mono-mode");
    } else {
      root.classList.remove("font-mono-mode");
    }
    saveFontStyle(fontStyle);
  }, [fontStyle]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTimerMode = useCallback((m: TimerMode) => {
    setMode(m);
  }, []);

  const toggleFontStyle = useCallback(() => {
    setFontStyle((prev) => (prev === "mono" ? "default" : "mono"));
  }, []);

  return { theme, toggleTheme, mode, setTimerMode, fontStyle, toggleFontStyle };
}
