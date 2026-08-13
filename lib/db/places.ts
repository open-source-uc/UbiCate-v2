import { bbox, booleanPointInPolygon, point, polygon } from "@turf/turf";

import type { Prisma } from "@/generated/prisma/client";
import { buildCachedPayload, type CachedPayload } from "@/lib/api/httpCache";
import { prisma } from "@/lib/prisma";
import type { Feature } from "@/lib/types";

import { cache } from "./cache";
import { campusToFeature, featureToPlaceData, placeToFeature } from "./transform";

const CACHE_KEY_PLACES = "allPlaces";
const CACHE_KEY_CAMPUSES = "campuses";
const CACHE_TTL = 5 * 60 * 1000;

interface FacultyArea {
  identifier: string;
  area: GeoJSON.Feature<GeoJSON.Polygon>;
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

function buildFacultyIndex(allFeatures: Feature[]): FacultyArea[] {
  const index: FacultyArea[] = [];

  for (const feature of allFeatures) {
    if (feature.geometry.type !== "Polygon" || !feature.properties.categories.includes("faculty")) continue;
    const area = polygon(feature.geometry.coordinates);
    const box = bbox(area);
    index.push({
      identifier: feature.properties.identifier,
      area,
      minLng: box[0],
      minLat: box[1],
      maxLng: box[2],
      maxLat: box[3],
    });
  }

  return index;
}

function facultiesForPoint(lng: number, lat: number, index: FacultyArea[]): string[] {
  const faculties: string[] = [];
  let p: GeoJSON.Feature<GeoJSON.Point> | null = null;

  for (const faculty of index) {
    if (lng < faculty.minLng || lng > faculty.maxLng || lat < faculty.minLat || lat > faculty.maxLat) continue;
    p ??= point([lng, lat]);
    if (booleanPointInPolygon(p, faculty.area)) faculties.push(faculty.identifier);
  }

  return faculties;
}

function assignFaculties(allFeatures: Feature[]): Feature[] {
  const index = buildFacultyIndex(allFeatures);

  for (const feature of allFeatures) {
    if (feature.geometry.type !== "Point") continue;
    const [lng, lat] = feature.geometry.coordinates;
    feature.properties.faculties = facultiesForPoint(lng, lat, index);
  }

  return allFeatures;
}

export interface PlacesData {
  approved: Feature[];
  newPlaces: Feature[];
  response: CachedPayload;
}

async function loadAllPlaces(): Promise<PlacesData> {
  const places = await prisma.place.findMany({
    // isEventOnly: lugares creados inline dentro de un evento. Se sirven solo vía /api/events,
    // nunca en el mapa normal.
    where: { isEventOnly: false },
    include: {
      categories: { include: { category: true } },
      floors: { include: { floor: true } },
    },
  });

  const withFaculties = assignFaculties(places.map((p) => placeToFeature(p)));

  const approved = withFaculties.filter((f) => !f.properties.needApproval);
  const newPlaces = withFaculties.filter((f) => f.properties.needApproval);

  const response = await buildCachedPayload({
    message: "Success",
    approved_places: { type: "FeatureCollection", features: approved },
    new_places: { type: "FeatureCollection", features: newPlaces },
  });

  return { approved, newPlaces, response };
}

async function loadCampuses(): Promise<Feature[]> {
  const campuses = await prisma.campus.findMany();
  return campuses.map(campusToFeature);
}

export async function getAllPlaces(options?: { bypassCache?: boolean }): Promise<PlacesData> {
  // bypassCache=true → salta la Capa 1 (cache en memoria) y lee directo de la BD.
  // Lo usan el modo debug (siempre datos frescos) y el refetch post-mutación.
  return cache.getOrLoad(CACHE_KEY_PLACES, loadAllPlaces, {
    ttlMs: CACHE_TTL,
    forceFresh: options?.bypassCache,
  });
}

export async function getCampuses(): Promise<Feature[]> {
  return cache.getOrLoad(CACHE_KEY_CAMPUSES, loadCampuses, { ttlMs: CACHE_TTL });
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
  return facultiesForPoint(lng, lat, buildFacultyIndex([...approved, ...newPlaces]));
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

  cache.invalidate(CACHE_KEY_PLACES);
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

  cache.invalidate(CACHE_KEY_PLACES);
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
  cache.invalidate(CACHE_KEY_PLACES);
}

export async function rejectPlace(id: string): Promise<void> {
  await prisma.place.delete({ where: { id } });
  cache.invalidate(CACHE_KEY_PLACES);
}

export async function deletePlace(id: string): Promise<void> {
  await prisma.place.delete({ where: { id } });
  cache.invalidate();
}

export async function normalizeIdentifierExists(identifier: string): Promise<boolean> {
  const normalized = identifier.trim().toUpperCase().replace(/\s+/g, "");
  const place = await prisma.place.findFirst({
    where: { id: { equals: normalized } },
    select: { id: true },
  });
  return place !== null;
}
