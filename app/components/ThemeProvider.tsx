"use client";
import { useEffect } from "react";
import { useTodos } from "../store/todos";

export default function ThemeProvider() {
  const { themePreference } = useTodos();

  useEffect(() => {
    // Apply theme on mount and when preference changes
    const root = document.documentElement;
    if (themePreference === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (themePreference === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [themePreference]);

  return null;
}

