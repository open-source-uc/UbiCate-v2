import { useMemo } from "react";

import { centroid } from "@turf/turf";

import { getCampusBoundsFromPoint, getCampusNameFromPoint } from "@/utils/getCampusBounds";
import { Feature, PointFeature } from "@/utils/types";

export function useDirectionStatus(position: PointFeature | null, place: Feature | null) {
  const status = useMemo(() => {
    if (!navigator.geolocation || !position) {
      return { ok: false, error: "No podemos acceder a tu ubicación" };
    }

    if (!place) {
      return { ok: false, error: "No podemos calcular la ruta para este lugar" };
    }

    const campus = place.properties?.campus;
    if (!["SJ", "LC", "SanJoaquin", "LoContador"].includes(campus)) {
      return { ok: false, error: `Las rutas en ${campus} no estan activas.` };
    }

    let destination: [number, number] | null = null;

    if (place.geometry.type === "Point") {
      destination = place.geometry.coordinates as [number, number];
    } else if (place.geometry.type === "Polygon") {
      destination = centroid(place.geometry).geometry.coordinates as [number, number];
    } else {
      return { ok: false, error: "No podemos calcular la ruta para este lugar" };
    }

    const origin = position.geometry.coordinates;

    const originCampus = getCampusBoundsFromPoint(origin[0], origin[1]);
    const destCampus = getCampusBoundsFromPoint(destination[0], destination[1]);

    if (!originCampus) {
      return { ok: false, error: "No podemos calcular la ruta si te encuentras fuera del campus" };
    }

    if (!destCampus) {
      return {
        ok: false,
        error:
          "Hmm... el punto de destino no está dentro de algún campus, esto es muy raro, por favor reporta este bug",
      };
    }

    if (getCampusNameFromPoint(destination[0], destination[1]) !== getCampusNameFromPoint(origin[0], origin[1])) {
      return { ok: false, error: "No podemos calcular la ruta entre campus distintos" };
    }

    return { ok: true, destination };
  }, [position, place]);

  return status;
}
