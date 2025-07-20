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

interface SubscriberData {
  callback: Subscriber;
  tracking: boolean;
}

const subscribers = new Map<Subscriber, SubscriberData>();
let currentData: LocationOrientationData = { position: null, alpha: 0, cardinal: "N" };
let watchId: number | null = null;
let orientationListenerActive = false;

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
  notifyActiveSubscribers();
}

// Handle location error
function handlePositionError(error: GeolocationPositionError) {
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
      geometry: { type: "Point", coordinates: [0, 0] },
    },
  };
  notifyActiveSubscribers();
}

// Handle device orientation events
function handleOrientation(event: DeviceOrientationEvent) {
  if (event.alpha == null) return;
  currentData = {
    ...currentData,
    alpha: event.alpha,
    cardinal: calculateCardinal(event.alpha, serviceOptions.cardinalPoints!),
  };
  notifyActiveSubscribers();
}

// Keep track of options for the running service
let serviceOptions: Options = {
  cardinalPoints: 4,
  maximumAge: 0,
  enableHighAccuracy: true,
  timeout: 5000,
};

// Notify only subscribers that have tracking enabled
function notifyActiveSubscribers() {
  subscribers.forEach(({ callback, tracking }) => {
    if (tracking) {
      callback(currentData);
    }
  });
}

// Check if any subscriber has tracking enabled
function hasActiveSubscribers(): boolean {
  for (const { tracking } of subscribers.values()) {
    if (tracking) return true;
  }
  return false;
}

// Start the shared service (only one watcher and orientation listener)
function startService(options: Options = {}) {
  if (watchId || !hasActiveSubscribers()) return;
  serviceOptions = { ...serviceOptions, ...options };

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: serviceOptions.enableHighAccuracy,
      maximumAge: serviceOptions.maximumAge,
      timeout: serviceOptions.timeout,
    });
  }

  if (!orientationListenerActive) {
    window.addEventListener("deviceorientation", handleOrientation);
    orientationListenerActive = true;
  }
}

// Stop the shared service when no active subscribers remain
function stopService() {
  if (!hasActiveSubscribers()) {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (orientationListenerActive) {
      window.removeEventListener("deviceorientation", handleOrientation);
      orientationListenerActive = false;
    }
  }
}

// Update tracking status for a subscriber
function updateSubscriberTracking(callback: Subscriber, tracking: boolean, options: Options = {}) {
  const subscriber = subscribers.get(callback);
  if (!subscriber) return;

  subscriber.tracking = tracking;

  if (tracking) {
    startService(options);
    // Emit current state immediately when tracking is enabled
    callback(currentData);
  } else {
    stopService();
  }
}

/**
 * Subscribe to shared user location & orientation updates
 * @returns object with unsubscribe function and setTracking function
 */
function subscribeUserLocation(callback: Subscriber, options: Options = {}) {
  const subscriberData: SubscriberData = { callback, tracking: false };
  subscribers.set(callback, subscriberData);

  const setTracking = (tracking: boolean) => {
    updateSubscriberTracking(callback, tracking, options);
  };

  const unsubscribe = () => {
    subscribers.delete(callback);
    stopService();
  };

  return { unsubscribe, setTracking };
}

export function useUbication(initialTracking: boolean = false): LocationOrientationData & {
  setTracking: (tracking: boolean) => void;
} {
  const [data, setData] = useState<LocationOrientationData>(currentData);
  // eslint-disable-next-line
  const [tracking, setTrackingState] = useState(initialTracking);

  useEffect(() => {
    const { unsubscribe, setTracking: setServiceTracking } = subscribeUserLocation(setData, {
      cardinalPoints: 8,
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    });

    // Set initial tracking state
    setServiceTracking(initialTracking);

    return unsubscribe;
  }, [initialTracking]);

  const setTracking = (newTracking: boolean) => {
    setTrackingState(newTracking);
    // The effect will handle the service update through the dependency
  };

  // Update service tracking when tracking state changes
  useEffect(() => {
    const { setTracking: setServiceTracking } = subscribeUserLocation(setData, {
      cardinalPoints: 8,
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    });

    setServiceTracking(tracking);
  }, [tracking]);

  return {
    ...data,
    setTracking,
  };
}
