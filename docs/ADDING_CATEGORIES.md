# Guía para Agregar una Nueva Categoría

Esta guía te mostrará cómo agregar correctamente una nueva categoría al sistema UbiCate v2. Sigue todos los pasos para asegurar una implementación completa.

## Pasos Requeridos

### 1. Agregar al Enum CATEGORIES

Edita [`lib/types/index.ts`](../lib/types/index.ts) y agrega tu nueva categoría al enum `CATEGORIES`:

```typescript
export enum CATEGORIES {
  AUDITORIUM = "auditorium",
  BATH = "bath",
  // ... categorías existentes
  TU_NUEVA_CATEGORIA = "tu_nueva_categoria", // Agregar aquí
}
```

**Convención de nombres:**
- Usa MAYÚSCULAS para el nombre en el enum
- El valor debe ser en minúsculas y con guiones bajos (snake_case)

### 2. Asignar un Color

Edita [`lib/map/categoryToColors.ts`](../lib/map/categoryToColors.ts) y mapea tu categoría a un color:

```typescript
const categoryToColorMap = new Map<CATEGORIES, string>([
  [CATEGORIES.FACULTY, "bg-chart-0"],
  // ... colores existentes
  [CATEGORIES.TU_NUEVA_CATEGORIA, "bg-chart-14"], // Agregar aquí
]);
```

**Colores disponibles:**
- `bg-chart-0` hasta `bg-chart-13` (actualmente usados)
- `bg-chart-14`, `bg-chart-15`, etc. (disponibles)
- `bg-primary` (color primario del tema)

### 3. Crear un Ícono

Edita [`app/components/ui/icons/icons.tsx`](../app/components/ui/icons/icons.tsx) y agrega una función para tu ícono:

```typescript
export function TuNuevoIcono({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" data-slot="icon" className={className}>
      <path d="TU_PATH_DEL_ICONO" />
    </svg>
  );
}
```

