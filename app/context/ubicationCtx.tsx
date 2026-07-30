"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

import { CATEGORIES, PointGeometry, Properties } from "@/lib/types";

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
  /** Rumbo del dispositivo en grados: 0 = norte, sentido horario. */
  heading: number | null;
  cardinal: string | null;
  hasCompass: boolean;
  hasLocation: boolean;
  error: string | null;
}

interface UbicationContextType extends LocationOrientationData {
  setTracking: (enabled: boolean) => void;
  isTracking: boolean;
  requestLocation: () => Promise<void>;
  /** En iOS DEBE llamarse desde un gesto del usuario. */
  requestOrientation: () => Promise<boolean>;
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

const HEADING_UPDATE_THRESHOLD_DEG = 1.5;
const LOW_ACCURACY_TIMEOUT_MS = 30000;

function angleDelta(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Rumbo de brújula: 0 = norte, horario. iOS entrega `webkitCompassHeading` ya en ese formato; el resto
// entrega `alpha`, que es antihorario.
function readCompassHeading(event: DeviceOrientationEvent): number | null {
  const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  if (typeof webkitHeading === "number" && !Number.isNaN(webkitHeading)) return normalizeAngle(webkitHeading);

  if (event.alpha == null) return null;
  return normalizeAngle(360 - event.alpha);
}

// En Chrome/Android `deviceorientation` no es absoluto: su alpha parte de un origen arbitrario.
function getOrientationEventName(): "deviceorientationabsolute" | "deviceorientation" {
  return "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
}

function getCurrentPosition(positionOptions: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, positionOptions));
}

function needsOrientationPermission(): boolean {
  return (
    typeof window !== "undefined" &&
    "DeviceOrientationEvent" in window &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === "function"
  );
}

export function UbicationProvider({ children, options = defaultOptions }: UbicationProviderProps) {
  const [position, setPosition] = useState<{
    type: string;
    properties: Properties;
    geometry: PointGeometry;
  } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [hasCompass, setHasCompass] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const orientationActive = useRef(false);
  const [isTracking, setIsTracking] = useState(false);

  const isGeolocationAvailable = useCallback(() => {
    return (
      typeof navigator !== "undefined" &&
      navigator.geolocation &&
      typeof navigator.geolocation.watchPosition === "function"
    );
  }, []);

  // Handle location position updates
  const handlePositionUpdate = useCallback(({ coords }: GeolocationPosition) => {
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
        errorMessage = "Debes activar la geolocalización";
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

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const next = readCompassHeading(event);
    if (next === null) return;

    setHasCompass(true);
    setHeading((prev) => (prev !== null && angleDelta(prev, next) < HEADING_UPDATE_THRESHOLD_DEG ? prev : next));
  }, []);

  // Sin brújula la app sigue siendo usable (el marcador no gira), así que un rechazo no se trata como error.
  const requestOrientationPermission = useCallback(async (): Promise<boolean> => {
    if (!needsOrientationPermission()) return true;

    try {
      const requestPermission = (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission;
      return (await requestPermission()) === "granted";
    } catch (err) {
      console.warn("No se pudo obtener permiso de orientación:", err);
      return false;
    }
  }, []);

  const requestOrientation = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return false;
    if (orientationActive.current) return true;

    const granted = await requestOrientationPermission();
    if (!granted) return false;

    window.addEventListener(getOrientationEventName(), handleOrientation);
    orientationActive.current = true;
    return true;
  }, [handleOrientation, requestOrientationPermission]);

  const stopOrientationListener = useCallback(() => {
    if (!orientationActive.current || typeof window === "undefined") return;

    window.removeEventListener(getOrientationEventName(), handleOrientation);
    orientationActive.current = false;
  }, [handleOrientation]);

  // Función para solicitar ubicación una sola vez
  const requestLocation = useCallback(async () => {
    if (!isGeolocationAvailable()) {
      setError("Geolocalización no disponible");
      return;
    }

    // iOS rechaza la geolocalización en orígenes no seguros SIN mostrar el diálogo de permiso.
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("La ubicación necesita una conexión segura (HTTPS)");
      return;
    }

    setError(null);

    try {
      handlePositionUpdate(
        await getCurrentPosition({
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: options.timeout ?? defaultOptions.timeout,
        }),
      );
    } catch (err) {
      const geoError = err as GeolocationPositionError;

      // iOS suele agotar el tiempo con alta precisión bajo techo: reintento con precisión baja.
      if (geoError.code === geoError.TIMEOUT || geoError.code === geoError.POSITION_UNAVAILABLE) {
        try {
          handlePositionUpdate(
            await getCurrentPosition({
              enableHighAccuracy: false,
              maximumAge: options.maximumAge,
              timeout: LOW_ACCURACY_TIMEOUT_MS,
            }),
          );
          return;
        } catch (fallbackError) {
          handlePositionError(fallbackError as GeolocationPositionError);
          throw fallbackError;
        }
      }

      handlePositionError(geoError);
      throw geoError;
    }
  }, [isGeolocationAvailable, handlePositionUpdate, handlePositionError, options]);

  const startTracking = useCallback(() => {
    // `watchId` puede ser 0 (es un id válido): comparar contra null, no por truthiness.
    if (watchId !== null || !isGeolocationAvailable()) {
      console.warn("Already tracking or geolocation not available");
      return;
    }

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

  // Donde no hace falta permiso (Android, escritorio) se engancha solo; en iOS lo hace el botón.
  useEffect(() => {
    if (!needsOrientationPermission()) requestOrientation();

    return () => {
      stopOrientationListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const cardinal = heading !== null ? calculateCardinal(heading, options.cardinalPoints || 8) : null;

  const value: UbicationContextType = {
    position,
    heading,
    cardinal,
    hasCompass,
    hasLocation,
    error,
    setTracking,
    isTracking,
    requestLocation,
    requestOrientation,
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
      heading: null,
      cardinal: null,
      hasCompass: false,
      hasLocation: false,
      error: null,
      setTracking: () => {},
      isTracking: false,
      requestLocation: async () => {},
      requestOrientation: async () => false,
    };
  }

  return context;
}
