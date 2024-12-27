"use client";

import { useState, useEffect } from "react";

function DebugPage() {
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  useEffect(() => {
    const debugModeFromLocalStorage = sessionStorage.getItem("debugMode") === "true";
    setIsDebugMode(debugModeFromLocalStorage);
  }, []);

  const toggleDebugMode = () => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    sessionStorage.setItem("debugMode", newDebugMode.toString());
  };

  return (
    <main className="flex flex-col items-center justify-center h-full w-full text-center space-y-4">
      <h1 className="text-3xl font-semibold">Modo Debug</h1>
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
    </main>
  );
}

export default DebugPage;
