import { use, useCallback, useEffect, useState } from "react";

import { centroid } from "@turf/centroid";
import type { MapEvent, MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";

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
  const { setPlaces, setSelectedPlace, setIsOpen } = useSidebar();
  const [isLoaded, setIsLoaded] = useState(false);
  const { create, cancel } = useTimeoutManager();
  const { addPin, clearPins, pins } = use(pinsContext);
  const { isPicking, mode, setPicking } = useMapPicking();

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

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (isPicking) {
        if (mode === "polygon" || pins.length >= 1) {
          if (mode === "point" && pins.length >= 1) {
            setPicking(true, "polygon");
          }
          addPin(e.lngLat.lng, e.lngLat.lat);
        } else {
          addPin(e.lngLat.lng, e.lngLat.lat);
        }
        return;
      }

      if (!e.features || e.features.length === 0) {
        create(
          "deletePins",
          () => {
            clearPins();
          },
          400,
        );
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
    [isPicking, mode, pins.length, addPin, setPicking, create, cancel, clearPins, handlePlaceSelection],
  );

  usePlaceSelectedListener((feature) => {
    if (!feature) return;
    handlePlaceSelection(feature, { openSidebar: true, flyMode: "always" });
  });

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

      e.target.on("dblclick", (e: MapLayerMouseEvent) => {
        cancel("deletePins");
        addPin(e.lngLat.lng, e.lngLat.lat);
      });

      // Nota: el manejo de clics (puntos con prioridad sobre polígonos, y capas de debug) se hace
      // en handleMapClick vía e.features de los interactiveLayerIds del mapa, no con listeners por capa.
      setIsLoaded(true);
    },
    [mapRef, paramPlace, paramLng, paramLat, setPlaces, handlePlaceSelection, addPin, cancel],
  );

  useEffect(() => {
    if (isPicking) return;
    let config: HandlePlaceSelectionOptions;
    if (pins.length === 1) {
      config = { openSidebar: true, flyMode: "always" };
    } else {
      config = { openSidebar: false, flyMode: "never" };
    }
    if (pins.length > 0) {
      handlePlaceSelection(pins[pins.length - 1] ?? null, config);
    }
  }, [pins, isPicking]);

  return {
    handlePlaceSelection,
    handleMapClick,
    handleMapLoad,
    isLoaded,
  };
}
