"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback, useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { categoryFilter, getActiveEvents, getEventPlaces } from "@/app/components/features/filters/pills/placeFilters";
import { AppLoadError, fetchJsonOrThrow, LoadErrorKind, markAppLoadedOnce } from "@/lib/api/loadError";
import {
  CATEGORIES,
  EventFeature,
  Feature,
  JSONFeatures,
  PointFeature,
  PolygonFeature,
  RouteFeature,
} from "@/lib/types";

import usePlaces from "../hooks/usePlaces";

// Tiempos de refetch configurables por entorno (en segundos → ms). Deben ser NEXT_PUBLIC_* para estar
// disponibles en el cliente. Si no están definidos, se usan los valores por defecto (5 min / 30 s).
const REFETCH_ONLINE_MS = (Number(process.env.NEXT_PUBLIC_REFETCH_ONLINE_SECONDS) || 300) * 1000;
const REFETCH_OFFLINE_MS = (Number(process.env.NEXT_PUBLIC_REFETCH_OFFLINE_SECONDS) || 30) * 1000;
const REFETCH_IN_BACKGROUND = process.env.NEXT_PUBLIC_REFETCH_IN_BACKGROUND === "true";

// Margen tras el primer request exitoso: el refresh fresco va en paralelo y puede tardar un poco más en
// delatar que el servidor está caído.
const FIRST_RESULT_GRACE_MS = 2000;

// Desfase aleatorio del refetch de reconexión: todos los clientes del campus vuelven a la vez.
const RECONNECT_JITTER_MS = 30_000;

