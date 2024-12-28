"use client";

import { useState, useEffect } from "react";

function DebugPage() {
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  useEffect(() => {
<<<<<<< HEAD
=======
    // Inicializa el estado a partir de localStorage
>>>>>>> bot-update-locations
    const debugModeFromLocalStorage = sessionStorage.getItem("debugMode") === "true";
    setIsDebugMode(debugModeFromLocalStorage);
  }, []);

  const toggleDebugMode = () => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    sessionStorage.setItem("debugMode", newDebugMode.toString());
  };

  return (
<<<<<<< HEAD
    <main className="flex flex-col items-center justify-center h-full w-full text-center space-y-4">
=======
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
>>>>>>> bot-update-locations
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
<<<<<<< HEAD
    </main>
=======
    </div>
>>>>>>> bot-update-locations
  );
}

export default DebugPage;
