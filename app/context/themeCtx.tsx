"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * ================================================================
 *                      SISTEMA DE TEMAS
 * ================================================================
 *
 * Context provider para el sistema de temas semántico de UbiCate v2.
 *
 * CARACTERÍSTICAS:
 * - Temas semánticos con nomenclatura clara
 * - Cambio dinámico y persistencia
 * - Configuración de viewport para PWA
 * - Rotación automática entre temas
 * - Metadatos descriptivos
 *
 * FILOSOFÍA:
 * Los temas se nombran por su propósito/estética, no por colores específicos:
 * - "": Tema original marrón elegante
 * - "light-formal": Profesional y claro
 * - "pink-coquette": Aesthetic pastel
 * - "uc": Institucional Universidad Católica
 */

export type Theme = "uc" | "uc-light" | "light-formal" | "pink-coquette" | "";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  rotateTheme: () => void;
  getNextTheme: (from?: Theme) => Theme;
  isSystemDark: boolean;
  themeMetadata: typeof THEME_METADATA;
  availableThemes: readonly Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider del contexto de temas
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line
  const [theme, setThemeState] = useState<Theme>(THEME_CONFIG.defaultTheme);
  const [isSystemDark, setIsSystemDark] = useState(false);

  const getViewportColor = () => {
    if (typeof document === "undefined") return "#150a04"; // fallback

    return getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim();
  };

  const updateViewportColor = (currentTheme: Theme) => {
    if (typeof document === "undefined") return;

    // Apply theme first to get correct CSS variable values
    document.documentElement.setAttribute("data-theme", currentTheme);

    // Get the color from CSS variable after theme is applied
    const color = getViewportColor();

    // Theme color principal
    updateOrCreateMetaTag("theme-color", color);

    // Status bar para iOS
    updateOrCreateMetaTag("apple-mobile-web-app-status-bar-style", isLightTheme ? "default" : "black-translucent");

    // Navigation button para Windows
    updateOrCreateMetaTag("msapplication-navbutton-color", color);

    // Tile color para Windows
    updateOrCreateMetaTag("msapplication-TileColor", color);
  };

  /**
   * Utilidad para crear o actualizar meta tags
   */
  const updateOrCreateMetaTag = (name: string, content: string) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", content);
  };

  /**
   * Cambia el tema activo con validación y persistencia
   */
  const setTheme = (newTheme: Theme) => {
    // Validar tema
    if (!THEME_CONFIG.allThemes.includes(newTheme as any)) {
      console.warn(`[ThemeProvider] Tema inválido: "${newTheme}". Usando tema por defecto.`);
      newTheme = THEME_CONFIG.defaultTheme;
    }

    setThemeState(newTheme);

    // Aplicar al DOM
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
      updateViewportMetaTags(newTheme);
    }

    // Persistir preferencia
    persistThemePreference(newTheme);
  };

  /**
   * Persiste la preferencia de tema en localStorage y cookies
   */
  const persistThemePreference = (theme: Theme) => {
    if (typeof window === "undefined") return;

    try {
      // localStorage para persistencia local
      localStorage.setItem("ubicate-theme", theme);

      // Cookie para SSR (si está disponible)
      if ("cookieStore" in window) {
        // @ts-ignore - cookieStore es experimental pero funcional
        cookieStore?.set("ubicate-theme", theme, {
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          sameSite: "lax",
        });
      }
    } catch (error) {
      console.warn("[ThemeProvider] No se pudo persistir la preferencia de tema:", error);
    }
  };

  /**
   * Obtiene el siguiente tema en la rotación
   */
  const getNextTheme = (from?: Theme): Theme => {
    const current = from ?? theme;
    const currentIndex = THEME_CONFIG.rotationThemes.indexOf(current as any);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % THEME_CONFIG.rotationThemes.length;
    return THEME_CONFIG.rotationThemes[nextIndex];
  };

  /**
   * Rota al siguiente tema disponible
   */
  const rotateTheme = () => {
    const nextTheme = getNextTheme();
    setTheme(nextTheme);
  };

  /**
   * Detecta preferencia del sistema (dark/light mode)
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsSystemDark(mediaQuery.matches);

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // Escuchar cambios en preferencia del sistema
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  /**
   * Inicializa el tema desde localStorage/DOM al montar
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Prioridad: localStorage > DOM attribute > default
      const savedTheme = localStorage.getItem("ubicate-theme") as Theme | null;
      const domTheme = document.documentElement.getAttribute("data-theme") as Theme | null;
      const initialTheme = savedTheme || domTheme || THEME_CONFIG.defaultTheme;

      // Validar y aplicar tema inicial
      const validTheme = THEME_CONFIG.allThemes.includes(initialTheme as any)
        ? initialTheme
        : THEME_CONFIG.defaultTheme;

      setThemeState(validTheme);
      document.documentElement.setAttribute("data-theme", validTheme);
      updateViewportMetaTags(validTheme);
    } catch (error) {
      console.warn("[ThemeProvider] Error al cargar preferencia de tema:", error);
      setThemeState(THEME_CONFIG.defaultTheme);
    }
  }, []);

  /**
   * Actualiza viewport cuando cambia el tema
   */
  useEffect(() => {
    updateViewportMetaTags(theme);
  }, [theme]);

  // Valor del contexto
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    getNextTheme,
    rotateTheme,
    isSystemDark,
    themeMetadata: THEME_METADATA,
    availableThemes: THEME_CONFIG.allThemes,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/**
 * Hook para acceder al contexto de temas
 * @throws Error si se usa fuera del ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}

/**
 * ================================================================
 *                     UTILIDADES DE TEMA
 * ================================================================
 */

/**
 * Utilidades para trabajar con temas
 */
export const themeUtils = {
  /**
   * Verifica si un tema es claro
   */
  isLightTheme: (theme: Theme): boolean => {
    return theme === "light-formal" || theme === "pink-coquette";
  },

  /**
   * Verifica si un tema es oscuro
   */
  isDarkTheme: (theme: Theme): boolean => {
    return theme === "" || theme === "uc";
  },

  /**
   * Obtiene la categoría de un tema
   */
  getThemeCategory: (theme: Theme): string => {
    return THEME_METADATA[theme].category;
  },

  /**
   * Obtiene todos los temas de una categoría específica
   */
  getThemesByCategory: (category: string): Theme[] => {
    return THEME_CONFIG.allThemes.filter((theme) => THEME_METADATA[theme].category === category);
  },

  /**
   * Verifica si un tema es institucional
   */
  isInstitutionalTheme: (theme: Theme): boolean => {
    return theme === "uc";
  },

  /**
   * Obtiene el tema recomendado según la hora del día
   */
  getRecommendedTheme: (): Theme => {
    const hour = new Date().getHours();

    // Tema oscuro para horarios nocturnos
    if (hour >= 20 || hour <= 6) {
      return "";
    }

    // Tema claro para horarios diurnos
    return "light-formal";
  },

  /**
   * Obtiene el contraste recomendado para un tema
   */
  getContrastLevel: (theme: Theme): "high" | "medium" | "low" => {
    switch (theme) {
      case "light-formal":
        return "high";
      case "":
      case "uc":
        return "medium";
      case "pink-coquette":
        return "low";
      default:
        return "medium";
    }
  },
};
