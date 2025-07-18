"use client";

import { createContext, ReactNode } from "react";

import type { MarkerDragEvent } from "react-map-gl/maplibre";

import { PointFeature, PolygonFeature } from "@/utils/types";

import { useCustomPins } from "../hooks/useCustomPins";

interface PinsContextType {
  pins: PointFeature[];
  addPin: (lng: number, lat: number, name?: string) => PointFeature | null;
  handlePinDrag: (event: MarkerDragEvent, pinId: string) => void;
  clearPins: () => void;
  polygon: PolygonFeature | null;
}

export const pinsContext = createContext<PinsContextType>({
  pins: [],
  addPin: () => null,
  handlePinDrag: () => null,
  clearPins: () => null,
  polygon: null,
});

export function PinsProvider({ children }: { children: ReactNode }) {
  const { pins, addPin, handlePinDrag, clearPins, polygon } = useCustomPins({
    maxPins: 20,
  });

  return (
    <pinsContext.Provider
      value={{
        pins,
        addPin,
        handlePinDrag,
        clearPins,
        polygon,
      }}
    >
      {children}
    </pinsContext.Provider>
  );
}
