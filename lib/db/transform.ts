import type { EventFeature, Feature, RouteFeature } from "@/lib/types";

import type { Prisma } from "../../generated/prisma/client";

type PlaceWithRelations = Prisma.PlaceGetPayload<{
  include: {
    categories: { include: { category: true } };
    floors: { include: { floor: true } };
  };
}>;

type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    places: { include: { place: true } };
  };
}>;

type CampusWithRelations = Prisma.CampusGetPayload<{
  include: { places: false };
}>;

type RouteWithRelations = Prisma.RouteGetPayload<{
  include: {
    places: { include: { place: true } };
  };
}>;

export function placeToFeature(place: PlaceWithRelations, faculties?: string[]): Feature {
  const geometry = place.geometry as unknown as { type: "Point" | "Polygon" | "MultiPolygon"; coordinates: unknown };

  const categories = place.categories.map((pc: { category: { id: string } }) => pc.category.id);
  const floors = place.floors.map((pf: { floor: { id: number } }) => pf.floor.id);

  return {
    type: "Feature",
    properties: {
      identifier: place.id,
      name: place.name,
      information: place.information ?? "",
      categories,
      campus: place.campusId ?? "",
      faculties: faculties ?? [],
      floors: floors.length > 0 ? floors : undefined,
      needApproval: place.needApproval || undefined,
      proposalType: place.proposalType || undefined,
      parentPlaceId: place.parentPlaceId || undefined,
    },
    geometry: geometry as Feature["geometry"],
  };
}

export function campusToFeature(campus: CampusWithRelations): Feature {
  const geometry = campus.geometry as unknown as { type: "Point" | "Polygon" | "MultiPolygon"; coordinates: unknown };

  return {
    type: "Feature",
    geometry: geometry as Feature["geometry"],
    properties: {
      identifier: campus.id,
      name: campus.name,
      information: "",
      categories: [],
      campus: campus.shortName ?? campus.id,
      faculties: [],
    },
  };
}

type GeoGeometryType = "Point" | "Polygon" | "MultiPolygon" | "LineString";

export interface FeatureData {
  id: string;
  name: string;
  information: string;
  categories: string[];
  floors: number[];
  needApproval: boolean;
  proposalType: "edit" | null;
  geometryType: GeoGeometryType;
  geometry: Prisma.InputJsonValue;
  longitude: number | null;
  latitude: number | null;
  campusId: string | null;
  parentPlaceId: string | null;
}

export function featureToPlaceData(feature: Feature): FeatureData {
  const geometry = feature.geometry;
  let longitude: number | null = null;
  let latitude: number | null = null;

  if (geometry.type === "Point") {
    longitude = geometry.coordinates[0];
    latitude = geometry.coordinates[1];
  }

  return {
    id: feature.properties.identifier,
    name: feature.properties.name,
    information: feature.properties.information || "",
    categories: feature.properties.categories,
    floors: feature.properties.floors ?? [],
    needApproval: feature.properties.needApproval ?? false,
    proposalType: (feature.properties.proposalType ?? null) as "edit" | null,
    geometryType: geometry.type as GeoGeometryType,
    geometry: JSON.parse(JSON.stringify(geometry)) as Prisma.InputJsonValue,
    longitude,
    latitude,
    campusId: feature.properties.campus || null,
    parentPlaceId: feature.properties.parentPlaceId || null,
  };
}

// ----- Eventos -----

// Las fechas de eventos viajan como valor de <input type="datetime-local"> ("YYYY-MM-DDTHH:mm", sin zona).
// Se guardan y leen como UTC para que el ida y vuelta no dependa de la zona horaria del servidor.
const inputToDate = (s: string): Date => new Date(/([zZ]|[+-]\d\d:?\d\d)$/.test(s) ? s : `${s}Z`);
const dateToInput = (d: Date): string => d.toISOString().slice(0, 16);

