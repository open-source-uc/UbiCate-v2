import { prisma } from "@/lib/prisma";
import type { Prisma } from "../generated/prisma/client";
import fs from "node:fs";
import path from "node:path";

type GeoGeometryType = "Point" | "Polygon" | "MultiPolygon";

type GeoJsonGeometry = {
  type: GeoGeometryType;
  coordinates: unknown;
};

type GeoJsonFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: Record<string, unknown>;
};

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const DATA_FILES = {
  campuses: path.resolve(process.cwd(), "prisma", "data", "campuses.json"),
  places: path.resolve(process.cwd(), "prisma", "data", "places.json"),
  newPlaces: path.resolve(process.cwd(), "prisma", "data", "newPlaces.json"),
};

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function readFeatureCollection(filePath: string): GeoJsonFeatureCollection {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as GeoJsonFeatureCollection;
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map((item) => cleanString(item))
        .filter((item): item is string => Boolean(item)),
    ),
  ];
}

function cleanNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item)),
    ),
  ];
}

function getCampusId(properties: Record<string, unknown>): string {
  const id = cleanString(properties.identifier) ?? cleanString(properties.campus);

  if (!id) {
    throw new Error(`Campus sin id válido: ${JSON.stringify(properties)}`);
  }

  return id;
}

function getPlaceId(properties: Record<string, unknown>): string {
  const id = cleanString(properties.identifier);

  if (!id) {
    throw new Error(`Place sin id válido: ${JSON.stringify(properties)}`);
  }

  return id;
}

function getPointCoordinates(geometry: GeoJsonGeometry): {
  longitude: number | null;
  latitude: number | null;
} {
  if (geometry.type !== "Point") {
    return { longitude: null, latitude: null };
  }

  if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
    return { longitude: null, latitude: null };
  }

  const longitude = Number(geometry.coordinates[0]);
  const latitude = Number(geometry.coordinates[1]);

  return {
    longitude: Number.isFinite(longitude) ? longitude : null,
    latitude: Number.isFinite(latitude) ? latitude : null,
  };
}

function getParentPlaceId(properties: Record<string, unknown>): string | null {
  const faculties = cleanStringArray(properties.faculties);
  return faculties[0] ?? null;
}

async function seedCampuses(features: GeoJsonFeature[]) {
  for (const feature of features) {
    const properties = feature.properties;
    const id = getCampusId(properties);

    await prisma.campus.upsert({
      where: { id },
      update: {
        name: cleanString(properties.name) ?? id,
        shortName: cleanString(properties.shortName),
        address: cleanString(properties.address),
        information: cleanString(properties.information),
        category: cleanString(properties.categories),
        geometryType: feature.geometry.type,
        geometry: toPrismaJson(feature.geometry),
      },
      create: {
        id,
        name: cleanString(properties.name) ?? id,
        shortName: cleanString(properties.shortName),
        address: cleanString(properties.address),
        information: cleanString(properties.information),
        category: cleanString(properties.categories),
        geometryType: feature.geometry.type,
        geometry: toPrismaJson(feature.geometry),
      },
    });
  }
}

async function seedCatalogs(placeFeatures: GeoJsonFeature[]) {
  const categories = new Set<string>();
  const floors = new Set<number>();

  for (const feature of placeFeatures) {
    cleanStringArray(feature.properties.categories).forEach((category) => categories.add(category));
    cleanNumberArray(feature.properties.floors).forEach((floor) => floors.add(floor));
  }

  if (categories.size > 0) {
    await prisma.category.createMany({
      data: [...categories].map((id) => ({ id, name: id })),
      skipDuplicates: true,
    });
  }

  if (floors.size > 0) {
    await prisma.floor.createMany({
      data: [...floors].map((id) => ({ id })),
      skipDuplicates: true,
    });
  }
}

