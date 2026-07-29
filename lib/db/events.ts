import { prisma } from "@/lib/prisma";
import type { EventFeature, Feature } from "@/lib/types";

import { cache } from "./cache";
import { eventToFeature, featureToEventData, featureToPlaceData, placeToFeature } from "./transform";

const CACHE_KEY_EVENTS = "allEvents";
const CACHE_TTL = 5 * 60 * 1000;

const eventInclude = {
  campus: true,
  places: { include: { place: true } },
} as const;

const inlinePlaceInclude = {
  campus: true,
  categories: { include: { category: true } },
  floors: { include: { floor: true } },
} as const;

async function loadAndCacheAllEvents(): Promise<{ events: EventFeature[]; eventPlaces: Feature[] }> {
  const [events, inlinePlaces] = await Promise.all([
    prisma.event.findMany({ include: eventInclude }),
    prisma.place.findMany({ where: { isEventOnly: true }, include: inlinePlaceInclude }),
  ]);

  const result = {
    events: events.map((e) => eventToFeature(e)),
    eventPlaces: inlinePlaces.map((p) => placeToFeature(p)),
  };

  cache.set(CACHE_KEY_EVENTS, result, CACHE_TTL);
  return result;
}

export async function getAllEvents(options?: {
  bypassCache?: boolean;
}): Promise<{ events: EventFeature[]; eventPlaces: Feature[] }> {
  // bypassCache=true → salta la Capa 1 y lee directo de la BD (debug / refetch post-mutación).
  if (!options?.bypassCache) {
    const cached = cache.get<{ events: EventFeature[]; eventPlaces: Feature[] }>(CACHE_KEY_EVENTS);
    if (cached) return cached;
  }
  return loadAndCacheAllEvents();
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
    for (const place of newPlaces) {
      await tx.place.create({ data: inlinePlaceCreateData(place) });
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
          create: parentPlaceIds.map((placeId) => ({ place: { connect: { id: placeId } } })),
        },
      },
    });
  });

  cache.invalidate();
}

export async function updateEvent(id: string, event: EventFeature, newPlaces: Feature[]): Promise<void> {
  const data = featureToEventData(event);
  const parentPlaceIds = event.properties.parentPlaceIds ?? [];

  await prisma.$transaction(async (tx) => {
    await tx.eventPlace.deleteMany({ where: { eventId: id } });

    for (const place of newPlaces) {
      await tx.place.create({ data: inlinePlaceCreateData(place) });
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
          create: parentPlaceIds.map((placeId) => ({ place: { connect: { id: placeId } } })),
        },
      },
    });
  });

  await cleanupOrphanInlinePlaces();
  cache.invalidate();
}

export async function deleteEvent(id: string): Promise<void> {
  await prisma.event.delete({ where: { id } });
  await cleanupOrphanInlinePlaces();
  cache.invalidate();
}
