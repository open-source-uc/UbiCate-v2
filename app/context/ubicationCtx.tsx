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
  alpha: number | null;
  cardinal: string | null;
  isCalibrated: boolean;
  hasLocation: boolean;
  error: string | null;
}

interface UbicationContextType extends LocationOrientationData {
  calibrateCompass: () => void;
  setTracking: (enabled: boolean) => void;
  isTracking: boolean;
  requestLocation: () => Promise<void>;
}

const UbicationContext = createContext<UbicationContextType | undefined>(undefined);

interface UbicationProviderProps {
  children: ReactNode;
  options?: Options;
}

const defaultOptions: Options = {
  cardinalPoints: 8,
  enableHighAccuracy: true,
  maximumAge: 60000,
  timeout: 15000,
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

function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

export function UbicationProvider({ children, options = defaultOptions }: UbicationProviderProps) {
  const [position, setPosition] = useState<{
    type: string;
    properties: Properties;
    geometry: PointGeometry;
  } | null>(null);
  const [alpha, setAlpha] = useState<number | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [orientationActive, setOrientationActive] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const isGeolocationAvailable = useCallback(() => {
    return (
      typeof navigator !== "undefined" &&
      navigator.geolocation &&
      typeof navigator.geolocation.watchPosition === "function"
    );
  }, []);

  // Handle location position updates
  const handlePositionUpdate = useCallback(({ coords }: GeolocationPosition) => {
    console.log("Location updated:", coords.latitude, coords.longitude);

    const newPosition = {
      type: "Feature" as const,
      properties: {
        identifier: "user_loc",
        name: "Usuario",
        information: "",
        categories: [CATEGORIES.USER_LOCATION],
        campus: "",
        faculties: [],
        floors: [],
      },
      geometry: {
        type: "Point" as const,
        coordinates: [coords.longitude, coords.latitude] as [number, number],
      },
    };

    setPosition(newPosition);
    setHasLocation(true);
    setError(null);
  }, []);

  // Handle location error
  const handlePositionError = useCallback((positionError: GeolocationPositionError) => {
    console.error("Location error:", positionError);

    let errorMessage = "Error desconocido";
    switch (positionError.code) {
      case positionError.PERMISSION_DENIED:
        errorMessage = "Permisos de ubicación denegados";
        break;
      case positionError.POSITION_UNAVAILABLE:
        errorMessage = "Ubicación no disponible";
        break;
      case positionError.TIMEOUT:
        errorMessage = "Tiempo de espera agotado";
        break;
    }

    setError(errorMessage);
    setHasLocation(false);
  }, []);

  // FIJO: Handle device orientation events - Versión simplificada como la original
  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (event.alpha == null) return;

      let finalAlpha = event.alpha;

      // Solo aplicar calibración si está calibrado
      if (isCalibrated) {
        finalAlpha = normalizeAngle(event.alpha - calibrationOffset);
      } else {
        finalAlpha = normalizeAngle(event.alpha);
      }

      setAlpha(finalAlpha);
    },
    [isCalibrated, calibrationOffset],
  );

  // FIJO: Función para solicitar permisos de orientación
  const requestOrientationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        const granted = permissionState === "granted";
        setPermissionGranted(granted);
        if (!granted) {
          setError("Permisos de orientación denegados");
        }
        return granted;
      } catch (error) {
        console.error("Failed to request orientation permission:", error);
        setError("Error al solicitar permisos de orientación");
        return false;
      }
    }
    // En dispositivos que no requieren permisos explícitos
    setPermissionGranted(true);
    return true;
  }, []);

  // FIJO: Iniciar listener de orientación
  const startOrientationListener = useCallback(async () => {
    if (orientationActive || typeof window === "undefined") return;

    console.log("Starting orientation listener...");

    // Solicitar permisos primero
    const hasPermission = await requestOrientationPermission();
    if (!hasPermission) return;

    // Agregar listener
    window.addEventListener("deviceorientation", handleOrientation);
    setOrientationActive(true);
    setError(null);

    console.log("Orientation listener started successfully");
  }, [orientationActive, handleOrientation, requestOrientationPermission]);

  // FIJO: Detener listener de orientación
  const stopOrientationListener = useCallback(() => {
    if (!orientationActive || typeof window === "undefined") return;

    console.log("Stopping orientation listener...");
    window.removeEventListener("deviceorientation", handleOrientation);
    setOrientationActive(false);
  }, [orientationActive, handleOrientation]);

  // FIJO: Calibrar la brújula - Mucho más simple
  const calibrateCompass = useCallback(() => {
    if (!orientationActive) {
      setError("Orientación no disponible para calibrar");
      return;
    }

    if (alpha === null) {
      setError("No hay datos de orientación disponibles");
      return;
    }

    console.log("Calibrating compass with current alpha:", alpha);

    // Usar el valor actual como offset de calibración
    setCalibrationOffset(alpha);
    setIsCalibrated(true);
    setError(null);

    console.log("Compass calibrated successfully");
  }, [alpha, orientationActive]);

  // Función para solicitar ubicación una sola vez
  const requestLocation = useCallback(async () => {
    if (!isGeolocationAvailable()) {
      setError("Geolocalización no disponible");
      return;
    }

    console.log("Requesting location...");
    setError(null);

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handlePositionUpdate(position);
          resolve();
        },
        (error) => {
          handlePositionError(error);
          reject(error);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          maximumAge: options.maximumAge,
          timeout: options.timeout,
        },
      );
    });
  }, [isGeolocationAvailable, handlePositionUpdate, handlePositionError, options]);

  const startTracking = useCallback(() => {
    if (watchId || !isGeolocationAvailable()) {
      console.warn("Already tracking or geolocation not available");
      return;
    }

    console.log("Starting location tracking...");
    setError(null);

    try {
      const id = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
        enableHighAccuracy: options.enableHighAccuracy,
        maximumAge: options.maximumAge,
        timeout: options.timeout,
      });

      setWatchId(id);
      setIsTracking(true);
    } catch (err) {
      console.error("Failed to start location tracking:", err);
      setError("Error al iniciar seguimiento de ubicación");
    }
  }, [watchId, isGeolocationAvailable, handlePositionUpdate, handlePositionError, options]);

  const stopTracking = useCallback(() => {
    if (watchId !== null && isGeolocationAvailable()) {
      console.log("Stopping location tracking...");
      try {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
        setIsTracking(false);
      } catch (err) {
        console.warn("Failed to clear geolocation watch:", err);
      }
    }
  }, [watchId, isGeolocationAvailable]);

  const setTracking = useCallback(
    (enabled: boolean) => {
      if (enabled && !isTracking) {
        startTracking();
      } else if (!enabled && isTracking) {
        stopTracking();
      }
    },
    [isTracking, startTracking, stopTracking],
  );

  // FIJO: Iniciar orientación automáticamente al montar
  useEffect(() => {
    startOrientationListener();

    return () => {
      stopOrientationListener();
    };
  }, []); // Solo ejecutar una vez al montar

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null && isGeolocationAvailable()) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (err) {
          console.warn("Failed to clear geolocation watch:", err);
        }
      }
    };
  }, [watchId, isGeolocationAvailable]);

  const cardinal = alpha !== null ? calculateCardinal(alpha, options.cardinalPoints || 8) : null;

  const value: UbicationContextType = {
    position,
    alpha,
    cardinal,
    isCalibrated,
    hasLocation,
    error,
    calibrateCompass,
    setTracking,
    isTracking,
    requestLocation,
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
      alpha: null,
      cardinal: null,
      isCalibrated: false,
      hasLocation: false,
      error: null,
      calibrateCompass: () => {},
      setTracking: () => {},
      isTracking: false,
      requestLocation: async () => {},
    };
  }

  return context;
}
