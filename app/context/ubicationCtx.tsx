"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

import { CATEGORIES, PointGeometry, Properties } from "../../utils/types";

type CardinalPoints = 4 | 8;

interface Options {
  cardinalPoints?: CardinalPoints;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
  timeout?: number;
}

interface LocationOrientationData {
  position: {
    type: string;
    properties: Properties;
    geometry: PointGeometry;
  } | null;
  alpha: number;
  cardinal: string;
}

interface UbicationContextType extends LocationOrientationData {
  setTracking: (tracking: boolean) => void;
  isTracking: boolean;
  error: GeolocationPositionError | null;
}

const UbicationContext = createContext<UbicationContextType | undefined>(undefined);

interface UbicationProviderProps {
  children: ReactNode;
  options?: Options;
}

const defaultOptions: Options = {
  cardinalPoints: 8,
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000,
};

function calculateCardinal(angle: number, points: CardinalPoints): string {
  const divisions = points;
  const sector = 360 / divisions;
  const halfSector = sector / 2;
  let index = Math.floor((angle + halfSector) / sector) % divisions;
  const labels4 = ["N", "E", "S", "W"];
  const labels8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return divisions === 8 ? labels8[index] : labels4[index];
}

export function UbicationProvider({ children, options = defaultOptions }: UbicationProviderProps) {
  const [data, setData] = useState<LocationOrientationData>({
    position: null,
    alpha: 0,
    cardinal: "N",
  });
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [orientationListenerActive, setOrientationListenerActive] = useState(false);

  const isGeolocationAvailable = useCallback(() => {
    return (
      typeof navigator !== "undefined" &&
      navigator.geolocation &&
      typeof navigator.geolocation.watchPosition === "function"
    );
  }, []);

  // Handle location position updates
  const handlePositionUpdate = useCallback(({ coords }: GeolocationPosition) => {
    setError(null);
    setData((prev) => ({
      ...prev,
      position: {
        type: "Feature",
        properties: {
          identifier: "user_loc",
          name: "Usuario",
          information: "",
          categories: [CATEGORIES.USER_LOCATION],
          campus: "",
          faculties: [],
          floors: [],
        },
        geometry: { type: "Point", coordinates: [coords.longitude, coords.latitude] },
      },
    }));
  }, []);

  // Handle location error
  const handlePositionError = useCallback((positionError: GeolocationPositionError) => {
    setError(positionError);
    setData((prev) => ({
      ...prev,
      position: {
        type: "Feature",
        properties: {
          identifier: "user_loc",
          name: "Usuario",
          information: "",
          categories: [CATEGORIES.USER_LOCATION],
          campus: "",
          faculties: [],
          floors: [],
        },
        geometry: { type: "Point", coordinates: [0, 0] },
      },
    }));
  }, []);

  // Handle device orientation events
  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (event.alpha == null) return;
      setData((prev) => ({
        ...prev,
        alpha: event.alpha!,
        cardinal: calculateCardinal(event.alpha!, options.cardinalPoints || 8),
      }));
    },
    [options.cardinalPoints],
  );

  // Start location tracking
  const startTracking = useCallback(() => {
    if (watchId || !isGeolocationAvailable()) {
      if (!isGeolocationAvailable()) {
        setError({
          code: 2,
          message: "Geolocation is not available",
        } as GeolocationPositionError);
      }
      return;
    }

    try {
      const id = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
        enableHighAccuracy: options.enableHighAccuracy,
        maximumAge: options.maximumAge,
        timeout: options.timeout,
      });

      setWatchId(id);

      // Add orientation listener if not already active
      if (!orientationListenerActive && typeof window !== "undefined") {
        window.addEventListener("deviceorientation", handleOrientation);
        setOrientationListenerActive(true);
      }
    } catch (err) {
      setError({
        code: 2,
        message: "Failed to start location tracking",
      } as GeolocationPositionError);
    }
  }, [
    watchId,
    isGeolocationAvailable,
    handlePositionUpdate,
    handlePositionError,
    handleOrientation,
    orientationListenerActive,
    options.enableHighAccuracy,
    options.maximumAge,
    options.timeout,
  ]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null && isGeolocationAvailable()) {
      try {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      } catch (err) {
        console.warn("Failed to clear geolocation watch:", err);
        setWatchId(null);
      }
    }

    if (orientationListenerActive && typeof window !== "undefined") {
      try {
        window.removeEventListener("deviceorientation", handleOrientation);
        setOrientationListenerActive(false);
      } catch (err) {
        console.warn("Failed to remove orientation listener:", err);
        setOrientationListenerActive(false);
      }
    }
  }, [watchId, isGeolocationAvailable, orientationListenerActive, handleOrientation]);

  // Set tracking function
  const setTracking = useCallback(
    (tracking: boolean) => {
      setIsTracking(tracking);
      if (tracking) {
        startTracking();
      } else {
        stopTracking();
      }
    },
    [startTracking, stopTracking],
  );

  // Effect to handle tracking state changes
  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isTracking, startTracking, stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const value: UbicationContextType = {
    ...data,
    setTracking,
    isTracking,
    error,
  };

  return <UbicationContext.Provider value={value}>{children}</UbicationContext.Provider>;
}

export function useUbication(): UbicationContextType {
  const context = useContext(UbicationContext);
  if (context === undefined) {
    throw new Error("useUbication must be used within a UbicationProvider");
  }

  if (typeof window === "undefined") {
    console.warn("useUbication should only be used on the client side");
    return {
      position: null,
      alpha: 0,
      cardinal: "N",
      setTracking: () => {},
      isTracking: false,
      error: null,
    };
  }

  return context;
}

export { UbicationContext };
