# UbiCate v2 - Architecture Documentation

## Overview

UbiCate v2 is a comprehensive campus navigation platform for the Pontificia Universidad Católica de Chile. This document describes the architectural decisions and code organization implemented to ensure maintainability, scalability, and developer productivity.

### What This Architecture Solves

The original codebase suffered from several maintainability issues:
- **Monolithic API routes**: A 719-line route file that violated the Single Responsibility Principle
- **Flat utility organization**: Difficult to locate related functionality 
- **Technical-based component grouping**: Components organized by type rather than business features
- **Poor separation of concerns**: Mixed responsibilities throughout the codebase

### Architecture Goals

1. **Single Responsibility Principle**: Each module has one clear purpose
2. **Feature-based Organization**: Code grouped by business domain, not technical type
3. **Clear Separation of Concerns**: Business logic separated from presentation and data access
4. **Improved Developer Experience**: Intuitive file organization and clear import paths
5. **Scalability**: Structure that supports future growth and team collaboration

## Project Structure

This project follows a domain-driven architecture with clear separation between business logic, presentation, and utilities.

### Directory Structure

```
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── ubicate/             # Main API endpoint (406 lines, down from 719)
│   ├── components/              # Feature-based component organization
│   │   ├── features/           # Business feature components
│   │   │   ├── navigation/     # Sidebar, navigation components
│   │   │   ├── search/         # Search functionality
│   │   │   ├── places/         # Place management (forms, menus)
│   │   │   ├── directions/     # Direction and routing
│   │   │   ├── notifications/  # Error handling and notifications
│   │   │   └── filters/        # Filter pills and functionality
│   │   ├── ui/                 # Shared UI components (icons, buttons)
│   │   └── app/                # App-level components (SW, error boundaries)
│   ├── context/                # React contexts
│   ├── hooks/                  # Custom React hooks
│   └── map/                    # Map-specific pages and layouts
├── lib/                        # Business logic and services (domain-based)
│   ├── api/                    # API client utilities (21 lines)
│   │   └── ubicateApiClient.ts
│   ├── campus/                 # Campus boundary logic (189 lines)
│   │   └── getCampusBounds.tsx
│   ├── config/                 # Configuration utilities (37 lines)
│   │   ├── allowOrigins.ts
│   │   └── constants.ts
│   ├── events/                 # Custom events (20 lines)
│   │   └── customEvents.ts
│   ├── geojson/                # GeoJSON transformations (8 lines)
│   │   └── featuresToGeoJSON.tsx
│   ├── github/                 # GitHub API operations (177 lines across 3 files)
│   │   ├── config.ts
│   │   ├── operations.ts
│   │   └── types.ts
│   ├── map/                    # Map utilities (520 lines across 3 files)
│   │   ├── categoryToColors.ts
│   │   ├── createMapLibreStyle.ts
│   │   └── getLayerMap.ts
│   ├── places/                 # Place business logic (117 lines across 2 files)
│   │   ├── data.ts
│   │   └── utils.ts
│   ├── types/                  # Shared TypeScript types (155 lines)
│   │   └── index.ts
│   └── validation/             # Schema validation (50 lines)
│       └── schemas.ts
├── utils/                      # Analysis scripts (preserved)
│   ├── compare_geojson.py     # Python analysis script
│   └── main.ipynb            # Jupyter notebook
├── data/                       # Static data files
└── public/                     # Static assets
```

## Design Principles

### 1. Single Responsibility Principle (SRP)

Each file and module has a single, well-defined purpose. This refactoring reduced the main API route from **719 lines to 406 lines** (43% reduction) by extracting distinct responsibilities:

- **`lib/github/`**: All GitHub API operations for place management
- **`lib/validation/`**: Schema validation logic using Zod
- **`lib/places/`**: Place-related business logic and data management
- **`lib/map/`**: Map styling, layer management, and category visualization
- **`lib/campus/`**: Campus boundary detection and location services
- **`lib/types/`**: Centralized shared TypeScript types and enums

### 2. Feature-Based Organization

