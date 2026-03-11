import { useEffect } from "react";

import { PlaceSelectedEvent } from "@/lib/events/customEvents";
import { Feature } from "@/lib/types";

export const usePlaceSelectedListener = (callback: (feature: Feature) => void) => {
  useEffect(() => {
    const handlePlaceSelected = (event: PlaceSelectedEvent) => {
      callback(event.detail.feature);
    };

    document.addEventListener("placeSelected", handlePlaceSelected as EventListener);

    return () => {
      document.removeEventListener("placeSelected", handlePlaceSelected as EventListener);
    };
  }, [callback]);
};