export type FirstRequestResult = "ok" | LoadErrorKind;

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (e: boolean) => void;
  // El panel abierto (buscar / campus / guía / lugar) es state local de cada sidebar, así que para
  // cerrarlo desde afuera —un clic en el mapa— se emite esta señal y cada sidebar reacciona.
  closeSidebar: () => void;
  closeSignal: number;
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
  hiddenPlaceIds: Set<string>;
  togglePlaceHidden: (identifier: string) => void;
  allFeatures: Feature[];
  allEvents: EventFeature[];
  eventPlaces: Feature[];
  routes: RouteFeature[];
  // La ruta elegida vive acá y no en el panel: el panel se desmonta al clickear el mapa y la ruta
  // dibujada tiene que sobrevivir a eso. Solo se apaga volviéndola a tocar en el sidebar.
  selectedRoute: RouteFeature | null;
  setSelectedRoute: (route: RouteFeature | null) => void;
  // Señal para abrir el panel de Rutas desde fuera del sidebar (clic en la línea del mapa).
  openRoutesPanelSignal: number;
  openRoutesPanel: (route?: RouteFeature | null) => void;
  // Ruta cuya ficha debe mostrarse. Se guarda el Feature completo, no un id: el id tendría que volver a
  // resolverse contra `routes` y el que entrega maplibre viene de properties serializadas.
  // Solo lo pone el clic en el mapa: elegir una ruta en la lista la dibuja, pero no abre su ficha.
  routeDetail: RouteFeature | null;
  isDataLoaded: boolean;
  // Solo tiene valor cuando la app se quedó sin datos que mostrar (ni frescos ni de cache).
  loadError: LoadErrorKind | null;
  firstRequestResult: FirstRequestResult | null;
  isRetryingLoad: boolean;
  retryLoad: () => void;
  refetchPlaces: (opts?: { syncMap?: boolean; fresh?: boolean }) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [closeSignal, setCloseSignal] = useState<number>(0);
  const closeSidebar = useCallback(() => setCloseSignal((n) => n + 1), []);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [eventCounts, setEventCounts] = useState<Map<string, number>>(new Map());
  const [eventPlaceIds, setEventPlaceIds] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteFeature | null>(null);
  const [openRoutesPanelSignal, setOpenRoutesPanelSignal] = useState<number>(0);
  const [routeDetail, setRouteDetail] = useState<RouteFeature | null>(null);

  // Elegir una ruta en la lista la dibuja y cierra cualquier ficha abierta.
  const selectRoute = useCallback((route: RouteFeature | null) => {
    setSelectedRoute(route);
    setRouteDetail(null);
  }, []);

  const openRoutesPanel = useCallback((route?: RouteFeature | null) => {
    setRouteDetail(route ?? null);
    setOpenRoutesPanelSignal((n) => n + 1);
  }, []);
  const queryClient = useQueryClient();

  // React Query borra `error` al INICIAR cualquier fetch mientras no haya datos (fetchState en
  // query-core), así que el refetch por foco de ventana hacía desaparecer la pantalla de error al
  // minimizar y volver. El error queda pegado acá hasta que un fetch traiga datos de verdad.
  const [stickyLoadError, setStickyLoadError] = useState<LoadErrorKind | null>(null);
  // Con la pantalla de error arriba no se sigue golpeando la red sola: solo Reintentar o un F5.
  const isLoadBlocked = stickyLoadError !== null;

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
    refetchInterval: isLoadBlocked ? false : isOnline ? REFETCH_ONLINE_MS : REFETCH_OFFLINE_MS,
    refetchIntervalInBackground: REFETCH_IN_BACKGROUND,
    refetchOnReconnect: !isLoadBlocked,
    refetchOnWindowFocus: !isLoadBlocked,
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

  useEffect(() => {
    if (data) return setStickyLoadError(null);
    if (fetchFailure) setStickyLoadError(fetchFailure);
  }, [data, fetchFailure]);

  const loadError: LoadErrorKind | null = data ? null : stickyLoadError;

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
    retry: 1,
    staleTime: REFETCH_ONLINE_MS,
    networkMode: "offlineFirst",
    refetchInterval: isLoadBlocked ? false : isOnline ? REFETCH_ONLINE_MS : REFETCH_OFFLINE_MS,
    refetchIntervalInBackground: REFETCH_IN_BACKGROUND,
    refetchOnReconnect: !isLoadBlocked,
    refetchOnWindowFocus: !isLoadBlocked,
  });

  // Rutas por el MISMO flujo de 3 capas que lugares y eventos, y montadas acá para que se carguen al
  // abrir la app y no recién cuando alguien abre el panel de Rutas.
  const { data: routesData } = useQuery({
    queryKey: ["routes"],
    queryFn: () =>
      fetch("/api/routes").then((r) => r.json()) as Promise<{
        routes: { features: RouteFeature[] };
        message: string;
      }>,
    retry: 1,
    staleTime: REFETCH_ONLINE_MS,
    networkMode: "offlineFirst",
    refetchInterval: isLoadBlocked ? false : isOnline ? REFETCH_ONLINE_MS : REFETCH_OFFLINE_MS,
    refetchIntervalInBackground: REFETCH_IN_BACKGROUND,
    refetchOnReconnect: !isLoadBlocked,
    refetchOnWindowFocus: !isLoadBlocked,
  });

  const routes: RouteFeature[] = useMemo(() => routesData?.routes?.features ?? [], [routesData]);

  // Ruta y filtro de categorías se excluyen: encender una pill limpia la ruta dibujada (el recorrido de
  // `routesPanel` es el simétrico). Va en su propio efecto y no en el efecto central de filtros, que
  // también corre en cada refetch de datos y borraría la ruta sin que el usuario tocara nada.
  useEffect(() => {
    if (activeFilters.length > 0) selectRoute(null);
  }, [activeFilters, selectRoute]);

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

  // Trae datos del servidor saltándose el cache del SW. syncMap=true además fuerza los lugares
  // aprobados al mapa (post-mutación); syncMap=false solo refresca los datos y deja que
  // allFeatures/PillFilter reconstruyan el mapa (carga/reconexión). fresh=true salta además la
  // Capa 1 y lee de la BD: solo para mutaciones y debug, ver optimize_data.md.
  const refetchPlaces = useCallback(
    async (opts?: { syncMap?: boolean; fresh?: boolean }) => {
      const syncMap = opts?.syncMap ?? true;
      const fresh = opts?.fresh ?? true;
      const headerName = fresh ? "X-Ubicate-Fresh" : "X-Ubicate-Revalidate";
      try {
        const freshData = await fetchJsonOrThrow<{
          approved_places: { features: Feature[] };
          new_places: { features: Feature[] };
          message: string;
        }>("/api/ubicate", { headers: { [headerName]: "true" } });
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

  // Se lee dentro de los listeners sin volver a suscribirlos: cambiar las deps del efecto relanzaría
  // el refetch de montaje, que es justo lo que no queremos con la pantalla de error arriba.
  const isLoadBlockedRef = useRef(isLoadBlocked);
  isLoadBlockedRef.current = isLoadBlocked;

  // Al cargar con conexión → buscar enseguida datos frescos del servidor. Al reconectar → volver a
  // pedirlos y restaurar la cadencia online. Al perder conexión → cambiar a polling agresivo (offline).
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const goOnline = () => {
      setIsOnline(true);
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        if (!isLoadBlockedRef.current) refetchPlaces({ syncMap: false, fresh: false });
      }, Math.random() * RECONNECT_JITTER_MS);
    };
    const goOffline = () => setIsOnline(false);

    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) refetchPlaces({ syncMap: false, fresh: false });
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      clearTimeout(reconnectTimer);
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
        closeSidebar,
        closeSignal,
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
        routes,
        selectedRoute,
        setSelectedRoute: selectRoute,
        openRoutesPanelSignal,
        openRoutesPanel,
        routeDetail,
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