Code is organized by business domain rather than technical type, making it easier to:
- **Find related functionality**: All search-related components are in `features/search/`
- **Maintain features**: Changes to place management only affect `features/places/` and `lib/places/`
- **Scale development**: Teams can work on different features independently
- **Onboard developers**: Clear business boundaries make the codebase more intuitive

**Before (technical grouping):**
```
components/
├── forms/          # All forms mixed together
├── icons/          # All icons
├── notifications/  # All notifications
└── pills/          # Filter components
```

**After (feature grouping):**
```
components/
├── features/
│   ├── search/        # Search functionality
│   ├── places/        # Place management
│   ├── filters/       # Filter functionality
│   └── notifications/ # Error handling
└── ui/                # Shared UI components
```

### 3. Domain-Driven Utility Organization

The `lib/` directory follows domain boundaries with clear responsibilities:

- **Business Logic**: `lib/places/`, `lib/campus/`
- **External Integrations**: `lib/github/`, `lib/api/`
- **Data Management**: `lib/validation/`, `lib/types/`, `lib/geojson/`
- **Presentation**: `lib/map/`, `lib/config/`
- **Infrastructure**: `lib/events/`

### 4. Clear Import Patterns

The project uses consistent import patterns with path aliases for maintainability:

```typescript
// External integrations
import { fetchApprovedPlaces } from "@/lib/github/operations";

// Data validation
import { placeSchema } from "@/lib/validation/schemas";

// Business logic
import { createFeatureFromPoints } from "@/lib/places/utils";

// UI components by feature
import { SearchForm } from "@/app/components/features/search/SearchForm";
import { PlaceMenu } from "@/app/components/features/places/PlaceMenu";

// Shared UI components
import { Button } from "@/app/components/ui/Button";
```

## Refactoring Results

### Quantified Improvements

- **43% reduction** in main API route complexity (719 → 406 lines)
- **14 specialized modules** created with clear, single responsibilities
- **Complete utils folder reorganization** from 12 mixed files to domain-based lib/ structure
- **50+ import statements** updated across the codebase
- **Zero breaking changes** - all existing functionality preserved
- **Feature-based component organization** for improved discoverability

### Before vs. After Comparison

#### API Route Complexity
**Before:** Single 719-line file mixing:
- GitHub API operations
- Data validation
- Business logic
- HTTP request handling
- Error management

**After:** Focused 406-line file that:
- Imports specialized modules
- Handles HTTP concerns only
- Delegates business logic to appropriate domains
- Maintains clear separation of concerns

#### Component Organization
**Before:** 
- Technical categories (forms/, icons/, notifications/)
- Mixed business contexts
- Difficult to locate related functionality

**After:**
- Business feature groupings (search/, places/, directions/)
- Clear feature boundaries
- Intuitive navigation for developers

### Migration Status

#### ✅ Completed
- **API Route Refactoring**: Extracted GitHub operations, validation, and place logic
- **Component Feature Organization**: Complete reorganization by business domain
- **Utils Folder Cleanup**: All utilities moved to appropriate lib/ domains
- **Type Centralization**: Shared types consolidated in `lib/types/`
- **Import Path Updates**: 50+ import statements updated for new structure

## Module Documentation

### `lib/github/` - GitHub Integration Layer
**Purpose**: Complete GitHub API integration for place management workflow
- **Files**: `operations.ts` (145 lines), `config.ts` (12 lines), `types.ts` (20 lines)
- **Responsibilities**: 
  - File CRUD operations on GitHub repository
  - Place approval workflow management
  - Error handling for GitHub API failures
  - Authentication and configuration management

**Key Functions:**
```typescript
fetchApprovedPlaces()     // Retrieve approved place data
updatePlaceData()         // Submit new places for approval
deletePlace()             // Remove places from repository
```

### `lib/validation/` - Data Validation Layer
**Purpose**: Centralized data validation using Zod schemas
- **Files**: `schemas.ts` (50 lines)
- **Responsibilities**: 
  - Request payload validation
  - Type-safe data transformation
  - Input sanitization
  - Error message standardization

