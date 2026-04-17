import { useState, useEffect, useCallback } from "react";
import { loadTheme, saveTheme, loadMode, saveMode } from "@/lib/store";
import type { TimerMode } from "@/lib/types";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => loadTheme());
  const [mode, setMode] = useState<TimerMode>(() => loadMode());

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

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTimerMode = useCallback((m: TimerMode) => {
    setMode(m);
  }, []);

  return { theme, toggleTheme, mode, setTimerMode };
}