export function eventToFeature(event: EventWithRelations, faculties?: string[]): EventFeature {
  const geometry = event.geometry as unknown as { type: "Point" | "Polygon" | "MultiPolygon"; coordinates: unknown };

  const parentPlaceIds = event.places.map((ep: { place: { id: string } }) => ep.place.id);

  const parentPlaceFloors: Record<string, number> = {};
  for (const ep of event.places as Array<{ place: { id: string }; floor: number | null }>) {
    if (ep.floor != null) parentPlaceFloors[ep.place.id] = ep.floor;
  }

  return {
    type: "Feature",
    properties: {
      identifier: event.id,
      name: event.name,
      information: event.information ?? "",
      categories: event.categories,
      campus: event.campusId ?? "",
      faculties: faculties ?? [],
      floors: event.floors.length > 0 ? event.floors : undefined,
      startDate: dateToInput(event.startDate),
      endDate: dateToInput(event.endDate),
      showFrom: event.showFrom ? dateToInput(event.showFrom) : undefined,
      parentPlaceIds,
      ...(Object.keys(parentPlaceFloors).length > 0 ? { parentPlaceFloors } : {}),
    },
    geometry: geometry as EventFeature["geometry"],
  };
}

export interface EventData {
  id: string;
  name: string;
  information: string;
  categories: string[];
  floors: number[];
  geometryType: GeoGeometryType;
  geometry: Prisma.InputJsonValue;
  longitude: number | null;
  latitude: number | null;
  campusId: string | null;
  startDate: Date;
  endDate: Date;
  showFrom: Date | null;
}

export function featureToEventData(feature: EventFeature): EventData {
  const geometry = feature.geometry;
  let longitude: number | null = null;
  let latitude: number | null = null;

  if (geometry.type === "Point") {
    longitude = geometry.coordinates[0];
    latitude = geometry.coordinates[1];
  }

  return {
    id: feature.properties.identifier,
    name: feature.properties.name,
    information: feature.properties.information || "",
    categories: feature.properties.categories,
    floors: feature.properties.floors ?? [],
    geometryType: geometry.type as GeoGeometryType,
    geometry: JSON.parse(JSON.stringify(geometry)) as Prisma.InputJsonValue,
    longitude,
    latitude,
    campusId: feature.properties.campus || null,
    startDate: inputToDate(feature.properties.startDate),
    endDate: inputToDate(feature.properties.endDate),
    showFrom: feature.properties.showFrom ? inputToDate(feature.properties.showFrom) : null,
  };
}

// ----- Rutas -----

export function routeToFeature(route: RouteWithRelations): RouteFeature {
  const geometry = route.geometry as unknown as { type: "LineString"; coordinates: [number, number][] };

  return {
    type: "Feature",
    properties: {
      identifier: route.id,
      name: route.name,
      information: route.information ?? "",
      categories: [],
      campus: route.campusId ?? "",
      faculties: [],
      placeIds: route.places.map((rp: { place: { id: string } }) => rp.place.id),
    },
    geometry,
  };
}

export interface RouteData {
  id: string;
  name: string;
  information: string;
  geometryType: GeoGeometryType;
  geometry: Prisma.InputJsonValue;
  longitude: number | null;
  latitude: number | null;
  campusId: string | null;
}

export function featureToRouteData(feature: RouteFeature): RouteData {
  const coordinates = feature.geometry.coordinates;

  // Una ruta no tiene un punto propio como sí lo tiene un lugar: se guarda el centroide de los
  // vértices para que el panel tenga a dónde encuadrar sin recorrer la línea entera.
  let longitude: number | null = null;
  let latitude: number | null = null;
  if (coordinates.length > 0) {
    longitude = coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length;
    latitude = coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length;
  }

  return {
    id: feature.properties.identifier,
    name: feature.properties.name,
    information: feature.properties.information || "",
    geometryType: feature.geometry.type as GeoGeometryType,
    geometry: JSON.parse(JSON.stringify(feature.geometry)) as Prisma.InputJsonValue,
    longitude,
    latitude,
    campusId: feature.properties.campus || null,
  };
}
