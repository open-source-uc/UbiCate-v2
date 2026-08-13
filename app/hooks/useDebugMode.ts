"use client";

import { useEffect, useState } from "react";

/**
 * El modo debug muestra propuestas pendientes y permite aprobar/rechazar, así que NO puede servir datos
 * cacheados: se apaga solo al perder conexión (ver CLAUDE.md, "Dos modos").
 */
export function useDebugMode(): boolean {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        setIsDebugMode(sessionStorage.getItem("debugMode") === "true");
      }
    } catch (error) {
      console.warn("Unable to access sessionStorage:", error);
      setIsDebugMode(false);
    }
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      sessionStorage.removeItem("debugMode");
      setIsDebugMode(false);
    };
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      sessionStorage.removeItem("debugMode");
      setIsDebugMode(false);
    }
  }, []);

  return isDebugMode;
}
