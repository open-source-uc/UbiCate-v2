import { booleanPointInPolygon, point, polygon } from "@turf/turf";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Feature } from "@/lib/types";

import { cache } from "./cache";
import { campusToFeature, featureToPlaceData, placeToFeature } from "./transform";

const CACHE_KEY_PLACES = "allPlaces";
const CACHE_KEY_CAMPUSES = "campuses";
const CACHE_TTL = 5 * 60 * 1000;

function computeFacultiesForPoint(lng: number, lat: number, allFeatures: Feature[]): string[] {
  const p = point([lng, lat]);
  const faculties: string[] = [];

  for (const feature of allFeatures) {
    if (feature.properties.categories.includes("faculty") && feature.geometry.type === "Polygon") {
      const poly = polygon(feature.geometry.coordinates);
      if (booleanPointInPolygon(p, poly)) {
        faculties.push(feature.properties.identifier);
      }
    }
  }

  return faculties;
}

function computeFacultiesForAll(allFeatures: Feature[]): Feature[] {
  return allFeatures.map((f) => {
    if (f.geometry.type !== "Point") return f;
    const [lng, lat] = f.geometry.coordinates;
    return {
      ...f,
      properties: {
        ...f.properties,
        faculties: computeFacultiesForPoint(lng, lat, allFeatures),
      },
    };
  });
}

async function loadAndCacheAllPlaces(): Promise<{ approved: Feature[]; newPlaces: Feature[] }> {
  const places = await prisma.place.findMany({
    include: {
      campus: true,
      categories: { include: { category: true } },
      floors: { include: { floor: true } },
    },
  });

  const features = places.map((p) => placeToFeature(p));
  const withFaculties = computeFacultiesForAll(features);

  const result = {
    approved: withFaculties.filter((f) => !f.properties.needApproval),
    newPlaces: withFaculties.filter((f) => f.properties.needApproval),
  };

  cache.set(CACHE_KEY_PLACES, result, CACHE_TTL);
  return result;
}

async function loadAndCacheCampuses(): Promise<Feature[]> {
  const campuses = await prisma.campus.findMany();
  const features = campuses.map(campusToFeature);
  cache.set(CACHE_KEY_CAMPUSES, features, CACHE_TTL);
  return features;
}

export async function getAllPlaces(): Promise<{ approved: Feature[]; newPlaces: Feature[] }> {
  const cached = cache.get<{ approved: Feature[]; newPlaces: Feature[] }>(CACHE_KEY_PLACES);
  if (cached) return cached;
  return loadAndCacheAllPlaces();
}

export async function getCampuses(): Promise<Feature[]> {
  const cached = cache.get<Feature[]>(CACHE_KEY_CAMPUSES);
  if (cached) return cached;
  return loadAndCacheCampuses();
}

export async function getPlaceById(id: string): Promise<Feature | null> {
  const { approved, newPlaces } = await getAllPlaces();
  const normalized = id.trim().toUpperCase().replace(/\s+/g, "");
  return (
    approved.find((p) => p.properties.identifier.trim().toUpperCase().replace(/\s+/g, "") === normalized) ??
    newPlaces.find((p) => p.properties.identifier.trim().toUpperCase().replace(/\s+/g, "") === normalized) ??
    null
  );
}

export async function getFacultyForPoint(lng: number, lat: number): Promise<string[]> {
  const { approved, newPlaces } = await getAllPlaces();
  const all = [...approved, ...newPlaces];
  return computeFacultiesForPoint(lng, lat, all);
}

export async function getCampusNameForPoint(lng: number, lat: number): Promise<string | null> {
  const campuses = await getCampuses();
  const p = point([lng, lat]);

  for (const campus of campuses) {
    if (campus.geometry.type === "Polygon") {
      const poly = polygon(campus.geometry.coordinates);
      if (booleanPointInPolygon(p, poly)) {
        return campus.properties.identifier;
      }
    }
  }

  return null;
}

