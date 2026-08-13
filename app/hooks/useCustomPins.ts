"use client";

import { useCallback, useMemo, useReducer, useRef } from "react";

import { booleanClockwise } from "@turf/boolean-clockwise";
import type { MarkerDragEvent } from "react-map-gl/maplibre";

import { getCampusNameFromPoint } from "@/lib/campus/getCampusBounds";
import { CATEGORIES, LineFeature, PointFeature, PolygonFeature } from "@/lib/types";

type CustomPin = PointFeature;

interface UseCustomPinsOptions {
  maxPins?: number;
  generatePinId?: (index: number) => string;
}

// Índice donde insertar un vértice para que caiga sobre la arista más cercana del anillo
// (así un clic al lado opuesto no cruza el polígono). Corrige la longitud del lng por cos(lat)
// para que la distancia sea aproximadamente métrica a escala de campus.
function bestInsertIndex(ring: number[][], p: number[]): number {
  const kx = Math.cos((p[1] * Math.PI) / 180);
  const px = p[0] * kx;
  const py = p[1];

  const segDistSq = (a: number[], b: number[]) => {
    const ax = a[0] * kx;
    const ay = a[1];
    const dx = b[0] * kx - ax;
    const dy = b[1] - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const ex = px - (ax + t * dx);
    const ey = py - (ay + t * dy);
    return ex * ex + ey * ey;
  };

  let best = Infinity;
  let bestIdx = ring.length;
  for (let i = 0; i < ring.length; i++) {
    const d = segDistSq(ring[i], ring[(i + 1) % ring.length]);
    if (d < best) {
      best = d;
      bestIdx = i + 1;
    }
  }
  return bestIdx;
}

// Distancia aproximada (al cuadrado) entre dos coordenadas, con el lng corregido por cos(lat) igual que
// en bestInsertIndex.
function coordDistSq(a: number[], p: number[]): number {
  const kx = Math.cos((p[1] * Math.PI) / 180);
  const dx = (a[0] - p[0]) * kx;
  const dy = a[1] - p[1];
  return dx * dx + dy * dy;
}

interface PinsState {
  pins: CustomPin[];
  past: CustomPin[][];
  future: CustomPin[][];
}

type PinsAction =
  | { type: "commit"; updater: (prev: CustomPin[]) => CustomPin[] }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset-history" };

