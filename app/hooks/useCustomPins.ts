"use client";

import { useState, useCallback, useRef } from "react";

import { MarkerDragEvent } from "react-map-gl";

import { getCampusNameFromPoint } from "@/utils/getCampusBounds";
import { CategoryEnum, PointFeature } from "@/utils/types";

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
          categories: [CategoryEnum.CUSTOM_MARK],
          campus: getCampusNameFromPoint(lng, lat) ?? "SJ",
          faculties: "",
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

  return {
    pins: customPins,
    addPin,
    clearPins,
    handlePinDrag,
    pinsCount: customPins.length,
    maxPins,
  };
}

export default useCustomPins;
