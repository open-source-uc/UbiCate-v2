import { NextRequest, NextResponse } from "next/server";

import { booleanClockwise, centroid } from "@turf/turf";

import "@/lib/setup-proxy";
import {
  approvePlace,
  createPlace,
  deletePlace,
  getAllPlaces,
  getCampusNameForPoint,
  getFacultyForPoint,
  rejectPlace,
  updatePlace,
} from "@/lib/db/places";
import { generateRandomIdWithTimestamp, normalizeIdentifier } from "@/lib/places/utils";
import type { Feature } from "@/lib/types";
import { deleteSchema, patchSchema, placeSchema, putSchema } from "@/lib/validation/schemas";

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

export async function GET() {
  try {
    const { approved, newPlaces } = await getAllPlaces();

    const approvedCollection = { type: "FeatureCollection", features: approved };
    const newPlacesCollection = { type: "FeatureCollection", features: newPlaces };

    return NextResponse.json(
      {
        message: "Success",
        approved_places: approvedCollection,
        new_places: newPlacesCollection,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      {
        error: "Error retrieving places data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = placeSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const points = result.data.points;
    if (points.length === 1 && (result.data.data.floors === undefined || result.data.data.floors?.length === 0)) {
      return NextResponse.json({ message: "Se requiere al menos un piso para crear un lugar" }, { status: 400 });
    }

    if (points.length === 2) {
      return NextResponse.json({ message: "Se requieren al menos 3 puntos para crear un polígono" }, { status: 400 });
    }

    let nuevo_punto = await buildFeature(points, {
      identifier: "",
      name: result.data.data.name,
      information: result.data.data.information,
      categories: result.data.data.categories,
      floors: result.data.data.floors,
      needApproval: true,
    });

    if (!nuevo_punto) {
      return NextResponse.json(
        {
          message: "Se requiere al menos 1 punto para ubicar un lugar o 3 puntos para crear un polígono",
        },
        { status: 400 },
      );
    }

    if (nuevo_punto.properties.campus === "") {
      return NextResponse.json({ message: "El lugar no está dentro de un campus" }, { status: 400 });
    }

    if (nuevo_punto.properties.categories.includes("classroom")) {
      nuevo_punto.properties.identifier =
        nuevo_punto.properties.name.trim().toUpperCase().replaceAll(" ", "_") +
        "-" +
        nuevo_punto.properties.campus.toUpperCase();
    } else {
      nuevo_punto.properties.identifier = generateRandomIdWithTimestamp();
    }

    nuevo_punto.properties.identifier = normalizeIdentifier(nuevo_punto.properties.identifier);
    const normalizedId = nuevo_punto.properties.identifier;

    const { approved, newPlaces } = await getAllPlaces();
    const existsInApproved = approved.some(
      (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedId,
    );
    if (existsInApproved) {
      return NextResponse.json({ message: "¡El lugar ya existe en lugares aprobados!" }, { status: 400 });
    }

    const existsInNewPlaces = newPlaces.some(
      (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedId,
    );
    if (existsInNewPlaces) {
      return NextResponse.json(
        { message: "¡El lugar ya existe en lugares pendientes de aprobación!" },
        { status: 400 },
      );
    }

    await createPlace(nuevo_punto);
    return NextResponse.json({
      message: "¡El lugar fue creado! Ahora debe esperar a que sea aprobado (máximo 1 semana).",
    });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = putSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const points = result.data.points;

    if (points.length === 1 && (result.data.data.floors === undefined || result.data.data.floors?.length === 0)) {
      return NextResponse.json({ message: "Se requiere al menos un piso para crear un lugar" }, { status: 400 });
    }

    if (points.length === 2) {
      return NextResponse.json({ message: "Se requieren al menos 3 puntos para crear un polígono" }, { status: 400 });
    }

    const normalizedId = normalizeIdentifier(result.data.identifier);

    let updated_point = await buildFeature(points, {
      identifier: result.data.identifier,
      name: result.data.data.name,
      information: result.data.data.information,
      categories: result.data.data.categories,
      floors: result.data.data.floors,
      needApproval: true,
    });

    if (!updated_point) {
      return NextResponse.json(
        {
          message: "Se requiere al menos 1 punto para ubicar un lugar o 3 puntos para crear un polígono",
        },
        { status: 400 },
      );
    }

    if (updated_point.properties.campus === "") {
      return NextResponse.json({ message: "El lugar no está dentro de un campus" }, { status: 400 });
    }

    const { approved, newPlaces } = await getAllPlaces();
    const pendingPlace = newPlaces.find((f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedId);
    const approvedPlace = approved.find((f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedId);

    if (pendingPlace) {
      await updatePlace(pendingPlace.properties.identifier, updated_point);
      return NextResponse.json({ message: "¡El lugar fue actualizado en lugares pendientes de aprobación!" });
    }

    if (approvedPlace) {
      const proposalId = normalizeIdentifier(generateRandomIdWithTimestamp());
      const proposalFeature = {
        ...updated_point,
        properties: {
          ...updated_point.properties,
          identifier: proposalId,
          parentPlaceId: approvedPlace.properties.identifier,
          needApproval: true,
          proposalType: "edit" as const,
        },
      };
      await createPlace(proposalFeature as Feature);
      return NextResponse.json({
        message: "¡Se ha creado una propuesta de edición para el lugar aprobado! Debe esperar a que sea aprobada.",
      });
    }

    return NextResponse.json({ message: "¡El lugar NO existe!" }, { status: 404 });
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("ubicate-token");

    if (token !== API_UBICATE_SECRET) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedId = normalizeIdentifier(result.data.identifier);
    const { action } = result.data;

    const { newPlaces } = await getAllPlaces();
    const pendingPlace = newPlaces.find((f) => normalizeIdentifier(f.properties.identifier) === normalizedId);

    if (!pendingPlace) {
      return NextResponse.json({ message: "¡El lugar NO existe en lugares pendientes!" }, { status: 404 });
    }

    if (action === "approve") {
      await approvePlace(pendingPlace.properties.identifier);
      const message = "¡El lugar fue aprobado!";
      return NextResponse.json({ message });
    } else if (action === "reject") {
      await rejectPlace(pendingPlace.properties.identifier);
      return NextResponse.json({ message: "¡El lugar fue rechazado!" });
    }
  } catch (error) {
    console.error("Error in PATCH:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
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
    const result = deleteSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedId = normalizeIdentifier(result.data.identifier);
    const { source } = result.data;

    const { approved, newPlaces } = await getAllPlaces();

    let found = false;
    let deletedFrom = "";

    if (source === "approved") {
      const place = approved.find((f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedId);
      if (place) {
        await deletePlace(place.properties.identifier);
        found = true;
        deletedFrom = "lugares aprobados";
      }
    } else if (source === "pending") {
      const place = newPlaces.find((f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedId);
      if (place) {
        await deletePlace(place.properties.identifier);
        found = true;
        deletedFrom = "lugares pendientes de aprobación";
      }
    }

    if (found) {
      return NextResponse.json({ message: `¡El lugar fue borrado de ${deletedFrom}!` }, { status: 200 });
    } else {
      const sourceText = source === "approved" ? "lugares aprobados" : "lugares pendientes de aprobación";
      return NextResponse.json({ message: `¡El lugar NO existe en ${sourceText}!` }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}

export const runtime = "nodejs";
