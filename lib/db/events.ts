import { getParentPlaceFloor } from "@/lib/places/utils";
import { prisma } from "@/lib/prisma";
import { GRACE_PERIOD_MS, type EventFeature, type Feature } from "@/lib/types";
import { nowInChile } from "@/lib/utils/time";

import { cache } from "./cache";
import { eventToFeature, featureToEventData, featureToPlaceData, placeToFeature } from "./transform";

const CACHE_KEY_EVENTS = "allEvents";
const CACHE_TTL = 5 * 60 * 1000;

const eventInclude = {
  places: { include: { place: true } },
} as const;

const inlinePlaceInclude = {
  categories: { include: { category: true } },
  floors: { include: { floor: true } },
} as const;

async function loadAllEvents(): Promise<{ events: EventFeature[]; eventPlaces: Feature[] }> {
  const [events, inlinePlaces] = await Promise.all([
    prisma.event.findMany({ include: eventInclude }),
    prisma.place.findMany({ where: { isEventOnly: true }, include: inlinePlaceInclude }),
  ]);

  return {
    events: events.map((e) => eventToFeature(e)),
    eventPlaces: inlinePlaces.map((p) => placeToFeature(p)),
  };
}

export async function getAllEvents(options?: {
  bypassCache?: boolean;
}): Promise<{ events: EventFeature[]; eventPlaces: Feature[] }> {
  // bypassCache=true → salta la Capa 1 y lee directo de la BD (debug / refetch post-mutación).
  return cache.getOrLoad(CACHE_KEY_EVENTS, loadAllEvents, {
    ttlMs: CACHE_TTL,
    forceFresh: options?.bypassCache,
  });
}

// Crea una fila Place "inline" (isEventOnly=true) para una ubicación nueva de un evento.
function inlinePlaceCreateData(feature: Feature) {
  const data = featureToPlaceData(feature);
  return {
    id: data.id,
    name: data.name,
    information: data.information,
    needApproval: false,
    isEventOnly: true,
    campusId: data.campusId,
    geometryType: data.geometryType,
    geometry: data.geometry,
    longitude: data.longitude,
    latitude: data.latitude,
    categories: {
      create: data.categories.map((catId) => ({
        category: { connectOrCreate: { where: { id: catId }, create: { id: catId, name: catId } } },
      })),
    },
    floors: {
      create: data.floors.map((floorId) => ({
        floor: { connectOrCreate: { where: { id: floorId }, create: { id: floorId } } },
      })),
    },
  };
}

// Elimina lugares inline (isEventOnly) que ya no están enlazados a ningún evento.
async function cleanupOrphanInlinePlaces(): Promise<void> {
  await prisma.place.deleteMany({ where: { isEventOnly: true, eventLinks: { none: {} } } });
}

// event.properties.parentPlaceIds contiene TODOS los ids a enlazar (existentes + inline nuevos).
// newPlaces son los Features inline a crear como Place (isEventOnly).
export async function createEvent(event: EventFeature, newPlaces: Feature[]): Promise<void> {
  const data = featureToEventData(event);
  const parentPlaceIds = event.properties.parentPlaceIds ?? [];

  await prisma.$transaction(async (tx) => {
    const inlineData = newPlaces.map((p) => inlinePlaceCreateData(p));
    const existing = await tx.place.findMany({
      where: { id: { in: inlineData.map((d) => d.id) } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((p) => p.id));
    for (const data of inlineData) {
      if (!existingIds.has(data.id)) await tx.place.create({ data });
    }

    await tx.event.create({
      data: {
        id: data.id,
        name: data.name,
        information: data.information,
        campusId: data.campusId,
        geometryType: data.geometryType,
        geometry: data.geometry,
        longitude: data.longitude,
        latitude: data.latitude,
        categories: data.categories,
        floors: data.floors,
        startDate: data.startDate,
        endDate: data.endDate,
        showFrom: data.showFrom,
        places: {
          create: parentPlaceIds.map((placeId) => ({
            place: { connect: { id: placeId } },
            floor: getParentPlaceFloor(event.properties, placeId) ?? null,
          })),
        },
      },
    });
  });

  cache.invalidate(CACHE_KEY_EVENTS);
}

export async function updateEvent(id: string, event: EventFeature, newPlaces: Feature[]): Promise<void> {
  const data = featureToEventData(event);
  const parentPlaceIds = event.properties.parentPlaceIds ?? [];

  await prisma.$transaction(async (tx) => {
    await tx.eventPlace.deleteMany({ where: { eventId: id } });

    const inlineData = newPlaces.map((p) => inlinePlaceCreateData(p));
    const existing = await tx.place.findMany({
      where: { id: { in: inlineData.map((d) => d.id) } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((p) => p.id));
    for (const data of inlineData) {
      if (!existingIds.has(data.id)) await tx.place.create({ data });
    }

    await tx.event.update({
      where: { id },
      data: {
        name: data.name,
        information: data.information,
        campusId: data.campusId,
        geometryType: data.geometryType,
        geometry: data.geometry,
        longitude: data.longitude,
        latitude: data.latitude,
        categories: data.categories,
        floors: data.floors,
        startDate: data.startDate,
        endDate: data.endDate,
        showFrom: data.showFrom,
        places: {
          create: parentPlaceIds.map((placeId) => ({
            place: { connect: { id: placeId } },
            floor: getParentPlaceFloor(event.properties, placeId) ?? null,
          })),
        },
      },
    });
  });

  await cleanupOrphanInlinePlaces();
  cache.invalidate(CACHE_KEY_EVENTS);
}

export async function deleteEvent(id: string): Promise<void> {
  await prisma.event.delete({ where: { id } });
  await cleanupOrphanInlinePlaces();
  cache.invalidate(CACHE_KEY_EVENTS);
}

// keepIds exceptúa eventos que no deben borrarse (p. ej. el que una mutación acaba de escribir).
export async function pruneExpiredEvents(keepIds: string[] = []): Promise<boolean> {
  // endDate en la BD es la hora de pared de Chile guardada como UTC, así que el corte tiene que
  // calcularse desde la hora Chile: con Date.now() (UTC real) se borraban eventos 3-4 horas antes.
  const cutoff = new Date(nowInChile().getTime() - GRACE_PERIOD_MS);
  const { count } = await prisma.event.deleteMany({
    where: { endDate: { lt: cutoff }, id: { notIn: keepIds } },
  });
  await cleanupOrphanInlinePlaces();
  if (count > 0) cache.invalidate(CACHE_KEY_EVENTS);
  return count > 0;
}
