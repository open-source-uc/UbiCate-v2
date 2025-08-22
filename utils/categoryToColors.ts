import { CATEGORIES } from "./types";

const categoryToColorMap = new Map<CATEGORIES, string>([
  [CATEGORIES.FACULTY, "bg-chart-1"],
  [CATEGORIES.STUDYROOM, "bg-chart-2"],
  [CATEGORIES.AUDITORIUM, "bg-chart-3"],
  [CATEGORIES.BATH, "bg-chart-5"],
  [CATEGORIES.FOOD_LUNCH, "bg-chart-6"],
  [CATEGORIES.WATER, "bg-chart-7"],
  [CATEGORIES.SPORTS_PLACE, "bg-chart-8"],
  [CATEGORIES.CRISOL, "bg-chart-9"],
  [CATEGORIES.PARKING, "bg-chart-10"],
  [CATEGORIES.COMPUTERS, "bg-chart-9"],
  [CATEGORIES.LIBRARY, "bg-chart-4"],
  [CATEGORIES.USER_LOCATION, "bg-primary"],
  [CATEGORIES.CUSTOM_MARK, "bg-chart-4"],
  [CATEGORIES.PHOTOCOPY, "bg-chart-1"],
  [CATEGORIES.FINANCIAL, "bg-chart-3"],
  [CATEGORIES.SHOP, "bg-chart-2"],
  [CATEGORIES.PARK_BICYCLE, "bg-chart-5"],
]);

export const getCategoryColor = (category: CATEGORIES): string => {
  return categoryToColorMap.get(category) ?? "bg-chart-0";
};