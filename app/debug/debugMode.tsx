"use client";

import React, { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import Places from "@/lib/places/data";
import { JSONFeatures } from "@/lib/types";

import {
  allPointsLayer,
  allPlacesTextLayer,
  approvalPointsLayer,
  allPlacesTextApprovalLayer,
  redLineLayerDebug,
  sectionAreaLayerDebug,
} from "./layers";

function DebugMode() {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugMode, setDebugMode] = useState(1);
  const mainMap = useMap();
  const [mapLayers, setMapLayers] = useState<string[]>([]);

  // Safely check for debug mode on client side only
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const debugModeFromStorage = sessionStorage.getItem("debugMode") === "true";
        setIsDebugMode(debugModeFromStorage);
      }
    } catch (error) {
      console.warn("Unable to access sessionStorage:", error);
      setIsDebugMode(false);
    }
  }, []);

  const {
    data: ubicateData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ubicate-debug"],
    queryFn: async () => {
      const response = await apiClient("/api/ubicate");
      return response;
    },
    enabled: isDebugMode,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Log all layer IDs when the map is loaded
    if (isDebugMode && mainMap.mainMap) {
      const map = mainMap.mainMap.getMap();

      if (map && map.isStyleLoaded()) {
        const layers = map.getStyle().layers;
        const layerIds = layers.map((layer: any) => layer.id);
        console.log("Available map layers:", layerIds);
        setMapLayers(layerIds);
      } else {
        // If style isn't loaded yet, wait for the style.load event
        map.once("style.load", () => {
          const layers = map.getStyle().layers;
          const layerIds = layers.map((layer: any) => layer.id);
          console.log("Available map layers:", layerIds);
          setMapLayers(layerIds);
        });
      }
    }
  }, [isDebugMode, mainMap.mainMap]);

  if (!isDebugMode) {
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    throw new Error("Failed to fetch GeoJSON data " + error?.message);
  }

  const json: JSONFeatures | null = ubicateData?.new_places;
  console.log(json);

  return (
    <>
      <div
        className="fixed right-0 top-44 bg-gray-800 bg-opacity-75 text-white p-4 w-min h-2/5 overflow-auto 
resize-x border-2 border-dashed pointer-events-auto"
      >
        <div className="mt-4">
          <label className="flex items-center">
            <input type="radio" checked={debugMode === 1} onChange={() => setDebugMode(1)} className="mr-2" />
            ALL puntos
          </label>
          <br />
          <label className="flex items-center">
            <input type="radio" checked={debugMode === 2} onChange={() => setDebugMode(2)} className="mr-2" />
            Punto new/update
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

        {mapLayers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Layer IDs:</h3>
            <div className="max-h-40 overflow-y-auto mt-2">
              <ul className="list-disc list-inside">
                {mapLayers.map((layerId) => (
                  <li key={layerId} className="text-xs">
                    {layerId}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {debugMode === 1 && (
        <>
          <Source
            id="debug-1"
            type="geojson"
            data={featuresToGeoJSON(Places.features.filter((e) => e.geometry.type === "Polygon"))}
          >
            <Layer {...redLineLayerDebug} />
          </Source>
          <Source
            id="debug-2"
            type="geojson"
            data={featuresToGeoJSON(Places.features.filter((e) => e.geometry.type === "Point"))}
          >
            <Layer {...allPointsLayer} />
            <Layer {...allPlacesTextLayer} />
          </Source>
        </>
      )}

      {debugMode === 2 && json ? (
        <>
          <Source
            id="debug-3"
            type="geojson"
            data={featuresToGeoJSON(json.features.filter((e) => e.geometry.type === "Point"))}
          >
            <Layer {...approvalPointsLayer} />
            <Layer {...allPlacesTextApprovalLayer} />
          </Source>
          <Source
            id="debug-8"
            type="geojson"
            data={featuresToGeoJSON(json.features.filter((e) => e.geometry.type === "Polygon"))}
          >
            <Layer {...sectionAreaLayerDebug} />
            <Layer {...redLineLayerDebug} />
          </Source>
        </>
      ) : null}
    </>
  );
}

export default DebugMode;
