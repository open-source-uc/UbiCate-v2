import React, { useState, useRef, useEffect } from "react";

import PlacesJSON from "@/utils/places";
import { Feature } from "@/utils/types";

import { handleResult, handleResults, handleClear } from "./placeHandlers";
const loadGeocoder = () => import("@/utils/getGeocoder");

function useGeocoder(
  ref: React.RefObject<any> | null,
  callBackResult: (e: Feature) => void,
): [Feature[], (places: Feature[]) => void] {
  const [geocoderPlaces, setGeocoderPlaces] = useState<Feature[]>([]);
  const geocoder = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();
      if (!mounted) return;

      geocoder.current = getGeocoder(
        PlacesJSON,
        (result: any) => {
          handleResult(result, setGeocoderPlaces, PlacesJSON, callBackResult);
        },
        (results: any) => mounted && handleResults(results, setGeocoderPlaces, PlacesJSON),
        () => handleClear(setGeocoderPlaces),
      );

      ref?.current?.appendChild(geocoder.current.onAdd());
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [geocoderPlaces, setGeocoderPlaces];
}

export default useGeocoder;
