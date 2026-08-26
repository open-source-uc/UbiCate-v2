import { prisma } from "@/lib/prisma";
import {
  CATEGORIES,
  type EventFeature,
  type EventProperties,
  type Feature,
  type PointGeometry,
  type PolygonGeometry,
  type Properties,
  type RouteFeature,
  type RouteProperties,
} from "@/lib/types";
import { nowInChile } from "@/lib/utils/time";

export const CAMPUS_ID = "TEST_SJ";

/** Dentro del campus y también dentro del polígono de FACULTY_ID. */
export const INSIDE: [number, number] = [-70.61, -33.5];
/** Fuera del campus. */
export const OUTSIDE: [number, number] = [-70.5, -33.4];

export const FACULTY_ID = "TEST_FACULTAD";

const CAMPUS_RING: [number, number][] = [
  [-70.62, -33.51],
  [-70.6, -33.51],
  [-70.6, -33.49],
  [-70.62, -33.49],
  [-70.62, -33.51],
];

const FACULTY_RING: [number, number][] = [
  [-70.615, -33.505],
  [-70.605, -33.505],
  [-70.605, -33.495],
  [-70.615, -33.495],
  [-70.615, -33.505],
];

export async function seedCampus(): Promise<void> {
  await prisma.campus.create({
    data: {
      id: CAMPUS_ID,
      name: "Campus de prueba",
      shortName: "TSJ",
      geometryType: "Polygon",
      geometry: { type: "Polygon", coordinates: [CAMPUS_RING] },
    },
  });
}

function baseProperties(identifier: string): Properties {
  return {
    identifier,
    name: `Lugar ${identifier}`,
    information: "Información de prueba",
    categories: [CATEGORIES.OTHER],
    campus: CAMPUS_ID,
    faculties: [],
    floors: [1],
  };
}

interface FeatureOverrides {
  properties?: Partial<Properties>;
  geometry?: PointGeometry | PolygonGeometry;
}

export function makePlaceFeature(identifier: string, overrides: FeatureOverrides = {}): Feature {
  return {
    type: "Feature",
    properties: { ...baseProperties(identifier), ...overrides.properties },
    geometry: overrides.geometry ?? { type: "Point", coordinates: [...INSIDE] },
  };
}

/** Polígono que contiene a INSIDE. Con la categoría `faculty` alimenta el índice de facultades. */
export function makeFacultyFeature(identifier: string = FACULTY_ID, overrides: FeatureOverrides = {}): Feature {
  return {
    type: "Feature",
    properties: {
      ...baseProperties(identifier),
      categories: [CATEGORIES.FACULTY],
      floors: undefined,
      ...overrides.properties,
    },
    geometry: overrides.geometry ?? {
      type: "Polygon",
      coordinates: [FACULTY_RING.map((c) => [...c] as [number, number])],
    },
  };
}

export function makeRouteFeature(identifier: string, overrides: Partial<RouteProperties> = {}): RouteFeature {
  return {
    type: "Feature",
    properties: {
      identifier,
      name: `Ruta ${identifier}`,
      information: "Recorrido de prueba",
      categories: [],
      campus: CAMPUS_ID,
      faculties: [],
      placeIds: [],
      color: null,
      ...overrides,
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [-70.615, -33.505],
        [-70.61, -33.5],
        [-70.605, -33.495],
      ],
    },
  };
}

/** Hora de pared de Chile en el formato de <input type="datetime-local">, que es como viajan las fechas. */
export function chileInput(offsetMs = 0): string {
  return new Date(nowInChile().getTime() + offsetMs).toISOString().slice(0, 16);
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function makeEventFeature(identifier: string, overrides: Partial<EventProperties> = {}): EventFeature {
  return {
    type: "Feature",
    properties: {
      identifier,
      name: `Evento ${identifier}`,
      information: "Evento de prueba",
      categories: [CATEGORIES.EVENTS],
      campus: CAMPUS_ID,
      faculties: [],
      floors: [1],
      startDate: chileInput(DAY_MS),
      endDate: chileInput(2 * DAY_MS),
      parentPlaceIds: [],
      ...overrides,
    },
    geometry: { type: "Point", coordinates: [...INSIDE] },
  };
}
