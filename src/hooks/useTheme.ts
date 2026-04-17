import { useState, useEffect, useCallback } from "react";
import { loadTheme, saveTheme } from "@/lib/store";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => loadTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}
