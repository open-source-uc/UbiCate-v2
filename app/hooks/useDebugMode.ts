"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  getDebugModeServerSnapshot,
  getDebugModeSnapshot,
  setDebugModeEnabled,
  subscribeDebugMode,
} from "@/lib/debug/debugModeStore";

/**
 * Solo lee el flag. Úsalo cuando el componente quiera saber si está en modo debug sin encargarse de
 * apagarlo.
 */
export function useIsDebugMode(): boolean {
  return useSyncExternalStore(subscribeDebugMode, getDebugModeSnapshot, getDebugModeServerSnapshot);
}

/**
 * El modo debug muestra propuestas pendientes y permite aprobar/rechazar, así que NO puede servir datos
 * cacheados: se apaga solo al perder conexión (ver CLAUDE.md, "Dos modos").
 *
 * `setDebugModeEnabled` no es un setState de React sino una escritura al store externo, así que el
 * efecto no reintroduce el problema de "setState sincrónico dentro de un efecto".
 */
export function useDebugMode(): boolean {
  const isDebugMode = useIsDebugMode();

  useEffect(() => {
    const disable = () => setDebugModeEnabled(false);
    if (typeof navigator !== "undefined" && !navigator.onLine) disable();
    window.addEventListener("offline", disable);
    return () => window.removeEventListener("offline", disable);
  }, []);

  return isDebugMode;
}
