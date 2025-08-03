import { CATEGORIES } from "./types";

const categoryToColorMap = new Map<string, string>([
  ["faculty", "bg-chart-1"],
  ["studyroom", "bg-chart-2"],
  ["auditorium", "bg-chart-3"],
  ["biblioteca", "bg-chart-4"],
  ["bath", "bg-chart-5"],
  ["food_lunch", "bg-chart-6"],
  ["water", "bg-chart-7"],
  ["sports_place", "bg-chart-8"],
  ["crisol", "bg-chart-9"],
  ["parking", "bg-chart-10"],
  ["computers", "bg-chart-9"],
  ["Facultad", "bg-chart-6"],
  ["library", "bg-chart-4"],
  ["userLocation", "bg-primary"],
  ["customMark", "bg-chart-4"],
  ["photocopy", "bg-chart-1"],
  [CATEGORIES.FINANCIAL, "bg-chart-3"],
  [CATEGORIES.SHOP, "bg-chart-2"],
  [CATEGORIES.PARK_BICYCLE, "bg-chart-5"],
]);

export const getCategoryColor = (category: string): string => {
  return categoryToColorMap.get(category) ?? "bg-chart-0"; // Default color if category not found
};