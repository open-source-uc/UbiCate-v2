import { useState, useEffect } from "react";

import { PointGeometry, Properties } from "@/utils/types";

export type CardinalPoints = 4 | 8;

export interface Options {
  cardinalPoints?: CardinalPoints;
  updateInterval?: number;
}

export interface LocationOrientationData {
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
let intervalId: ReturnType<typeof setInterval> | null = null;

function calculateCardinal(angle: number, points: CardinalPoints): string {
  const divisions = points;
  const sector = 360 / divisions;
  const halfSector = sector / 2;
  let index = Math.floor((angle + halfSector) / sector) % divisions;
  const labels4 = ["N", "E", "S", "W"];
  const labels8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return divisions === 8 ? labels8[index] : labels4[index];
}

function updateLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      currentData = {
        ...currentData,
        position: {
          type: "Feature",
          properties: {
            identifier: "user_loc",
            name: "Usuario",
            information: "",
            categories: ["user"],
            campus: "",
            faculties: "",
            floors: [],
            needApproval: false,
          },
          geometry: { type: "Point", coordinates: [coords.longitude, coords.latitude] },
        },
      };
      notifySubscribers();
    },
    (error) => {},
    { enableHighAccuracy: true, maximumAge: 0 },
  );
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
let serviceOptions: Options = { cardinalPoints: 4, updateInterval: 2000 };

// Notify all hooked components
function notifySubscribers() {
  subscribers.forEach((cb) => cb(currentData));
}

// Start the shared service (only one interval and listener)
function startService(options: Options = {}) {
  if (intervalId) return;
  serviceOptions = { ...serviceOptions, ...options };

  updateLocation();
  intervalId = setInterval(updateLocation, serviceOptions.updateInterval!);
  window.addEventListener("deviceorientation", handleOrientation);
}

// Stop the shared service when no subscribers remain
function stopService() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
  window.removeEventListener("deviceorientation", handleOrientation);
}

/**
 * Subscribe to shared user location & orientation updates
 * @returns unsubscribe function
 */
export function subscribeUserLocation(callback: Subscriber, options: Options = {}): () => void {
  subscribers.add(callback);
  if (subscribers.size === 1) startService(options);
  // Emit current state immediately
  callback(currentData);

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) stopService();
  };
}

/**
 * React hook to access user location & orientation
 */
export function useUbication(options: Options = { cardinalPoints: 8, updateInterval: 1_500 }): LocationOrientationData {
  const [data, setData] = useState<LocationOrientationData>(currentData);

  useEffect(() => {
    const unsubscribe = subscribeUserLocation(setData, options);
    return unsubscribe;
  }, []);

  return data;
}
