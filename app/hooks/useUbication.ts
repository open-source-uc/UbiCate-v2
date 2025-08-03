// This file provides backwards compatibility and safe fallbacks
// Use the context instead: import { useUbication } from "@/app/context/ubicationCtx"

import { useUbication as useUbicationContext } from "@/app/context/ubicationCtx";

export function useUbication(_initialTracking?: boolean) {
  try {
    return useUbicationContext();
  } catch (error) {
    // Fallback when context is not available
    console.warn("UbicationProvider not found, returning fallback values");
    return {
      position: null,
      alpha: 0,
      cardinal: "N" as const,
      setTracking: (_tracking: boolean) => {
        console.warn("setTracking called but UbicationProvider is not available");
      },
      isTracking: false,
      error: null,
    };
  }
}
