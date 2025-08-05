import { useCallback, useEffect } from "react";

import { PlaceSelectedEvent } from "@/utils/customEvents";
import { Feature } from "@/utils/types";

export const usePlaceSelectedListener = (callback: (feature: Feature) => void, dependencies: any[] = []) => {
  const memoizedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    const handlePlaceSelected = (event: PlaceSelectedEvent) => {
      memoizedCallback(event.detail.feature);
    };

    document.addEventListener("placeSelected", handlePlaceSelected as EventListener);

    return () => {
      document.removeEventListener("placeSelected", handlePlaceSelected as EventListener);
    };
  }, [memoizedCallback]);
};
