import { booleanClockwise } from "@turf/boolean-clockwise";
import { centroid } from "@turf/centroid";

import { getCampusNameFromPoint, getFacultiesIdsFromPoint } from "@/lib/campus/getCampusBounds";
import { Feature } from "@/lib/types";

// Normaliza identificadores para comparaciones consistentes
export function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateRandomIdWithTimestamp() {
  const timestamp = Date.now().toString(36); // Get timestamp in base-36
  const randomPart = Math.random().toString(36).substring(2, 8); // Shorter random part
  return timestamp + randomPart; // Concatenate timestamp and random part
}

export function createFeatureFromPoints(points: any[], properties: any): Feature | null {
  if (points.length === 0) {
    return null;
  }

  let geometry: any;

  if (points.length === 1) {
    // Punto simple
    geometry = {
      type: "Point",
      coordinates: points[0].geometry.coordinates,
    };
  } else {
    // Polygon: debe tener al menos 3 puntos
    if (points.length < 3) {
      return null;
    }

    // Crear el polígono
    const coordinates = points.map((point) => point.geometry.coordinates);
    coordinates.push(coordinates[0]); // Cerrar el polígono

    geometry = {
      type: "Polygon",
      coordinates: [coordinates],
    };

    // Verificar orientación y corregir si es necesario
    if (booleanClockwise(geometry)) {
      geometry.coordinates[0].reverse();
    }
  }

  const feature: Feature = {
    type: "Feature",
    geometry,
    properties: {
      ...properties,
      campus: "",
      faculties: [],
    },
  };

  // Determinar campus y facultades
  if (geometry.type === "Point") {
    feature.properties.campus = getCampusNameFromPoint(geometry.coordinates[0], geometry.coordinates[1]) || "";
    feature.properties.faculties = getFacultiesIdsFromPoint(geometry.coordinates[0], geometry.coordinates[1]);
  } else {
    // Para polígonos, usar el centroide
    const center = centroid(feature as any);
    feature.properties.campus =
      getCampusNameFromPoint(center.geometry.coordinates[0], center.geometry.coordinates[1]) || "";
    feature.properties.faculties = getFacultiesIdsFromPoint(
      center.geometry.coordinates[0],
      center.geometry.coordinates[1],
    );
  }

  return feature;
}
