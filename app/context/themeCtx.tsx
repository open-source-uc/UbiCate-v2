"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light-formal" | "pink-coquette" | "";

const themeOptions: Theme[] = ["light-formal", "pink-coquette", ""];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  rotateTheme: () => void;
  getNextTheme: (from?: Theme) => Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("");

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      //@ts-ignore
      cookieStore?.set("ubicate-theme", newTheme)
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
      const initial =
        saved || (document.documentElement.getAttribute("data-theme") as Theme) || "";
      setTheme(initial);
    }
  }, []);

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
