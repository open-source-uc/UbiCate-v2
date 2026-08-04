/**
 * Seed: reconstruye TODA la base desde prisma/data/*.json.
 *
 * Flujo pensado para levantar el proyecto en una máquina limpia:
 *   npx prisma migrate reset   → borra la BD, aplica las migraciones en orden y corre este seed
 *   (o `npm run db:seed` sobre una BD ya migrada y vacía)
 *
 * Cubre todo lo que agregaron las migraciones: proposalType, isEventOnly, eventos y el piso por
 * lugar en event_place. Si mañana el schema crece, este archivo tiene que crecer con él o un init
 * limpio quedará incompleto.
 */
import fs from "node:fs";
import path from "node:path";

import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

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

const DATA_DIR = path.resolve(process.cwd(), "prisma", "data");

const DATA_FILES = {
  campuses: path.join(DATA_DIR, "campuses.json"),
  places: path.join(DATA_DIR, "places.json"),
  newPlaces: path.join(DATA_DIR, "newPlaces.json"),
  eventPlaces: path.join(DATA_DIR, "eventPlaces.json"),
};

const CHUNK_SIZE = 1000;

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

// eventPlaces.json es opcional: sin eventos el resto del seed sigue siendo válido.
function readFeatureCollection(filePath: string, optional = false): GeoJsonFeatureCollection {
  if (!fs.existsSync(filePath)) {
    if (optional) return { type: "FeatureCollection", features: [] };
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

  return [...new Set(value.map((item) => cleanString(item)).filter((item): item is string => Boolean(item)))];
}

function cleanNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map((item) => Number(item)).filter((item) => Number.isInteger(item)))];
}

function chunk<T>(items: T[], size = CHUNK_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
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
  if (geometry.type !== "Point" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
    return { longitude: null, latitude: null };
  }

  const longitude = Number(geometry.coordinates[0]);
  const latitude = Number(geometry.coordinates[1]);

  return {
    longitude: Number.isFinite(longitude) ? longitude : null,
    latitude: Number.isFinite(latitude) ? latitude : null,
  };
}

// Mismas reglas que lib/db/transform.ts: las fechas de evento viajan como valor de
// <input type="datetime-local"> (sin zona) y se guardan como UTC, para que el ida y vuelta no
// dependa de la zona horaria de la máquina que corre el seed.
function parseEventDate(value: unknown, field: string, eventId: string): Date {
  const raw = cleanString(value);
  if (!raw) throw new Error(`Evento ${eventId} sin ${field}`);

  const date = new Date(/([zZ]|[+-]\d\d:?\d\d)$/.test(raw) ? raw : `${raw}Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Evento ${eventId} con ${field} inválido: ${raw}`);

  return date;
}

function parseOptionalEventDate(value: unknown, field: string, eventId: string): Date | null {
  return cleanString(value) ? parseEventDate(value, field, eventId) : null;
}

type PlaceSource = {
  feature: GeoJsonFeature;
  needApproval: boolean;
  isEventOnly: boolean;
  origin: string;
};

type PreparedPlace = {
  row: Prisma.PlaceCreateManyInput;
  categories: string[];
  floors: number[];
  /** Padre declarado (propuesta de edición) o derivado de faculties[0] (jerarquía por facultad). */
  parentPlaceId: string | null;
};

function preparePlace(source: PlaceSource, validCampusIds: Set<string>): PreparedPlace {
  const { feature, needApproval, isEventOnly } = source;
  const properties = feature.properties;
  const id = getPlaceId(properties);
  const rawCampusId = cleanString(properties.campus);
  const { longitude, latitude } = getPointCoordinates(feature.geometry);

  // parentPlaceId cumple dos roles: el padre de una propuesta de edición (viene explícito) y la
  // jerarquía por facultad (se deriva de faculties[0]). El explícito manda. Los lugares inline de
  // evento no cuelgan de nadie, igual que cuando los crea la app.
  const declaredParent = cleanString(properties.parentPlaceId);
  const facultyParent = isEventOnly ? null : cleanStringArray(properties.faculties)[0] ?? null;

  return {
    row: {
      id,
      name: cleanString(properties.name) ?? id,
      information: cleanString(properties.information),
      needApproval: Boolean(properties.needApproval ?? needApproval),
      proposalType: cleanString(properties.proposalType) === "edit" ? "edit" : null,
      isEventOnly,
      campusId: rawCampusId && validCampusIds.has(rawCampusId) ? rawCampusId : null,
      parentPlaceId: null,
      geometryType: feature.geometry.type,
      geometry: toPrismaJson(feature.geometry),
      longitude,
      latitude,
    },
    categories: cleanStringArray(properties.categories),
    floors: cleanNumberArray(properties.floors),
    parentPlaceId: declaredParent ?? facultyParent,
  };
}

type PreparedEvent = {
  row: Prisma.EventCreateManyInput;
  /** placeId → piso que el evento definió para ese lugar (parentPlaceFloors). */
  links: Map<string, number | null>;
};

