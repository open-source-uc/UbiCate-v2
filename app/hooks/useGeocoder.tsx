import React, { useState, useRef, useEffect } from "react";

import PlacesJSON from "@/utils/places";
import { Feature } from "@/utils/types";

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
        (result: { result: Feature }) => {
          setGeocoderPlaces([result.result]);
          callBackResult(result.result);
        },
        (results: { features: Feature[] | null | undefined; config: any }) => {
          if (!mounted) return;
          setGeocoderPlaces(results.features ?? []);
        },
        () => setGeocoderPlaces([]),
      );

      ref?.current?.appendChild(geocoder.current.onAdd());
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPlaces = (e: Feature[] | Feature | null) => {
    if (Array.isArray(e)) {
      setGeocoderPlaces(e);
    } else if (e) {
      setGeocoderPlaces([e]);
    } else {
      setGeocoderPlaces([]);
    }
  };

  return [geocoderPlaces, setPlaces];
}

export default useGeocoder;