export async function createPlace(feature: Feature): Promise<void> {
  const data = featureToPlaceData(feature);

  await prisma.place.create({
    data: {
      id: data.id,
      name: data.name,
      information: data.information,
      needApproval: data.needApproval,
      proposalType: data.proposalType,
      campusId: data.campusId,
      parentPlaceId: data.parentPlaceId,
      geometryType: data.geometryType,
      geometry: data.geometry,
      longitude: data.longitude,
      latitude: data.latitude,
      categories: {
        create: data.categories.map((catId) => ({
          category: {
            connectOrCreate: {
              where: { id: catId },
              create: { id: catId, name: catId },
            },
          },
        })),
      },
      floors: {
        create: data.floors.map((floorId) => ({
          floor: {
            connectOrCreate: {
              where: { id: floorId },
              create: { id: floorId },
            },
          },
        })),
      },
    },
  });

  cache.invalidate();
}

export async function updatePlace(id: string, feature: Feature): Promise<void> {
  const data = featureToPlaceData(feature);

  await prisma.$transaction(async (tx) => {
    await tx.placeCategory.deleteMany({ where: { placeId: id } });
    await tx.placeFloor.deleteMany({ where: { placeId: id } });

    await tx.place.update({
      where: { id },
      data: {
        name: data.name,
        information: data.information,
        needApproval: data.needApproval,
        campusId: data.campusId,
        parentPlaceId: data.parentPlaceId,
        geometryType: data.geometryType,
        geometry: data.geometry,
        longitude: data.longitude,
        latitude: data.latitude,
        categories: {
          create: data.categories.map((catId) => ({
            category: {
              connectOrCreate: {
                where: { id: catId },
                create: { id: catId, name: catId },
              },
            },
          })),
        },
        floors: {
          create: data.floors.map((floorId) => ({
            floor: {
              connectOrCreate: {
                where: { id: floorId },
                create: { id: floorId },
              },
            },
          })),
        },
      },
    });
  });

  cache.invalidate();
}

export async function approvePlace(id: string): Promise<void> {
  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      floors: { include: { floor: true } },
    },
  });
  if (!place) throw new Error("Place not found");

  if (place.proposalType === "edit" && place.parentPlaceId) {
    await prisma.$transaction(async (tx) => {
      await tx.placeCategory.deleteMany({ where: { placeId: place.parentPlaceId! } });
      await tx.placeFloor.deleteMany({ where: { placeId: place.parentPlaceId! } });
      await tx.place.update({
        where: { id: place.parentPlaceId! },
        data: {
          name: place.name,
          information: place.information,
          geometryType: place.geometryType,
          geometry: place.geometry as Prisma.InputJsonValue,
          longitude: place.longitude,
          latitude: place.latitude,
          categories: {
            create: place.categories.map((pc) => ({
              category: { connect: { id: pc.category.id } },
            })),
          },
          floors: {
            create: place.floors.map((pf) => ({
              floor: { connect: { id: pf.floor.id } },
            })),
          },
        },
      });
      await tx.place.delete({ where: { id } });
    });
  } else {
    await prisma.place.update({
      where: { id },
      data: { needApproval: false },
    });
  }
  cache.invalidate();
}

export async function rejectPlace(id: string): Promise<void> {
  await prisma.place.delete({ where: { id } });
  cache.invalidate();
}

export async function deletePlace(id: string): Promise<void> {
  await prisma.place.delete({ where: { id } });
  cache.invalidate();
}

export function initCache(): void {
  cache.startRefresh(CACHE_KEY_PLACES, CACHE_TTL, () => loadAndCacheAllPlaces().then(() => {}));
}

export async function normalizeIdentifierExists(identifier: string): Promise<boolean> {
  const normalized = identifier.trim().toUpperCase().replace(/\s+/g, "");
  const place = await prisma.place.findFirst({
    where: { id: { equals: normalized } },
    select: { id: true },
  });
  return place !== null;
}
