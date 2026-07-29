import { NextRequest, NextResponse } from "next/server";

import { booleanClockwise, centroid } from "@turf/turf";

import "@/lib/setup-proxy";
import { createEvent, deleteEvent, getAllEvents, updateEvent } from "@/lib/db/events";
import { getAllPlaces, getCampusNameForPoint, getFacultyForPoint } from "@/lib/db/places";
import { generateRandomIdWithTimestamp, normalizeIdentifier } from "@/lib/places/utils";
import type { EventFeature, Feature } from "@/lib/types";
import { eventDeleteSchema, eventPlaceSchema, eventPutSchema } from "@/lib/validation/schemas";

const API_UBICATE_SECRET = process.env.API_UBICATE_SECRET;

function buildGeometry(points: any[]): { geometry: any; lng: number; lat: number } | null {
  if (points.length === 0) return null;

  if (points.length === 1) {
    const coords = points[0].geometry.coordinates;
    return { geometry: { type: "Point", coordinates: coords }, lng: coords[0], lat: coords[1] };
  }

  if (points.length < 3) return null;

  const coordinates = points.map((p: any) => p.geometry.coordinates);
  coordinates.push(coordinates[0]);
  const geometry = { type: "Polygon" as const, coordinates: [coordinates] };

  if (booleanClockwise(geometry as any)) {
    geometry.coordinates[0].reverse();
  }

  const center = centroid({ type: "Feature", geometry } as any);
  return { geometry, lng: center.geometry.coordinates[0], lat: center.geometry.coordinates[1] };
}

// Construye un Feature resolviendo campus/facultades contra la BD (igual que /api/ubicate).
async function buildFeature(points: any[], properties: Record<string, unknown>): Promise<Feature | null> {
  const result = buildGeometry(points);
  if (!result) return null;

  const campus = (await getCampusNameForPoint(result.lng, result.lat)) || "";
  const faculties = campus ? await getFacultyForPoint(result.lng, result.lat) : [];

  return {
    type: "Feature",
    geometry: result.geometry,
    properties: { ...properties, campus, faculties },
  } as Feature;
}

// Resuelve las ubicaciones del evento: "existing" → id real del lugar aprobado;
// "new" → construye un Feature (que luego se persistirá como Place isEventOnly).
async function resolveLocations(
  locations: Array<{
    type: string;
    placeId?: string;
    name?: string;
    information?: string;
    identifier?: string;
    points?: any[];
  }>,
  categories: string[],
  floors: number[],
  approvedPlaces: Feature[],
): Promise<{ parentPlaceIds: string[]; newPlaceFeatures: Feature[] }> {
  const parentPlaceIds: string[] = [];
  const newPlaceFeatures: Feature[] = [];

  for (const loc of locations) {
    if (loc.type === "existing" && loc.placeId) {
      const normalizedId = normalizeIdentifier(loc.placeId);
      const place = approvedPlaces.find((f) => normalizeIdentifier(f.properties.identifier) === normalizedId);
      if (!place) continue;
      parentPlaceIds.push(place.properties.identifier);
    } else if (loc.type === "new" && loc.name) {
      const locPoints = loc.points || [];
      if (locPoints.length === 0) continue;

      const feature = await buildFeature(locPoints, {
        identifier: normalizeIdentifier(loc.identifier || generateRandomIdWithTimestamp()),
        name: loc.name,
        information: loc.information || "",
        categories,
        floors,
        needApproval: false,
      });

      if (feature && feature.properties.campus !== "") {
        newPlaceFeatures.push(feature);
        parentPlaceIds.push(feature.properties.identifier);
      }
    }
  }

  return { parentPlaceIds, newPlaceFeatures };
}

