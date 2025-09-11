import type { ComponentType } from "react";

import type { LayerProps } from "react-map-gl/maplibre";

/**
 * Color configuration for CSS variables
 */
export interface ThemeColors {
  // Core colors
  background: string;
  foreground: string;

  // Primary colors
  primary: string;
  primaryForeground: string;

  // Secondary colors
  secondary: string;
  secondaryForeground: string;

  // Tertiary colors
  tertiary: string;
  tertiaryForeground: string;

  // Muted colors
  muted: string;
  mutedForeground: string;

  // Accent colors
  accent: string;
  accentForeground: string;

  // Destructive colors
  destructive: string;
  destructiveForeground: string;

  // UI elements
  border: string;
  input: string;
  ring: string;

  // Functional colors
  routePrimary: string;
  routeBorder: string;
  focusIndicator: string;

  // Chart colors
  chart0: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
  chart9: string;
  chart10: string;
}

/**
 * Map style configuration for each theme
 */
export interface ThemeMapConfig {
  placesTextLayer: LayerProps;
  campusBorderLayer: LayerProps;
  sectionStrokeLayer: LayerProps;
  sectionAreaLayer: LayerProps;
  customPolygonStrokeLayer: LayerProps;
  customPolygonSectionAreaLayer: LayerProps;
  mapColors?: Record<string, any>; // For createMapLibreStyle
}

/**
 * UI configuration for theme display
 */
export interface ThemeUIConfig {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Complete theme definition
 */
export interface ThemeDefinition {
  id: string;
  ui: ThemeUIConfig;
  colors: ThemeColors;
  mapConfig: ThemeMapConfig;
  /** Additional CSS properties that get applied to [data-theme="..."] selector */
  additionalCSS?: Record<string, string>;
}

/**
 * Theme registry containing all available themes
 */
export interface ThemeRegistry {
  themes: Record<string, ThemeDefinition>;
  defaultTheme: string;
}

/**
 * Helper type to extract theme IDs from registry
 */
export type ThemeId<T extends ThemeRegistry> = keyof T["themes"] | "";

/**
 * Utility type for theme configuration without the ID (for easier theme creation)
 */
export type ThemeConfig = Omit<ThemeDefinition, "id">;
