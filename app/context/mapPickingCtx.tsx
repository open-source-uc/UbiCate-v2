"use client";

import { createContext, ReactNode, use, useCallback, useContext, useState } from "react";

import { CATEGORIES, Feature } from "@/lib/types";

import { pinsContext } from "./pinsCtx";
import { useSidebar } from "./sidebarCtx";

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
  /**
   * "Se está creando un punto": hay una propuesta de lugar en curso — modo edición activo, formulario
   * abierto, o geometría marcada con su pin seleccionado (el menú con "Agregar"). Es el estado que
   * gobierna todo lo que no debe interrumpir ese trabajo: cerrar el sidebar, cambiar la selección y
   * dibujar los lugares del filtro en el mapa.
   */
  isCreatingPlace: boolean;
  /** Solo la parte "hay una propuesta pendiente", fuera del modo edición. */
  hasPendingProposal: boolean;
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
  isCreatingPlace: false,
  hasPendingProposal: false,
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

  // El provider vive dentro de Sidebar y Pins (ver providers.tsx), así que puede derivar acá el estado
  // de "propuesta en curso" y no repetirlo en cada consumidor. El flujo de eventos queda afuera: sus
  // pins son un borrador del modal, no una propuesta de lugar.
  const { pins } = use(pinsContext);
  const { selectedPlace } = useSidebar();
  const hasPendingProposal =
    !isForEvent &&
    (isPlaceFormOpen ||
      (pins.length > 0 && selectedPlace?.properties.categories.includes(CATEGORIES.CUSTOM_MARK) === true));
  const isCreatingPlace = isPicking || hasPendingProposal;

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
        isCreatingPlace,
        hasPendingProposal,
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