// Historial de deshacer/rehacer: cada mutación guarda el estado anterior en `past` y **vacía `future`**
// (hacer algo nuevo sobre el mapa borra el camino hacia adelante). El updater debe ser puro: los pins
// nuevos se construyen antes de despachar, nunca dentro del reducer.
function pinsReducer(state: PinsState, action: PinsAction): PinsState {
  switch (action.type) {
    case "commit": {
      const pins = action.updater(state.pins);
      if (pins === state.pins) return state;
      return { pins, past: [...state.past, state.pins], future: [] };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      return {
        pins: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [state.pins, ...state.future],
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      return { pins: state.future[0], past: [...state.past, state.pins], future: state.future.slice(1) };
    }
    case "reset-history":
      return { pins: state.pins, past: [], future: [] };
  }
}

export function useCustomPins(options: UseCustomPinsOptions = {}) {
  const { maxPins = 100, generatePinId = (index) => `custom-pin-${index}` } = options;

  const [state, dispatch] = useReducer(pinsReducer, { pins: [], past: [], future: [] });
  const customPins = state.pins;
  const commit = useCallback(
    (updater: (prev: CustomPin[]) => CustomPin[]) => dispatch({ type: "commit", updater }),
    [],
  );
  const lastPinIndexRef = useRef<number>(0);

  const buildPin = useCallback(
    (lng: number, lat: number): PointFeature => {
      const pinIndex = lastPinIndexRef.current;
      lastPinIndexRef.current += 1;

      return {
        type: "Feature",
        properties: {
          identifier: generatePinId(pinIndex),
          name: `${lng.toFixed(4)}, ${lat.toFixed(4)}`,
          information: "",
          categories: [CATEGORIES.CUSTOM_MARK],
          campus: getCampusNameFromPoint(lng, lat) ?? "SJ",
          faculties: [],
          floors: [],
        },
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };
    },
    [generatePinId],
  );

  const addPin = useCallback(
    (lng: number, lat: number) => {
      if (customPins.length >= maxPins) {
        console.warn(`Maximum number of pins (${maxPins}) reached`);
        return null;
      }
      const newPin = buildPin(lng, lat);
      commit((prev) => [...prev, newPin]);
      return newPin;
    },
    [customPins.length, maxPins, buildPin, commit],
  );

  // Para una línea: el vértice nuevo se engancha al **extremo más cercano** al clic. Con append a secas,
  // editando una ruta ya dibujada un clic al principio del recorrido lo estiraba desde el final y
  // cruzaba el trazado entero.
  const addPinToNearestEnd = useCallback(
    (lng: number, lat: number) => {
      if (customPins.length >= maxPins) {
        console.warn(`Maximum number of pins (${maxPins}) reached`);
        return null;
      }
      const newPin = buildPin(lng, lat);
      commit((prev) => {
        if (prev.length < 2) return [...prev, newPin];
        const toStart = coordDistSq(prev[0].geometry.coordinates, [lng, lat]);
        const toEnd = coordDistSq(prev[prev.length - 1].geometry.coordinates, [lng, lat]);
        return toStart < toEnd ? [newPin, ...prev] : [...prev, newPin];
      });
      return newPin;
    },
    [customPins.length, maxPins, buildPin, commit],
  );

  const insertPin = useCallback(
    (lng: number, lat: number) => {
      if (customPins.length >= maxPins) {
        console.warn(`Maximum number of pins (${maxPins}) reached`);
        return null;
      }
      const newPin = buildPin(lng, lat);
      commit((prev) => {
        if (prev.length < 3) return [...prev, newPin];
        const ring = prev.map((pin) => pin.geometry.coordinates);
        const at = bestInsertIndex(ring, [lng, lat]);
        const next = prev.slice();
        next.splice(at, 0, newPin);
        return next;
      });
      return newPin;
    },
    [customPins.length, maxPins, buildPin, commit],
  );

  // Clear all pins
  const clearPins = useCallback(() => {
    commit((prev) => (prev.length === 0 ? prev : []));
  }, [commit]);

  // Reemplaza el set completo (restaurar un snapshot). lastPinIndexRef solo avanza, así un pin nuevo
  // nunca colisiona de id con uno restaurado.
  const setPins = useCallback(
    (next: CustomPin[]) => {
      commit((prev) => (prev === next ? prev : next));
    },
    [commit],
  );

  // Reemplaza la geometría completa en UN solo paso de historial (el cuadrado son 4 vértices, pero
  // deshacer debe devolver el estado anterior al cuadrado, no borrar esquina por esquina).
  const setPinsFromCoords = useCallback(
    (coords: [number, number][]) => {
      const next = coords.slice(0, maxPins).map(([lng, lat]) => buildPin(lng, lat));
      commit(() => next);
    },
    [buildPin, commit, maxPins],
  );

  const removePin = useCallback(
    (pinId: string) => {
      commit((prev) => {
        const next = prev.filter((pin) => pin.properties.identifier !== pinId);
        return next.length === prev.length ? prev : next;
      });
    },
    [commit],
  );

  // Update pin position
  const updatePinPosition = useCallback(
    (pinId: string, lng: number, lat: number) => {
      commit((prev) =>
        prev.map((pin) => {
          if (pin.properties.identifier === pinId) {
            return {
              ...pin,
              geometry: {
                ...pin.geometry,
                coordinates: [lng, lat],
              },
              properties: {
                ...pin.properties,
                campus: getCampusNameFromPoint(lng, lat) ?? pin.properties.campus,
              },
            };
          }
          return pin;
        }),
      );
    },
    [commit],
  );

  const handlePinDrag = useCallback(
    (event: MarkerDragEvent, pinId: string) => {
      updatePinPosition(pinId, event.lngLat.lng, event.lngLat.lat);
    },
    [updatePinPosition],
  );

  const polygon: null | PolygonFeature = useMemo(() => {
    if (customPins.length < 3) return null;

    const coordinates = customPins.map((pin) => pin.geometry.coordinates);

    // Asegura que el polígono esté cerrado (el primer punto se repite al final)
    const closedCoordinates =
      coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
      coordinates[0][1] === coordinates[coordinates.length - 1][1]
        ? coordinates
        : [...coordinates, coordinates[0]];

    // Si no es en sentido antihorario, lo revertimos (para GeoJSON válido)
    const isClockwise = booleanClockwise(closedCoordinates);
    const orderedCoordinates = isClockwise ? closedCoordinates.slice().reverse() : closedCoordinates;

    return {
      type: "Feature",
      properties: {
        identifier: "custom-polygon",
        name: "Área personalizada",
        information: "",
        categories: [CATEGORIES.CUSTOM_MARK],
        campus: "",
        faculties: [],
        floors: [],
      },
      geometry: {
        type: "Polygon",
        coordinates: [orderedCoordinates],
      },
    };
  }, [customPins]);

  // Al revés del polígono: la línea NO se cierra ni se reorienta. El orden de los vértices es el
  // recorrido, así que tocarlo cambiaría el trazado.
  const line: null | LineFeature = useMemo(() => {
    if (customPins.length < 2) return null;

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: customPins.map((pin) => pin.geometry.coordinates),
      },
    };
  }, [customPins]);

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const resetHistory = useCallback(() => dispatch({ type: "reset-history" }), []);

  return {
    pins: customPins,
    addPin,
    addPinToNearestEnd,
    insertPin,
    clearPins,
    setPins,
    setPinsFromCoords,
    removePin,
    handlePinDrag,
    undo,
    redo,
    resetHistory,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    pinsCount: customPins.length,
    maxPins,
    polygon,
    line,
  };
}
