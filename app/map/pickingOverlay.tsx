"use client";

import { use } from "react";

import { useMapPicking } from "@/app/context/mapPickingCtx";
import { pinsContext } from "@/app/context/pinsCtx";

export default function PickingOverlay() {
  const { isPicking, mode, setPicking } = useMapPicking();
  const { clearPins, pins } = use(pinsContext);

  if (!isPicking) return null;

  const handleCancel = () => {
    clearPins();
    setPicking(false);
  };

  const handleConfirm = () => {
    setPicking(false);
  };

  const message =
    mode === "polygon"
      ? pins.length < 3
        ? "Agrega al menos un punto más para formar el polígono"
        : "Haz clic para agregar más puntos o confirma el polígono"
      : "Haz clic en el mapa para ubicar el lugar";

  return (
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
            disabled={mode === "polygon" && pins.length < 3}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
