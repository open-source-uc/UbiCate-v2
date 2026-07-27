"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

export type PickingMode = "point" | "polygon";

interface MapPickingContextType {
  isPicking: boolean;
  mode: PickingMode;
  isForEvent: boolean;
  setPicking: (v: boolean, mode?: PickingMode) => void;
  setForEvent: (v: boolean) => void;
}

const MapPickingContext = createContext<MapPickingContextType>({
  isPicking: false,
  mode: "point",
  isForEvent: false,
  setPicking: () => {},
  setForEvent: () => {},
});

export function MapPickingProvider({ children }: { children: ReactNode }) {
  const [isPicking, setIsPicking] = useState(false);
  const [mode, setMode] = useState<PickingMode>("point");
  const [isForEvent, setIsForEvent] = useState(false);

  const setPicking = useCallback((v: boolean, m?: PickingMode) => {
    setIsPicking(v);
    if (m) setMode(m);
  }, []);

  const setForEvent = useCallback((v: boolean) => {
    setIsForEvent(v);
  }, []);

  return (
    <MapPickingContext.Provider value={{ isPicking, mode, isForEvent, setPicking, setForEvent }}>
      {children}
    </MapPickingContext.Provider>
  );
}

export const useMapPicking = () => useContext(MapPickingContext);
