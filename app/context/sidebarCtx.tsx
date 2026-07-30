"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback, useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { categoryFilter, getActiveEvents, getEventPlaces } from "@/app/components/features/filters/pills/placeFilters";
import { AppLoadError, fetchJsonOrThrow, LoadErrorKind, markAppLoadedOnce } from "@/lib/api/loadError";
import { CATEGORIES, EventFeature, Feature, JSONFeatures, PointFeature, PolygonFeature } from "@/lib/types";

import usePlaces from "../hooks/usePlaces";

// Tiempos de refetch configurables por entorno (en segundos → ms). Deben ser NEXT_PUBLIC_* para estar
// disponibles en el cliente. Si no están definidos, se usan los valores por defecto (5 min / 30 s).
const REFETCH_ONLINE_MS = (Number(process.env.NEXT_PUBLIC_REFETCH_ONLINE_SECONDS) || 300) * 1000;
const REFETCH_OFFLINE_MS = (Number(process.env.NEXT_PUBLIC_REFETCH_OFFLINE_SECONDS) || 30) * 1000;
const REFETCH_IN_BACKGROUND = process.env.NEXT_PUBLIC_REFETCH_IN_BACKGROUND === "true";

// Margen tras el primer request exitoso: el refresh fresco va en paralelo y puede tardar un poco más en
// delatar que el servidor está caído.
const FIRST_RESULT_GRACE_MS = 2000;