async function seedPlaces(features: GeoJsonFeature[], validCampusIds: Set<string>) {
  for (const feature of features) {
    const properties = feature.properties;
    const id = getPlaceId(properties);
    const rawCampusId = cleanString(properties.campus);
    const campusId = rawCampusId && validCampusIds.has(rawCampusId) ? rawCampusId : null;
    const { longitude, latitude } = getPointCoordinates(feature.geometry);

    await prisma.place.upsert({
      where: { id },
      update: {
        name: cleanString(properties.name) ?? id,
        information: cleanString(properties.information),
        needApproval: Boolean(properties.needApproval ?? false),
        campusId,
        parentPlaceId: null,
        geometryType: feature.geometry.type,
        geometry: toPrismaJson(feature.geometry),
        longitude,
        latitude,
      },
      create: {
        id,
        name: cleanString(properties.name) ?? id,
        information: cleanString(properties.information),
        needApproval: Boolean(properties.needApproval ?? false),
        campusId,
        parentPlaceId: null,
        geometryType: feature.geometry.type,
        geometry: toPrismaJson(feature.geometry),
        longitude,
        latitude,
      },
    });
  }
}

async function seedPlaceRelations(features: GeoJsonFeature[]) {
  for (const feature of features) {
    const properties = feature.properties;
    const placeId = getPlaceId(properties);
    const categories = cleanStringArray(properties.categories);
    const floors = cleanNumberArray(properties.floors);

    await prisma.$transaction([
      prisma.placeCategory.deleteMany({ where: { placeId } }),
      prisma.placeFloor.deleteMany({ where: { placeId } }),
    ]);

    if (categories.length > 0) {
      await prisma.placeCategory.createMany({
        data: categories.map((categoryId) => ({ placeId, categoryId })),
        skipDuplicates: true,
      });
    }

    if (floors.length > 0) {
      await prisma.placeFloor.createMany({
        data: floors.map((floorId) => ({ placeId, floorId })),
        skipDuplicates: true,
      });
    }
  }
}

async function seedPlaceHierarchy(features: GeoJsonFeature[]) {
  const placeIds = new Set(features.map((feature) => getPlaceId(feature.properties)));
  const missingParents = new Map<string, string[]>();

  for (const feature of features) {
    const properties = feature.properties;
    const placeId = getPlaceId(properties);
    const parentPlaceId = getParentPlaceId(properties);

    if (!parentPlaceId || parentPlaceId === placeId) {
      await prisma.place.update({
        where: { id: placeId },
        data: { parentPlaceId: null },
      });
      continue;
    }

    if (!placeIds.has(parentPlaceId)) {
      const children = missingParents.get(parentPlaceId) ?? [];
      children.push(placeId);
      missingParents.set(parentPlaceId, children);

      await prisma.place.update({
        where: { id: placeId },
        data: { parentPlaceId: null },
      });
      continue;
    }

    await prisma.place.update({
      where: { id: placeId },
      data: { parentPlaceId },
    });
  }

  if (missingParents.size > 0) {
    console.warn("Parents referenciados en faculties que no existen como Place. Se dejaron en null:");
    for (const [parentId, children] of missingParents.entries()) {
      console.warn(`- ${parentId}: ${children.length} place(s)`);
    }
  }
}

async function main() {
  const campusesCollection = readFeatureCollection(DATA_FILES.campuses);
  const placesCollection = readFeatureCollection(DATA_FILES.places);
  const newPlacesCollection = readFeatureCollection(DATA_FILES.newPlaces);

  const campusFeatures = campusesCollection.features;
  const placeFeatures = [...placesCollection.features, ...newPlacesCollection.features];

  const validCampusIds = new Set(campusFeatures.map((feature) => getCampusId(feature.properties)));

  console.log(`Campuses a cargar: ${campusFeatures.length}`);
  console.log(`Places a cargar: ${placeFeatures.length}`);

  await seedCampuses(campusFeatures);
  await seedCatalogs(placeFeatures);
  await seedPlaces(placeFeatures, validCampusIds);
  await seedPlaceRelations(placeFeatures);
  await seedPlaceHierarchy(placeFeatures);

  console.log("Seed completado correctamente.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
