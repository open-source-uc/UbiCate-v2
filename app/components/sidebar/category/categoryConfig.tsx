import React from "react";

import { CATEGORIES } from "../../../../utils/types";
import * as Icons from "../../icons/icons";

export interface CategoryConfig {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  isNameFilter?: boolean;
  category: CATEGORIES;
}

export const categoryConfigs: CategoryConfig[] = [
  {
    key: "faculty",
    title: "Facultades",
    icon: Icons.School,
    bg: "bg-red",
    category: CATEGORIES.FACULTY,
  },
  {
    key: "studyroom",
    title: "Salas de Estudio",
    icon: Icons.Studyroom,
    bg: "bg-orange-dark",
    category: CATEGORIES.STUDYROOM,
  },
  {
    key: "auditorium",
    title: "Auditorios",
    icon: Icons.Auditorium,
    bg: "bg-green",
    category: CATEGORIES.AUDITORIUM,
  },
  {
    key: "biblioteca",
    title: "Bibliotecas",
    icon: Icons.Library,
    bg: "bg-pink",
    isNameFilter: true,
    category: CATEGORIES.LIBRARY,
  },
  {
    key: "bath",
    title: "Baños",
    icon: Icons.Wc,
    bg: "bg-cyan-dark",
    category: CATEGORIES.BATH,
  },
  {
    key: "food_lunch",
    title: "Comida",
    icon: Icons.Restaurant,
    bg: "bg-orange",
    category: CATEGORIES.FOOD_LUNCH,
  },
  {
    key: "water",
    title: "Agua",
    icon: Icons.Water,
    bg: "bg-cyan",
    category: CATEGORIES.WATER,
  },
  {
    key: "trash",
    title: "Puntos de Reciclaje",
    icon: Icons.Recycle,
    bg: "bg-green",
    category: CATEGORIES.TRASH,
  },
  {
    key: "sports_place",
    title: "Deportes",
    icon: Icons.Sport,
    bg: "bg-purple-dark",
    category: CATEGORIES.SPORTS_PLACE,
  },
  {
    key: "crisol",
    title: "Crisol",
    icon: Icons.Print,
    bg: "bg-purple",
    isNameFilter: true,
    category: CATEGORIES.PHOTOCOPY,
  },
  {
    key: "parking",
    title: "Estacionamiento de Vehículos",
    icon: Icons.Car,
    bg: "bg-gray",
    category: CATEGORIES.PARKING,
  },
  {
    key: "park_bicycle",
    title: "Estacionamiento de Bicicletas",
    icon: Icons.Bicycle,
    bg: "bg-pink-dark",
    category: CATEGORIES.PARK_BICYCLE,
  },
  {
    key: "financial",
    title: "Servicios Financieros",
    icon: Icons.Bank,
    bg: "bg-green-dark",
    category: CATEGORIES.FINANCIAL,
  },
];

// Create a map for quick lookup by key name
export const categoryToConfigMap = categoryConfigs.reduce(
  (map, config) => {
    map[config.key] = config;
    return map;
  },
  {} as Record<string, CategoryConfig>,
);

// Create a map for quick lookup by category enum
export const categoryToConfigByCategoryMap = categoryConfigs.reduce(
  (map, config) => {
    map[config.category] = config;
    return map;
  },
  {} as Record<CATEGORIES, CategoryConfig>,
);

// Create a map for marker colors by category
export const categoryToColorMap = categoryConfigs.reduce(
  (map, config) => {
    map[config.key] = config.bg;
    return map;
  },
  {} as Record<string, string>,
);

// Create centralized category to icon mapping
export const categoryToIconMap = categoryConfigs.reduce(
  (map, config) => {
    map[config.category] = config.icon;
    return map;
  },
  {} as Record<CATEGORIES, React.ComponentType<{ className?: string }>>,
);

// Helper function to get category configuration by category enum
export const getCategoryConfig = (category: CATEGORIES): CategoryConfig => {
  const config = categoryToConfigByCategoryMap[category];
  if (config) return config;

  // Return default configuration for unmapped categories
  return {
    key: "other",
    title: "Otros",
    icon: Icons.Default,
    bg: "bg-background",
    category: CATEGORIES.OTHER,
  };
};

// Helper function to get marker color by category
export const getMarkerColorByCategory = (category: CATEGORIES): string => {
  const config = categoryToConfigByCategoryMap[category];
  return config?.bg || "bg-background";
};

// Helper function to get icon component by category
export const getIconByCategory = (category: CATEGORIES): React.ComponentType<{ className?: string }> => {
  const config = categoryToConfigByCategoryMap[category];
  return config?.icon || Icons.Default;
};
