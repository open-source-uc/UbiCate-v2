"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

import { ThemeId, getThemeIds } from "@/lib/themes";

const themeOptions = getThemeIds() as ThemeId[];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  rotateTheme: () => void;
  getNextTheme: (from?: ThemeId) => ThemeId;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line
  const [theme, setThemeState] = useState<ThemeId>("");

  const getViewportColor = () => {
    if (typeof document === "undefined") return "#150a04"; // fallback

    return getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim();
  };

  const updateViewportColor = (currentTheme: ThemeId) => {
    if (typeof document === "undefined") return;

    // Apply theme first to get correct CSS variable values
    document.documentElement.setAttribute("data-theme", currentTheme);

    // Get the color from CSS variable after theme is applied
    const color = getViewportColor();

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", color);

    let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaStatusBar) {
      metaStatusBar = document.createElement("meta");
      metaStatusBar.setAttribute("name", "apple-mobile-web-app-status-bar-style");
      document.head.appendChild(metaStatusBar);
    }

    const statusBarStyle =
      currentTheme === "pink-coquette" || currentTheme === "light-formal" || currentTheme === "uc-theme"
        ? "default" // contenido oscuro sobre fondo claro
        : "black-translucent"; // contenido claro sobre fondo oscuro

    metaStatusBar.setAttribute("content", statusBarStyle);

    let metaNavColor = document.querySelector('meta[name="msapplication-navbutton-color"]');
    if (!metaNavColor) {
      metaNavColor = document.createElement("meta");
      metaNavColor.setAttribute("name", "msapplication-navbutton-color");
      document.head.appendChild(metaNavColor);
    }
    metaNavColor.setAttribute("content", color);

    let metaTileColor = document.querySelector('meta[name="msapplication-TileColor"]');
    if (!metaTileColor) {
      metaTileColor = document.createElement("meta");
      metaTileColor.setAttribute("name", "msapplication-TileColor");
      document.head.appendChild(metaTileColor);
    }
    metaTileColor.setAttribute("content", color);
  };

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
      updateViewportColor(newTheme);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      //@ts-ignore
      cookieStore?.set("ubicate-theme", newTheme);
    }
  };

  const getNextTheme = (from?: ThemeId): ThemeId => {
    const current = from ?? theme;
    const index = themeOptions.indexOf(current);
    const nextIndex = (index + 1) % themeOptions.length;
    return themeOptions[nextIndex];
  };

  const rotateTheme = () => {
    const next = getNextTheme();
    setTheme(next);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as ThemeId | null;
      const initial = saved || (document.documentElement.getAttribute("data-theme") as ThemeId) || "";

      setThemeState(initial);

      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", initial);
        updateViewportColor(initial);
      }
    }
  }, []);

  useEffect(() => {
    updateViewportColor(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        getNextTheme,
        rotateTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Re-export the ThemeId type for backward compatibility
export type { ThemeId } from "@/lib/themes";
