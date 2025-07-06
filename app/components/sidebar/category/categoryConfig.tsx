import React from "react";

import { CATEGORIES } from "../../../../utils/types";
import * as Icons from "../../icons/icons";

export interface CategoryConfig {
  key: string;
  title: string;
  icon: React.ReactNode;
  iconComponent: React.ComponentType<{ className?: string }>;
  bg: string;
  filter: string;
  isNameFilter?: boolean;
  category: CATEGORIES;
}

export const categoryConfigs: CategoryConfig[] = [
  // Main interactive categories (shown in UI)
  {
    key: "faculty",
    title: "Facultades",
    icon: <Icons.School />,
    iconComponent: Icons.School,
    bg: "bg-red",
    filter: "faculty",
    category: CATEGORIES.FACULTY,
  },
  {
    key: "studyroom",
    title: "Salas de Estudio",
    icon: <Icons.Studyroom />,
    iconComponent: Icons.Studyroom,
    bg: "bg-red",
    filter: "studyroom",
    category: CATEGORIES.STUDYROOM,
  },
  {
    key: "auditorium",
    title: "Auditorios",
    icon: <Icons.Auditorium />,
    iconComponent: Icons.Auditorium,
    bg: "bg-green",
    filter: "auditorium",
    category: CATEGORIES.AUDITORIUM,
  },
  {
    key: "biblioteca",
    title: "Bibliotecas",
    icon: <Icons.Library />,
    iconComponent: Icons.Library,
    bg: "bg-pink",
    filter: "biblioteca",
    isNameFilter: true,
    category: CATEGORIES.LIBRARY,
  },
  {
    key: "bath",
    title: "Baños",
    icon: <Icons.Wc />,
    iconComponent: Icons.Wc,
    bg: "bg-cyan",
    filter: "bath",
    category: CATEGORIES.BATH,
  },
  {
    key: "food_lunch",
    title: "Comida",
    icon: <Icons.Restaurant />,
    iconComponent: Icons.Restaurant,
    bg: "bg-orange",
    filter: "food_lunch",
    category: CATEGORIES.FOOD_LUNCH,
  },
  {
    key: "water",
    title: "Agua",
    icon: <Icons.Water />,
    iconComponent: Icons.Water,
    bg: "bg-cyan",
    filter: "water",
    category: CATEGORIES.WATER,
  },
  {
    key: "trash",
    title: "Puntos de Reciclaje",
    icon: <Icons.Recycle />,
    iconComponent: Icons.Recycle,
    bg: "bg-green",
    filter: "trash",
    category: CATEGORIES.TRASH,
  },
  {
    key: "sports_place",
    title: "Deportes",
    icon: <Icons.Sport />,
    iconComponent: Icons.Sport,
    bg: "bg-deep-green-option",
    filter: "sports_place",
    category: CATEGORIES.SPORTS_PLACE,
  },
  {
    key: "crisol",
    title: "Crisol",
    icon: <Icons.Print />,
    iconComponent: Icons.Print,
    bg: "bg-purple",
    filter: "crisol",
    isNameFilter: true,
    category: CATEGORIES.PHOTOCOPY,
  },
  {
    key: "parking",
    title: "Estacionamiento de Vehículos",
    icon: <Icons.Car />,
    iconComponent: Icons.Car,
    bg: "bg-red",
    filter: "parking",
    category: CATEGORIES.PARKING,
  },
  {
    key: "park_bicycle",
    title: "Estacionamiento de Bicicletas",
    icon: <Icons.Bicycle />,
    iconComponent: Icons.Bicycle,
    bg: "bg-green",
    filter: "park_bicycle",
    category: CATEGORIES.PARK_BICYCLE,
  },
  {
    key: "financial",
    title: "Servicios Financieros",
    icon: <Icons.Bank />,
    iconComponent: Icons.Bank,
    bg: "bg-green-light",
    filter: "financial",
    category: CATEGORIES.FINANCIAL,
  },
];

// Create a map for quick lookup by filter name
export const categoryToConfigMap = categoryConfigs.reduce(
  (map, config) => {
    map[config.filter] = config;
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
    map[config.filter] = config.bg;
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
  {} as Record<CATEGORIES, React.ReactNode>,
);

// Helper function to get category configuration by category enum
export const getCategoryConfig = (category: CATEGORIES): CategoryConfig => {
  const config = categoryToConfigByCategoryMap[category];
  if (config) return config;

  // Return default configuration for unmapped categories
  return {
    key: "other",
    title: "Otros",
    icon: <Icons.Default />,
    iconComponent: Icons.Default,
    bg: "bg-background",
    filter: "other",
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
  return config?.iconComponent || Icons.Default;
};
