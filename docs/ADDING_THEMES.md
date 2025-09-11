# How to Add a New Theme - UbiCate v2

Adding a new theme to UbiCate is now incredibly simple! Follow this guide to add your own custom theme.

## Quick Overview

With the new centralized theme system, adding a theme requires only **3 simple steps**:

1. Add your theme configuration to the registry
2. Create a CSS file for your theme
3. Import the CSS file

That's it! The theme will automatically appear in the UI and work everywhere in the app.

## Step-by-Step Example: Adding a "Ocean Blue" Theme

Let's add a new ocean-themed blue theme as an example.

### Step 1: Add Theme to Registry

Edit `/lib/themes/registry.ts` and add your theme to the `themes` object:

```typescript
// Add this to the themes object in themeRegistry
"ocean-blue": {
  id: "ocean-blue",
  ui: {
    name: "Ocean Blue",
    description: "Deep and calming 🌊",
    icon: Icons.Waves, // You can use any existing icon or add a new one
  },
  colors: {
    background: "var(--palette-blue-900)",
    foreground: "var(--palette-white-primary)",
    primary: "var(--palette-cyan-500)",
    primaryForeground: "var(--palette-white-primary)",
    secondary: "var(--palette-blue-800)",
    secondaryForeground: "var(--palette-white-primary)",
    tertiary: "var(--palette-blue-200)",
    tertiaryForeground: "var(--palette-blue-900)",
    muted: "var(--palette-blue-400)",
    mutedForeground: "var(--palette-blue-900)",
    accent: "var(--palette-cyan-400)",
    accentForeground: "var(--palette-blue-900)",
    destructive: "var(--palette-red-500)",
    destructiveForeground: "var(--palette-white-primary)",
    border: "var(--palette-blue-600)",
    input: "var(--palette-blue-400)",
    ring: "var(--palette-cyan-300)",
    routePrimary: "var(--palette-cyan-500)",
    routeBorder: "var(--palette-cyan-800)",
    focusIndicator: "var(--palette-cyan-500)",
    // Chart colors using ocean-themed palette
    chart0: "var(--palette-cyan-300)",
    chart1: "var(--palette-blue-400)",
    chart2: "var(--palette-cyan-500)",
    chart3: "var(--palette-blue-600)",
    chart4: "var(--palette-cyan-600)",
    chart5: "var(--palette-blue-700)",
    chart6: "var(--palette-cyan-700)",
    chart7: "var(--palette-blue-800)",
    chart8: "var(--palette-cyan-800)",
    chart9: "var(--palette-blue-900)",
    chart10: "var(--palette-cyan-900)",
  },
  mapConfig: {
    // You can reuse existing map configs or create new ones
    placesTextLayer: {
      ...normalMap.placesTextLayer,
      paint: {
        ...normalMap.placesTextLayer.paint,
        "text-color": "#ffffff",
        "text-halo-color": "rgba(0, 51, 102, 0.75)", // Ocean blue halo
      },
    },
    campusBorderLayer: {
      ...normalMap.campusBorderLayer,
      paint: {
        ...normalMap.campusBorderLayer.paint,
        "line-color": "#03b5aa", // Cyan border
      },
    },
    sectionStrokeLayer: {
      ...normalMap.sectionStrokeLayer,
      paint: {
        ...normalMap.sectionStrokeLayer.paint,
        "line-color": "#03b5aa",
      },
    },
    sectionAreaLayer: {
      ...normalMap.sectionAreaLayer,
      paint: {
        ...normalMap.sectionAreaLayer.paint,
        "fill-color": "rgba(3, 181, 170, 0.1)",
      },
    },
    customPolygonStrokeLayer: normalMap.customPolygonStrokeLayer,
    customPolygonSectionAreaLayer: normalMap.customPolygonSectionAreaLayer,
    // Optional: Custom map colors for createMapLibreStyle
    mapColors: {
      // Define custom map colors if needed
      water: "#1e40af",
      land: "#1e3a8a",
      // ... other map styling
    },
  },
  // Optional: Additional CSS for theme-specific effects
  additionalCSS: {
    ".ocean-wave": "animation: wave 2s ease-in-out infinite;",
    "button:hover": "box-shadow: 0 0 20px rgba(3, 181, 170, 0.3);",
  },
},
```

### Step 2: Create CSS File

Create `/app/styles/themes/ocean-blue.css`:

```css
/* This file is auto-generated from the theme registry */
/* You can also add additional custom styles here */

/* Custom animations for ocean theme */
@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Ocean-specific enhancements */
[data-theme="ocean-blue"] .wave-effect {
  animation: wave 2s ease-in-out infinite;
}

[data-theme="ocean-blue"] .button-ripple:active {
  background: radial-gradient(circle, rgba(3, 181, 170, 0.3) 0%, transparent 70%);
}
```

### Step 3: Import CSS File

Add the import to `/app/styles/variables.css`:

```css
/* Add this line with the other theme imports */
@import './themes/ocean-blue.css';
```

## That's It! 🎉

Your new theme is now fully integrated and will:

- ✅ Automatically appear in the theme selector
- ✅ Work with all UI components
- ✅ Apply to map styling
- ✅ Persist user selection in localStorage
- ✅ Support all theme features (viewport colors, status bar, etc.)

## Alternative: Using the Theme Builder Utility

For even easier theme creation, you can use the `createTheme` utility:

```typescript
import { createTheme } from "@/lib/themes";
import * as Icons from "@/app/components/ui/icons/icons";

const oceanBlueTheme = createTheme(
  "ocean-blue",
  "Ocean Blue",
  {
    background: "var(--palette-blue-900)",
    foreground: "var(--palette-white-primary)",
    primary: "var(--palette-cyan-500)",
    // ... only specify the colors you want to customize
  },
  {
    description: "Deep and calming 🌊",
    icon: Icons.Waves,
    additionalCSS: {
      ".ocean-wave": "animation: wave 2s ease-in-out infinite;",
    },
  }
);

// Then add oceanBlueTheme to your registry
```

## Advanced Features

### Custom Map Styling
You can create completely custom map configurations by creating new files in `/app/map/hooks/config/` and referencing them in your theme.

### Color Palette Extension
Add new colors to `/app/styles/variables.css` in the color palette section and reference them in your theme.

### Theme Variants
Use the `mergeThemes` utility to create variants of existing themes:

```typescript
import { mergeThemes, getTheme } from "@/lib/themes";

const darkOceanTheme = mergeThemes(
  getTheme("ocean-blue")!,
  {
    id: "dark-ocean",
    ui: { name: "Dark Ocean" },
    colors: {
      background: "var(--palette-blue-950)", // Even darker
    }
  }
);
```

## Benefits of the New System

- **Single Source of Truth**: All theme configuration in one place
- **Type Safety**: Full TypeScript support with auto-completion
- **Automatic UI Updates**: Themes appear automatically in selectors
- **Consistent API**: Same pattern for all themes
- **Easy Maintenance**: No more scattered files to update
- **Validation**: Built-in theme validation utilities
- **Backward Compatibility**: Existing themes continue to work

## Need Help?

- Check existing themes in the registry for examples
- Use the `validateTheme()` utility to check your theme configuration
- The `generateThemeCSS()` utility can help generate CSS from your theme definition
