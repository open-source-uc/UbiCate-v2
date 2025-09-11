"use client";
import { createContext, useContext, ReactNode, useState } from "react";

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
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const o = usePlaces();

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        ...o,
        places: o.findPlaces,
        pointsName: o.PointsName,
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
