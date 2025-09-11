import { CATEGORIES } from "@/lib/types";

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
  return categoryToColorMap.get(category) ?? "bg-chart-0";
};
