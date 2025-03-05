import React from "react";

import * as Icons from "./icons";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  auditorium: Icons.Auditorium,
  bath: Icons.Wc,
  water: Icons.Water,
  food_lunch: Icons.Restaurant,
  library: Icons.Library,
  studyroom: Icons.Studyroom,
  sports_place: Icons.Sport,
  parking: Icons.Parking,
  computers: Icons.Print,
};

export default function MarkerIcon({ label }: { label: string }) {
  const Icon = categoryIcons[label] ?? Icons.Default;
  return <Icon className="w-3 h-3" />;
}
