import * as Icons from "@/app/components/ui/icons/icons";
import * as lightFormalMap from "@/app/map/hooks/config/lightFormal";
import * as normalMap from "@/app/map/hooks/config/normal";
import * as pinkCoquetteMap from "@/app/map/hooks/config/pinkCoquette";

import { ThemeRegistry, ThemeDefinition } from "./types";

/**
 * Central theme registry - Add new themes here!
 *
 * To add a new theme:
 * 1. Add your theme definition to the themes object below
 * 2. Create corresponding CSS file in app/styles/themes/[theme-id].css
 * 3. Import the CSS file in app/styles/variables.css
 * 4. That's it! The theme will automatically appear in the UI
 */
export const themeRegistry: ThemeRegistry = {
  defaultTheme: "", // Default (dark brown) theme

  themes: {
    // Default theme (empty string for backwards compatibility)
    "": {
      id: "",
      ui: {
        name: "Tema Café Matte",
        description: "Equilibrio perfecto",
        icon: Icons.Coffee,
      },
      colors: {
        background: "var(--palette-brown-900)",
        foreground: "var(--palette-white-primary)",
        primary: "var(--palette-blue-primary)",
        primaryForeground: "var(--palette-white-primary)",
        secondary: "var(--palette-brown-600)",
        secondaryForeground: "var(--palette-white-primary)",
        tertiary: "var(--palette-brown-200)",
        tertiaryForeground: "var(--palette-brown-900)",
        muted: "var(--palette-brown-400)",
        mutedForeground: "var(--palette-brown-900)",
        accent: "var(--palette-brown-400)",
        accentForeground: "var(--palette-brown-900)",
        destructive: "var(--palette-red-500)",
        destructiveForeground: "var(--palette-white-primary)",
        border: "var(--palette-brown-600)",
        input: "var(--palette-brown-400)",
        ring: "var(--palette-brown-200)",
        routePrimary: "var(--palette-blue-primary)",
        routeBorder: "var(--palette-cyan-800)",
        focusIndicator: "var(--palette-blue-primary)",
        chart0: "var(--palette-gray-300)",
        chart1: "var(--palette-red-800)",
        chart2: "var(--palette-red-500)",
        chart3: "var(--palette-green-500)",
        chart4: "var(--palette-pink-500)",
        chart5: "var(--palette-cyan-800)",
        chart6: "var(--palette-orange-500)",
        chart7: "var(--palette-cyan-500)",
        chart8: "var(--palette-green-800)",
        chart9: "var(--palette-purple-500)",
        chart10: "var(--palette-gray-500)",
      },
      mapConfig: {
        placesTextLayer: normalMap.placesTextLayer,
        campusBorderLayer: normalMap.campusBorderLayer,
        sectionStrokeLayer: normalMap.sectionStrokeLayer,
        sectionAreaLayer: normalMap.sectionAreaLayer,
        customPolygonStrokeLayer: normalMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: normalMap.customPolygonSectionAreaLayer,
      },
    },

    "light-formal": {
      id: "light-formal",
      ui: {
        name: "Tema Diurno Formal",
        description: "Limpio y profesional",
        icon: Icons.Work,
      },
      colors: {
        background: "var(--palette-white-primary)",
        foreground: "var(--palette-brown-900)",
        primary: "var(--palette-blue-primary)",
        primaryForeground: "var(--palette-white-primary)",
        secondary: "var(--palette-soft-gray-100)",
        secondaryForeground: "var(--palette-soft-gray-900)",
        tertiary: "var(--palette-soft-gray-50)",
        tertiaryForeground: "var(--palette-soft-gray-900)",
        muted: "var(--palette-soft-gray-200)",
        mutedForeground: "var(--palette-soft-gray-600)",
        accent: "var(--palette-soft-gray-100)",
        accentForeground: "var(--palette-soft-gray-900)",
        destructive: "var(--palette-professional-red-light)",
        destructiveForeground: "var(--palette-white-primary)",
        border: "var(--palette-soft-gray-300)",
        input: "var(--palette-soft-gray-200)",
        ring: "var(--palette-blue-primary)",
        routePrimary: "var(--palette-blue-primary)",
        routeBorder: "var(--palette-blue-primary)",
        focusIndicator: "var(--palette-blue-primary)",
        chart0: "var(--palette-soft-gray-600)",
        chart1: "var(--palette-red-500)",
        chart2: "var(--palette-orange-500)",
        chart3: "var(--palette-green-500)",
        chart4: "var(--palette-blue-primary)",
        chart5: "var(--palette-purple-500)",
        chart6: "var(--palette-cyan-500)",
        chart7: "var(--palette-pink-500)",
        chart8: "var(--palette-brown-600)",
        chart9: "var(--palette-gray-500)",
        chart10: "var(--palette-soft-gray-400)",
      },
      mapConfig: {
        placesTextLayer: lightFormalMap.placesTextLayer,
        campusBorderLayer: lightFormalMap.campusBorderLayer,
        sectionStrokeLayer: lightFormalMap.sectionStrokeLayer,
        sectionAreaLayer: lightFormalMap.sectionAreaLayer,
        customPolygonStrokeLayer: lightFormalMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: lightFormalMap.customPolygonSectionAreaLayer,
        mapColors: lightFormalMap.LIGHT_FORMAL_MAP_COLORS,
      },
      additionalCSS: {
        ".shadow-lg": "box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);",
        ".bg-background\\/95": "background-color: rgb(249 248 243 / 0.98);",
      },
    },

    "pink-coquette": {
      id: "pink-coquette",
      ui: {
        name: "Coquette",
        description: "Pink pony club 🎵",
        icon: Icons.Coquette,
      },
      colors: {
        background: "var(--palette-pastel-pink-50)",
        foreground: "var(--palette-soft-gray-900)",
        primary: "var(--palette-pastel-pink-600)",
        primaryForeground: "var(--palette-white-primary)",
        secondary: "var(--palette-pastel-pink-100)",
        secondaryForeground: "var(--palette-soft-gray-800)",
        tertiary: "var(--palette-pastel-cream)",
        tertiaryForeground: "var(--palette-soft-gray-900)",
        muted: "var(--palette-pastel-pink-200)",
        mutedForeground: "var(--palette-soft-gray-700)",
        accent: "var(--palette-pastel-pink-100)",
        accentForeground: "var(--palette-soft-gray-900)",
        destructive: "var(--palette-red-500)",
        destructiveForeground: "var(--palette-white-primary)",
        border: "var(--palette-pastel-pink-300)",
        input: "var(--palette-pastel-pink-200)",
        ring: "var(--palette-pastel-pink-500)",
        routePrimary: "var(--palette-pastel-pink-600)",
        routeBorder: "var(--palette-pastel-pink-400)",
        focusIndicator: "var(--palette-pastel-pink-500)",
        chart0: "var(--palette-pastel-pink-300)",
        chart1: "var(--palette-pastel-coral)",
        chart2: "var(--palette-pastel-peach)",
        chart3: "var(--palette-pastel-mint)",
        chart4: "var(--palette-pastel-lilac)",
        chart5: "var(--palette-pastel-sky)",
        chart6: "var(--palette-pastel-lavender)",
        chart7: "var(--palette-pastel-pink-400)",
        chart8: "var(--palette-pastel-pink-500)",
        chart9: "var(--palette-pastel-pink-600)",
        chart10: "var(--palette-soft-gray-400)",
      },
      mapConfig: {
        placesTextLayer: pinkCoquetteMap.placesTextLayer,
        campusBorderLayer: pinkCoquetteMap.campusBorderLayer,
        sectionStrokeLayer: pinkCoquetteMap.sectionStrokeLayer,
        sectionAreaLayer: pinkCoquetteMap.sectionAreaLayer,
        customPolygonStrokeLayer: pinkCoquetteMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: pinkCoquetteMap.customPolygonSectionAreaLayer,
        mapColors: pinkCoquetteMap.PINK_COQUETTE_MAP_COLORS,
      },
      additionalCSS: {
        ".theme-transition": "transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);",
        "button:hover": "transform: translateY(-1px); transition: transform 0.2s ease;",
      },
    },

    // Example of how easy it is to add a new theme!
    "purple-space": {
      id: "purple-space",
      ui: {
        name: "Purple Space",
        description: "Cosmic and mysterious ✨",
        icon: Icons.Work, // You can use any existing icon
      },
      colors: {
        background: "var(--palette-purple-500)",
        foreground: "var(--palette-white-primary)",
        primary: "var(--palette-pastel-lavender)",
        primaryForeground: "var(--palette-purple-500)",
        secondary: "var(--palette-soft-gray-800)",
        secondaryForeground: "var(--palette-white-primary)",
        tertiary: "var(--palette-soft-gray-200)",
        tertiaryForeground: "var(--palette-purple-500)",
        muted: "var(--palette-soft-gray-600)",
        mutedForeground: "var(--palette-white-primary)",
        accent: "var(--palette-pastel-lilac)",
        accentForeground: "var(--palette-purple-500)",
        destructive: "var(--palette-red-500)",
        destructiveForeground: "var(--palette-white-primary)",
        border: "var(--palette-soft-gray-700)",
        input: "var(--palette-soft-gray-600)",
        ring: "var(--palette-pastel-lavender)",
        routePrimary: "var(--palette-pastel-lavender)",
        routeBorder: "var(--palette-pastel-lilac)",
        focusIndicator: "var(--palette-pastel-lavender)",
        chart0: "var(--palette-pastel-lavender)",
        chart1: "var(--palette-pastel-lilac)",
        chart2: "var(--palette-pastel-coral)",
        chart3: "var(--palette-pastel-mint)",
        chart4: "var(--palette-pastel-peach)",
        chart5: "var(--palette-pastel-sky)",
        chart6: "var(--palette-soft-gray-400)",
        chart7: "var(--palette-soft-gray-500)",
        chart8: "var(--palette-soft-gray-600)",
        chart9: "var(--palette-purple-500)",
        chart10: "var(--palette-pastel-cream)",
      },
      mapConfig: {
        // For simplicity, reuse existing map configuration
        // You can create custom map configs in separate files for more advanced themes
        placesTextLayer: normalMap.placesTextLayer,
        campusBorderLayer: normalMap.campusBorderLayer,
        sectionStrokeLayer: normalMap.sectionStrokeLayer,
        sectionAreaLayer: normalMap.sectionAreaLayer,
        customPolygonStrokeLayer: normalMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: normalMap.customPolygonSectionAreaLayer,
      },
      additionalCSS: {
        ".space-glow": "box-shadow: 0 0 15px rgba(221, 160, 221, 0.5);",
        "button:hover": "transform: scale(1.02); box-shadow: 0 0 10px rgba(221, 160, 221, 0.3);",
      },
    },
  },
};

/**
 * Get all available theme IDs
 */
export function getThemeIds(): string[] {
  return Object.keys(themeRegistry.themes);
}

/**
 * Get theme configuration by ID
 */
export function getTheme(id: string): ThemeDefinition | undefined {
  return themeRegistry.themes[id];
}

/**
 * Get all themes as an array
 */
export function getAllThemes(): ThemeDefinition[] {
  return Object.values(themeRegistry.themes);
}

/**
 * Check if a theme ID exists
 */
export function isValidThemeId(id: string): boolean {
  return id in themeRegistry.themes;
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): ThemeDefinition {
  const defaultTheme = themeRegistry.themes[themeRegistry.defaultTheme];
  if (!defaultTheme) {
    throw new Error(`Default theme "${themeRegistry.defaultTheme}" not found in registry`);
  }
  return defaultTheme;
}

// Type-safe theme IDs
export type ThemeId = keyof typeof themeRegistry.themes | "";
export const THEME_IDS = getThemeIds() as ThemeId[];
