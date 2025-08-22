/**
 * ================================================================
 *              MAPEO DE CATEGORÍAS A COLORES                
 * ================================================================
 * 
 * Sistema de mapeo de categorías de lugares a clases CSS semánticas.
 * Utiliza el nuevo sistema de tokens de tema definido en globals.css.
 * 
 * FILOSOFÍA:
 * - Cada categoría tiene un color semántico específico
 * - Los colores se adaptan automáticamente al tema activo
 * - Mantiene compatibilidad hacia atrás con sistema chart-*
 * 
 * AGREGAR NUEVA CATEGORÍA:
 * 1. Definir en types.ts
 * 2. Agregar mapeo aquí usando bg-category-[nombre]
 * 3. Definir --theme-category-[nombre] en todos los temas en globals.css
 */

import { CATEGORIES } from "./types";

/**
 * Mapeo principal: categorías → clases CSS semánticas
 * Utiliza el sistema de tokens bg-category-*
 */
const categoryToSemanticColorMap = new Map<CATEGORIES, string>([
  // === CATEGORÍAS ACADÉMICAS ===
  [CATEGORIES.FACULTY, "bg-category-faculty"],
  [CATEGORIES.CLASSROOM, "bg-category-studyroom"], // Reutiliza color de salas de estudio
  [CATEGORIES.STUDYROOM, "bg-category-studyroom"],
  [CATEGORIES.AUDITORIUM, "bg-category-auditorium"],
  [CATEGORIES.LIBRARY, "bg-category-library"],
  [CATEGORIES.LABORATORY, "bg-category-computers"], // Reutiliza color de computadores
  [CATEGORIES.COMPUTERS, "bg-category-computers"],

  // === SERVICIOS BÁSICOS ===
  [CATEGORIES.BATH, "bg-category-bath"],
  [CATEGORIES.WATER, "bg-category-water"],

  // === ALIMENTACIÓN Y COMERCIO ===
  [CATEGORIES.FOOD_LUNCH, "bg-category-food"],
  [CATEGORIES.SHOP, "bg-category-shop"],

  // === SERVICIOS ADMINISTRATIVOS ===
  [CATEGORIES.PHOTOCOPY, "bg-category-photocopy"],
  [CATEGORIES.FINANCIAL, "bg-category-financial"],

  // === DEPORTES Y RECREACIÓN ===
  [CATEGORIES.SPORTS_PLACE, "bg-category-sports"],
  [CATEGORIES.CRISOL, "bg-category-crisol"],
  [CATEGORIES.YARD, "bg-category-sports"], // Reutiliza color de deportes

  // === TRANSPORTE ===
  [CATEGORIES.PARKING, "bg-category-parking"],
  [CATEGORIES.PARK_BICYCLE, "bg-category-bicycle"],

  // === INFRAESTRUCTURA ===
  [CATEGORIES.BUILDING, "bg-surface"], // Usa color de superficie
  [CATEGORIES.CAMPUS, "bg-brand"], // Usa color de marca
  [CATEGORIES.TRASH, "bg-surface-low"], // Usa superficie baja
  [CATEGORIES.OTHER, "bg-surface-low"], // Usa superficie baja

  // === ESPECIALES ===
  [CATEGORIES.USER_LOCATION, "bg-brand"], // Usuario usa color de marca
  [CATEGORIES.CUSTOM_MARK, "bg-accent"], // Marcas personalizadas usan accent
]);

/**
 * Mapeo de compatibilidad: categorías → clases chart-* legacy
 * DEPRECATED: Mantener solo por compatibilidad hacia atrás
 * TODO: Migrar todos los usos a getCategoryColor()
 */
const categoryToLegacyChartMap = new Map<CATEGORIES, string>([
  [CATEGORIES.FACULTY, "bg-chart-0"],
  [CATEGORIES.STUDYROOM, "bg-chart-1"],
  [CATEGORIES.AUDITORIUM, "bg-chart-2"],
  [CATEGORIES.LIBRARY, "bg-chart-3"],
  [CATEGORIES.BATH, "bg-chart-4"],
  [CATEGORIES.FOOD_LUNCH, "bg-chart-5"],
  [CATEGORIES.WATER, "bg-chart-6"],
  [CATEGORIES.SPORTS_PLACE, "bg-chart-7"],
  [CATEGORIES.CRISOL, "bg-chart-8"],
  [CATEGORIES.PARKING, "bg-chart-9"],
  [CATEGORIES.COMPUTERS, "bg-chart-10"],
  [CATEGORIES.PHOTOCOPY, "bg-chart-0"], // Reutiliza chart-0
  [CATEGORIES.FINANCIAL, "bg-chart-2"], // Reutiliza chart-2
  [CATEGORIES.SHOP, "bg-chart-1"], // Reutiliza chart-1
  [CATEGORIES.PARK_BICYCLE, "bg-chart-4"], // Reutiliza chart-4
  [CATEGORIES.CLASSROOM, "bg-chart-1"], // Reutiliza chart-1
  [CATEGORIES.LABORATORY, "bg-chart-10"], // Reutiliza chart-10
  [CATEGORIES.BUILDING, "bg-chart-0"],
  [CATEGORIES.CAMPUS, "bg-chart-0"],
  [CATEGORIES.YARD, "bg-chart-7"],
  [CATEGORIES.TRASH, "bg-chart-0"],
  [CATEGORIES.OTHER, "bg-chart-0"],
  [CATEGORIES.USER_LOCATION, "bg-brand"], // Casos especiales mantienen semántica
  [CATEGORIES.CUSTOM_MARK, "bg-chart-3"],
]);

