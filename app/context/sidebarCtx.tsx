"use client";
import { createContext, useContext, ReactNode, useState, useRef, RefObject } from "react";

import { Feature, PointFeature, PolygonFeature } from "@/utils/types";

import useGeocoder from "../hooks/useGeocoder";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (e: boolean) => void;
  places: Feature[];
  points: PointFeature[];
  polygons: PolygonFeature[];
  setPlaces: (e: Feature[] | Feature | null) => void;
  geocoder: RefObject<MapboxGeocoder | null>;
  refFunctionClickOnResult: RefObject<((e: Feature) => void) | null>;
  selectedPlace: Feature | null;
  setSelectedPlace: (place: Feature | null) => void;
  pointsName: PointFeature[];
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const refFunctionClickOnResult = useRef<((e: Feature) => void) | null>(null);

  const [places, points, polygons, setPlaces, geocoder, selectedPlace, setSelectedPlace, pointsName] = useGeocoder(null);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        places,
        points,
        polygons,
        setPlaces,
        geocoder,
        refFunctionClickOnResult,
        selectedPlace,
        setSelectedPlace,
        pointsName
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
