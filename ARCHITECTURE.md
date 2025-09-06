# UbiCate v2 - Architecture Documentation

## Project Structure

This document describes the organization of code in the UbiCate v2 project, following modern maintainability principles.

### Directory Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # UI components organized by feature
│   ├── context/           # React contexts
│   ├── hooks/             # Custom React hooks
│   └── map/               # Map-specific components
├── lib/                   # Business logic and services (NEW)
│   ├── github/            # GitHub API operations
│   ├── validation/        # Schema validation
│   ├── places/            # Place-related business logic
│   ├── map/               # Map utilities (NEW)
│   ├── campus/            # Campus-related utilities (NEW)
│   ├── geojson/           # GeoJSON utilities (NEW)
│   ├── api/               # API client utilities (NEW)
│   ├── events/            # Custom events (NEW)
│   └── config/            # Configuration utilities (NEW)
├── utils/                 # Utility functions (legacy, being migrated)
├── data/                  # Static data files
└── public/                # Static assets
```

### Design Principles

#### 1. Single Responsibility Principle (SRP)
Each file and module has a single, well-defined purpose:

- **`lib/github/`**: All GitHub API operations
- **`lib/validation/`**: Schema validation logic
- **`lib/places/`**: Place-related business logic
- **`lib/map/`**: Map-specific utilities
- **`lib/campus/`**: Campus boundary and location logic

#### 2. Related Code Grouping
Code is organized by feature/domain rather than by type:

- Map-related utilities are grouped in `lib/map/`
- Campus logic is centralized in `lib/campus/`
- API interactions are in `lib/api/` and `lib/github/`

#### 3. Clear Import Paths
The project uses path aliases for clean imports:

```typescript
// GitHub operations
import { fetchApprovedPlaces } from "@/lib/github/operations";

// Validation schemas
import { placeSchema } from "@/lib/validation/schemas";

// Place utilities
import { createFeatureFromPoints } from "@/lib/places/utils";
```

#### 4. Configuration Separation
Environment variables and configuration are separated from business logic:

- **`lib/github/config.ts`**: GitHub-specific configuration
- **`lib/config/`**: General configuration utilities

### Migration Progress

#### ✅ Completed
- **API Route Refactoring**: Broke down 719-line file into focused modules (-53% lines)
- **GitHub Operations**: Extracted to `lib/github/`
- **Validation Logic**: Centralized in `lib/validation/`
- **Place Business Logic**: Moved to `lib/places/`
- **Domain-based Utilities**: Started migration to `lib/` directories

#### 🔄 In Progress
- **Utils Migration**: Gradually moving utilities from flat `utils/` to domain-based `lib/` structure
- **Component Organization**: Evaluating shared components for `components/ui/`

#### 📋 Planned
- **Complete Utils Migration**: Finish moving remaining utilities
- **Shared Components**: Create `components/ui/` for truly reusable components
- **Documentation**: Add inline documentation for complex modules

### Module Responsibilities

#### `lib/github/`
- **Purpose**: GitHub API interactions for place management
- **Files**: `operations.ts`, `config.ts`, `types.ts`
- **Responsibilities**: File operations, place approval workflow, error handling

#### `lib/validation/`
- **Purpose**: Data validation using Zod schemas
- **Files**: `schemas.ts`
- **Responsibilities**: Request validation, data sanitization

#### `lib/places/`
- **Purpose**: Place-related business logic
- **Files**: `utils.ts`
- **Responsibilities**: Feature creation, identifier generation, campus detection

#### `lib/map/`
- **Purpose**: Map-specific utilities and styling
- **Files**: `createMapLibreStyle.ts`, `getLayerMap.ts`, `categoryToColors.ts`
- **Responsibilities**: Map styling, layer management, category visualization

#### `lib/campus/`
- **Purpose**: Campus boundary and location services
- **Files**: `getCampusBounds.tsx`
- **Responsibilities**: Campus detection, faculty mapping, location validation

### Best Practices

1. **Import Organization**: Follow the established import order (React, Next.js, external libs, internal)
2. **Naming Conventions**: Use clear, descriptive names for files and functions
3. **Error Handling**: Implement proper error handling in all async operations
4. **Type Safety**: Leverage TypeScript for better code reliability
5. **Documentation**: Add JSDoc comments for complex functions

### Future Improvements

1. **Complete Utils Migration**: Move remaining utilities to appropriate `lib/` domains
2. **Shared Component Library**: Create reusable UI components
3. **Testing Structure**: Add domain-specific test organization
4. **Performance Optimization**: Implement code splitting by domain
5. **API Documentation**: Add OpenAPI specs for API routes

---

This architecture supports maintainable, scalable development while keeping the codebase organized and easy to navigate.