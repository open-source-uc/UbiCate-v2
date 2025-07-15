import { useMemo } from "react";

import { centroid } from "@turf/turf";

import { getCampusEntryPoint, getCampusNameFromPoint } from "@/utils/getCampusBounds";
import { Feature, PointFeature } from "@/utils/types";

export function useDirectionStatus(
  position: PointFeature | null,
  place: Feature | null,
): {
  ok: boolean;
  error?: string;
  destination?: [number, number];
  origin?: [number, number];
} {
  const status = useMemo(() => {
    if (!place) {
      return { ok: false, error: "No podemos calcular la ruta para este lugar." };
    }

    let destination: [number, number] | null = null;
    if (place.geometry.type === "Point") {
      destination = place.geometry.coordinates as [number, number];
    } else if (place.geometry.type === "Polygon") {
      destination = centroid(place.geometry).geometry.coordinates as [number, number];
    } else {
      return { ok: false, error: "No podemos calcular la ruta para este lugar" };
    }

    const destCampus = getCampusNameFromPoint(destination[0], destination[1]);
    if (!destCampus) {
      return { ok: false, error: "No podemos calcular la ruta para este lugar" };
    }

    const validCampuses = ["SJ", "SanJoaquin", "LC", "LoContador"];
    if (!validCampuses.includes(destCampus)) {
      return { ok: false, error: `Las rutas en ${destCampus} no están activas.` };
    }

    let origin: [number, number] | null = null;

    if (position?.geometry.coordinates) {
      origin = position.geometry.coordinates as [number, number];

      const originCampus = getCampusNameFromPoint(origin[0], origin[1]);

      if (!originCampus || originCampus !== destCampus) {
        const entryPoint = getCampusEntryPoint(destCampus);
        if (!entryPoint) {
          return { ok: false, error: `No encontramos el punto de entrada para ${destCampus}` };
        }
        origin = entryPoint;
      }
    } else {
      origin = getCampusEntryPoint(destCampus);
      if (!origin) {
        return { ok: false, error: "No podemos calcular la ruta si no tenemos tu ubicación" };
      }
    }

    const originCampus = getCampusNameFromPoint(origin[0], origin[1]);

    if (!originCampus) {
      return { ok: false, error: "Error en la determinación del origen de la ruta" };
    }
    if (!validCampuses.includes(originCampus)) {
      return { ok: false, error: `Las rutas en ${originCampus} no están activas.` };
    }

    if (!validCampuses.includes(originCampus)) {
      return { ok: false, error: `Las rutas en ${originCampus} no están activas.` };
    }

    return { ok: true, destination, origin };
  }, [position, place]);

  return status;
}