// Construye el Feature del evento (su geometría propia): desde el primer punto "new" o,
// si no hay, desde la geometría del primer lugar existente asociado.
async function buildEventFeature(
  locations: Array<{ type: string; placeId?: string; points?: any[] }>,
  props: { identifier: string; name: string; information: string; categories: string[]; floors: number[] },
  approvedPlaces: Feature[],
): Promise<Feature | null> {
  const firstNewPoint = locations.find((l) => l.type === "new" && l.points && l.points.length > 0)?.points?.[0];

  if (firstNewPoint) {
    return buildFeature([firstNewPoint], props);
  }

  const firstExisting = locations.find((l) => l.type === "existing" && l.placeId);
  if (firstExisting) {
    const place = approvedPlaces.find(
      (f) => normalizeIdentifier(f.properties.identifier) === normalizeIdentifier(firstExisting.placeId!),
    );
    if (place) {
      return {
        type: "Feature",
        geometry: place.geometry,
        properties: { ...props, campus: place.properties.campus, faculties: place.properties.faculties },
      } as Feature;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const bypassCache = request.headers.get("X-Ubicate-Fresh") === "true";
    const { events, eventPlaces } = await getAllEvents({ bypassCache });

    return NextResponse.json(
      {
        message: "Success",
        events: { type: "FeatureCollection", features: [...events, ...eventPlaces] },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET events:", error);
    return NextResponse.json(
      { message: "Success", events: { type: "FeatureCollection", features: [] } },
      { status: 200 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("ubicate-token");
    if (token !== API_UBICATE_SECRET) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = eventPlaceSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { data, locations } = result.data;

    if (data.startDate > data.endDate) {
      return NextResponse.json({ message: "La fecha de inicio debe ser anterior a la fecha de fin" }, { status: 400 });
    }
    if (locations.length === 0) {
      return NextResponse.json({ message: "Debe agregar al menos un lugar" }, { status: 400 });
    }

    const { approved } = await getAllPlaces();

    const eventProps = {
      identifier: normalizeIdentifier(generateRandomIdWithTimestamp()),
      name: data.name,
      information: data.information,
      categories: data.categories,
      floors: data.floors,
    };

    const eventBase = await buildEventFeature(locations, eventProps, approved);
    if (!eventBase) {
      return NextResponse.json(
        { message: "Se requiere al menos un lugar o punto para ubicar un evento" },
        { status: 400 },
      );
    }
    if (eventBase.properties.campus === "") {
      return NextResponse.json({ message: "El evento no está dentro de un campus" }, { status: 400 });
    }

    const { parentPlaceIds, newPlaceFeatures } = await resolveLocations(
      locations,
      data.categories,
      data.floors,
      approved,
    );

    if (parentPlaceIds.length === 0) {
      return NextResponse.json({ message: "Debe agregar al menos un lugar válido" }, { status: 400 });
    }

    const eventFeature: EventFeature = {
      ...eventBase,
      properties: {
        ...eventBase.properties,
        startDate: data.startDate,
        endDate: data.endDate,
        ...(data.showFrom ? { showFrom: data.showFrom } : {}),
        parentPlaceIds,
      },
    };

    await createEvent(eventFeature, newPlaceFeatures);
    return NextResponse.json({ message: "¡El evento fue creado!" });
  } catch (error) {
    console.error("Error in POST event:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("ubicate-token");
    if (token !== API_UBICATE_SECRET) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = eventPutSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { data, identifier, locations } = result.data;

    if (data.startDate > data.endDate) {
      return NextResponse.json({ message: "La fecha de inicio debe ser anterior a la fecha de fin" }, { status: 400 });
    }
    if (locations.length === 0) {
      return NextResponse.json({ message: "Debe agregar al menos un lugar" }, { status: 400 });
    }

    const normalizedId = normalizeIdentifier(identifier);
    const { events } = await getAllEvents();
    const existing = events.find((e) => normalizeIdentifier(e.properties.identifier) === normalizedId);
    if (!existing) {
      return NextResponse.json({ message: "¡El evento NO existe!" }, { status: 404 });
    }

    const { approved } = await getAllPlaces();

    const eventProps = {
      identifier: existing.properties.identifier,
      name: data.name,
      information: data.information,
      categories: data.categories,
      floors: data.floors,
    };

    const eventBase = await buildEventFeature(locations, eventProps, approved);
    if (!eventBase) {
      return NextResponse.json(
        { message: "Se requiere al menos un lugar o punto para ubicar un evento" },
        { status: 400 },
      );
    }
    if (eventBase.properties.campus === "") {
      return NextResponse.json({ message: "El evento no está dentro de un campus" }, { status: 400 });
    }

    const { parentPlaceIds, newPlaceFeatures } = await resolveLocations(
      locations,
      data.categories,
      data.floors,
      approved,
    );

    if (parentPlaceIds.length === 0) {
      return NextResponse.json({ message: "Debe agregar al menos un lugar válido" }, { status: 400 });
    }

    const eventFeature: EventFeature = {
      ...eventBase,
      properties: {
        ...eventBase.properties,
        startDate: data.startDate,
        endDate: data.endDate,
        ...(data.showFrom ? { showFrom: data.showFrom } : {}),
        parentPlaceIds,
      },
    };

    await updateEvent(existing.properties.identifier, eventFeature, newPlaceFeatures);
    return NextResponse.json({ message: "¡El evento fue actualizado!" });
  } catch (error) {
    console.error("Error in PUT event:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("ubicate-token");
    if (token !== API_UBICATE_SECRET) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = eventDeleteSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedId = normalizeIdentifier(result.data.identifier);
    const { events } = await getAllEvents();
    const existing = events.find((e) => normalizeIdentifier(e.properties.identifier) === normalizedId);
    if (!existing) {
      return NextResponse.json({ message: "¡El evento NO existe!" }, { status: 404 });
    }

    await deleteEvent(existing.properties.identifier);
    return NextResponse.json({ message: "¡El evento fue eliminado!" });
  } catch (error) {
    console.error("Error in DELETE event:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export const runtime = "nodejs";
