import React from "react";

import { CategoryOptions, CategoryToDisplayName } from "@/utils/types";

interface CategoriesFieldProps {
  categories: string[];
  onChange: (categories: string[]) => void;
  disabled: boolean;
}

export function CategoriesField({ categories, onChange, disabled }: CategoriesFieldProps) {
  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    onChange(newCategories);
  };

  const addCategory = () => {
    onChange([...categories, ""]);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      const newCategories = [...categories];
      newCategories.splice(index, 1);
      onChange(newCategories);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center text-md font-medium text-foreground" htmlFor="categories">
        Categorías
      </label>
      <p className="text-xs text-foreground/80 text-center italic">
        Selecciona las categorías que consideres que corresponden
      </p>

      {categories.map((category, index) => (
        <div key={index} className="flex items-center gap-2 w-full">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(index, e.target.value)}
            className="block p-3 w-full text-sm rounded-lg border border-border focus:ring-primary focus:outline-hidden focus:ring-2 bg-input text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            <option value="">Seleccionar categoría</option>
            {CategoryOptions.map((option) => (
              <option key={option} value={option}>
                {CategoryToDisplayName.get(option)}
              </option>
            ))}
          </select>

          {categories.length > 1 && (
            <button
              type="button"
              className="w-12 h-12 bg-transparent border border-border text-foreground rounded-full focus:ring-primary focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={() => removeCategory(index)}
              disabled={disabled}
            >
              x
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="text-sm text-interactive-primary hover:underline self-start disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
        disabled={disabled}
      >
        + Agregar otra categoría
      </button>
    </div>
  );
}
