"use client";
import { useRouter } from "next/navigation";

import { createContext, useContext, ReactNode, useState, useRef, RefObject } from "react";

import { Feature, PointFeature, PolygonFeature } from "@/utils/types";

import useGeocoder from "../hooks/useGeocoder";

interface SidebarContextType {
  isOpen: boolean;
  places: Feature[];
  points: PointFeature[];
  polygons: PolygonFeature[];
  setPlaces: (e: Feature[] | Feature | null) => void;
  toggleSidebar: () => void;
  geocoder: RefObject<MapboxGeocoder | null>;
  refFunctionClickOnResult: RefObject<((e: Feature) => void) | null>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const refFunctionClickOnResult = useRef<((e: Feature) => void) | null>(null);

  const [places, points, polygons, setPlaces, geocoder] = useGeocoder(
    null,
    refFunctionClickOnResult ??
      ((e: Feature) => {
        router.push("/map?place=" + e.properties.identifier);
      }),
  );

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{ isOpen, places, points, polygons, setPlaces, toggleSidebar, geocoder, refFunctionClickOnResult }}
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
