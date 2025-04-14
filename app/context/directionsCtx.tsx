"use client";

import { createContext, useContext, ReactNode, useState } from "react";

import { LineFeature } from "@/utils/types";

interface DirectionsContextType {
  route: LineFeature | null;
  duration: number | null;
  distance: number | null;
  setDirectionData: (direction: LineFeature, duration: number, distance: number) => void;
}

const DirectionsContext = createContext<DirectionsContextType | undefined>(undefined);

export function DirectionsProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<LineFeature | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const setDirectionData = (route: LineFeature, duration: number, distance: number) => {
    setRoute(route);
    setDuration(duration);
    setDistance(distance);
  };

  return (
    <DirectionsContext.Provider value={{ route: route, duration, distance, setDirectionData: setDirectionData }}>
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
