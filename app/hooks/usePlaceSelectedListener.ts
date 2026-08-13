import { useEffect, useEffectEvent } from "react";

import { PlaceSelectedEvent } from "@/lib/events/customEvents";
import { Feature } from "@/lib/types";

// `useEffectEvent` (React 19.2) reemplaza al `useCallback` con array de dependencias dinámico que
// había antes: el listener se suscribe una sola vez y siempre llama al callback más reciente, sin
// desuscribirse y volver a suscribirse en cada render del que lo usa.
export const usePlaceSelectedListener = (callback: (feature: Feature) => void) => {
  const onPlaceSelected = useEffectEvent(callback);

  useEffect(() => {
    const handlePlaceSelected = (event: PlaceSelectedEvent) => {
      onPlaceSelected(event.detail.feature);
    };

    document.addEventListener("placeSelected", handlePlaceSelected as EventListener);

    return () => {
      document.removeEventListener("placeSelected", handlePlaceSelected as EventListener);
    };
  }, []);
};