function prepareEvent(feature: GeoJsonFeature, validCampusIds: Set<string>): PreparedEvent {
  const properties = feature.properties;
  const id = getPlaceId(properties);
  const rawCampusId = cleanString(properties.campus);
  const { longitude, latitude } = getPointCoordinates(feature.geometry);

  const floorsByPlace =
    properties.parentPlaceFloors && typeof properties.parentPlaceFloors === "object"
      ? (properties.parentPlaceFloors as Record<string, unknown>)
      : {};

  const links = new Map<string, number | null>();
  for (const placeId of cleanStringArray(properties.parentPlaceIds)) {
    const floor = Number(floorsByPlace[placeId]);
    links.set(placeId, Number.isInteger(floor) ? floor : null);
  }

  return {
    row: {
      id,
      name: cleanString(properties.name) ?? id,
      information: cleanString(properties.information),
      campusId: rawCampusId && validCampusIds.has(rawCampusId) ? rawCampusId : null,
      geometryType: feature.geometry.type,
      geometry: toPrismaJson(feature.geometry),
      longitude,
      latitude,
      categories: cleanStringArray(properties.categories),
      floors: cleanNumberArray(properties.floors),
      startDate: parseEventDate(properties.startDate, "startDate", id),
      endDate: parseEventDate(properties.endDate, "endDate", id),
      showFrom: parseOptionalEventDate(properties.showFrom, "showFrom", id),
    },
    links,
  };
}

// Orden inverso a las FKs. `migrate reset` deja todo vacío, así que en el flujo normal no borra nada;
// esto existe para poder re-correr el seed sobre una BD ya sembrada sin duplicar ni chocar con PKs.
async function resetTables() {
  await prisma.eventPlace.deleteMany();
  await prisma.event.deleteMany();
  await prisma.placeCategory.deleteMany();
  await prisma.placeFloor.deleteMany();
  await prisma.place.deleteMany();
  await prisma.category.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.campus.deleteMany();
}