**Key Schemas:**
```typescript
placeSchema              // Validates place submission data
updatePlaceSchema        // Validates place update requests
```

### `lib/places/` - Place Business Logic
**Purpose**: Core business logic for place management
- **Files**: `utils.ts` (109 lines), `data.ts` (8 lines)
- **Responsibilities**: 
  - Place feature creation from coordinates
  - Unique identifier generation
  - Campus detection and assignment
  - Place data transformation

**Key Functions:**
```typescript
createFeatureFromPoints()  // Convert coordinates to GeoJSON features
generatePlaceId()         // Create unique place identifiers
detectCampus()            // Assign places to appropriate campus
```

### `lib/map/` - Map Visualization Layer
**Purpose**: Map styling, theming, and layer management
- **Files**: `createMapLibreStyle.ts` (301 lines), `getLayerMap.ts` (183 lines), `categoryToColors.ts` (36 lines)
- **Responsibilities**: 
  - Dynamic map style generation
  - Category-based color management
  - Layer visibility control
  - MapLibre GL JS configuration

**Key Functions:**
```typescript
createMapLibreStyle()     // Generate map styles based on categories
getLayerMap()            // Manage map layer configurations
categoryToColors()       // Map place categories to visual themes
```

### `lib/campus/` - Campus Location Services
**Purpose**: Campus boundary detection and location services
- **Files**: `getCampusBounds.tsx` (189 lines)
- **Responsibilities**: 
  - Campus boundary calculations
  - Faculty location mapping
  - Geographic coordinate validation
  - Campus-specific place filtering

### `lib/types/` - Type System Foundation
**Purpose**: Centralized TypeScript type definitions
- **Files**: `index.ts` (155 lines)
- **Responsibilities**: 
  - Shared interface definitions
  - Enum declarations (PlaceCategory, Campus)
  - Type utilities and helpers
  - API response type definitions

**Key Types:**
```typescript
Place                    // Core place data structure
PlaceCategory           // Enum of available categories
Campus                  // Campus identification enum
MapStyle                // Map styling configuration
```

### `lib/api/` - External API Layer
**Purpose**: API client utilities and configurations
- **Files**: `ubicateApiClient.ts` (21 lines)
- **Responsibilities**: 
  - HTTP client configuration
  - API endpoint management
  - Request/response standardization

### `lib/config/` - Configuration Management
**Purpose**: Application configuration and constants
- **Files**: `constants.ts` (29 lines), `allowOrigins.ts` (8 lines)
- **Responsibilities**: 
  - Environment variable management
  - CORS configuration
  - Application constants
  - Feature flags and settings

## Component Architecture

### Feature-Based Organization

Components are organized by business functionality rather than technical type, making the codebase more intuitive and maintainable.

#### `app/components/features/` - Business Feature Components

**`navigation/`** - Navigation and Sidebar Components
- Sidebar navigation with campus selection
- Mobile-responsive navigation menu
- Navigation state management

**`search/`** - Search Functionality
- Location search with autocomplete
- Search result display and interaction
- Search history and favorites

**`places/`** - Place Management
- Place creation and editing forms
- Place detail views and menus
- Place submission workflow

**`directions/`** - Routing and Directions
- Route calculation and display
- Turn-by-turn navigation
- Route optimization options

**`notifications/`** - User Feedback System
- Error message display
- Success notifications
- Toast notification management

**`filters/`** - Content Filtering
- Category filter pills
- Campus-based filtering
- Advanced filter options

#### `app/components/ui/` - Shared UI Components
- **Icons**: Consistent icon system
- **Buttons**: Standardized button components
- **Forms**: Reusable form elements
- **Layout**: Grid and spacing utilities

#### `app/components/app/` - Application-Level Components
- **Service Workers**: PWA functionality
- **Error Boundaries**: Error handling and recovery
- **Layout Providers**: Global layout management

### Component Import Guidelines

