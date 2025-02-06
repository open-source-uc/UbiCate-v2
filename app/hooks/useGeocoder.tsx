import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

import PlacesJSON from "@/utils/places";
import { Feature, PointFeature, PolygonFeature } from "@/utils/types";

const loadGeocoder = () => import("@/utils/getGeocoder");

function useGeocoder(
  ref: React.RefObject<HTMLElement | null>,
  callBackResult: (e: Feature) => void,
): [
  Feature[],
  PointFeature[],
  PolygonFeature[],
  (places: Feature[] | Feature | null) => void,
  (placeIdentifier: string | null) => Feature | undefined,
] {
  const [findPlaces, setFindPlaces] = useState<Feature[]>([]);
  const geocoder = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();
      if (!mounted) return;

      geocoder.current = getGeocoder(
        PlacesJSON,
        (result: { result: Feature }) => {
          setFindPlaces([result.result]);
          callBackResult(result.result);
        },
        (results: { features: Feature[] | null | undefined; config: any }) => {
          if (!mounted) return;
          setFindPlaces(results.features ?? []);
        },
        () => setFindPlaces([]),
      );
      if (ref.current) geocoder.current?.addTo(ref.current);
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPlaces = (e: Feature[] | Feature | null) => {
    if (Array.isArray(e)) {
      setFindPlaces(e);
    } else if (e) {
      setFindPlaces([e]);
    } else {
      setFindPlaces([]);
    }
  };

  const findPlace = useCallback((placeIdentifier: string | null): Feature | undefined => {
    if (!placeIdentifier) return undefined;
    const place = PlacesJSON.features.find((e) => e.properties.identifier === placeIdentifier);
    return place;
  }, []);

  const Points = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Point"), [findPlaces]);
  const Polygons = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Polygon"), [findPlaces]);

  return [findPlaces, Points as PointFeature[], Polygons as PolygonFeature[], setPlaces, findPlace];
}

export default useGeocoder;
