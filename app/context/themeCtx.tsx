"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "uc" | "light-formal" | "pink-coquette" | "";

const themeOptions: Theme[] = ["light-formal", "pink-coquette", ""];

const VIEWPORT_COLORS = {
  "": "#150a04", // brown-900 (tema por defecto)
  "pink-coquette": "#fdf2f8", // pink-coquette
  "light-formal": "#f9f8f3", // white-primary
  "uc": "#03122E"
} as const;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  rotateTheme: () => void;
  getNextTheme: (from?: Theme) => Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line
  const [theme, setThemeState] = useState<Theme>("");

  const updateViewportColor = (currentTheme: Theme) => {
    if (typeof document === "undefined") return;

    const color = VIEWPORT_COLORS[currentTheme];

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
      currentTheme === "pink-coquette" || currentTheme === "light-formal"
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

  const setTheme = (newTheme: Theme) => {
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

  const getNextTheme = (from?: Theme): Theme => {
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
      const saved = localStorage.getItem("theme") as Theme | null;
      const initial = saved || (document.documentElement.getAttribute("data-theme") as Theme) || "";

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
