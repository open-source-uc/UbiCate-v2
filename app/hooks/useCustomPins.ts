"use client";

import { useState, useCallback, useRef, useMemo } from "react";

import { booleanClockwise } from "@turf/boolean-clockwise";
import type { MarkerDragEvent } from "react-map-gl/maplibre";

import { getCampusNameFromPoint } from "@/lib/campus/getCampusBounds";
import { CATEGORIES, PointFeature, PolygonFeature } from "@/lib/types";

type CustomPin = PointFeature;

interface UseCustomPinsOptions {
  maxPins?: number;
  generatePinId?: (index: number) => string;
}

export function useCustomPins(options: UseCustomPinsOptions = {}) {
  const { maxPins = 100, generatePinId = (index) => `custom-pin-${index}` } = options;

  const [customPins, setCustomPins] = useState<CustomPin[]>([]);
  const lastPinIndexRef = useRef<number>(0);

  const addPin = useCallback(
    (lng: number, lat: number, name?: string) => {
      if (customPins.length >= maxPins) {
        console.warn(`Maximum number of pins (${maxPins}) reached`);
        return null;
      }

      const pinIndex = lastPinIndexRef.current;
      lastPinIndexRef.current += 1;

      const newPin: PointFeature = {
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

      setCustomPins((prev) => [...prev, newPin]);
      return newPin;
    },
    [customPins.length, maxPins, generatePinId],
  );

  // Clear all pins
  const clearPins = useCallback(() => {
    setCustomPins([]);
  }, [setCustomPins]);

  // Update pin position
  const updatePinPosition = useCallback((pinId: string, lng: number, lat: number) => {
    setCustomPins((prev) =>
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
  }, []);

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

  return {
    pins: customPins,
    addPin,
    clearPins,
    handlePinDrag,
    pinsCount: customPins.length,
    maxPins,
    polygon,
  };
}