```typescript
// Feature-specific components (most specific)
import { SearchForm } from "@/app/components/features/search/SearchForm";
import { PlaceMenu } from "@/app/components/features/places/PlaceMenu";

// Shared UI components (reusable across features)
import { Button } from "@/app/components/ui/Button";
import { Icon } from "@/app/components/ui/Icon";

// App-level components (global scope)
import { ErrorBoundary } from "@/app/components/app/ErrorBoundary";
```

## Development Guidelines

### Best Practices

#### 1. Import Organization
Follow consistent import order for better code readability:

```typescript
// 1. React and Next.js
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. External libraries
import { z } from 'zod';
import maplibregl from 'maplibre-gl';

// 3. Internal lib modules (domain-specific)
import { fetchApprovedPlaces } from '@/lib/github/operations';
import { placeSchema } from '@/lib/validation/schemas';

// 4. Components (feature-specific first, then shared)
import { SearchForm } from '@/app/components/features/search/SearchForm';
import { Button } from '@/app/components/ui/Button';

// 5. Types and interfaces
import type { Place, PlaceCategory } from '@/lib/types';
```

#### 2. Naming Conventions
- **Files**: Use descriptive, kebab-case for files (`create-place-form.tsx`)
- **Functions**: Use descriptive verbs (`fetchApprovedPlaces`, `createFeatureFromPoints`)
- **Components**: Use PascalCase (`SearchForm`, `PlaceMenu`)
- **Types**: Use PascalCase with descriptive names (`Place`, `PlaceCategory`)

#### 3. Error Handling Standards
Implement consistent error handling across all async operations:

```typescript
// Good: Specific error handling with context
try {
  const places = await fetchApprovedPlaces();
  return places;
} catch (error) {
  console.error('Failed to fetch approved places:', error);
  throw new Error('Unable to retrieve place data');
}
```

#### 4. Type Safety Requirements
- **Always** use TypeScript types for function parameters and return values
- **Prefer** interface definitions over type aliases for object shapes
- **Use** generic types for reusable components and utilities
- **Validate** external data with Zod schemas before processing

#### 5. Documentation Standards
Add JSDoc comments for:
- Public API functions
- Complex business logic
- Non-obvious implementations

```typescript
/**
 * Creates a GeoJSON feature from coordinate points with campus detection
 * @param points - Array of coordinate pairs [longitude, latitude]
 * @param properties - Additional place properties
 * @returns GeoJSON Feature with detected campus information
 */
export function createFeatureFromPoints(
  points: [number, number][],
  properties: PlaceProperties
): Feature {
  // Implementation...
}
```

### Adding New Features

#### 1. Identify the Domain
Determine which lib/ domain the feature belongs to:
- **User interaction**: Add to appropriate `features/` component directory
- **Business logic**: Add to relevant `lib/` domain directory
- **Data handling**: Consider `lib/validation/` or `lib/types/`

#### 2. Follow SRP
Each new module should have a single, clear responsibility:
- ✅ Good: `lib/places/validation.ts` (place-specific validation)
- ❌ Bad: `lib/utils/helpers.ts` (mixed responsibilities)

#### 3. Update Documentation
When adding new domains or significant features:
- Update this ARCHITECTURE.md file
- Add JSDoc comments for public APIs
- Update import examples if new patterns are introduced

### Working with the Existing Codebase

#### 1. Understanding the Migration
The codebase has been refactored from a flat structure to domain-based organization. When working with existing code:
- **Check both** `lib/` and legacy locations for utilities
- **Prefer** new `lib/` modules over any remaining flat utilities
- **Update imports** to use the new structure when modifying files

#### 2. Testing Approach
When making changes:
- **Run existing tests** to ensure no regression
- **Add tests** for new business logic in appropriate domain
- **Focus on integration points** between domains

#### 3. Performance Considerations
- **Import only what you need** from lib/ modules to support tree-shaking
- **Consider code splitting** at the feature level for large additions
- **Use dynamic imports** for heavy dependencies that aren't always needed

### Common Development Tasks

