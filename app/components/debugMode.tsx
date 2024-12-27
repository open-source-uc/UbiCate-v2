"use client";

import React, { useEffect, useState } from "react";
import { Source, Layer } from "react-map-gl";
import { allPointsLayer, allPlacesTextLayer, approvalPointsLayer } from "@/app/map/layers";

function DebugMode() {
  const isDebugMode = sessionStorage.getItem("debugMode") === "true";

  if (!isDebugMode) {
    return null;
  }

  const [json, setJson] = useState(null);
  const [showDebug2, setShowDebug2] = useState(true); // Controla la visibilidad de debug-2
  const [showDebug3, setShowDebug3] = useState(true); // Controla la visibilidad de debug-3

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data");
        if (!response.ok) {
          throw new Error("Failed to fetch GeoJSON data");
        }
        setJson((await response.json())?.file_places);
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div
        className="fixed left-0 bottom-0 bg-gray-800 bg-opacity-75 text-white p-4 w-min h-2/3 overflow-auto 
resize-x border-2 border-dashed pointer-events-auto"
      >
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showDebug2}
              onChange={() => setShowDebug2((prev) => !prev)}
              className="mr-2"
            />
            Mostrar Debug 2
          </label>
          <br />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showDebug3}
              onChange={() => setShowDebug3((prev) => !prev)}
              className="mr-2"
            />
            Mostrar Debug 3
          </label>
        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        </div>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#1E90FF] mr-2" /> Aulas - Azul
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#8B0000] mr-2" /> Baños - Rojo Oscuro
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#FFA500] mr-2" /> Comida - Naranja
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#32CD32] mr-2" /> Salas de Estudio - Verde
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#808080] mr-2" /> Reciclaje - Gris
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#228B22] mr-2" /> Bicicleteros - Verde Oscuro
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#FFD700] mr-2" /> Bancos - Dorado
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#FF69B4] mr-2" /> Laboratorios - Rosa
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#00BFFF] mr-2" /> Puntos de Agua - Azul Claro
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#4B0082] mr-2" /> Auditorios - Índigo
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#DC143C] mr-2" /> Deportes - Carmesí
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#00008B] mr-2" /> Salas de Computadores - Azul Oscuro
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#8A2BE2] mr-2" /> Fotocopias - Violeta
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#FF6347] mr-2" /> Tiendas - Tomate
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#A9A9A9] mr-2" /> Otros - Gris Oscuro
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#716ADB] mr-2" /> Color por Defecto
          </li>
        </ul>

      </div>

      <Source id="debug-1" type="geojson" data={json}>
        <Layer {...allPlacesTextLayer} />
      </Source>
      {showDebug2 && (
        <Source id="debug-2" type="geojson" data={json}>
          <Layer {...allPointsLayer} />
        </Source>
      )}
      {showDebug3 && (
        <Source id="debug-3" type="geojson" data={json}>
          <Layer {...approvalPointsLayer} />
        </Source>
      )}
    </>
  );
}

export default DebugMode;
