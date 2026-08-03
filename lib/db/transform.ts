import type { EventFeature, Feature } from "@/lib/types";

import type { Prisma } from "../../generated/prisma/client";

type PlaceWithRelations = Prisma.PlaceGetPayload<{
  include: {
    campus: true;
    categories: { include: { category: true } };
    floors: { include: { floor: true } };
  };
}>;

type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    campus: true;
    places: { include: { place: true } };
  };
}>;

type CampusWithRelations = Prisma.CampusGetPayload<{
  include: { places: false };
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

type GeoGeometryType = "Point" | "Polygon" | "MultiPolygon";

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
