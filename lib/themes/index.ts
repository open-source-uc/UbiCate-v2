// Core types
export type { ThemeColors, ThemeMapConfig, ThemeUIConfig, ThemeDefinition, ThemeRegistry, ThemeConfig } from "./types";

// Registry and theme utilities
export {
  themeRegistry,
  getThemeIds,
  getTheme,
  getAllThemes,
  isValidThemeId,
  getDefaultTheme,
  THEME_IDS,
} from "./registry";

// Theme utilities

// Use the ThemeId from registry as the main export
export type { ThemeId } from "./registry";
