"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Feature, JSONFeatures, PointFeature, PolygonFeature } from "@/lib/types";

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
  allFeatures: Feature[];
  isDataLoaded: boolean;
  refetchPlaces: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data, isSuccess } = useQuery({
    queryKey: ["places"],
    queryFn: () =>
      fetch("/api/ubicate").then((r) => r.json()) as Promise<{
        approved_places: JSONFeatures;
        new_places: JSONFeatures;
        message: string;
      }>,
    staleTime: 5 * 60 * 1000,
    networkMode: "offlineFirst",
  });

  const allFeatures = useMemo(() => {
    if (!data) return [];
    return data.approved_places?.features ?? [];
  }, [data]);

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

  const refetchPlaces = async () => {
    try {
      const res = await fetch("/api/ubicate", {
        headers: { "X-Ubicate-Fresh": "true" },
      });
      const freshData = (await res.json()) as {
        approved_places: { features: Feature[] };
        new_places: { features: Feature[] };
        message: string;
      };
      queryClient.setQueryData(["places"], freshData);
      queryClient.invalidateQueries({ queryKey: ["ubicate-debug"] });
      const inDebugMode = typeof window !== "undefined" && sessionStorage.getItem("debugMode") === "true";
      if (!inDebugMode) {
        o.setPlaces(freshData.approved_places?.features ?? []);
      }
    } catch {
      // offline — debug mode handles auto-exit, normal app stays on cache
    }
  };

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
        allFeatures,
        isDataLoaded: isSuccess,
        refetchPlaces,
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
