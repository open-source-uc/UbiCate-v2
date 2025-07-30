import { useState, useMemo, useCallback } from "react";

import { Feature, PointFeature, PolygonFeature } from "@/utils/types";

/*
Este hook solo se usa sidebarCtx 
*/
export default function usePlaces(): {
  findPlaces: Feature[];
  points: PointFeature[];
  polygons: PolygonFeature[];
  setPlaces: (places: Feature[] | Feature | null) => void;
  selectedPlace: Feature | null;
  setSelectedPlace: (place: Feature | null) => void;
  PointsName: PointFeature[];
} {
  const [findPlaces, setFindPlaces] = useState<Feature[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Feature | null>(null);

  const setPlaces = useCallback(
    (e: Feature[] | Feature | null) => {
      if (Array.isArray(e)) {
        setFindPlaces(e);
      } else if (e) {
        setFindPlaces([e]);
      } else {
        setFindPlaces([]);
      }
    },
    [setFindPlaces],
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

          const updatedE = {
            ...e,
            properties: {
              ...e.properties,
              name:
                e.properties.floors?.length === 1 && e.properties.floors[0] === 1
                  ? e.properties.name
                  : `${e.properties.name}\n ${pisoTexto}: ${str}`,
            },
          };

          return updatedE;
        }),
    [findPlaces],
  );

  const Polygons = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Polygon"), [findPlaces]);
  const Points = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Point"), [findPlaces]);

  return {
    findPlaces,
    points: Points as PointFeature[],
    polygons: Polygons as PolygonFeature[],
    setPlaces,
    selectedPlace,
    setSelectedPlace,
    PointsName: PointsName as PointFeature[],
  };
}
