// Category Configuration System - Usage Examples
// This file demonstrates how to use the centralized category configuration system

import React from "react";

import { CATEGORIES } from "../../../../utils/types";

import {
  categoryConfigs,
  getCategoryConfig,
  getMarkerColorByCategory,
  getIconByCategory,
  categoryToMarkerColorMap,
} from "./categoryConfig";

// Example 1: Creating a Marker Component with centralized configuration
export const ExampleMarker = ({ category }: { category: CATEGORIES }) => {
  const color = getMarkerColorByCategory(category);
  const IconComponent = getIconByCategory(category);

  return (
    <div className={`p-2 rounded-full ${color}`}>
      <IconComponent className="w-4 h-4" />
    </div>
  );
};

// Example 2: Creating a Category List with centralized configuration
export const CategoryList = () => {
  return (
    <div className="space-y-2">
      {categoryConfigs.map((config) => (
        <div key={config.key} className="flex items-center space-x-2">
          <div className={`p-2 rounded ${config.markerColor}`}>
            {config.icon}
          </div>
          <span>{config.title}</span>
        </div>
      ))}
    </div>
  );
};

// Example 3: Dynamic Category Badge Component
export const CategoryBadge = ({ category }: { category: CATEGORIES }) => {
  const config = getCategoryConfig(category);

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${config.markerColor}`}>
      {config.icon}
      <span className="ml-1">{config.title || category}</span>
    </div>
  );
};

// Example 4: Category Legend Component
export const CategoryLegend = () => {
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {Object.entries(categoryToMarkerColorMap).map(([category, color]) => {
        const IconComponent = getIconByCategory(category as CATEGORIES);
        return (
          <div key={category} className="flex items-center space-x-2">
            <div className={`p-1 rounded ${color}`}>
              <IconComponent className="w-3 h-3" />
            </div>
            <span className="text-sm capitalize">{category.replace("_", " ")}</span>
          </div>
        );
      })}
    </div>
  );
};

// Example 5: Category Filter Button
export const CategoryFilterButton = ({ category, isActive, onClick }: { 
  category: CATEGORIES; 
  isActive: boolean; 
  onClick: () => void; 
}) => {
  const config = getCategoryConfig(category);
  const baseClasses = "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors";
  const activeClasses = isActive ? config.markerColor : "bg-gray-100 hover:bg-gray-200";

  return (
    <button className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
      {config.icon}
      <span>{config.title || category}</span>
    </button>
  );
};

// Example 6: Getting all available categories
export const getAllCategories = () => {
  return Object.values(CATEGORIES);
};

// Example 7: Validating if a category exists
export const isValidCategory = (category: string): category is CATEGORIES => {
  return Object.values(CATEGORIES).includes(category as CATEGORIES);
};

// Example 8: Getting category statistics
export const getCategoryStats = () => {
  const totalCategories = Object.values(CATEGORIES).length;
  const configuredCategories = categoryConfigs.length;
  const unconfiguredCategories = totalCategories - configuredCategories;

  return {
    total: totalCategories,
    configured: configuredCategories,
    unconfigured: unconfiguredCategories,
    configuredPercentage: (configuredCategories / totalCategories) * 100,
  };
};

// Example 9: Custom hook for category configuration
export const useCategoryConfig = (category: CATEGORIES) => {
  const config = getCategoryConfig(category);
  const color = getMarkerColorByCategory(category);
  const IconComponent = getIconByCategory(category);

  return {
    config,
    color,
    IconComponent,
    title: config.title || category,
    isConfigured: categoryConfigs.some((c) => c.category === category),
  };
};

// Example 10: Batch operations with categories
export const getCategoriesByColor = (targetColor: string) => {
  return Object.entries(categoryToMarkerColorMap)
    .filter(([, color]) => color === targetColor)
    .map(([category]) => category as CATEGORIES);
};

// Example usage of the functions above:
/*
// In your component:
const MarkerComponent = () => {
  const { color, IconComponent, title } = useCategoryConfig(CATEGORIES.LIBRARY);
  
  return (
    <div className={`marker ${color}`}>
      <IconComponent className="w-4 h-4" />
      <span>{title}</span>
    </div>
  );
};

// Get all categories with red colors:
const redCategories = getCategoriesByColor('bg-red-option');

// Check if a string is a valid category:
if (isValidCategory(someString)) {
  // Safe to use as CATEGORIES enum
}

// Get statistics about category configuration:
const stats = getCategoryStats();
console.log(`${stats.configured}/${stats.total} categories configured (${stats.configuredPercentage}%)`);
*/
