// This file provides backwards compatibility and safe fallbacks
// Use the context instead: import { useUbication } from "@/app/context/ubicationCtx"

import { useUbication as useUbicationContext } from "@/app/context/ubicationCtx";

export function useUbication(initialTracking?: boolean) {
  try {
    const context = useUbicationContext();

    // Si se especifica initialTracking y no está ya trackeando, activar
    if (initialTracking && !context.isTracking) {
      context.setTracking(true);
    }

    return context;
  } catch (error) {
    // Fallback cuando el contexto no está disponible
    console.warn("UbicationProvider not found, returning fallback values");
    return {
      position: null,
      alpha: null,
      cardinal: null,
      isCalibrated: false,
      hasLocation: false,
      error: "UbicationProvider no encontrado",
      calibrateCompass: () => {
        console.warn("calibrateCompass called but UbicationProvider is not available");
      },
      setTracking: (_tracking: boolean) => {
        console.warn("setTracking called but UbicationProvider is not available");
      },
      isTracking: false,
      requestLocation: async () => {
        console.warn("requestLocation called but UbicationProvider is not available");
      },
    };
  }
}
