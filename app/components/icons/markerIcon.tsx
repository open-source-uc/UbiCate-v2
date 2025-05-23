import React from "react";

import { CATEGORIES } from "@/utils/types";

import * as Icons from "./icons";

const categoryIcons: Record<CATEGORIES, React.ComponentType<{ className?: string }>> = {
  [CATEGORIES.AUDITORIUM]: Icons.Auditorium,
  [CATEGORIES.BATH]: Icons.Wc,
  [CATEGORIES.BUILDING]: Icons.Default,
  [CATEGORIES.CAMPUS]: Icons.Default,
  [CATEGORIES.CLASSROOM]: Icons.Default,
  [CATEGORIES.COMPUTERS]: Icons.Print,
  [CATEGORIES.CUSTOM_MARK]: Icons.Pin,
  [CATEGORIES.FACULTY]: Icons.Default,
  [CATEGORIES.FINANCIAL]: Icons.Default,
  [CATEGORIES.FOOD_LUNCH]: Icons.Restaurant,
  [CATEGORIES.LABORATORY]: Icons.Default,
  [CATEGORIES.OTHER]: Icons.Default,
  [CATEGORIES.PARK_BICYCLE]: Icons.Default,
  [CATEGORIES.PARKING]: Icons.Parking,
  [CATEGORIES.PHOTOCOPY]: Icons.Print,
  [CATEGORIES.LIBRARY]: Icons.Library,
  [CATEGORIES.SHOP]: Icons.Default,
  [CATEGORIES.SPORTS_PLACE]: Icons.Sport,
  [CATEGORIES.STUDYROOM]: Icons.Studyroom,
  [CATEGORIES.TRASH]: Icons.Default,
  [CATEGORIES.WATER]: Icons.Water,
  [CATEGORIES.USER_LOCATION]: Icons.UserLocation,
  [CATEGORIES.YARD]: Icons.Default,
};

export default function MarkerIcon({ label }: { label: CATEGORIES }) {
  const Icon = categoryIcons[label] ?? Icons.Default;
  return <Icon className="w-3 h-3" />;
}
