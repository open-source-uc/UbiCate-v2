"use client";

import { createContext, useContext, ReactNode, useState } from "react";

import { DirectionRoute } from "@/app/hooks/useOptimalDirection";
import { LineFeature } from "@/lib/types";

interface DirectionsContextType {
  route: LineFeature | null;
  duration: string | null;
  distance: number | null;

  routes: DirectionRoute[];
  selectedRouteId: string | null;

  setDirectionData: (direction: LineFeature | null, duration: string | null, distance: number | null) => void;

  setDirectionRoutes: (routes: DirectionRoute[]) => void;
  selectDirectionRoute: (id: string) => void;
}

const DirectionsContext = createContext<DirectionsContextType | undefined>(undefined);

export function DirectionsProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<LineFeature | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const [routes, setRoutes] = useState<DirectionRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const setDirectionData = (direction: LineFeature | null, duration: string | null, distance: number | null) => {
    setRoute(direction);
    setDuration(duration);
    setDistance(distance);

    setRoutes([]);
    setSelectedRouteId(null);
  };

  const setDirectionRoutes = (newRoutes: DirectionRoute[]) => {
    setRoutes(newRoutes);

    const first = newRoutes[0] ?? null;

    setSelectedRouteId(first?.id ?? null);
    setRoute(first?.direction ?? null);
    setDuration(first ? `${first.duration} min` : null);
    setDistance(first?.distance ?? null);
  };

  const selectDirectionRoute = (id: string) => {
    const selected = routes.find((item) => item.id === id);

    if (!selected) return;

    setSelectedRouteId(id);
    setRoute(selected.direction);
    setDuration(`${selected.duration} min`);
    setDistance(selected.distance);
  };

  return (
    <DirectionsContext.Provider
      value={{
        route,
        duration,
        distance,
        routes,
        selectedRouteId,
        setDirectionData,
        setDirectionRoutes,
        selectDirectionRoute,
      }}
    >
      {children}
    </DirectionsContext.Provider>
  );
}

export const useDirections = (): DirectionsContextType => {
  const context = useContext(DirectionsContext);

  if (!context) {
    throw new Error("useDirections must be used within a DirectionsProvider");
  }

  return context;
};
