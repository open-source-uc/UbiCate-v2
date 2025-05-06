import { useState, useEffect } from "react";

import { CATEGORIES, PointGeometry, Properties } from "@/utils/types";

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

type Subscriber = (data: LocationOrientationData) => void;

const subscribers = new Set<Subscriber>();
let currentData: LocationOrientationData = { position: null, alpha: 0, cardinal: "N" };
let watchId: number | null = null;

function calculateCardinal(angle: number, points: CardinalPoints): string {
  const divisions = points;
  const sector = 360 / divisions;
  const halfSector = sector / 2;
  let index = Math.floor((angle + halfSector) / sector) % divisions;
  const labels4 = ["N", "E", "S", "W"];
  const labels8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return divisions === 8 ? labels8[index] : labels4[index];
}

// Handle location position updates
function handlePositionUpdate({ coords }: GeolocationPosition) {
  currentData = {
    ...currentData,
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
        needApproval: false,
      },
      geometry: { type: "Point", coordinates: [coords.longitude, coords.latitude] },
    },
  };
  notifySubscribers();
}

// Handle location error
function handlePositionError(error: GeolocationPositionError) {
  console.error("Error getting location:", error.message);
}

// Handle device orientation events
function handleOrientation(event: DeviceOrientationEvent) {
  if (event.alpha == null) return;
  currentData = {
    ...currentData,
    alpha: event.alpha,
    cardinal: calculateCardinal(event.alpha, serviceOptions.cardinalPoints!),
  };
  notifySubscribers();
}

// Keep track of options for the running service
let serviceOptions: Options = {
  cardinalPoints: 4,
  maximumAge: 0,
  enableHighAccuracy: true,
  timeout: 5000,
};

// Notify all hooked components
function notifySubscribers() {
  subscribers.forEach((cb) => cb(currentData));
}

// Start the shared service (only one watcher and orientation listener)
function startService(options: Options = {}) {
  if (watchId) return;
  serviceOptions = { ...serviceOptions, ...options };

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: serviceOptions.enableHighAccuracy,
      maximumAge: serviceOptions.maximumAge,
      timeout: serviceOptions.timeout,
    });
  }

  window.addEventListener("deviceorientation", handleOrientation);
}

// Stop the shared service when no subscribers remain
function stopService() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  window.removeEventListener("deviceorientation", handleOrientation);
}

/**
 * Subscribe to shared user location & orientation updates
 * @returns unsubscribe function
 */
function subscribeUserLocation(callback: Subscriber, options: Options = {}): () => void {
  subscribers.add(callback);
  if (subscribers.size === 1) startService(options);

  // Emit current state immediately
  callback(currentData);

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) stopService();
  };
}

export function useUbication(): LocationOrientationData {
  const [data, setData] = useState<LocationOrientationData>(currentData);

  useEffect(() => {
    const unsubscribe = subscribeUserLocation(setData, {
      cardinalPoints: 8,
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    });
    return unsubscribe;
  }, []);

  return data;
}
