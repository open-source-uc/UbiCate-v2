"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { categoryFilter } from "@/app/components/features/filters/pills/placeFilters";
import { Feature, JSONFeatures, PointFeature, PolygonFeature } from "@/lib/types";

import usePlaces from "../hooks/usePlaces";

// Tiempos de refetch configurables por entorno (en segundos → ms). Deben ser NEXT_PUBLIC_* para estar
// disponibles en el cliente. Si no están definidos, se usan los valores por defecto (5 min / 30 s).
const REFETCH_ONLINE_MS = (Number(process.env.NEXT_PUBLIC_REFETCH_ONLINE_SECONDS) || 300) * 1000;
const REFETCH_OFFLINE_MS = (Number(process.env.NEXT_PUBLIC_REFETCH_OFFLINE_SECONDS) || 30) * 1000;
const REFETCH_IN_BACKGROUND = process.env.NEXT_PUBLIC_REFETCH_IN_BACKGROUND === "true";

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
  refetchPlaces: (opts?: { syncMap?: boolean }) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const { data, isSuccess } = useQuery({
    queryKey: ["places"],
    queryFn: () =>
      fetch("/api/ubicate").then((r) => r.json()) as Promise<{
        approved_places: JSONFeatures;
        new_places: JSONFeatures;
        message: string;
      }>,
    staleTime: REFETCH_ONLINE_MS,
    networkMode: "offlineFirst",
    // Polling adaptativo: agresivo si estamos offline (busca reconexión), relajado si hay conexión.
    // Este path pasa por el SW + cache del servidor (Capa 1), así no golpea la BD en cada tick.
    refetchInterval: isOnline ? REFETCH_ONLINE_MS : REFETCH_OFFLINE_MS,
    refetchIntervalInBackground: REFETCH_IN_BACKGROUND,
    refetchOnReconnect: true,
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

  // Trae datos frescos del servidor saltándose TODAS las capas de cache (SW + memoria del servidor)
  // vía el header X-Ubicate-Fresh. syncMap=true además fuerza los lugares aprobados al mapa (post-mutación);
  // syncMap=false solo refresca los datos y deja que allFeatures/PillFilter reconstruyan el mapa (carga/reconexión).
  const refetchPlaces = useCallback(
    async (opts?: { syncMap?: boolean }) => {
      const syncMap = opts?.syncMap ?? true;
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
        if (syncMap && !inDebugMode) {
          o.setPlaces(freshData.approved_places?.features ?? []);
        }
      } catch {
        // offline — debug mode handles auto-exit, normal app stays on cache
      }
    },
    [queryClient, o.setPlaces],
  );

  // Al cargar con conexión → buscar enseguida datos frescos del servidor. Al reconectar → volver a
  // pedirlos y restaurar la cadencia online. Al perder conexión → cambiar a polling agresivo (offline).
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      refetchPlaces({ syncMap: false });
    };
    const goOffline = () => setIsOnline(false);

    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) refetchPlaces({ syncMap: false });
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [refetchPlaces]);

  // Recalcula los puntos del mapa desde los filtros activos SIEMPRE que cambien los datos o los filtros,
  // aunque el sidebar (y por tanto PillFilter) esté cerrado. Solo actúa cuando hay filtros activos, para
  // no pisar la selección de búsqueda ni el flujo sin filtros.
  useEffect(() => {
    if (!isSuccess || allFeatures.length === 0 || activeFilters.length === 0) return;

    const geoJson = { type: "FeatureCollection", features: allFeatures };
    const seen = new Set<string>();
    const results: Feature[] = [];

    activeFilters.forEach((cat) => {
      categoryFilter(geoJson, cat).forEach((f: Feature) => {
        const id = f.properties?.identifier ?? JSON.stringify(f);
        if (!seen.has(id)) {
          seen.add(id);
          results.push(f);
        }
      });
    });

    o.setPlaces(results);
  }, [allFeatures, activeFilters, isSuccess, o.setPlaces]);

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