export type FirstRequestResult = "ok" | LoadErrorKind;

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
  eventCounts: Map<string, number>;
  setEventCounts: (counts: Map<string, number>) => void;
  eventPlaceIds: Set<string>;
  setEventPlaceIds: (ids: Set<string>) => void;
  allFeatures: Feature[];
  allEvents: EventFeature[];
  eventPlaces: Feature[];
  isDataLoaded: boolean;
  // Solo tiene valor cuando la app se quedó sin datos que mostrar (ni frescos ni de cache).
  loadError: LoadErrorKind | null;
  firstRequestResult: FirstRequestResult | null;
  isRetryingLoad: boolean;
  retryLoad: () => void;
  refetchPlaces: (opts?: { syncMap?: boolean }) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [eventCounts, setEventCounts] = useState<Map<string, number>>(new Map());
  const [eventPlaceIds, setEventPlaceIds] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const {
    data,
    isSuccess,
    error,
    fetchStatus,
    refetch: retryLoad,
  } = useQuery({
    queryKey: ["places"],
    queryFn: () =>
      fetchJsonOrThrow<{
        approved_places: JSONFeatures;
        new_places: JSONFeatures;
        message: string;
      }>("/api/ubicate"),
    // Un solo reintento: si falla, avisar rápido con la pantalla de error en vez de esperar el backoff.
    retry: 1,
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

  // `fetchStatus === "paused"` es React Query esperando red en networkMode offlineFirst.
  const fetchFailure: LoadErrorKind | null = useMemo(() => {
    if (fetchStatus === "paused") return "offline";
    if (!error) return null;
    return error instanceof AppLoadError ? error.kind : "database";
  }, [error, fetchStatus]);

  const loadError: LoadErrorKind | null = data ? null : fetchFailure;

  // Cubre el refetch con X-Ubicate-Fresh, que no pasa por el estado de la query.
  const [manualServerError, setManualServerError] = useState(false);

  const [firstRequestResult, setFirstRequestResult] = useState<FirstRequestResult | null>(null);
  const firstResultSettled = useRef(false);

  useEffect(() => {
    if (firstResultSettled.current) return;

    const settle = (result: FirstRequestResult) => {
      firstResultSettled.current = true;
      setFirstRequestResult(result);
    };

    if (fetchFailure) return settle(fetchFailure);
    if (manualServerError) return settle("database");
    if (!isSuccess) return;
    // Datos servidos por el cache del SW estando sin conexión: igual hay que avisarlo.
    if (typeof navigator !== "undefined" && !navigator.onLine) return settle("offline");

    const timer = setTimeout(() => settle("ok"), FIRST_RESULT_GRACE_MS);
    return () => clearTimeout(timer);
  }, [fetchFailure, manualServerError, isSuccess]);

  // Eventos por el MISMO flujo de 3 capas (offlineFirst + SW + Capa 1). El endpoint devuelve en una
  // sola colección los eventos (con startDate) y sus lugares inline (isEventOnly, sin startDate).
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () =>
      fetch("/api/events").then((r) => r.json()) as Promise<{
        events: { features: (EventFeature | Feature)[] };
        message: string;
      }>,
    staleTime: REFETCH_ONLINE_MS,
    networkMode: "offlineFirst",
    refetchInterval: isOnline ? REFETCH_ONLINE_MS : REFETCH_OFFLINE_MS,
    refetchIntervalInBackground: REFETCH_IN_BACKGROUND,
    refetchOnReconnect: true,
  });

  const { allEvents, eventPlaces } = useMemo(() => {
    const features = eventsData?.events?.features ?? [];
    const evs: EventFeature[] = [];
    const places: Feature[] = [];
    for (const f of features) {
      if ("startDate" in f.properties) evs.push(f as EventFeature);
      else places.push(f as Feature);
    }
    return { allEvents: evs, eventPlaces: places };
  }, [eventsData]);

  const o = usePlaces(eventCounts);

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

  useEffect(() => {
    if (isSuccess) markAppLoadedOnce();
  }, [isSuccess]);

  // Trae datos frescos del servidor saltándose TODAS las capas de cache (SW + memoria del servidor)
  // vía el header X-Ubicate-Fresh. syncMap=true además fuerza los lugares aprobados al mapa (post-mutación);
  // syncMap=false solo refresca los datos y deja que allFeatures/PillFilter reconstruyan el mapa (carga/reconexión).
  const refetchPlaces = useCallback(
    async (opts?: { syncMap?: boolean }) => {
      const syncMap = opts?.syncMap ?? true;
      try {
        const freshData = await fetchJsonOrThrow<{
          approved_places: { features: Feature[] };
          new_places: { features: Feature[] };
          message: string;
        }>("/api/ubicate", { headers: { "X-Ubicate-Fresh": "true" } });
        queryClient.setQueryData(["places"], freshData);
        queryClient.invalidateQueries({ queryKey: ["ubicate-debug"] });
        setManualServerError(false);
        const inDebugMode = typeof window !== "undefined" && sessionStorage.getItem("debugMode") === "true";
        if (syncMap && !inDebugMode) {
          o.setPlaces(freshData.approved_places?.features ?? []);
        }
      } catch (err) {
        setManualServerError(err instanceof AppLoadError && err.kind === "database");
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

  // Recalcula los puntos del mapa desde los filtros activos SIEMPRE que cambien los datos, los eventos
  // o los filtros — aunque el sidebar (y por tanto PillFilter) esté cerrado. Maneja también el filtro
  // de eventos (categoría EVENTS) y publica eventPlaceIds para que el mapa marque esos lugares.
  useEffect(() => {
    if (activeFilters.length === 0) {
      o.setPlaces([]);
      setEventPlaceIds(new Set());
      return;
    }

    const geoJson = { type: "FeatureCollection", features: allFeatures };
    const seen = new Set<string>();
    const results: Feature[] = [];
    const nextEventPlaceIds = new Set<string>();

    activeFilters.forEach((cat) => {
      if (cat === CATEGORIES.EVENTS) {
        const activeEvents = getActiveEvents(allEvents);
        const { places, eventPlaceIds } = getEventPlaces(activeEvents, allFeatures, eventPlaces);
        places.forEach((p) => {
          const id = p.properties.identifier;
          if (!seen.has(id)) {
            seen.add(id);
            results.push(p);
          }
        });
        eventPlaceIds.forEach((id) => nextEventPlaceIds.add(id));
      } else {
        categoryFilter(geoJson, cat).forEach((f: Feature) => {
          const id = f.properties?.identifier ?? JSON.stringify(f);
          if (!seen.has(id)) {
            seen.add(id);
            results.push(f);
          }
        });
      }
    });

    setEventCounts(new Map());
    setEventPlaceIds(nextEventPlaceIds);
    o.setPlaces(results);
  }, [allFeatures, allEvents, eventPlaces, activeFilters, o.setPlaces]);

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
        eventCounts,
        setEventCounts,
        eventPlaceIds,
        setEventPlaceIds,
        allFeatures,
        allEvents,
        eventPlaces,
        isDataLoaded: isSuccess,
        loadError,
        firstRequestResult,
        isRetryingLoad: fetchStatus === "fetching",
        retryLoad,
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
