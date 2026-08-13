"use client";

import { use, useEffect, useRef } from "react";

import { PickingMode, useMapPicking } from "@/app/context/mapPickingCtx";
import { pinsContext } from "@/app/context/pinsCtx";
import { PointFeature } from "@/lib/types";

import MaterialSymbol from "../components/ui/icons/MaterialSymbol";

import PlaceViewCard from "./placeViewCard";

const MODE_TOOLS: Record<PickingMode, { icon: string; label: string }> = {
  point: { icon: "distance", label: "Modo punto" },
  polygon: { icon: "polyline", label: "Modo polígono" },
  line: { icon: "route", label: "Modo ruta" },
};

const MIN_PINS: Record<PickingMode, number> = { point: 1, line: 2, polygon: 3 };

export default function PickingOverlay() {
  const {
    isPicking,
    mode,
    allowedModes,
    isForRoute,
    setPicking,
    isDrawingRect,
    setDrawingRect,
    isPlaceFormOpen,
    isViewOnly,
    viewPlace,
  } = useMapPicking();
  const { clearPins, setPins, pins, undo, redo, resetHistory, canUndo, canRedo } = use(pinsContext);

  // Geometría con la que se entró al modo edición. Si el formulario está abierto, Cancelar la restaura
  // en vez de dejar la propuesta sin geometría: solo la x del sidebar descarta el trabajo.
  const pinsOnEnterRef = useRef<PointFeature[]>([]);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  // El historial de deshacer/rehacer es por sesión: cada entrada al modo edición arranca en blanco.
  useEffect(() => {
    if (!isPicking) return;
    pinsOnEnterRef.current = pinsRef.current;
    resetHistory();
  }, [isPicking, resetHistory]);

  // Ctrl/⌘ + Z deshace y Ctrl/⌘ + Y rehace, solo dentro del modo edición y sin foco en un campo de
  // texto (ahí el atajo le pertenece al input).
  useEffect(() => {
    if (!isPicking || isViewOnly) return;

    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || isTyping(e.target)) return;

      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        undo();
      } else if (key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPicking, isViewOnly, undo, redo]);

  if (!isPicking) return null;

  const handleCancel = () => {
    // Con un formulario detrás (lugar o ruta) Cancelar restaura la geometría con la que se entró, en vez
    // de dejar la propuesta sin nada: descartar el trabajo es cosa de cerrar el formulario.
    if (isPlaceFormOpen || isForRoute) {
      setPins(pinsOnEnterRef.current);
    } else {
      clearPins();
    }
    setPicking(false);
  };

  const handleConfirm = () => {
    setPicking(false);
  };

  // Lugar existente de la app: se muestra su geometría, sin herramientas ni edición.
  if (isViewOnly) {
    return (
      <>
        {viewPlace ? <PlaceViewCard place={viewPlace} /> : null}

        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end pb-8 pointer-events-none">
          <div className="pointer-events-auto bg-background rounded-xl shadow-xl px-6 py-4 flex flex-col items-center gap-4">
            <p className="text-sm text-foreground font-medium">Visualización de lugar existente.</p>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition"
            >
              Volver
            </button>
          </div>
        </div>
      </>
    );
  }

  // El punto es exacto (uno solo, el clic lo reubica); línea y polígono son mínimos.
  const confirmDisabled = mode === "point" ? pins.length !== 1 : pins.length < MIN_PINS[mode];

  let message: string;
  if (isDrawingRect) {
    message = "Arrastra en el mapa para dibujar el cuadrado";
  } else if (mode === "point") {
    message =
      pins.length === 1
        ? "Punto listo. Confirma o haz clic para reubicarlo"
        : "Haz clic en el mapa para marcar el punto";
  } else if (mode === "line") {
    message = pins.length < 2 ? "Marca al menos 2 puntos para la ruta" : "Haz clic para seguir la ruta o confirma";
  } else {
    message =
      pins.length < 3 ? "Marca al menos 3 puntos para el polígono" : "Haz clic para agregar más puntos o confirma";
  }

  const toolClass = (active: boolean) =>
    `flex h-11 w-11 items-center justify-center rounded-lg border shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-foreground border-border hover:bg-border"
    }`;

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-3 z-[100] -translate-x-1/2">
        <div
          className="rounded-full bg-background/80 px-6 py-2 shadow-lg ring-1 ring-border backdrop-blur-md"
          style={{ fontFamily: "var(--font-roboto), system-ui, sans-serif" }}
        >
          <span className="text-base font-semibold tracking-wide text-foreground">
            {isForRoute ? "Dibujar Ruta" : "Modo Edición"}
          </span>
        </div>
      </div>

      <div className="pointer-events-auto fixed right-2 top-4 z-[100] flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {allowedModes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPicking(true, m)}
              className={toolClass(mode === m)}
              title={MODE_TOOLS[m].label}
              aria-label={MODE_TOOLS[m].label}
              aria-pressed={mode === m}
            >
              <MaterialSymbol name={MODE_TOOLS[m].icon} className="text-[22px]" />
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={toolClass(false)}
            title="Deshacer (Ctrl+Z)"
            aria-label="Deshacer"
          >
            <MaterialSymbol name="undo" className="text-[22px]" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={toolClass(false)}
            title="Rehacer (Ctrl+Y)"
            aria-label="Rehacer"
          >
            <MaterialSymbol name="redo" className="text-[22px]" />
          </button>
          {/* El cuadrado sale del modo línea: al soltar fuerza el modo polígono. */}
          {mode !== "line" ? (
            <button
              type="button"
              onClick={() => setDrawingRect(true)}
              className={toolClass(isDrawingRect)}
              title="Cuadrado"
              aria-label="Cuadrado"
              aria-pressed={isDrawingRect}
            >
              <MaterialSymbol name="crop_free" className="text-[22px]" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => clearPins()}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition hover:bg-border"
            title="Limpiar"
            aria-label="Limpiar"
          >
            <MaterialSymbol name="delete" className="text-[22px]" />
          </button>
        </div>
      </div>

      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end pb-8 pointer-events-none">
        <div className="pointer-events-auto bg-background rounded-xl shadow-xl px-6 py-4 flex flex-col items-center gap-4">
          <p className="text-sm text-foreground font-medium">{message}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm rounded-lg border border-border bg-input text-foreground hover:bg-accent/5 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmDisabled}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
