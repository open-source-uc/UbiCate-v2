# 🎨 Sistema de Temas UbiCate v2

Documentación completa del sistema de diseño y temas de UbiCate v2 usando Tailwind CSS v4.

## 📋 Índice

1. [Filosofía del Sistema](#-filosofía-del-sistema)
2. [Arquitectura](#-arquitectura)
3. [Tokens Semánticos](#-tokens-semánticos)
4. [Uso en Componentes](#-uso-en-componentes)
5. [Temas Disponibles](#-temas-disponibles)
6. [Crear Nuevos Temas](#-crear-nuevos-temas)
7. [Migración](#-migración)
8. [Mejores Prácticas](#-mejores-prácticas)
9. [API Reference](#-api-reference)

## 🎯 Filosofía del Sistema

El sistema de temas de UbiCate v2 está diseñado con los siguientes principios:

### Nomenclatura Semántica

En lugar de usar nombres confusos como `primary`, `secondary`, `tertiary`, utilizamos nombres que describen **qué representa** cada color:

- **Canvas**: El fondo principal de la aplicación
- **Surface**: Superficies elevadas (tarjetas, modales, paneles)
- **Brand**: Colores de marca e identidad
- **Content**: Jerarquía de texto y contenido
- **Interactive**: Elementos con los que el usuario puede interactuar
- **Accent**: Elementos decorativos y de énfasis
- **Feedback**: Estados de respuesta al usuario
- **Category**: Colores específicos para categorías de lugares

### Desacoplamiento Total

- Los componentes NO saben qué colores específicos están usando
- Los temas pueden cambiar completamente sin afectar componentes
- Cada token tiene un propósito semántico claro

## 🏗️ Arquitectura

```
Paleta Base (--palette-*)
    ↓
Tokens de Tema (--theme-*)
    ↓
Tokens Semánticos (--color-*)
    ↓
Clases Tailwind (bg-canvas, text-content-primary, etc.)
    ↓
Componentes React
```

### 1. Paleta Base

Colores primitivos que NO se usan directamente:

```css
--palette-brand-blue: #015fff;
--palette-neutral-gray-900: #171717;
--palette-vibrant-red: #ef4444;
```

### 2. Tokens de Tema

Mapean la paleta base a roles semánticos por tema:

```css
:root {
  --theme-canvas: var(--palette-neutral-brown-900);
  --theme-surface: var(--palette-neutral-brown-600);
}

[data-theme="light-formal"] {
  --theme-canvas: var(--palette-brand-cream);
  --theme-surface: #ffffff;
}
```

### 3. Tokens Semánticos

Interfaz estable que usan los componentes:

```css
--color-canvas: var(--theme-canvas);
--color-surface: var(--theme-surface);
```

## 🎨 Tokens Semánticos

### Canvas - Fondo Principal

```css
/* Clases Tailwind disponibles */
bg-canvas text-canvas-foreground
```

**Uso**: Body, contenedores principales, fondo de la app

```tsx
<div className="bg-canvas text-canvas-foreground min-h-screen">{children}</div>
```

### Surface - Superficies Elevadas

```css
/* Superficie estándar */
bg-surface text-surface-foreground

/* Superficie baja (menos elevación) */
bg-surface-low text-surface-low-foreground

/* Superficie alta (más elevación) */
bg-surface-high text-surface-high-foreground
```

**Uso**: Tarjetas, modales, sidebars, dropdowns

```tsx
<div className="bg-surface text-surface-foreground rounded-lg p-4">
  <h3>Tarjeta de contenido</h3>
</div>

<div className="bg-surface-high text-surface-high-foreground shadow-lg">
  <h3>Modal importante</h3>
</div>
```

### Brand - Identidad de Marca

```css
bg-brand text-brand-foreground
```

**Uso**: Botones principales, logos, elementos de marca

```tsx
<button className="bg-brand text-brand-foreground px-4 py-2 rounded">Acción Principal</button>
```

### Content - Jerarquía de Texto

```css
/* Texto principal (títulos, contenido importante) */
text-content-primary

/* Texto secundario (subtítulos, metadatos) */
text-content-secondary

/* Texto terciario (placeholders, texto deshabilitado) */
text-content-tertiary
```

**Uso**: Todo el contenido de texto

```tsx
<div>
  <h1 className="text-content-primary text-2xl font-bold">Título Principal</h1>
  <p className="text-content-secondary text-sm">Subtítulo o metadatos</p>
  <span className="text-content-tertiary text-xs">Información adicional</span>
</div>
```

### Interactive - Elementos Interactivos

```css
/* Botón principal */
bg-interactive-primary text-interactive-primary-foreground
hover:bg-interactive-primary-hover

/* Botón secundario */
bg-interactive-secondary text-interactive-secondary-foreground
hover:bg-interactive-secondary-hover

/* Botón ghost/sutil */
bg-interactive-tertiary text-interactive-tertiary-foreground
hover:bg-interactive-tertiary-hover
```

**Uso**: Botones, enlaces, elementos clicables

```tsx
<button className="bg-interactive-primary text-interactive-primary-foreground hover:bg-interactive-primary-hover px-4 py-2 rounded interactive-transition">
  Botón Principal
</button>

<button className="bg-interactive-secondary text-interactive-secondary-foreground hover:bg-interactive-secondary-hover px-4 py-2 rounded interactive-transition">
  Botón Secundario
</button>

<button className="bg-interactive-tertiary text-interactive-tertiary-foreground hover:bg-interactive-tertiary-hover px-4 py-2 rounded interactive-transition">
  Botón Ghost
</button>
```

### Accent - Elementos Decorativos

```css
bg-accent text-accent-foreground
```

**Uso**: Badges, pills, elementos destacados sin acción

```tsx
<span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs">Badge</span>
```

### Feedback - Estados del Sistema

```css
/* Éxito */
bg-feedback-success text-feedback-success-foreground

/* Advertencia */
bg-feedback-warning text-feedback-warning-foreground

/* Peligro/Error */
bg-feedback-danger text-feedback-danger-foreground

/* Información */
bg-feedback-info text-feedback-info-foreground
```

**Uso**: Alertas, notificaciones, estados

```tsx
<div className="bg-feedback-success text-feedback-success-foreground p-4 rounded">
  ✅ Operación exitosa
</div>

<div className="bg-feedback-danger text-feedback-danger-foreground p-4 rounded">
  ❌ Error al procesar
</div>
```

### Border & Input - Elementos de Interfaz

```css
/* Bordes principales */
border-border

/* Bordes sutiles */
border-border-subtle

/* Campos de entrada */
bg-input text-input-foreground

/* Anillo de foco */
focus:ring-focus-ring
```

**Uso**: Bordes, campos de entrada, elementos de UI

```tsx
<input
  className="bg-input text-input-foreground border border-border rounded px-3 py-2 focus:ring-2 focus:ring-focus-ring"
  placeholder="Buscar lugares..."
/>
```

### Category - Colores de Categorías

```css
bg-category-faculty     /* Facultades */
bg-category-studyroom   /* Salas de estudio */
bg-category-auditorium  /* Auditorios */
bg-category-library     /* Bibliotecas */
bg-category-bath        /* Baños */
bg-category-food        /* Comida */
bg-category-water       /* Agua */
bg-category-sports      /* Deportes */
bg-category-crisol      /* Espacios Crisol */
bg-category-parking     /* Estacionamientos */
bg-category-computers   /* Computadores */
bg-category-photocopy   /* Fotocopias */
bg-category-financial   /* Servicios financieros */
bg-category-shop        /* Tiendas */
bg-category-bicycle     /* Estacionamiento bicicletas */
```

**Uso**: Marcadores, pills de filtro, leyendas

```tsx
import { getCategoryColor } from "@/utils/categoryToColors";

const CategoryPill = ({ category }) => {
  const colorClass = getCategoryColor(category);
  return <div className={`${colorClass} px-3 py-1 rounded-full text-white text-sm`}>{category}</div>;
};
```

## 🌈 Temas Disponibles

### Tema Por Defecto (Marrón Elegante)

- **Activación**: Sin `data-theme` o `data-theme=""`
- **Descripción**: Tema oscuro con tonos marrones cálidos
- **Uso**: Tema principal de UbiCate, identidad original

### Rosa Coquette

- **Activación**: `data-theme="pink-coquette"`
- **Descripción**: Tema claro con estética pastel rosa
- **Uso**: Para usuarios que prefieren tonos suaves y aesthetic

### Formal Claro

- **Activación**: `data-theme="light-formal"`
- **Descripción**: Tema claro profesional con alto contraste
- **Uso**: Ambientes profesionales, mejor accesibilidad

### UC Institucional

- **Activación**: `data-theme="uc"`
- **Descripción**: Colores oficiales de la Universidad Católica
- **Uso**: Contextos oficiales, representación institucional

## ➕ Crear Nuevos Temas

### Paso 1: Definir los Tokens de Tema

```css
[data-theme="mi-nuevo-tema"] {
  /* Canvas */
  --theme-canvas: #tu-color-fondo;
  --theme-canvas-foreground: #tu-color-texto;

  /* Surface */
  --theme-surface: #tu-color-superficie;
  --theme-surface-foreground: #tu-color-texto-superficie;
  --theme-surface-low: #tu-color-superficie-baja;
  --theme-surface-low-foreground: #tu-color-texto-superficie-baja;
  --theme-surface-high: #tu-color-superficie-alta;
  --theme-surface-high-foreground: #tu-color-texto-superficie-alta;

  /* Brand */
  --theme-brand: #tu-color-marca;
  --theme-brand-foreground: #tu-color-texto-marca;

  /* Content */
  --theme-content-primary: #tu-texto-principal;
  --theme-content-secondary: #tu-texto-secundario;
  --theme-content-tertiary: #tu-texto-terciario;

  /* Interactive */
  --theme-interactive-primary: #tu-boton-principal;
  --theme-interactive-primary-foreground: #tu-texto-boton-principal;
  --theme-interactive-primary-hover: #tu-boton-principal-hover;

  --theme-interactive-secondary: #tu-boton-secundario;
  --theme-interactive-secondary-foreground: #tu-texto-boton-secundario;
  --theme-interactive-secondary-hover: #tu-boton-secundario-hover;

  --theme-interactive-tertiary: #tu-boton-ghost;
  --theme-interactive-tertiary-foreground: #tu-texto-boton-ghost;
  --theme-interactive-tertiary-hover: #tu-boton-ghost-hover;

  /* Accent */
  --theme-accent: #tu-color-acento;
  --theme-accent-foreground: #tu-texto-acento;

  /* Feedback */
  --theme-feedback-success: #tu-color-exito;
  --theme-feedback-success-foreground: #tu-texto-exito;
  --theme-feedback-warning: #tu-color-advertencia;
  --theme-feedback-warning-foreground: #tu-texto-advertencia;
  --theme-feedback-danger: #tu-color-peligro;
  --theme-feedback-danger-foreground: #tu-texto-peligro;
  --theme-feedback-info: #tu-color-info;
  --theme-feedback-info-foreground: #tu-texto-info;

  /* Border & Input */
  --theme-border: #tu-color-borde;
  --theme-border-subtle: #tu-color-borde-sutil;
  --theme-input: #tu-color-input;
  --theme-input-foreground: #tu-texto-input;
  --theme-focus-ring: #tu-color-foco;

  /* Categories - Define TODOS los colores de categoría */
  --theme-category-faculty: #color-facultades;
  --theme-category-studyroom: #color-salas-estudio;
  /* ... todas las demás categorías ... */
}
```

### Paso 2: Actualizar ThemeProvider

```tsx
// En themeCtx.tsx
export type Theme = "uc" | "light-formal" | "pink-coquette" | "mi-nuevo-tema" | "";

const THEME_CONFIG = {
  rotationThemes: ["light-formal", "pink-coquette", "mi-nuevo-tema", ""],
  allThemes: ["", "light-formal", "pink-coquette", "uc", "mi-nuevo-tema"],
};

const VIEWPORT_COLORS: Record<Theme, string> = {
  // ... otros temas
  "mi-nuevo-tema": "#color-para-viewport",
};

export const THEME_METADATA = {
  // ... otros temas
  "mi-nuevo-tema": {
    name: "Mi Nuevo Tema",
    description: "Descripción del tema",
    category: "personalizado",
  },
};
```

## 🔄 Migración

### De Sistema Anterior

```tsx
// ❌ ANTES (confuso y acoplado)
<div className="bg-primary text-primary-foreground">
  <div className="bg-secondary text-secondary-foreground">
    <span className="text-muted-foreground">Texto</span>
  </div>
</div>

// ✅ DESPUÉS (semántico y claro)
<div className="bg-brand text-brand-foreground">
  <div className="bg-surface text-surface-foreground">
    <span className="text-content-tertiary">Texto</span>
  </div>
</div>
```

### Compatibilidad Hacia Atrás

El sistema mantiene compatibilidad con nombres antiguos:

```css
/* Estos siguen funcionando temporalmente */
--color-primary: var(--color-brand);
--color-background: var(--color-canvas);
--color-muted: var(--color-surface-low);
```

### Migración de Categorías

```tsx
// ❌ ANTES
const color = getCategoryChartColor(category); // "bg-chart-1"

// ✅ DESPUÉS
const color = getCategoryColor(category); // "bg-category-faculty"
```

## ✅ Mejores Prácticas

### 1. Usa Siempre Tokens Semánticos

```tsx
// ✅ CORRECTO
<div className="bg-surface text-surface-foreground">

// ❌ INCORRECTO
<div className="bg-gray-800 text-white">
```

### 2. Aplica Transiciones

```tsx
// ✅ CORRECTO - Se adapta suavemente a cambios de tema
<div className="bg-surface text-surface-foreground theme-aware">

// ✅ CORRECTO - Para elementos interactivos
<button className="bg-interactive-primary text-interactive-primary-foreground interactive-transition">
```

### 3. Usa Pares de Colores Apropiados

```tsx
// ✅ CORRECTO - Contraste garantizado
<div className="bg-surface text-surface-foreground">

// ❌ INCORRECTO - Puede tener mal contraste
<div className="bg-surface text-canvas-foreground">
```

### 4. Utiliza Clases Helper Predefinidas

```tsx
// ✅ CORRECTO - Usa clases helper
<div className="card-surface">
<button className="btn-primary">
<input className="input-field">

// En lugar de repetir clases manualmente
```

### 5. Agrupa Elementos Relacionados

```tsx
// ✅ CORRECTO - Agrupa lógicamente
<div className="bg-canvas text-canvas-foreground">
  {" "}
  {/* App background */}
  <header className="bg-surface text-surface-foreground">
    {" "}
    {/* Navigation */}
    <h1 className="text-content-primary">Título</h1>
    <p className="text-content-secondary">Subtítulo</p>
  </header>
  <main className="bg-surface-low text-surface-low-foreground">
    {" "}
    {/* Content area */}
    <button className="bg-interactive-primary text-interactive-primary-foreground">Acción</button>
  </main>
</div>
```

## 📚 API Reference

### Funciones de Utilidad

#### `getCategoryColor(category: CATEGORIES): string`

Obtiene la clase CSS semántica para una categoría.

```tsx
const color = getCategoryColor(CATEGORIES.FACULTY); // "bg-category-faculty"
```

#### `getCategoryDisplayName(category: CATEGORIES): string`

Obtiene el nombre legible de una categoría.

```tsx
const name = getCategoryDisplayName(CATEGORIES.FACULTY); // "Facultades"
```

#### `getAllCategoryColors(): Array<{category: CATEGORIES, color: string}>`

Obtiene todas las categorías con sus colores (excluye especiales).

```tsx
const categories = getAllCategoryColors();
// [{ category: CATEGORIES.FACULTY, color: "bg-category-faculty" }, ...]
```

#### `getCategoriesByGroup()`

Agrupa categorías por tipo de servicio.

```tsx
const groups = getCategoriesByGroup();
// { academic: [...], services: [...], foodAndShopping: [...], ... }
```

### Hooks de Tema

#### `useTheme()`

Hook principal para manejar temas.

```tsx
const { theme, setTheme, rotateTheme, themeMetadata } = useTheme();
```
