"use client";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";

import { Feature, PointFeature, PolygonFeature } from "@/lib/types";

import usePlaces from "../hooks/usePlaces";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (e: boolean) => void;
  places: Feature[];
  points: PointFeature[];
  polygons: PolygonFeature[];
  setPlaces: (e: Feature[] | Feature | null) => void;
  selectedPlace: Feature | null;
  setSelectedPlace: (place: Feature | null) => void;
  pointsName: PointFeature[];
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const o = usePlaces();

  useEffect(() => {
    const savedFilters = localStorage.getItem("ubicateActiveFilters");
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setActiveFilters(parsed);
      } catch (e) {
        console.error("Error loading filters from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ubicateActiveFilters", JSON.stringify(activeFilters));
  }, [activeFilters]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        ...o,
        places: o.findPlaces,
        pointsName: o.PointsName,
        activeFilters,
        setActiveFilters,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