async function main() {
  const campusFeatures = readFeatureCollection(DATA_FILES.campuses).features;
  const approvedFeatures = readFeatureCollection(DATA_FILES.places).features;
  const pendingFeatures = readFeatureCollection(DATA_FILES.newPlaces).features;
  // eventPlaces.json trae mezclados los eventos (properties.startDate) y los lugares "inline" que
  // esos eventos crearon (van a place con isEventOnly=true, fuera del mapa normal).
  const eventCollection = readFeatureCollection(DATA_FILES.eventPlaces, true).features;
  const eventFeatures = eventCollection.filter((feature) => "startDate" in feature.properties);
  const inlinePlaceFeatures = eventCollection.filter((feature) => !("startDate" in feature.properties));

  const validCampusIds = new Set(campusFeatures.map((feature) => getCampusId(feature.properties)));

  const sources: PlaceSource[] = [
    ...approvedFeatures.map((feature) => ({ feature, needApproval: false, isEventOnly: false, origin: "places" })),
    ...pendingFeatures.map((feature) => ({ feature, needApproval: true, isEventOnly: false, origin: "newPlaces" })),
    ...inlinePlaceFeatures.map((feature) => ({
      feature,
      needApproval: false,
      isEventOnly: true,
      origin: "eventPlaces",
    })),
  ];

  // Un id repetido entre archivos rompería el createMany. Gana el primero (aprobados > pendientes >
  // inline de evento), que es la versión "más real" del lugar.
  const preparedPlaces = new Map<string, PreparedPlace>();
  const duplicated: string[] = [];
  for (const source of sources) {
    const prepared = preparePlace(source, validCampusIds);
    if (preparedPlaces.has(prepared.row.id)) {
      duplicated.push(`${prepared.row.id} (${source.origin})`);
      continue;
    }
    preparedPlaces.set(prepared.row.id, prepared);
  }

  const preparedEvents = eventFeatures.map((feature) => prepareEvent(feature, validCampusIds));

  const existingPlaces = await prisma.place.count();
  const existingEvents = await prisma.event.count();
  if ((existingPlaces > 0 || existingEvents > 0) && process.env.SEED_FORCE !== "true") {
    throw new Error(
      `La base ya tiene datos (${existingPlaces} lugares, ${existingEvents} eventos) y el seed los reemplaza por completo. ` +
        `Usa \`npx prisma migrate reset\` para partir limpio, o vuelve a correrlo con SEED_FORCE=true si de verdad quieres sobrescribir.`,
    );
  }

  console.log(
    `Campuses: ${campusFeatures.length} · Lugares: ${preparedPlaces.size} ` +
      `(aprobados ${approvedFeatures.length}, pendientes ${pendingFeatures.length}, de evento ${inlinePlaceFeatures.length}) · ` +
      `Eventos: ${preparedEvents.length}`,
  );

  await resetTables();

  await prisma.campus.createMany({
    data: campusFeatures.map((feature) => {
      const properties = feature.properties;
      const id = getCampusId(properties);
      return {
        id,
        name: cleanString(properties.name) ?? id,
        shortName: cleanString(properties.shortName),
        address: cleanString(properties.address),
        information: cleanString(properties.information),
        category: cleanString(properties.categories),
        geometryType: feature.geometry.type,
        geometry: toPrismaJson(feature.geometry),
      };
    }),
    skipDuplicates: true,
  });

  const categories = new Set<string>();
  const floors = new Set<number>();
  for (const prepared of preparedPlaces.values()) {
    prepared.categories.forEach((category) => categories.add(category));
    prepared.floors.forEach((floor) => floors.add(floor));
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

  // Los lugares entran con parentPlaceId en null: la FK es al propio place y un padre puede venir
  // después que su hijo en el archivo. La jerarquía se resuelve en un segundo paso.
  for (const batch of chunk([...preparedPlaces.values()].map((prepared) => prepared.row))) {
    await prisma.place.createMany({ data: batch, skipDuplicates: true });
  }

  const childrenByParent = new Map<string, string[]>();
  const missingParents = new Map<string, number>();
  for (const prepared of preparedPlaces.values()) {
    const parentPlaceId = prepared.parentPlaceId;
    if (!parentPlaceId || parentPlaceId === prepared.row.id) continue;

    if (!preparedPlaces.has(parentPlaceId)) {
      missingParents.set(parentPlaceId, (missingParents.get(parentPlaceId) ?? 0) + 1);
      continue;
    }

    const children = childrenByParent.get(parentPlaceId) ?? [];
    children.push(prepared.row.id);
    childrenByParent.set(parentPlaceId, children);
  }

  for (const [parentPlaceId, children] of childrenByParent) {
    for (const batch of chunk(children)) {
      await prisma.place.updateMany({ where: { id: { in: batch } }, data: { parentPlaceId } });
    }
  }

  const placeCategories: Prisma.PlaceCategoryCreateManyInput[] = [];
  const placeFloors: Prisma.PlaceFloorCreateManyInput[] = [];
  for (const prepared of preparedPlaces.values()) {
    prepared.categories.forEach((categoryId) => placeCategories.push({ placeId: prepared.row.id, categoryId }));
    prepared.floors.forEach((floorId) => placeFloors.push({ placeId: prepared.row.id, floorId }));
  }

  for (const batch of chunk(placeCategories)) {
    await prisma.placeCategory.createMany({ data: batch, skipDuplicates: true });
  }
  for (const batch of chunk(placeFloors)) {
    await prisma.placeFloor.createMany({ data: batch, skipDuplicates: true });
  }

  if (preparedEvents.length > 0) {
    for (const batch of chunk(preparedEvents.map((prepared) => prepared.row))) {
      await prisma.event.createMany({ data: batch, skipDuplicates: true });
    }

    const eventLinks: Prisma.EventPlaceCreateManyInput[] = [];
    const missingEventPlaces = new Map<string, number>();
    for (const prepared of preparedEvents) {
      for (const [placeId, floor] of prepared.links) {
        // Un evento puede apuntar a un lugar aprobado o a uno inline; si el id no existe en ningún
        // archivo, el link se omite (la FK lo rechazaría y caería el seed completo).
        if (!preparedPlaces.has(placeId)) {
          missingEventPlaces.set(placeId, (missingEventPlaces.get(placeId) ?? 0) + 1);
          continue;
        }
        eventLinks.push({ eventId: prepared.row.id, placeId, floor });
      }
    }

    for (const batch of chunk(eventLinks)) {
      await prisma.eventPlace.createMany({ data: batch, skipDuplicates: true });
    }

    if (missingEventPlaces.size > 0) {
      console.warn(`Eventos con lugares inexistentes (link omitido): ${[...missingEventPlaces.keys()].join(", ")}`);
    }
  }

  if (duplicated.length > 0) {
    console.warn(`Ids repetidos entre archivos, se usó la primera aparición: ${duplicated.join(", ")}`);
  }

  if (missingParents.size > 0) {
    console.warn("Padres (faculties / parentPlaceId) que no existen como Place. Quedaron en null:");
    for (const [parentId, count] of missingParents) {
      console.warn(`- ${parentId}: ${count} place(s)`);
    }
  }

  const [placeCount, approvedCount, pendingCount, eventOnlyCount, eventCount, linkCount] = await Promise.all([
    prisma.place.count(),
    prisma.place.count({ where: { needApproval: false, isEventOnly: false } }),
    prisma.place.count({ where: { needApproval: true } }),
    prisma.place.count({ where: { isEventOnly: true } }),
    prisma.event.count(),
    prisma.eventPlace.count(),
  ]);

  console.log(
    `Seed completado. place=${placeCount} (aprobados ${approvedCount}, pendientes ${pendingCount}, de evento ${eventOnlyCount}) · ` +
      `event=${eventCount} · event_place=${linkCount}`,
  );
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
