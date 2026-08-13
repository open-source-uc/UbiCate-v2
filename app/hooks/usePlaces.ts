import { useState, useMemo, useCallback } from "react";

import { Feature, PointFeature, PolygonFeature } from "@/lib/types";

/*
Este hook solo se usa sidebarCtx 
*/
export default function usePlaces(eventCounts: Map<string, number> = new Map()): {
  findPlaces: Feature[];
  points: PointFeature[];
  polygons: PolygonFeature[];
  setPlaces: (places: Feature[] | Feature | null) => void;
  selectedPlace: Feature | null;
  setSelectedPlace: (place: Feature | null) => void;
  // Última selección no nula. Los sidebars la usan para seguir mostrando la ficha mientras se crea un
  // punto, aunque algo deseleccione el lugar.
  lastSelectedPlace: Feature | null;
  PointsName: PointFeature[];
  hiddenPlaceIds: Set<string>;
  togglePlaceHidden: (identifier: string) => void;
} {
  const [allFindPlaces, setAllFindPlaces] = useState<Feature[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Feature | null>(null);
  // Se actualiza en la misma transición que `selectedPlace`, dentro del handler. Antes cada sidebar la
  // recordaba con una ref escrita en un efecto y leída durante el render, que es impuro: guardarla
  // acá, junto al estado que refleja, deja a los sidebars derivando sin memoria propia.
  const [lastSelectedPlace, setLastSelectedPlace] = useState<Feature | null>(null);

  const selectPlace = useCallback((place: Feature | null) => {
    setSelectedPlace(place);
    if (place !== null) setLastSelectedPlace(place);
  }, []);
  // Ocultar es solo para la sesión: no se persiste, al recargar vuelven a aparecer
  const [hiddenPlaceIds, setHiddenPlaceIds] = useState<Set<string>>(new Set());

  const togglePlaceHidden = useCallback((identifier: string) => {
    if (!identifier) return;
    setHiddenPlaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(identifier)) {
        next.delete(identifier);
      } else {
        next.add(identifier);
      }
      return next;
    });
  }, []);

  const setPlaces = useCallback(
    (e: Feature[] | Feature | null) => {
      if (Array.isArray(e)) {
        setAllFindPlaces(e);
      } else if (e) {
        setAllFindPlaces([e]);
      } else {
        setAllFindPlaces([]);
      }
    },
    [setAllFindPlaces],
  );

  const findPlaces = useMemo(
    () => allFindPlaces.filter((e) => !hiddenPlaceIds.has(e.properties.identifier)),
    [allFindPlaces, hiddenPlaceIds],
  );

  const PointsName = useMemo(
    () =>
      findPlaces
        .filter((e) => e.geometry.type === "Point")
        .map((e) => {
          const formatter = new Intl.ListFormat("es", { style: "long", type: "conjunction" });
          const safeArray = e.properties.floors ? e.properties.floors.map(String) : [];
          const str = formatter.format(safeArray);

          const pisoTexto = safeArray.length === 1 ? "Piso" : "Pisos";

          const hasDisplayName = !!(e as any).properties.displayName;
          let name =
            hasDisplayName || (e.properties.floors?.length === 1 && e.properties.floors[0] === 1)
              ? e.properties.name
              : `${e.properties.name}\n ${pisoTexto}: ${str}`;

          const eventCount = eventCounts.get(e.properties.identifier);
          if (eventCount && eventCount > 1) {
            name = `${name}\n ${eventCount} eventos`;
          }

          const updatedE = {
            ...e,
            properties: {
              ...e.properties,
              name,
            },
          };

          return updatedE;
        }),
    [findPlaces, eventCounts],
  );

  const Polygons = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Polygon"), [findPlaces]);
  const Points = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Point"), [findPlaces]);

  return {
    findPlaces,
    points: Points as PointFeature[],
    polygons: Polygons as PolygonFeature[],
    setPlaces,
    selectedPlace,
    setSelectedPlace: selectPlace,
    lastSelectedPlace,
    PointsName: PointsName as PointFeature[],
    hiddenPlaceIds,
    togglePlaceHidden,
  };
}
