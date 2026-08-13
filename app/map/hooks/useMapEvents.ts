import { use, useCallback, useEffect, useRef, useState } from "react";

import { centroid } from "@turf/centroid";
import type { MapEvent, MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";

import { useAppLoading } from "@/app/context/appLoadingCtx";
import { useMapPicking } from "@/app/context/mapPickingCtx";
import { pinsContext } from "@/app/context/pinsCtx";
import { useSidebar } from "@/app/context/sidebarCtx";
import { usePlaceSelectedListener } from "@/app/hooks/usePlaceSelectedListener";
import { useTimeoutManager } from "@/app/hooks/useTimeoutManager";
import {
  getCampusBoundsFromName,
  getCampusNameFromPoint,
  getMaxCampusBoundsFromName,
  getMaxCampusBoundsFromPoint,
} from "@/lib/campus/getCampusBounds";
import type { FlyToEvent } from "@/lib/events/customEvents";
import { normalizeFeature } from "@/lib/map/getLayerMap";
import { Feature, CATEGORIES } from "@/lib/types";

interface UseMapEventsProps {
  mapRef: React.RefObject<MapRef | null>;
  paramPlace?: Feature | null;
  paramLng?: number | null;
  paramLat?: number | null;
}

export interface HandlePlaceSelectionOptions {
  openSidebar?: boolean;
  flyMode: "always" | "ifOutside" | "never";
}

export function useMapEvents({ mapRef, paramPlace, paramLng, paramLat }: UseMapEventsProps) {
  const { setPlaces, setSelectedPlace, setIsOpen, selectedPlace, closeSidebar } = useSidebar();
  const [isLoaded, setIsLoaded] = useState(false);
  const { create, cancel } = useTimeoutManager();
  const { addPin, addPinToNearestEnd, insertPin, clearPins, setPinsFromCoords, pins } = use(pinsContext);
  const { isPicking, mode, setPicking, isForEvent, isForRoute, isViewOnly, isPlaceFormOpen, hasPendingProposal } =
    useMapPicking();
  const { setMapLoaded } = useAppLoading();

  const isForEventRef = useRef(isForEvent);
  const isForRouteRef = useRef(isForRoute);
  const isPickingRef = useRef(isPicking);
  useEffect(() => {
    isForEventRef.current = isForEvent;
    isForRouteRef.current = isForRoute;
    isPickingRef.current = isPicking;
  }, [isForEvent, isForRoute, isPicking]);

  const handlePlaceSelection = useCallback(
    (place: Feature | null, options: HandlePlaceSelectionOptions) => {
      setSelectedPlace(place);
      const title = document.querySelector("title");
      if (!place) {
        window.history.replaceState(null, "", "?");
        if (title) {
          title.textContent = "Ubicate UC - Mapa";
        }
        setIsOpen(false);
        return;
      }

      localStorage.setItem("defaultCampus", place.properties.campus);

      if (title) {
        title.textContent = place ? `${place.properties.name}` : "Ubicate UC - Mapa";
      }

      if (place.properties.categories.includes(CATEGORIES.CUSTOM_MARK)) {
        window.history.replaceState(
          null,
          "",
          `?lng=${place.geometry.coordinates[0]}&lat=${place.geometry.coordinates[1]}`,
        );
      } else {
        window.history.replaceState(null, "", `?place=${place.properties.identifier}`);
      }

      let center: [number, number] = [0, 0];

      if (place.geometry.type === "Polygon") {
        center = centroid(place.geometry).geometry.coordinates as unknown as [number, number];
      }

      if (place.geometry.type === "Point")
        center = [place.geometry.coordinates[0], place.geometry.coordinates[1]] as unknown as [number, number];

      const [lng, lat] = center;
      const map = mapRef.current?.getMap();
      map?.setMaxBounds(undefined);
      setTimeout(() => {
        map?.setMaxBounds(getMaxCampusBoundsFromPoint(lng, lat));
      }, 600);

      const flyMode = options?.flyMode || "always";
      if (flyMode === "never") {
        return;
      }

      if (flyMode === "ifOutside") {
        const bounds = map?.getBounds();
        const margin = 0.001;

        if (!map || !bounds) return;

        const isOutside = !(
          lng >= bounds.getWest() + margin &&
          lng <= bounds.getEast() - margin &&
          lat >= bounds.getSouth() + margin &&
          lat <= bounds.getNorth() - margin
        );

        if (isOutside) {
          const mapHeight = bounds.getNorth() - bounds.getSouth();
          const offset = mapHeight * 0.25;

          map.flyTo({
            center: [lng, lat - offset],
            essential: true,
            duration: 400,
          });
        }
      } else {
        // flyMode === 'always' - siempre hacer fly con zoom
        map?.flyTo({
          essential: true,
          duration: 400,
          zoom: 17,
          center: [lng, lat],
          offset: [0, -20],
        });
      }
    },
    [setSelectedPlace, setIsOpen, mapRef],
  );

  // Con una propuesta en curso la selección queda congelada y solo la x del sidebar la descarta:
  // cambiar de lugar seleccionado desmonta el menú/formulario y se pierde el trabajo.
  const selectionLocked = !isPicking && hasPendingProposal;

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (isPicking) {
        if (isViewOnly) return;
        if (mode === "point") {
          // Reubicar es UN paso de historial: con clearPins() + addPin() el usuario tenía que deshacer
          // dos veces (el punto nuevo y el borrado del anterior) para ver un solo cambio en pantalla.
          setPinsFromCoords([[e.lngLat.lng, e.lngLat.lat]]);
        } else if (mode === "line") {
          // Se engancha al extremo más cercano al clic, no siempre al final: editando una ruta ya hecha,
          // un clic al principio del recorrido lo estiraba desde el otro extremo. `insertPin` tampoco
          // sirve: busca la arista más cercana cerrando el anillo y reordena los vértices.
          addPinToNearestEnd(e.lngLat.lng, e.lngLat.lat);
        } else {
          insertPin(e.lngLat.lng, e.lngLat.lat);
        }
        return;
      }

      // Con el formulario de ruta abierto el mapa no toca la geometría: más abajo un clic en vacío
      // programa clearPins() y borraría la ruta dibujada.
      if (isForRoute) return;

      if (selectionLocked) return;

      if (!e.features || e.features.length === 0) {
        create(
          "deletePins",
          () => {
            clearPins();
          },
          400,
        );
        // Cierra cualquier panel abierto (buscar, campus, guía, lugar). Con una propuesta en curso no
        // se llega hasta acá: `selectionLocked` retorna antes para no perder el trabajo del formulario.
        closeSidebar();
        handlePlaceSelection(null, { openSidebar: false, flyMode: "never" });
        return;
      }

      cancel("deletePins");

      const pointFeature =
        e.features.find((f) => f.geometry.type === "Point" && !("startDate" in f.properties)) ??
        e.features.find((f) => f.geometry.type === "Point");
      if (pointFeature) {
        const feature = normalizeFeature(pointFeature);
        if (!feature) return;
        handlePlaceSelection(feature, { openSidebar: true, flyMode: "ifOutside" });
        return;
      }

      const polygonFeature = e.features.find((f) => f.geometry.type === "Polygon");
      if (!polygonFeature) return;

      const feature = normalizeFeature(polygonFeature);
      if (!feature) return;
      handlePlaceSelection(feature, { openSidebar: true, flyMode: "ifOutside" });
    },
    [
      isPicking,
      isViewOnly,
      isForRoute,
      selectionLocked,
      mode,
      addPinToNearestEnd,
      insertPin,
      setPinsFromCoords,
      create,
      cancel,
      clearPins,
      closeSidebar,
      handlePlaceSelection,
    ],
  );

  usePlaceSelectedListener((feature) => {
    if (!feature) return;
    handlePlaceSelection(feature, { openSidebar: true, flyMode: "always" });
  });

  useEffect(() => {
    const handleFlyTo = (e: Event) => {
      const { lng, lat, zoom } = (e as FlyToEvent).detail;
      const map = mapRef.current?.getMap();
      if (!map) return;
      map.setMaxBounds(undefined);
      map.flyTo({ center: [lng, lat], zoom: zoom ?? 17, essential: true, duration: 600 });
    };
    document.addEventListener("mapFlyTo", handleFlyTo as EventListener);
    return () => document.removeEventListener("mapFlyTo", handleFlyTo as EventListener);
  }, [mapRef]);

  const handleMapLoad = useCallback(
    async (e: MapEvent) => {
      e.target.doubleClickZoom.disable();
      mapRef.current?.getMap().setMinZoom(15);
      const map = mapRef.current?.getMap();

      if (paramPlace) {
        map?.setMaxBounds(getMaxCampusBoundsFromName(paramPlace.properties.campus));
        setPlaces([paramPlace]);
        handlePlaceSelection(paramPlace, { openSidebar: true, flyMode: "always" });
        localStorage.setItem("defaultCampus", paramPlace.properties.campus);
      } else if (paramLng && paramLat) {
        localStorage.setItem("defaultCampus", getCampusNameFromPoint(paramLng, paramLat) ?? "SanJoaquin");
        map?.setMaxBounds(getMaxCampusBoundsFromPoint(paramLng, paramLat));
        handlePlaceSelection(addPin(parseFloat("" + paramLng), parseFloat("" + paramLat)), {
          openSidebar: true,
          flyMode: "always",
        });
      } else {
        const defaultCampus = localStorage.getItem("defaultCampus") ?? "SanJoaquin";
        map?.setMaxBounds(getMaxCampusBoundsFromName(defaultCampus));
        map?.fitBounds(getCampusBoundsFromName(defaultCampus), {
          duration: 0,
          zoom:
            defaultCampus === "SJ" || defaultCampus === "SanJoaquin"
              ? 15.5
              : defaultCampus === "VR" || defaultCampus === "Villarrica"
                ? 14
                : 17,
        });
      }

      const enterPicking = () => {
        cancel("deletePins");
        // Sin el chequeo de ruta, un doble clic con el formulario de ruta abierto entra en modo punto
        // y destruye la línea dibujada.
        if (!isForEventRef.current && !isForRouteRef.current && !isPickingRef.current) {
          setPicking(true, "point");
        }
      };

      e.target.on("dblclick", enterPicking);

      // En táctil no se puede confiar en `dblclick` (el navegador se lo come con el doble tap para
      // zoom), así que el doble tap se detecta a mano: dos toques de UN dedo, seguidos y en el mismo
      // punto. Los gestos de dos dedos (zoom/rotar) no cuentan.
      let lastTapAt = 0;
      let lastTapPoint: { x: number; y: number } | null = null;
      e.target.on("touchend", (ev) => {
        const touch = ev.originalEvent.changedTouches?.[0];
        if (!touch || ev.originalEvent.touches.length > 0) return;

        const now = Date.now();
        const point = { x: touch.clientX, y: touch.clientY };
        const isDoubleTap =
          lastTapPoint !== null &&
          now - lastTapAt < 300 &&
          Math.hypot(point.x - lastTapPoint.x, point.y - lastTapPoint.y) < 30;

        if (!isDoubleTap) {
          lastTapAt = now;
          lastTapPoint = point;
          return;
        }

        lastTapAt = 0;
        lastTapPoint = null;
        enterPicking();
      });

      // Nota: el manejo de clics (puntos con prioridad sobre polígonos, y capas de debug) se hace
      // en handleMapClick vía e.features de los interactiveLayerIds del mapa, no con listeners por capa.
      setIsLoaded(true);
      setMapLoaded();
    },
    [mapRef, paramPlace, paramLng, paramLat, setPlaces, handlePlaceSelection, addPin, cancel, setPicking, setMapLoaded],
  );

  // Con el formulario abierto manda el formulario: mover/rehacer la geometría no debe cambiar el lugar
  // seleccionado (cambiarlo desmonta el formulario y se pierde lo escrito).
  useEffect(() => {
    // isForRoute: al confirmar la ruta esto seleccionaría el último vértice (un CUSTOM_MARK) y el
    // sidebar saltaría a la ficha del lugar, tapando el formulario de la ruta.
    if (isPicking || isPlaceFormOpen || isForRoute) return;
    let config: HandlePlaceSelectionOptions;
    if (pins.length === 1) {
      config = { openSidebar: true, flyMode: "always" };
    } else {
      config = { openSidebar: false, flyMode: "never" };
    }
    if (pins.length > 0) {
      handlePlaceSelection(pins[pins.length - 1] ?? null, config);
    }
    // Depende SOLO de pins y de las tres guardas. Agregar `handlePlaceSelection` lo relanzaría cuando cambia
    // su identidad y volvería a seleccionar el último vértice, tapando el formulario. Ver CLAUDE.md.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, isPicking, isPlaceFormOpen, isForRoute]);

  return {
    handlePlaceSelection,
    handleMapClick,
    handleMapLoad,
    isLoaded,
    selectionLocked,
  };
}
