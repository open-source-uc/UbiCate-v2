import { useRouter } from "next/navigation";

import React, { useState, useRef, useEffect, useMemo, RefObject, useCallback } from "react";

import PlacesJSON from "@/utils/places";
import { Feature, PointFeature, PolygonFeature } from "@/utils/types";

const loadGeocoder = () => import("@/utils/getGeocoder");

function useGeocoder(
  ref: React.RefObject<HTMLElement | null> | null,
  refFunctionClickOnResult: RefObject<((e: Feature) => void) | null>,
): [
  Feature[],
  PointFeature[],
  PolygonFeature[],
  (places: Feature[] | Feature | null) => void,
  React.RefObject<MapboxGeocoder | null>,
] {
  const [findPlaces, setFindPlaces] = useState<Feature[]>([]);
  const geocoder = useRef<MapboxGeocoder | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();
      if (!mounted) return;

      geocoder.current = getGeocoder(
        PlacesJSON,
        (result: { result: Feature }) => {
          setFindPlaces([result.result]);
          if (refFunctionClickOnResult.current === null) {
            router.push("/map?place=" + result.result.properties.identifier);
          } else {
            refFunctionClickOnResult.current(result.result);
          }
        },
        (results: { features: Feature[] | null | undefined; config: any }) => {
          if (!mounted) return;
          setFindPlaces(results.features ?? []);
        },
        () => setFindPlaces([]),
      );
      if (ref?.current) geocoder.current.addTo(ref.current);
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const Points = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Point"), [findPlaces]);
  const Polygons = useMemo(() => findPlaces.filter((e) => e.geometry.type === "Polygon"), [findPlaces]);

  return [findPlaces, Points as PointFeature[], Polygons as PolygonFeature[], setPlaces, geocoder];
}

export default useGeocoder;
