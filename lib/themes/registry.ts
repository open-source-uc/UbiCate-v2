import * as Icons from "@/app/components/ui/icons/icons";
import * as lightFormalMap from "@/app/map/hooks/config/lightFormal";
import * as normalMap from "@/app/map/hooks/config/normal";
import * as pinkCoquetteMap from "@/app/map/hooks/config/pinkCoquette";
import * as ucMap from "@/app/map/hooks/config/uc-theme";

import { darkThemeMap } from "../map/styles/darkThemeMap";
import { lightThemeMap } from "../map/styles/lightThemeMap";
import { pinkThemeMap } from "../map/styles/pinkThemeMap";
import { ucThemeMap } from "../map/styles/ucThemeMap";

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

    // "light-formal": {
    //   id: "light-formal",
    //   ui: {
    //     name: "Tema Diurno Formal",
    //     description: "Limpio y profesional",
    //     icon: Icons.Work,
    //   },
    //   mapConfig: {
    //     placesTextLayer: lightFormalMap.placesTextLayer,
    //     campusBorderLayer: lightFormalMap.campusBorderLayer,
    //     sectionStrokeLayer: lightFormalMap.sectionStrokeLayer,
    //     sectionAreaLayer: lightFormalMap.sectionAreaLayer,
    //     customPolygonStrokeLayer: lightFormalMap.customPolygonStrokeLayer,
    //     customPolygonSectionAreaLayer: lightFormalMap.customPolygonSectionAreaLayer,
    //     mapStyle: lightThemeMap,
    //   },
    // },

    // "pink-coquette": {
    //   id: "pink-coquette",
    //   ui: {
    //     name: "Coquette",
    //     description: "Pink pony club 🎵",
    //     icon: Icons.Coquette,
    //   },

    //   mapConfig: {
    //     placesTextLayer: pinkCoquetteMap.placesTextLayer,
    //     campusBorderLayer: pinkCoquetteMap.campusBorderLayer,
    //     sectionStrokeLayer: pinkCoquetteMap.sectionStrokeLayer,
    //     sectionAreaLayer: pinkCoquetteMap.sectionAreaLayer,
    //     customPolygonStrokeLayer: pinkCoquetteMap.customPolygonStrokeLayer,
    //     customPolygonSectionAreaLayer: pinkCoquetteMap.customPolygonSectionAreaLayer,
    //     mapStyle: pinkThemeMap,
    //   },
    // },

    "uc-theme": {
      id: "uc-theme",
      ui: {
        name: "UC",
        description: "Utiliza el estilo oficial de la UC",
        icon: Icons.Coffee,
      },
      mapConfig: {
        placesTextLayer: ucMap.placesTextLayer,
        campusBorderLayer: ucMap.campusBorderLayer,
        sectionStrokeLayer: ucMap.sectionStrokeLayer,
        sectionAreaLayer: ucMap.sectionAreaLayer,
        customPolygonStrokeLayer: ucMap.customPolygonStrokeLayer,
        customPolygonSectionAreaLayer: ucMap.customPolygonSectionAreaLayer,
        mapStyle: ucThemeMap,
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
