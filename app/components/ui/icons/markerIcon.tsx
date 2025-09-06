import React from "react";

import { CATEGORIES } from "@/utils/types";

import * as Icons from "./icons";

const categoryIcons: Record<CATEGORIES, React.ComponentType<{ className?: string }>> = {
  [CATEGORIES.AUDITORIUM]: Icons.Auditorium,
  [CATEGORIES.BATH]: Icons.Wc,
  [CATEGORIES.BUILDING]: Icons.Default,
  [CATEGORIES.CAMPUS]: Icons.Default,
  [CATEGORIES.CLASSROOM]: Icons.School,
  [CATEGORIES.COMPUTERS]: Icons.PersonalComputer,
  [CATEGORIES.CUSTOM_MARK]: Icons.Pin,
  [CATEGORIES.FACULTY]: Icons.School,
  [CATEGORIES.FINANCIAL]: Icons.Money,
  [CATEGORIES.FOOD_LUNCH]: Icons.Restaurant,
  [CATEGORIES.LABORATORY]: Icons.Default,
  [CATEGORIES.OTHER]: Icons.Default,
  [CATEGORIES.PARK_BICYCLE]: Icons.Bike,
  [CATEGORIES.PARKING]: Icons.Parking,
  [CATEGORIES.PHOTOCOPY]: Icons.Print,
  [CATEGORIES.LIBRARY]: Icons.Library,
  [CATEGORIES.SHOP]: Icons.Shop,
  [CATEGORIES.SPORTS_PLACE]: Icons.Sport,
  [CATEGORIES.STUDYROOM]: Icons.Studyroom,
  [CATEGORIES.TRASH]: Icons.Default,
  [CATEGORIES.WATER]: Icons.Water,
  [CATEGORIES.USER_LOCATION]: Icons.UserLocation,
  [CATEGORIES.YARD]: Icons.Default,
  [CATEGORIES.CRISOL]: Icons.PersonalComputer,
};

export default function MarkerIcon({ label, classname = "w-3 h-3" }: { label: CATEGORIES; classname?: string }) {
  const Icon = categoryIcons[label] ?? Icons.Default;
  return <Icon className={classname} />;
}
