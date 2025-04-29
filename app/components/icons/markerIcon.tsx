import React from "react";

import { CategoryEnum } from "@/utils/types";

import * as Icons from "./icons";

const categoryIcons: Record<CategoryEnum, React.ComponentType<{ className?: string }>> = {
  [CategoryEnum.AUDITORIUM]: Icons.Auditorium,
  [CategoryEnum.BATH]: Icons.Wc,
  [CategoryEnum.BUILDING]: Icons.Default,
  [CategoryEnum.CAMPUS]: Icons.Default,
  [CategoryEnum.CLASSROOM]: Icons.Default,
  [CategoryEnum.COMPUTERS]: Icons.Print,
  [CategoryEnum.CUSTOM_MARK]: Icons.Pin,
  [CategoryEnum.FACULTY]: Icons.Default,
  [CategoryEnum.FINANCIAL]: Icons.Default,
  [CategoryEnum.FOOD_LUNCH]: Icons.Restaurant,
  [CategoryEnum.LABORATORY]: Icons.Default,
  [CategoryEnum.OTHER]: Icons.Default,
  [CategoryEnum.PARK_BICYCLE]: Icons.Default,
  [CategoryEnum.PARKING]: Icons.Parking,
  [CategoryEnum.PHOTOCOPY]: Icons.Print,
  [CategoryEnum.LIBRARY]: Icons.Library,
  [CategoryEnum.SHOP]: Icons.Default,
  [CategoryEnum.SPORTS_PLACE]: Icons.Sport,
  [CategoryEnum.STUDYROOM]: Icons.Studyroom,
  [CategoryEnum.TRASH]: Icons.Default,
  [CategoryEnum.WATER]: Icons.Water,
};

export default function MarkerIcon({ label }: { label: CategoryEnum }) {
  const Icon = categoryIcons[label] ?? Icons.Default;
  return <Icon className="w-3 h-3" />;
}
