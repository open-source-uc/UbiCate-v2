"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

import { Feature } from "@/lib/types";

export type PickingMode = "point" | "polygon";

interface MapPickingContextType {
  isPicking: boolean;
  mode: PickingMode;
  isForEvent: boolean;
  isDrawingRect: boolean;
  isPlaceFormOpen: boolean;
  // Sesión de solo lectura: se muestra la geometría en el mapa sin herramientas ni edición.
  isViewOnly: boolean;
  // Lugar que se está mirando en esa sesión, para pintar su ficha.
  viewPlace: Feature | null;
  setPicking: (v: boolean, mode?: PickingMode, opts?: { viewOnly?: boolean; place?: Feature | null }) => void;
  setForEvent: (v: boolean) => void;
  setDrawingRect: (v: boolean) => void;
  setPlaceFormOpen: (v: boolean) => void;
}

const MapPickingContext = createContext<MapPickingContextType>({
  isPicking: false,
  mode: "point",
  isForEvent: false,
  isDrawingRect: false,
  isPlaceFormOpen: false,
  isViewOnly: false,
  viewPlace: null,
  setPicking: () => {},
  setForEvent: () => {},
  setDrawingRect: () => {},
  setPlaceFormOpen: () => {},
});

export function MapPickingProvider({ children }: { children: ReactNode }) {
  const [isPicking, setIsPicking] = useState(false);
  const [mode, setMode] = useState<PickingMode>("point");
  const [isForEvent, setIsForEvent] = useState(false);
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [isPlaceFormOpen, setIsPlaceFormOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [viewPlace, setViewPlace] = useState<Feature | null>(null);

  // `viewOnly` solo vive dentro de una sesión de picking: al salir (o al reentrar sin pedirlo) se apaga.
  const setPicking = useCallback(
    (v: boolean, m?: PickingMode, opts?: { viewOnly?: boolean; place?: Feature | null }) => {
      setIsPicking(v);
      if (m) setMode(m);
      const viewOnly = v && opts?.viewOnly === true;
      setIsViewOnly(viewOnly);
      setViewPlace(viewOnly ? opts?.place ?? null : null);
    },
    [],
  );

  const setForEvent = useCallback((v: boolean) => {
    setIsForEvent(v);
  }, []);

  const setDrawingRect = useCallback((v: boolean) => {
    setIsDrawingRect(v);
  }, []);

  const setPlaceFormOpen = useCallback((v: boolean) => {
    setIsPlaceFormOpen(v);
  }, []);

  return (
    <MapPickingContext.Provider
      value={{
        isPicking,
        mode,
        isForEvent,
        isDrawingRect,
        isPlaceFormOpen,
        isViewOnly,
        viewPlace,
        setPicking,
        setForEvent,
        setDrawingRect,
        setPlaceFormOpen,
      }}
    >
      {children}
    </MapPickingContext.Provider>
  );
}

export const useMapPicking = () => useContext(MapPickingContext);
