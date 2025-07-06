import React from "react";

import { CATEGORIES } from "../../../../utils/types";

import * as Icons from "../../icons/icons";

export interface CategoryConfig {
  key: string;
  title: string;
  icon: React.ReactNode;
  bg: string;
  filter: string;
  isNameFilter?: boolean;
  markerColor: string;
  category: CATEGORIES;
}

export const categoryConfigs: CategoryConfig[] = [
  {
    key: "faculty",
    title: "Facultades",
    icon: <Icons.School />,
    bg: "bg-red",
    filter: "faculty",
    markerColor: "bg-deep-red-option",
    category: CATEGORIES.FACULTY,
  },
  {
    key: "studyroom",
    title: "Salas de Estudio",
    icon: <Icons.Studyroom />,
    bg: "",
    filter: "studyroom",
    markerColor: "bg-red-option",
    category: CATEGORIES.STUDYROOM,
  },
  {
    key: "auditorium",
    title: "Auditorios",
    icon: <Icons.Auditorium />,
    bg: "bg-green",
    filter: "auditorium",
    markerColor: "bg-green-option",
    category: CATEGORIES.AUDITORIUM,
  },
  {
    key: "biblioteca",
    title: "Bibliotecas",
    icon: <Icons.Library />,
    bg: "bg-pink",
    filter: "biblioteca",
    isNameFilter: true,
    markerColor: "bg-pink-option",
    category: CATEGORIES.LIBRARY,
  },
  {
    key: "bath",
    title: "Baños",
    icon: <Icons.Wc />,
    bg: "bg-cyan",
    filter: "bath",
    markerColor: "bg-deep-cyan-option",
    category: CATEGORIES.BATH,
  },
  {
    key: "food_lunch",
    title: "Comida",
    icon: <Icons.Restaurant />,
    bg: "bg-orange",
    filter: "food_lunch",
    markerColor: "bg-orange-option",
    category: CATEGORIES.FOOD_LUNCH,
  },
  {
    key: "water",
    title: "Agua",
    icon: <Icons.Water />,
    bg: "bg-cyan",
    filter: "water",
    markerColor: "bg-cyan-option",
    category: CATEGORIES.WATER,
  },
  {
    key: "sports_place",
    title: "Deportes",
    icon: <Icons.Sport />,
    bg: "",
    filter: "sports_place",
    markerColor: "bg-deep-green-option",
    category: CATEGORIES.SPORTS_PLACE,
  },
  {
    key: "crisol",
    title: "Crisol",
    icon: <Icons.Print />,
    bg: "bg-purple",
    filter: "crisol",
    isNameFilter: true,
    markerColor: "bg-purple-option",
    category: CATEGORIES.PHOTOCOPY,
  },
  {
    key: "parking",
    title: "Estacionamientos",
    icon: <Icons.Parking />,
    bg: "bg-gray",
    filter: "parking",
    markerColor: "bg-gray-option",
    category: CATEGORIES.PARKING,
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

// Create a map for marker colors by category
export const categoryToColorMap = categoryConfigs.reduce(
  (map, config) => {
    map[config.filter] = config.markerColor;
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

// Create centralized category to marker color mapping using CATEGORIES enum
export const categoryToMarkerColorMap: Record<CATEGORIES, string> = {
  [CATEGORIES.AUDITORIUM]: "bg-green-option",
  [CATEGORIES.BATH]: "bg-deep-cyan-option",
  [CATEGORIES.BUILDING]: "bg-brown-light",
  [CATEGORIES.CAMPUS]: "bg-brown-light",
  [CATEGORIES.CLASSROOM]: "bg-brown-light",
  [CATEGORIES.COMPUTERS]: "bg-purple-option",
  [CATEGORIES.CUSTOM_MARK]: "bg-pink-option",
  [CATEGORIES.FACULTY]: "bg-deep-red-option",
  [CATEGORIES.FINANCIAL]: "bg-brown-light",
  [CATEGORIES.FOOD_LUNCH]: "bg-orange-option",
  [CATEGORIES.LABORATORY]: "bg-brown-light",
  [CATEGORIES.LIBRARY]: "bg-pink-option",
  [CATEGORIES.OTHER]: "bg-brown-light",
  [CATEGORIES.PARK_BICYCLE]: "bg-brown-light",
  [CATEGORIES.PARKING]: "bg-gray-option",
  [CATEGORIES.PHOTOCOPY]: "bg-purple-option",
  [CATEGORIES.SHOP]: "bg-brown-light",
  [CATEGORIES.SPORTS_PLACE]: "bg-deep-green-option",
  [CATEGORIES.STUDYROOM]: "bg-red-option",
  [CATEGORIES.TRASH]: "bg-brown-light",
  [CATEGORIES.WATER]: "bg-cyan-option",
  [CATEGORIES.USER_LOCATION]: "bg-cyan-option",
  [CATEGORIES.YARD]: "bg-brown-light",
};

// Create centralized category to icon component mapping
export const categoryToIconComponentMap: Record<CATEGORIES, React.ComponentType<{ className?: string }>> = {
  [CATEGORIES.AUDITORIUM]: Icons.Auditorium,
  [CATEGORIES.BATH]: Icons.Wc,
  [CATEGORIES.BUILDING]: Icons.Default,
  [CATEGORIES.CAMPUS]: Icons.Default,
  [CATEGORIES.CLASSROOM]: Icons.Default,
  [CATEGORIES.COMPUTERS]: Icons.Print,
  [CATEGORIES.CUSTOM_MARK]: Icons.Pin,
  [CATEGORIES.FACULTY]: Icons.School,
  [CATEGORIES.FINANCIAL]: Icons.Default,
  [CATEGORIES.FOOD_LUNCH]: Icons.Restaurant,
  [CATEGORIES.LABORATORY]: Icons.Default,
  [CATEGORIES.LIBRARY]: Icons.Library,
  [CATEGORIES.OTHER]: Icons.Default,
  [CATEGORIES.PARK_BICYCLE]: Icons.Default,
  [CATEGORIES.PARKING]: Icons.Parking,
  [CATEGORIES.PHOTOCOPY]: Icons.Print,
  [CATEGORIES.SHOP]: Icons.Default,
  [CATEGORIES.SPORTS_PLACE]: Icons.Sport,
  [CATEGORIES.STUDYROOM]: Icons.Studyroom,
  [CATEGORIES.TRASH]: Icons.Default,
  [CATEGORIES.WATER]: Icons.Water,
  [CATEGORIES.USER_LOCATION]: Icons.UserLocation,
  [CATEGORIES.YARD]: Icons.Default,
};

// Helper function to get category configuration by category enum
export const getCategoryConfig = (category: CATEGORIES): Partial<CategoryConfig> => {
  const config = categoryConfigs.find((c) => c.category === category);
  if (config) return config;
  
  // Return default configuration for unmapped categories
  return {
    icon: <Icons.Default />,
    markerColor: "bg-brown-light",
    category,
  };
};

// Helper function to get marker color by category
export const getMarkerColorByCategory = (category: CATEGORIES): string => {
  return categoryToMarkerColorMap[category] || "bg-brown-light";
};

// Helper function to get icon component by category
export const getIconByCategory = (category: CATEGORIES): React.ComponentType<{ className?: string }> => {
  return categoryToIconComponentMap[category] || Icons.Default;
};

// Backward compatibility - keep existing exports but mark as deprecated
/** @deprecated Use categoryToMarkerColorMap instead */
export const additionalMarkerColors: Record<string, string> = {
  library: "bg-pink-option",
  computers: "bg-purple-option",
  Facultad: "bg-deep-red-option",
  userLocation: "bg-cyan-option",
  customMark: "bg-pink-option",
};

/** @deprecated Use categoryToMarkerColorMap instead */
export const allMarkerColors = {
  ...categoryToColorMap,
  ...additionalMarkerColors,
};
