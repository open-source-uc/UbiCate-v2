"use client";

import Link from "next/link";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const debugModeFromLocalStorage = sessionStorage.getItem("debugMode") === "true";
        setIsDebugMode(debugModeFromLocalStorage);
      }
    } catch (error) {
      console.warn("Unable to access sessionStorage:", error);
      setIsDebugMode(false);
    }
  }, []);

  const toggleDebugMode = () => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("debugMode", newDebugMode.toString());
      }
    } catch (error) {
      console.warn("Unable to set sessionStorage:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-full w-full text-center space-y-4">
      <h1 className="text-3xl font-semibold">Modo Debug</h1>
      <section>
        <label className="flex items-center space-x-2 text-xl">
          <input
            type="checkbox"
            checked={isDebugMode}
            onChange={toggleDebugMode}
            className="w-6 h-6 text-blue-500 focus:ring-blue-500"
          />
          <span>Activar Modo Debug</span>
        </label>
        <p className="text-lg">Modo Debug: {isDebugMode ? "Activado" : "Desactivado"}</p>
      </section>
      <section>
        <label className="flex items-center space-x-2 text-xl">
          <input
            type="password"
            className="bg-surface rounded-2xl p-2 disabled:bg-surface"
            disabled={!isDebugMode}
            onChange={(e) => {
              try {
                if (typeof window !== "undefined" && window.sessionStorage) {
                  sessionStorage.setItem("ubicateToken", e.target.value ?? "");
                }
              } catch (error) {
                console.warn("Unable to set sessionStorage:", error);
              }
            }}
          />
        </label>
      </section>
      <section>
        <Link href="/" className="font-semibold transition-all underline text-lg py-2">
          Regresar al inicio
        </Link>
      </section>
    </main>
  );
}

export const runtime = "edge";