/**
 * ================================================================
 *                        API PRINCIPAL                          
 * ================================================================
 */

/**
 * Obtiene la clase CSS semántica para una categoría
 * 
 * @param category - Categoría del lugar
 * @returns Clase CSS semántica (ej: "bg-category-faculty")
 * 
 * @example
 * ```tsx
 * const MarkerComponent = ({ category }) => {
 *   const colorClass = getCategoryColor(category);
 *   return <div className={`${colorClass} rounded-full w-4 h-4`} />;
 * };
 * ```
 */
export const getCategoryColor = (category: CATEGORIES): string => {
  return categoryToSemanticColorMap.get(category) ?? "bg-surface-low";
};

/**
 * Obtiene la clase CSS legacy (chart-*) para una categoría
 * 
 * @deprecated Usar getCategoryColor() en su lugar
 * @param category - Categoría del lugar  
 * @returns Clase CSS legacy (ej: "bg-chart-1")
 */
export const getCategoryChartColor = (category: CATEGORIES): string => {
  return categoryToLegacyChartMap.get(category) ?? "bg-chart-0";
};

/**
 * ================================================================
 *                      UTILIDADES AVANZADAS                     
 * ================================================================
 */

/**
 * Obtiene todas las categorías con sus colores semánticos
 * Excluye categorías especiales como USER_LOCATION
 * 
 * @returns Array de objetos {category, color}
 * 
 * @example
 * ```tsx
 * const CategoryLegend = () => {
 *   const categories = getAllCategoryColors();
 *   return (
 *     <div>
 *       {categories.map(({category, color}) => (
 *         <div key={category} className={`${color} p-2`}>
 *           {getCategoryDisplayName(category)}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export const getAllCategoryColors = (): Array<{category: CATEGORIES, color: string}> => {
  const excludeFromLegend = new Set([
    CATEGORIES.USER_LOCATION,
    CATEGORIES.CUSTOM_MARK,
    CATEGORIES.BUILDING,
    CATEGORIES.CAMPUS,
    CATEGORIES.OTHER,
    CATEGORIES.TRASH
  ]);

  const result: Array<{category: CATEGORIES, color: string}> = [];
  
  for (const [category, color] of categoryToSemanticColorMap) {
    if (!excludeFromLegend.has(category)) {
      result.push({ category, color });
    }
  }
  
  return result;
};

/**
 * Verifica si una categoría tiene un color específico definido
 * 
 * @param category - Categoría a verificar
 * @returns true si tiene color específico, false si usa fallback
 */
export const hasDefinedColor = (category: CATEGORIES): boolean => {
  return categoryToSemanticColorMap.has(category);
};

/**
 * Obtiene el nombre legible de una categoría
 * 
 * @param category - Categoría
 * @returns Nombre en español legible
 */
export const getCategoryDisplayName = (category: CATEGORIES): string => {
  const displayNames: Record<CATEGORIES, string> = {
    [CATEGORIES.FACULTY]: "Facultades",
    [CATEGORIES.CLASSROOM]: "Salas de Clases",
    [CATEGORIES.STUDYROOM]: "Salas de Estudio",
    [CATEGORIES.AUDITORIUM]: "Auditorios",
    [CATEGORIES.LIBRARY]: "Bibliotecas",
    [CATEGORIES.LABORATORY]: "Laboratorios",
    [CATEGORIES.COMPUTERS]: "Computadores",
    [CATEGORIES.BATH]: "Baños",
    [CATEGORIES.WATER]: "Agua",
    [CATEGORIES.FOOD_LUNCH]: "Comida",
    [CATEGORIES.SHOP]: "Tiendas",
    [CATEGORIES.PHOTOCOPY]: "Fotocopias",
    [CATEGORIES.FINANCIAL]: "Servicios Financieros",
    [CATEGORIES.SPORTS_PLACE]: "Deportes",
    [CATEGORIES.CRISOL]: "Espacios Crisol",
    [CATEGORIES.YARD]: "Patios",
    [CATEGORIES.PARKING]: "Estacionamientos",
    [CATEGORIES.PARK_BICYCLE]: "Estacionamiento Bicicletas",
    [CATEGORIES.BUILDING]: "Edificios",
    [CATEGORIES.CAMPUS]: "Campus",
    [CATEGORIES.TRASH]: "Puntos de Basura",
    [CATEGORIES.OTHER]: "Otros",
    [CATEGORIES.USER_LOCATION]: "Ubicación del Usuario",
    [CATEGORIES.CUSTOM_MARK]: "Marcador Personalizado",
  };

  return displayNames[category] ?? "Categoría Desconocida";
};

/**
 * Agrupa categorías por tipo de servicio
 * Útil para crear interfaces organizadas
 */
export const getCategoriesByGroup = () => {
  return {
    academic: [
      CATEGORIES.FACULTY,
      CATEGORIES.CLASSROOM,
      CATEGORIES.STUDYROOM,
      CATEGORIES.AUDITORIUM,
      CATEGORIES.LIBRARY,
      CATEGORIES.LABORATORY,
      CATEGORIES.COMPUTERS,
    ],
    services: [
      CATEGORIES.BATH,
      CATEGORIES.WATER,
      CATEGORIES.PHOTOCOPY,
      CATEGORIES.FINANCIAL,
    ],
    foodAndShopping: [
      CATEGORIES.FOOD_LUNCH,
      CATEGORIES.SHOP,
    ],
    recreation: [
      CATEGORIES.SPORTS_PLACE,
      CATEGORIES.CRISOL,
      CATEGORIES.YARD,
    ],
    transport: [
      CATEGORIES.PARKING,
      CATEGORIES.PARK_BICYCLE,
    ],
  };
};