import React, { useState, useRef, useEffect, useMemo, RefObject, useCallback } from "react";

import PlacesJSON from "@/utils/places";
import { Feature, PointFeature, PolygonFeature } from "@/utils/types";

const loadGeocoder = () => import("@/utils/getGeocoder");

function useGeocoder(
  ref: React.RefObject<HTMLElement | null> | null,
): [
  Feature[],
  PointFeature[],
  PolygonFeature[],
  (places: Feature[] | Feature | null) => void,
  RefObject<MapboxGeocoder | null>,
  Feature | null,
  (place: Feature | null) => void,
  PointFeature[],
] {
  const [findPlaces, setFindPlaces] = useState<Feature[]>([]);
  const geocoder = useRef<MapboxGeocoder | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Feature | null>(null);

  const setPlaces = useCallback((e: Feature[] | Feature | null) => {
    const alwaysVisiblePlaces = PlacesJSON.features.filter((place) => place.properties.always_visible === true);

    if (Array.isArray(e)) {
      const newPlaces = [...alwaysVisiblePlaces, ...e];
      setFindPlaces(newPlaces);
    } else if (e) {
      const newPlaces = [...alwaysVisiblePlaces, e];
      setFindPlaces(newPlaces);
    } else {
      setFindPlaces(alwaysVisiblePlaces);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();
      if (!mounted) return;

      const initialPlaces = PlacesJSON.features.filter((place) => place.properties.always_visible === true);
      setFindPlaces(initialPlaces);

      geocoder.current = getGeocoder(
        PlacesJSON,
        (result: { result: Feature }) => {
          setPlaces([result.result]);
          setSelectedPlace(result.result);
        },
        (results: { features: Feature[] | null | undefined; config: any }) => {
          if (!mounted) return;
          setPlaces(results.features ?? []);
        },
        () => setPlaces(null),
      );
      if (ref?.current) geocoder.current.addTo(ref.current);
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return [
    findPlaces,
    Points as PointFeature[],
    Polygons as PolygonFeature[],
    setPlaces,
    geocoder,
    selectedPlace,
    setSelectedPlace,
    PointsName as PointFeature[],
  ];
}

export default useGeocoder;
