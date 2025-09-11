import { ThemeDefinition, ThemeColors } from "./types";

/**
 * Generate CSS variables string from theme colors
 */
export function generateThemeCSS(theme: ThemeDefinition): string {
  const { colors, additionalCSS } = theme;

  let css = `/* =============================================== */\n`;
  css += `/*              ${theme.ui.name.toUpperCase()} THEME              */\n`;
  css += `/* =============================================== */\n\n`;

  // Generate CSS custom properties
  css += `[data-theme="${theme.id}"] {\n`;

  // Core color variables
  css += `  --theme-background: ${colors.background};\n`;
  css += `  --theme-foreground: ${colors.foreground};\n`;
  css += `  \n`;
  css += `  --theme-primary: ${colors.primary};\n`;
  css += `  --theme-primary-foreground: ${colors.primaryForeground};\n`;
  css += `  \n`;
  css += `  --theme-secondary: ${colors.secondary};\n`;
  css += `  --theme-secondary-foreground: ${colors.secondaryForeground};\n`;
  css += `  \n`;
  css += `  --theme-tertiary: ${colors.tertiary};\n`;
  css += `  --theme-tertiary-foreground: ${colors.tertiaryForeground};\n`;
  css += `  \n`;
  css += `  --theme-muted: ${colors.muted};\n`;
  css += `  --theme-muted-foreground: ${colors.mutedForeground};\n`;
  css += `  \n`;
  css += `  --theme-accent: ${colors.accent};\n`;
  css += `  --theme-accent-foreground: ${colors.accentForeground};\n`;
  css += `  \n`;
  css += `  --theme-destructive: ${colors.destructive};\n`;
  css += `  --theme-destructive-foreground: ${colors.destructiveForeground};\n`;
  css += `  \n`;
  css += `  --theme-border: ${colors.border};\n`;
  css += `  --theme-input: ${colors.input};\n`;
  css += `  --theme-ring: ${colors.ring};\n`;
  css += `  \n`;
  css += `  /* Functional colors for app-specific features */\n`;
  css += `  --theme-route-primary: ${colors.routePrimary};\n`;
  css += `  --theme-route-border: ${colors.routeBorder};\n`;
  css += `  --theme-focus-indicator: ${colors.focusIndicator};\n`;
  css += `  \n`;
  css += `  /* Chart Colors */\n`;
  css += `  --theme-chart-0: ${colors.chart0};\n`;
  css += `  --theme-chart-1: ${colors.chart1};\n`;
  css += `  --theme-chart-2: ${colors.chart2};\n`;
  css += `  --theme-chart-3: ${colors.chart3};\n`;
  css += `  --theme-chart-4: ${colors.chart4};\n`;
  css += `  --theme-chart-5: ${colors.chart5};\n`;
  css += `  --theme-chart-6: ${colors.chart6};\n`;
  css += `  --theme-chart-7: ${colors.chart7};\n`;
  css += `  --theme-chart-8: ${colors.chart8};\n`;
  css += `  --theme-chart-9: ${colors.chart9};\n`;
  css += `  --theme-chart-10: ${colors.chart10};\n`;
  css += `}\n`;

  // Add additional CSS if provided
  if (additionalCSS) {
    css += `\n`;
    css += `/* Theme-specific enhancements */\n`;
    for (const [selector, rules] of Object.entries(additionalCSS)) {
      css += `[data-theme="${theme.id}"] ${selector} {\n`;
      css += `  ${rules}\n`;
      css += `}\n`;
    }
  }

  return css;
}

/**
 * Generate TypeScript type definition for theme IDs
 */
export function generateThemeTypes(themes: Record<string, ThemeDefinition>): string {
  const themeIds = Object.keys(themes);
  const unionType = themeIds.map((id) => `"${id}"`).join(" | ");

  return `// Auto-generated theme types
export type ThemeId = ${unionType};

export const THEME_IDS: ThemeId[] = [${themeIds.map((id) => `"${id}"`).join(", ")}];
`;
}

/**
 * Create a new theme definition with sensible defaults
 */
export function createTheme(
  id: string,
  name: string,
  colors: Partial<ThemeColors>,
  options?: {
    description?: string;
    icon?: any;
    mapConfig?: any;
    additionalCSS?: Record<string, string>;
  },
): ThemeDefinition {
  // Default color values (based on the default theme)
  const defaultColors: ThemeColors = {
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
  };

  return {
    id,
    ui: {
      name,
      description: options?.description || "Custom theme",
      icon: options?.icon || (() => null),
    },
    colors: { ...defaultColors, ...colors },
    mapConfig: options?.mapConfig || {
      placesTextLayer: {} as any,
      campusBorderLayer: {} as any,
      sectionStrokeLayer: {} as any,
      sectionAreaLayer: {} as any,
      customPolygonStrokeLayer: {} as any,
      customPolygonSectionAreaLayer: {} as any,
    },
    additionalCSS: options?.additionalCSS,
  };
}

/**
 * Validate a theme definition
 */
export function validateTheme(theme: ThemeDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!theme.id) {
    errors.push("Theme ID is required");
  }

  if (!theme.ui.name) {
    errors.push("Theme name is required");
  }

  if (!theme.ui.description) {
    errors.push("Theme description is required");
  }

  if (!theme.ui.icon) {
    errors.push("Theme icon is required");
  }

  // Validate required color properties
  const requiredColors: (keyof ThemeColors)[] = ["background", "foreground", "primary", "primaryForeground"];

  for (const colorKey of requiredColors) {
    if (!theme.colors[colorKey]) {
      errors.push(`Color '${colorKey}' is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to merge theme configurations (useful for theme variants)
 */
export function mergeThemes(base: ThemeDefinition, override: Partial<ThemeDefinition>): ThemeDefinition {
  return {
    ...base,
    ...override,
    ui: { ...base.ui, ...override.ui },
    colors: { ...base.colors, ...override.colors },
    mapConfig: { ...base.mapConfig, ...override.mapConfig },
    additionalCSS: { ...base.additionalCSS, ...override.additionalCSS },
  };
}
