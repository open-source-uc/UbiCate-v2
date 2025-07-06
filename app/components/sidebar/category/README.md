# Category Configuration System

This document explains the centralized category configuration system implemented in UbiCate v2. The system provides a unified way to manage category colors, icons, and other properties across the application.

## Overview

The category configuration system centralizes all category-related data in a single location, making it easier to maintain and update category properties consistently across the application.

## Key Files

- `categoryConfig.tsx` - Main configuration file with all category mappings
- `categoryFilter.tsx` - Uses the configuration for filtering
- `markerIcon.tsx` - Uses the configuration for marker icons
- `marker.tsx` - Uses the configuration for marker colors

## Core Configuration

### CategoryConfig Interface

```typescript
export interface CategoryConfig {
  key: string;              // Unique identifier for the category
  title: string;            // Display name
  icon: React.ReactNode;    // React icon component
  bg: string;               // Background color class
  filter: string;           // Filter identifier
  isNameFilter?: boolean;   // Whether this is a name-based filter
  markerColor: string;      // Marker color class
  category: CATEGORIES;     // CATEGORIES enum value
}
```

### Available Maps and Functions

#### 1. Category to Configuration Map
```typescript
export const categoryToConfigMap: Record<string, CategoryConfig>
```
Maps filter strings to full category configurations.

#### 2. Category to Color Map
```typescript
export const categoryToColorMap: Record<string, string>
```
Maps filter strings to marker colors.

#### 3. Category to Icon Map
```typescript
export const categoryToIconMap: Record<CATEGORIES, React.ReactNode>
```
Maps CATEGORIES enum values to React icon components.

#### 4. Category to Marker Color Map
```typescript
export const categoryToMarkerColorMap: Record<CATEGORIES, string>
```
Maps CATEGORIES enum values to marker color classes.

#### 5. Category to Icon Component Map
```typescript
export const categoryToIconComponentMap: Record<CATEGORIES, React.ComponentType<{ className?: string }>>
```
Maps CATEGORIES enum values to icon component classes.

## Helper Functions

### getCategoryConfig(category: CATEGORIES)
Returns the full configuration for a given category, with fallbacks for unmapped categories.

```typescript
const config = getCategoryConfig(CATEGORIES.FACULTY);
// Returns: { icon: <Icons.School />, markerColor: "bg-deep-red-option", category: CATEGORIES.FACULTY }
```

### getMarkerColorByCategory(category: CATEGORIES)
Returns the marker color class for a given category.

```typescript
const color = getMarkerColorByCategory(CATEGORIES.LIBRARY);
// Returns: "bg-pink-option"
```

### getIconByCategory(category: CATEGORIES)
Returns the icon component for a given category.

```typescript
const IconComponent = getIconByCategory(CATEGORIES.WATER);
// Returns: Icons.Water component
```

## Usage Examples

### 1. Using in Marker Components

```typescript
import { getMarkerColorByCategory } from '@/app/components/sidebar/category/categoryConfig';

// Get color for a category
const color = getMarkerColorByCategory(CATEGORIES.FACULTY);
```

### 2. Using in Icon Components

```typescript
import { getIconByCategory } from '@/app/components/sidebar/category/categoryConfig';

const Icon = getIconByCategory(CATEGORIES.LIBRARY);
return <Icon className="w-4 h-4" />;
```

### 3. Getting Full Configuration

```typescript
import { getCategoryConfig } from '@/app/components/sidebar/category/categoryConfig';

const config = getCategoryConfig(CATEGORIES.AUDITORIUM);
// Use config.icon, config.markerColor, etc.
```

## Adding New Categories

To add a new category:

1. Add the category to the `CATEGORIES` enum in `utils/types.ts`
2. Add the category configuration to `categoryConfigs` array in `categoryConfig.tsx`
3. Add the category to `categoryToMarkerColorMap` if it needs a custom color
4. Add the category to `categoryToIconComponentMap` if it needs a custom icon

Example:
```typescript
// In categoryConfigs array
{
  key: "new_category",
  title: "New Category",
  icon: <Icons.NewIcon />,
  bg: "bg-blue",
  filter: "new_category",
  markerColor: "bg-blue-option",
  category: CATEGORIES.NEW_CATEGORY,
}

// In categoryToMarkerColorMap
[CATEGORIES.NEW_CATEGORY]: "bg-blue-option",

// In categoryToIconComponentMap
[CATEGORIES.NEW_CATEGORY]: Icons.NewIcon,
```

## Migration from Old System

The old `allMarkerColors` and direct icon mappings are deprecated but still available for backward compatibility. New code should use the centralized functions:

- Replace `allMarkerColors[category]` with `getMarkerColorByCategory(category)`
- Replace direct icon mappings with `getIconByCategory(category)`
- Use `getCategoryConfig(category)` for full configuration access

## Best Practices

1. **Use enum values**: Always use `CATEGORIES` enum values instead of string literals
2. **Use helper functions**: Use the provided helper functions instead of accessing maps directly
3. **Provide fallbacks**: The system provides default fallbacks for unmapped categories
4. **Keep consistency**: Use the same color and icon patterns across the application
5. **Document changes**: Update this README when adding new categories or changing the system

## Color Classes Available

The system uses the following color classes:
- `bg-brown-light` (default)
- `bg-deep-red-option`
- `bg-red-option`
- `bg-green-option`
- `bg-pink-option`
- `bg-deep-cyan-option`
- `bg-orange-option`
- `bg-cyan-option`
- `bg-deep-green-option`
- `bg-purple-option`
- `bg-gray-option`

These correspond to the Tailwind CSS classes defined in your project's theme.
