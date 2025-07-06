import React from "react";

import { CATEGORIES } from "@/utils/types";

import { getIconByCategory } from "../sidebar/category/categoryConfig";

export default function MarkerIcon({ label }: { label: CATEGORIES }) {
  const Icon = getIconByCategory(label);
  return <Icon className="w-3 h-3" />;
}
