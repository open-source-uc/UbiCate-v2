import * as Icons from "@/app/components/ui/icons/icons";
import * as lightFormalMap from "@/app/map/hooks/config/lightFormal";
import * as normalMap from "@/app/map/hooks/config/normal";
import * as pinkCoquetteMap from "@/app/map/hooks/config/pinkCoquette";
import * as ucLightMap from "@/app/map/hooks/config/uc-theme-light";
import * as ucDarkMap from "@/app/map/hooks/config/uc-theme-dark";

import { darkThemeMap } from "../map/styles/darkThemeMap";
import { lightThemeMap } from "../map/styles/lightThemeMap";
import { pinkThemeMap } from "../map/styles/pinkThemeMap";
import { ucLightThemeMap } from "../map/styles/ucLightThemeMap";
import { ucDarkThemeMap } from "../map/styles/ucDarkThemeMap";


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
  defaultTheme: "uc-theme-light", // UC theme as default

  themes: {
    // Default theme (empty string for backwards compatibility)
    "": {
      id: "",
      ui: {
        name: "Tema Café Matte",
        description: "Equilibrio perfecto",
        icon: Icons.Coffee,
      },
      mapConfig: {
        placesTextLayer: normalMap.placesTextLayer,
        campusBorderLayer: normalMap.campusBorderLayer,
        sectionStrokeLayer: normalMap.sectionStrokeLayer,
        sectionAreaLayer: normalMap.sectionAreaLayer,
        customPolygonStrokeLayer: normalMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: normalMap.customPolygonSectionAreaLayer,
        mapStyle: darkThemeMap,
      },
    },

    "light-formal": {
      id: "light-formal",
      ui: {
        name: "Tema Diurno Formal",
        description: "Limpio y profesional",
        icon: Icons.Work,
      },
      mapConfig: {
        placesTextLayer: lightFormalMap.placesTextLayer,
        campusBorderLayer: lightFormalMap.campusBorderLayer,
        sectionStrokeLayer: lightFormalMap.sectionStrokeLayer,
        sectionAreaLayer: lightFormalMap.sectionAreaLayer,
        customPolygonStrokeLayer: lightFormalMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: lightFormalMap.customPolygonSectionAreaLayer,
        mapStyle: lightThemeMap,
      },
    },

    "pink-coquette": {
      id: "pink-coquette",
      ui: {
        name: "Coquette",
        description: "Pink pony club 🎵",
        icon: Icons.Coquette,
      },

      mapConfig: {
        placesTextLayer: pinkCoquetteMap.placesTextLayer,
        campusBorderLayer: pinkCoquetteMap.campusBorderLayer,
        sectionStrokeLayer: pinkCoquetteMap.sectionStrokeLayer,
        sectionAreaLayer: pinkCoquetteMap.sectionAreaLayer,
        customPolygonStrokeLayer: pinkCoquetteMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: pinkCoquetteMap.customPolygonSectionAreaLayer,
        mapStyle: pinkThemeMap,
      },
    },

    "uc-theme-light": {
      id: "uc-theme-light",
      ui: {
        name: "UC",
        description: "Utiliza el estilo oficial de la UC en modo claro",
        icon: Icons.Coffee,
      },
      mapConfig: {
        placesTextLayer: ucLightMap.placesTextLayer,
        campusBorderLayer: ucLightMap.campusBorderLayer,
        sectionStrokeLayer: ucLightMap.sectionStrokeLayer,
        sectionAreaLayer: ucLightMap.sectionAreaLayer,
        customPolygonStrokeLayer: ucLightMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: ucLightMap.customPolygonSectionAreaLayer,
        mapStyle: ucLightThemeMap,
      },
    },

    "uc-theme-dark": {
      id: "uc-theme-dark",
      ui: {
        name: "UC",
        description: "Utiliza el estilo oficial de la UC en modo oscuro",
        icon: Icons.Coffee,
      },
      mapConfig: {
        placesTextLayer: ucDarkMap.placesTextLayer,
        campusBorderLayer: ucDarkMap.campusBorderLayer,
        sectionStrokeLayer: ucDarkMap.sectionStrokeLayer,
        sectionAreaLayer: ucDarkMap.sectionAreaLayer,
        customPolygonStrokeLayer: ucDarkMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: ucDarkMap.customPolygonSectionAreaLayer,
        mapStyle: ucDarkThemeMap,
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
