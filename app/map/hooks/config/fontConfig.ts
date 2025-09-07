/**
 * Font configuration for map elements
 * Provides consistent font settings for map text layers
 */

// Font families for map text elements using Roboto Slab
export const MAP_FONTS = {
  // Regular weight for general map text
  REGULAR: ["Roboto Slab", "serif"],
  // Semibold weight for place names and important labels
  SEMIBOLD: ["Roboto Slab", "serif"],
  // Bold weight for emphasis
  BOLD: ["Roboto Slab", "serif"],
};

// Fallback fonts for compatibility
export const MAP_FONT_FALLBACKS = ["serif"];

/**
 * Get the appropriate font array for map text layers
 * @param weight - Font weight: 'regular', 'semibold', or 'bold'
 * @returns Array of font names with fallbacks
 */
export function getMapFont(weight: "regular" | "semibold" | "bold" = "regular"): string[] {
  switch (weight) {
    case "semibold":
      return [...MAP_FONTS.SEMIBOLD];
    case "bold":
      return [...MAP_FONTS.BOLD];
    case "regular":
    default:
      return [...MAP_FONTS.REGULAR];
  }
}
