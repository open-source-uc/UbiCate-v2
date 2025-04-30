"use client";

import { createContext, useContext, ReactNode, useState } from "react";

import { LineFeature, PointFeature } from "@/utils/types";

import { useUbication } from "../hooks/useUbication";

interface DirectionsContextType {
  route: LineFeature | null;
  duration: string | null;
  distance: number | null;
  setDirectionData: (direction: LineFeature | null, duration: string | null, distance: number | null) => void;
  position: PointFeature | null;
  alpha: number;
  cardinal: string;
}

const DirectionsContext = createContext<DirectionsContextType | undefined>(undefined);

export function DirectionsProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<LineFeature | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const { position, alpha, cardinal } = useUbication();

  const setDirectionData = (route: LineFeature | null, duration: string | null, distance: number | null) => {
    setRoute(route);
    setDuration(duration);
    setDistance(distance);
  };

  return (
    <DirectionsContext.Provider
      value={{
        route,
        duration,
        distance,
        setDirectionData: setDirectionData,
        position,
        alpha,
        cardinal,
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
