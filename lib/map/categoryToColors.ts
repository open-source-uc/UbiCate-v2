import { CATEGORIES } from "@/lib/types";

const categoryToColorMap = new Map<CATEGORIES, string>([
  [CATEGORIES.FACULTY, "bg-chart-0"],
  [CATEGORIES.STUDYROOM, "bg-chart-1"],
  [CATEGORIES.AUDITORIUM, "bg-chart-2"],
  [CATEGORIES.BATH, "bg-chart-3"],
  [CATEGORIES.FOOD_LUNCH, "bg-chart-4"],
  [CATEGORIES.WATER, "bg-chart-5"],
  [CATEGORIES.SPORTS_PLACE, "bg-chart-6"],
  [CATEGORIES.CRISOL, "bg-chart-7"],
  [CATEGORIES.PARKING, "bg-chart-8"],
  [CATEGORIES.COMPUTERS, "bg-chart-9"],
  [CATEGORIES.LIBRARY, "bg-chart-10"],
  [CATEGORIES.USER_LOCATION, "bg-primary"],
  [CATEGORIES.CUSTOM_MARK, "bg-primary"],
  [CATEGORIES.PHOTOCOPY, "bg-chart-9"],
  [CATEGORIES.FINANCIAL, "bg-chart-11"],
  [CATEGORIES.SHOP, "bg-chart-12"],
  [CATEGORIES.PARK_BICYCLE, "bg-chart-13"],
]);

export const getCategoryColor = (category: CATEGORIES): string => {
  return categoryToColorMap.get(category) ?? "bg-primary";
};