**Fuente de íconos:**
- Todos los íconos son de [Google Material Symbols](https://fonts.google.com/icons)
- Configuración: Weight 200, Grade 200, Optical Size 24, Con Fill
- Copia el path SVG del ícono que selecciones

### 4. Mapear el Ícono en el Mapa

**¡IMPORTANTE!** Edita [`app/components/ui/icons/markerIcon.tsx`](../app/components/ui/icons/markerIcon.tsx) y agrega tu categoría al objeto `categoryIcons`:

```typescript
const categoryIcons: Record<CATEGORIES, React.ComponentType<{ className?: string }>> = {
  [CATEGORIES.AUDITORIUM]: Icons.Auditorium,
  // ... íconos existentes
  [CATEGORIES.TU_NUEVA_CATEGORIA]: Icons.TuNuevoIcono, // Agregar aquí
};
```

**Nota crítica:** Sin este paso, los marcadores en el mapa aparecerán como círculos blancos sin ícono.

### 5. Agregar al Array de Pills (Filtros)

Edita [`app/components/features/filters/pills/PillFilter.tsx`](../app/components/features/filters/pills/PillFilter.tsx) y agrega tu categoría al array `pills`:

```typescript
const pills: Array<CategoryFilter> = [
  { title: "Facultades", icon: <Icons.School />, filter: CATEGORIES.FACULTY },
  // ... pills existentes
  { 
    title: "Tu Nueva Categoría", 
    icon: <Icons.TuNuevoIcono />, 
    filter: CATEGORIES.TU_NUEVA_CATEGORIA 
  },
];
```

**Nota:** El título será visible en la interfaz de usuario.

### 6. Actualizar los Datos

Una vez que hayas implementado todos los cambios anteriores, puedes comenzar a usar tu nueva categoría en:

- **Crear nuevos lugares:** Usa el formulario de la aplicación
- **Editar lugares existentes:** Añade la categoría a lugares en [`data/places.json`](../data/places.json)

```json
{
  "type": "Feature",
  "properties": {
    "identifier": "ejemplo-id",
    "name": "Nombre del Lugar",
    "information": "Información del lugar",
    "categories": ["tu_nueva_categoria"],
    "campus": "SanJoaquin",
    "faculties": []
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-70.6108, -33.4985]
  }
}
```

## Checklist de Implementación

- [ ] Agregar categoría al enum `CATEGORIES` en `lib/types/index.ts`
- [ ] Mapear categoría a color en `lib/map/categoryToColors.ts`
- [ ] Crear función de ícono en `app/components/ui/icons/icons.tsx`
- [ ] **Mapear ícono en el mapa** en `app/components/ui/icons/markerIcon.tsx` (¡CRÍTICO!)
- [ ] Agregar pill al array en `app/components/features/filters/pills/PillFilter.tsx`
- [ ] Probar la nueva categoría en el filtro
- [ ] Verificar que el ícono aparezca correctamente en el mapa
- [ ] Verificar que el color se muestre correctamente
- [ ] Asignar la categoría a al menos un lugar para probar

## Ejemplo Completo

Supongamos que queremos agregar una categoría "Hospital":

### 1. En `lib/types/index.ts`:
```typescript
export enum CATEGORIES {
  // ... categorías existentes
  HOSPITAL = "hospital",
}
```

### 2. En `lib/map/categoryToColors.ts`:
```typescript
const categoryToColorMap = new Map<CATEGORIES, string>([
  // ... colores existentes
  [CATEGORIES.HOSPITAL, "bg-chart-14"],
]);
```

### 3. En `app/components/ui/icons/icons.tsx`:
```typescript
export function LocalHospital({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" data-slot="icon" className={className}>
      <path d="M420-280h120v-140h140v-120H540v-140H420v140H280v120h140v140Z" />
    </svg>
  );
}
```ui/icons/markerIcon.tsx`:
```typescript
const categoryIcons: Record<CATEGORIES, React.ComponentType<{ className?: string }>> = {
  // ... íconos existentes
  [CATEGORIES.HOSPITAL]: Icons.LocalHospital,
};
```

### 5. En `app/components/

### 4. En `app/components/features/filters/pills/PillFilter.tsx`:
```typescript
const pills: Array<CategoryFilter> = [
  // ... pills existentes
  { title: "Hospitales", icon: <Icons.LocalHospital />, filter: CATEGORIES.HOSPITAL },
];
```

## Notas Importantes

1. **El filtro funciona automáticamente**: No necesitas modificar la lógica de filtrado en [`placeFilters.ts`](../app/components/features/filters/pills/placeFilters.ts), ya que usa el campo `categories` directamente.

2. **Orden de los pills**: El orden en el array determina el orden de aparición en la UI.

3. **Colores temáticos**: Los colores `bg-chart-X` se adaptan automáticamente a los diferentes temas de la aplicación.

4. **Validación**: El esquema de validación en [`lib/validation/schemas.ts`](../lib/validation/schemas.ts) acepta cualquier string en el array de categorías, por lo que no necesita modificación.

## Problemas Comunes en el mapa (círculo blanco):**
- **Este es el error más común:** Asegúrate de haber agregado el mapeo en `markerIcon.tsx`
- Verifica que el nombre del ícono en `markerIcon.tsx` coincida exactamente con el exportado en `icons.tsx`
- Comprueba que estés usando la categoría correcta (el valor debe estar en minúsculas en los datos)

**El ícono no aparece en los filtros

**El filtro no funciona:**
- Verifica que el valor en el enum coincida exactamente con el valor en `places.json`
- Asegúrate de que el lugar tenga la categoría en su array `categories`

**El color no se muestra:**
- Confirma que añadiste el mapeo en `categoryToColors.ts`
- Verifica que estés usando un color válido de Tailwind CSS

**El ícono no aparece:**
- Asegúrate de importar el ícono correctamente en `PillFilter.tsx`
- Verifica que el nombre de la función del ícono coincida con el import

## Referencias

- [Documentación de Material Symbols](https://fonts.google.com/icons)
- [Tailwind CSS Chart Colors](https://tailwindcss.com/docs/customizing-colors)
- [Enums en TypeScript](https://www.typescriptlang.org/docs/handbook/enums.html)
