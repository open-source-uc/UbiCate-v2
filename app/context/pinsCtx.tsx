"use client";

import { createContext, ReactNode } from "react";

import type { MarkerDragEvent } from "react-map-gl/maplibre";

import { PointFeature, PolygonFeature } from "@/lib/types";

import { useCustomPins } from "../hooks/useCustomPins";

interface PinsContextType {
  pins: PointFeature[];
  addPin: (lng: number, lat: number, name?: string) => PointFeature | null;
  insertPin: (lng: number, lat: number) => PointFeature | null;
  handlePinDrag: (event: MarkerDragEvent, pinId: string) => void;
  clearPins: () => void;
  setPins: (pins: PointFeature[]) => void;
  setPinsFromCoords: (coords: [number, number][]) => void;
  removePin: (pinId: string) => void;
  polygon: PolygonFeature | null;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const pinsContext = createContext<PinsContextType>({
  pins: [],
  addPin: () => null,
  insertPin: () => null,
  handlePinDrag: () => null,
  clearPins: () => null,
  setPins: () => null,
  setPinsFromCoords: () => null,
  removePin: () => null,
  polygon: null,
  undo: () => null,
  redo: () => null,
  resetHistory: () => null,
  canUndo: false,
  canRedo: false,
});

export function PinsProvider({ children }: { children: ReactNode }) {
  const {
    pins,
    addPin,
    insertPin,
    handlePinDrag,
    clearPins,
    setPins,
    setPinsFromCoords,
    removePin,
    polygon,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
  } = useCustomPins({
    maxPins: 20,
  });

  return (
    <pinsContext.Provider
      value={{
        pins,
        addPin,
        insertPin,
        handlePinDrag,
        clearPins,
        setPins,
        setPinsFromCoords,
        removePin,
        polygon,
        undo,
        redo,
        resetHistory,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </pinsContext.Provider>
  );
}
