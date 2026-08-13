"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

import EventPlaceForm from "@/app/components/features/places/forms/EventPlaceForm";
import { useMapPicking } from "@/app/context/mapPickingCtx";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useDebugMode } from "@/app/hooks/useDebugMode";
import { useRoutesDebug } from "@/app/hooks/useRoutes";
import { apiClient } from "@/lib/api/ubicateApiClient";
import { setDebugModeEnabled } from "@/lib/debug/debugModeStore";
import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { pruneEventPlaces } from "@/lib/places/eventPlaces";
import { getParentPlaceFloor, normalizeIdentifier } from "@/lib/places/utils";
import { EventFeature, EventLocation, EventProperties, Feature, getParentPlaceIds, PointFeature } from "@/lib/types";

import {
  allPointsLayer,
  allPlacesTextLayer,
  approvalPointsLayer,
  allPlacesTextApprovalLayer,
  redLineLayerDebug,
  sectionAreaLayerDebug,
  eventPointsLayer,
  eventPolygonLayer,
  eventPolygonLineLayer,
  eventTextLayer,
  routeLineBorderLayer,
  routeLineLayer,
  routeTextLayer,
} from "./layers";

function DebugMode() {
  // useDebugMode ya encapsula la lectura del flag y el apagado automático al perder conexión.
  const isDebugMode = useDebugMode();
  const [debugMode, setDebugMode] = useState(1);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventFeature | null>(null);
  const mainMap = useMap();
  const [mapLayers, setMapLayers] = useState<string[]>([]);
  const { isPicking, isForRoute } = useMapPicking();
  const { hiddenPlaceIds, selectedRoute } = useSidebar();
  const queryClient = useQueryClient();

  const {
    data: ubicateData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ubicate-debug"],
    queryFn: async () => {
      const response = await apiClient("/api/ubicate", {
        headers: { "X-Ubicate-Fresh": "true" },
      });
      return response;
    },
    enabled: isDebugMode,
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events-debug"],
    queryFn: async () => {
      // Debug = siempre fresco: X-Ubicate-Fresh salta el SW y la Capa 1 (lee directo de la BD).
      const response = await apiClient("/api/events", { headers: { "X-Ubicate-Fresh": "true" } });
      return response;
    },
    enabled: isDebugMode,
    staleTime: 5 * 60 * 1000,
  });

  const debugRoutes = useRoutesDebug(isDebugMode);

  /*
  El overlay de debug sí muestra los eventos vencidos (dropExpiredEvents: false),
  pero nunca los lugares de evento huérfanos: sin un evento que los apunte no representan nada.
  */
  const eventJson: EventFeature[] = useMemo(
    () => pruneEventPlaces(eventsData?.events?.features || [], { dropExpiredEvents: false }).features as EventFeature[],
    [eventsData],
  );

  const visibleFeatures = useCallback(
    <T extends Feature | EventFeature>(features: T[]) =>
      features.filter((f) => !hiddenPlaceIds.has(f.properties.identifier)),
    [hiddenPlaceIds],
  );

  const approvedIdentifiers = useMemo(
    () =>
      new Set(
        (ubicateData?.approved_places?.features || []).map((f: Feature) =>
          normalizeIdentifier(f.properties.identifier),
        ),
      ),
    [ubicateData],
  );

  const eventPlaceMap = useMemo(() => {
    const map = new Map<string, Feature>();
    for (const item of eventJson) {
      if ((item as any).properties?.startDate) continue;
      map.set(normalizeIdentifier(item.properties.identifier), item as unknown as Feature);
    }
    return map;
  }, [eventJson]);

  const debugEventFeatures = useMemo(() => {
    const approvedFeatures = new Map<string, Feature>();
    for (const f of (ubicateData?.approved_places?.features || []) as Feature[]) {
      approvedFeatures.set(normalizeIdentifier(f.properties.identifier), f);
    }

    const enriched: (EventFeature | Feature)[] = [...eventJson];
    const enrichedIndex = new Map<string, number>();
    for (let i = 0; i < enriched.length; i++) {
      enrichedIndex.set(normalizeIdentifier(enriched[i].properties.identifier), i);
    }

    for (const item of eventJson) {
      if (!("startDate" in item.properties)) continue;
      const parentIds = getParentPlaceIds(item.properties);
      for (const parentId of parentIds) {
        const normId = normalizeIdentifier(parentId);
        const existingIdx = enrichedIndex.get(normId);
        if (existingIdx !== undefined) {
          const existing = enriched[existingIdx];
          enriched[existingIdx] = {
            ...existing,
            properties: { ...existing.properties, eventLabel: item.properties.name },
          } as unknown as Feature;
        } else {
          const approvedFeature = approvedFeatures.get(normId);
          if (approvedFeature) {
            enrichedIndex.set(normId, enriched.length);
            enriched.push({
              ...approvedFeature,
              properties: { ...approvedFeature.properties, eventLabel: item.properties.name },
            } as unknown as Feature);
          }
        }
      }
    }

    return enriched;
  }, [eventJson, ubicateData]);

  function buildLocationsFromParentIds(parentIds: string[], props?: EventProperties): EventLocation[] {
    return parentIds.map((id) => {
      const normId = normalizeIdentifier(id);
      const floor = props ? getParentPlaceFloor(props, id) : undefined;
      if (approvedIdentifiers.has(normId)) {
        return { id: `existing-${id}`, type: "existing" as const, placeId: id, floor, pins: [] };
      }
      const placeFeature = eventPlaceMap.get(normId);
      if (placeFeature) {
        const pins: PointFeature[] = [];
        if (placeFeature.geometry.type === "Point") {
          pins.push({
            type: "Feature",
            properties: {} as any,
            geometry: { type: "Point", coordinates: placeFeature.geometry.coordinates as [number, number] },
          });
        } else if (placeFeature.geometry.type === "Polygon") {
          const coords = (placeFeature.geometry.coordinates as [number, number][][])[0].slice(0, -1);
          for (const c of coords) {
            pins.push({ type: "Feature", properties: {} as any, geometry: { type: "Point", coordinates: c } });
          }
        }
        return {
          id: `new-${id}`,
          type: "new" as const,
          name: placeFeature.properties.name,
          information: placeFeature.properties.information || "",
          identifier: placeFeature.properties.identifier,
          floor,
          pins,
        };
      }
      return { id: `existing-${id}`, type: "existing" as const, placeId: id, floor, pins: [] };
    });
  }

  useEffect(() => {
    if (isDebugMode && mainMap.mainMap) {
      const map = mainMap.mainMap.getMap();

      if (map && map.isStyleLoaded()) {
        const layers = map.getStyle().layers;
        const layerIds = layers.map((layer: any) => layer.id);
        console.log("Available map layers:", layerIds);
        // Lee las capas del estilo de maplibre, un sistema externo que no existe durante el render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMapLayers(layerIds);
      } else {
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

  const approvedFeatures: Feature[] = ubicateData?.approved_places?.features ?? [];
  const newPlacesFeatures: Feature[] = ubicateData?.new_places?.features ?? [];

  // Lienzo limpio en todo el flujo de dibujo: el modo edición y también el formulario de ruta, donde los
  // pins siguen desplegados. Con una ruta elegida también, para que se vean su trazado y sus lugares y
  // no los cientos de puntos del debug. El modo seleccionado se conserva para cuando se vuelva.
  const visibleDebugMode = isPicking || isForRoute || selectedRoute ? 0 : debugMode;

  return (
    <>
      {/* En modo edición el mapa queda limpio: se oculta (no se desmonta) para no perder el estado del panel.
          Con el formulario de ruta abierto también, o los radios quedarían sin pintar nada. */}
      <div
        className={`fixed right-0 top-44 bg-gray-800 bg-opacity-75 text-white p-4 w-min h-2/5 overflow-auto resize-x border-2 border-dashed pointer-events-auto ${
          isPicking || isForRoute ? "hidden" : ""
        }`}
      >
        <button
          onClick={() => setDebugModeEnabled(false)}
          className="mb-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Salir de modo debug
        </button>
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
          <br />
          <label className="flex items-center">
            <input type="radio" checked={debugMode === 3} onChange={() => setDebugMode(3)} className="mr-2" />
            Eventos
          </label>
          <br />
          <label className="flex items-center">
            <input type="radio" checked={debugMode === 4} onChange={() => setDebugMode(4)} className="mr-2" />
            Rutas
          </label>

          <div className="mt-3">
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowEventForm(true);
              }}
              className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              + Crear Evento
            </button>
          </div>

          <h2 className="text-xl font-bold mb-4 mt-4">Categorías</h2>
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
            <span className="w-6 h-6 bg-[#9370DB] mr-2" /> Cultura - Púrpura Medio
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#CD853F] mr-2" /> Oficinas - Marrón Claro
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#A9A9A9] mr-2" /> Otros - Gris Oscuro
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#716ADB] mr-2" /> Color por Defecto
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#9333EA] mr-2" /> Eventos - Púrpura
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 bg-[#22C55E] mr-2" /> Rutas - Verde
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

      {visibleDebugMode === 1 && (
        <>
          <Source
            id="debug-1"
            type="geojson"
            data={featuresToGeoJSON(visibleFeatures(approvedFeatures.filter((e) => e.geometry.type === "Polygon")))}
          >
            <Layer {...redLineLayerDebug} />
          </Source>
          <Source
            id="debug-2"
            type="geojson"
            data={featuresToGeoJSON(visibleFeatures(approvedFeatures.filter((e) => e.geometry.type === "Point")))}
          >
            <Layer {...allPointsLayer} />
            <Layer {...allPlacesTextLayer} />
          </Source>
        </>
      )}

      {visibleDebugMode === 2 && newPlacesFeatures.length > 0 ? (
        <>
          <Source
            id="debug-8"
            type="geojson"
            data={featuresToGeoJSON(visibleFeatures(newPlacesFeatures.filter((e) => e.geometry.type === "Polygon")))}
          >
            <Layer {...sectionAreaLayerDebug} />
            <Layer {...redLineLayerDebug} />
          </Source>
          <Source
            id="debug-3"
            type="geojson"
            data={featuresToGeoJSON(visibleFeatures(newPlacesFeatures.filter((e) => e.geometry.type === "Point")))}
          >
            <Layer {...approvalPointsLayer} />
            <Layer {...allPlacesTextApprovalLayer} />
          </Source>
        </>
      ) : null}

      {visibleDebugMode === 4 && debugRoutes.length > 0 ? (
        <Source id="debug-routes" type="geojson" data={featuresToGeoJSON(debugRoutes)}>
          <Layer {...routeLineBorderLayer} />
          <Layer {...routeLineLayer} />
          <Layer {...routeTextLayer} />
        </Source>
      ) : null}

      {visibleDebugMode === 3 && debugEventFeatures.length > 0 ? (
        <>
          <Source id="debug-events" type="geojson" data={featuresToGeoJSON(visibleFeatures(debugEventFeatures))}>
            <Layer {...eventPolygonLayer} />
            <Layer {...eventPolygonLineLayer} />
            <Layer {...eventPointsLayer} />
            <Layer {...eventTextLayer} />
          </Source>
        </>
      ) : null}

      {showEventForm ? (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 pointer-events-auto ${
            isPicking ? "hidden" : ""
          }`}
        >
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <EventPlaceForm
              defaultData={
                editingEvent
                  ? {
                      name: editingEvent.properties.name,
                      information: editingEvent.properties.information,
                      categories: editingEvent.properties.categories,
                      floors: editingEvent.properties.floors || [],
                      startDate: editingEvent.properties.startDate,
                      endDate: editingEvent.properties.endDate,
                      showFrom: editingEvent.properties.showFrom || "",
                      locations: buildLocationsFromParentIds(
                        getParentPlaceIds(editingEvent.properties),
                        editingEvent.properties,
                      ),
                      identifier: editingEvent.properties.identifier,
                    }
                  : undefined
              }
              method={editingEvent ? "PUT" : "POST"}
              submitButtonText={editingEvent ? "Actualizar Evento" : "Crear Evento"}
              title={editingEvent ? "Editar Evento" : "Nuevo Evento"}
              onClose={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["events-debug"] });
                queryClient.invalidateQueries({ queryKey: ["events"] });
                queryClient.invalidateQueries({ queryKey: ["ubicate-debug"] });
                queryClient.invalidateQueries({ queryKey: ["places"] });
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default DebugMode;
