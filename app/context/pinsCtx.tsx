"use client";

import { createContext, ReactNode } from "react";

import type { MarkerDragEvent } from "react-map-gl/maplibre";

import { LineFeature, PointFeature, PolygonFeature } from "@/lib/types";

import { useCustomPins } from "../hooks/useCustomPins";

interface PinsContextType {
  pins: PointFeature[];
  addPin: (lng: number, lat: number, name?: string) => PointFeature | null;
  /** Línea: engancha el vértice al extremo más cercano al clic. */
  addPinToNearestEnd: (lng: number, lat: number) => PointFeature | null;
  insertPin: (lng: number, lat: number) => PointFeature | null;
  handlePinDrag: (event: MarkerDragEvent, pinId: string) => void;
  clearPins: () => void;
  setPins: (pins: PointFeature[]) => void;
  setPinsFromCoords: (coords: [number, number][]) => void;
  removePin: (pinId: string) => void;
  polygon: PolygonFeature | null;
  line: LineFeature | null;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// 20 alcanza de sobra para un punto o un polígono, pero una ruta de campus necesita bastantes
// más vértices para seguir los caminos. Se exporta porque la importación de GeoJSON tiene que
// reducir el trazado a este mismo tope.
export const MAX_PINS = 60;

export const pinsContext = createContext<PinsContextType>({
  pins: [],
  addPin: () => null,
  addPinToNearestEnd: () => null,
  insertPin: () => null,
  handlePinDrag: () => null,
  clearPins: () => null,
  setPins: () => null,
  setPinsFromCoords: () => null,
  removePin: () => null,
  polygon: null,
  line: null,
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
    addPinToNearestEnd,
    insertPin,
    handlePinDrag,
    clearPins,
    setPins,
    setPinsFromCoords,
    removePin,
    polygon,
    line,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
  } = useCustomPins({ maxPins: MAX_PINS });

  return (
    <pinsContext.Provider
      value={{
        pins,
        addPin,
        addPinToNearestEnd,
        insertPin,
        handlePinDrag,
        clearPins,
        setPins,
        setPinsFromCoords,
        removePin,
        polygon,
        line,
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