#### Adding a New Place Category
1. Update `lib/types/index.ts` to add the new category to `PlaceCategory` enum
2. Update `lib/map/categoryToColors.ts` to add color mapping
3. Update validation in `lib/validation/schemas.ts` if needed
4. Update filtering in `app/components/features/filters/`

#### Adding New Map Functionality
1. Add business logic to `lib/map/` domain
2. Create feature components in `app/components/features/`
3. Update map page components in `app/map/`
4. Consider if changes affect `lib/places/` or `lib/campus/` domains

## Future Roadmap

### Planned Enhancements

#### 1. Enhanced Testing Structure
- **Domain-specific test organization**: Mirror the lib/ structure in test files
- **Integration testing**: Test interactions between domains
- **Component testing**: Feature-based component test organization
- **API testing**: Comprehensive API route testing

#### 2. Performance Optimizations
- **Code splitting by domain**: Implement lazy loading at the feature level
- **Bundle analysis**: Optimize import patterns for better tree-shaking
- **Caching strategies**: Implement appropriate caching for GitHub API calls
- **Service Worker enhancements**: Improve offline functionality

#### 3. Developer Experience Improvements
- **API Documentation**: Add OpenAPI specs for all API routes
- **Storybook Integration**: Component library documentation
- **Development tooling**: Enhanced linting rules for architectural patterns
- **onboarding documentation**: Expanded developer guides

#### 4. Architecture Evolution
- **Micro-frontend consideration**: Evaluate if features should become independent modules
- **State management**: Consider if centralized state management is needed
- **Real-time features**: Architecture for live updates and collaboration
- **Mobile app support**: Structure considerations for React Native

### iOS Safari Optimizations

UbiCate v2 includes specific optimizations for iOS Safari compatibility, particularly for modals and overlay components.

#### The Challenge

iOS Safari has known issues with `position: fixed` elements:
- Fixed elements don't stay fixed when page is scrolled
- Virtual keyboard can cause positioning issues
- Overlays may not cover the entire viewport correctly

#### The Solution

We implement a three-part optimization strategy:

1. **Absolute Positioning for Backdrops**: Use `position: absolute` instead of `fixed` for overlay elements
2. **Relative Body Container**: Set `body { position: relative }` when modals are open to contain absolute overlays
3. **Sticky Modal Content**: Wrap modal content in `position: sticky` containers to keep them visible in viewport

#### Implementation

- **CSS Overrides**: `app/styles/radix-overrides.css` provides iOS Safari fixes for Radix UI components
- **Example Component**: `app/components/examples/IOSSafariModalExample.tsx` demonstrates the pattern
- **Documentation**: Full guide available at `docs/ios-safari-optimization.md`

#### Usage Guidelines

When implementing modals or overlays:
- Use the example component as a reference
- Apply the three-part strategy for iOS Safari compatibility
- Test on actual iOS Safari devices when possible
- Follow the testing checklist in the documentation

### Maintenance Guidelines

#### Regular Architectural Reviews
- **Monthly**: Review new code for architectural compliance
- **Quarterly**: Assess if domain boundaries are still appropriate
- **Yearly**: Major architectural decisions and technology updates

#### Metrics Tracking
- **Bundle size**: Monitor growth and optimize import patterns
- **Build times**: Ensure modular structure doesn't hurt build performance
- **Developer velocity**: Track time to implement new features
- **Bug patterns**: Identify if architectural improvements can prevent common issues

---

## Summary

This architecture refactoring has transformed UbiCate v2 from a monolithic structure to a maintainable, domain-driven codebase. The 43% reduction in API route complexity, complete feature-based component organization, and clear domain boundaries provide a solid foundation for future development.

**Key Benefits Achieved:**
- **Improved maintainability** through single responsibility modules
- **Enhanced developer experience** with intuitive file organization
- **Better scalability** with clear domain boundaries
- **Reduced complexity** in critical system components
- **Zero breaking changes** while achieving significant improvements

The architecture now supports efficient team collaboration, easier onboarding, and sustainable long-term development of the UbiCate platform.