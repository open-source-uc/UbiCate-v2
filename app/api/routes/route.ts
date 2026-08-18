import { NextRequest, NextResponse } from "next/server";

import "@/lib/setup-proxy";
import { cachedJsonResponse } from "@/lib/api/httpCache";
import { getAllPlaces, getCampuses } from "@/lib/db/places";
import { createRoute, deleteRoute, getAllRoutes, getRoutesData, routeExists, updateRoute } from "@/lib/db/routes";
import { generateRandomIdWithTimestamp, normalizeIdentifier } from "@/lib/places/utils";
import { CATEGORIES, type Feature, type RouteFeature } from "@/lib/types";
import { routeDeleteSchema, routePutSchema, routeSchema } from "@/lib/validation/schemas";

const API_UBICATE_SECRET = process.env.API_UBICATE_SECRET;

type PointInput = { geometry: { coordinates: number[] } };

// Al revés de /api/ubicate y /api/events: acá 2 puntos es el mínimo válido, y la línea NO se cierra
// ni se reorienta con booleanClockwise — el orden de los vértices es el recorrido.
function buildLineGeometry(points: PointInput[]): { type: "LineString"; coordinates: [number, number][] } | null {
  if (points.length < 2) return null;

  return {
    type: "LineString",
    coordinates: points.map((p) => [p.geometry.coordinates[0], p.geometry.coordinates[1]] as [number, number]),
  };
}

async function isValidCampus(campus: string): Promise<boolean> {
  const campuses = await getCampuses();
  return campuses.some((c) => c.properties.identifier === campus);
}

// Los lugares de una ruta son lugares aprobados que ya existen; se descartan los que no existan y
// los que sean un campus. Se guarda el `identifier` REAL del feature, no el normalizado: la
// normalización puede diferir del casing con el que está guardada la fila.
function resolvePlaceIds(placeIds: string[], approved: Feature[]): string[] {
  const resolved: string[] = [];

  for (const rawId of placeIds) {
    const normalized = normalizeIdentifier(rawId);
    const found = approved.find((p) => normalizeIdentifier(p.properties.identifier) === normalized);
    if (!found) continue;
    if (found.properties.categories.includes(CATEGORIES.CAMPUS)) continue;
    if (resolved.includes(found.properties.identifier)) continue;
    resolved.push(found.properties.identifier);
  }

  return resolved;
}

export async function GET(request: NextRequest) {
  try {
    const bypassCache = request.headers.get("X-Ubicate-Fresh") === "true";
    const { response } = await getRoutesData({ bypassCache });

    return cachedJsonResponse(request, response, { noStore: bypassCache });
  } catch (error) {
    console.error("Error in GET routes:", error);
    // 500 y no un 200 con lista vacía: el StaleWhileRevalidate del SW no filtra por status, así que ese
    // 200 sobrescribía la entrada buena de `ubicate-routes` y el panel quedaba vacío hasta 30 días.
    // "cero rutas" y "no pude leer las rutas" son cosas distintas.
    return NextResponse.json(
      {
        error: "Error retrieving routes data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
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
    const result = routeSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { data, points } = result.data;

    const geometry = buildLineGeometry(points);
    if (!geometry) {
      return NextResponse.json({ message: "La ruta debe tener al menos 2 puntos" }, { status: 400 });
    }

    if (!(await isValidCampus(data.campus))) {
      return NextResponse.json({ message: "Debes elegir un campus válido" }, { status: 400 });
    }

    const { approved } = await getAllPlaces();
    const placeIds = resolvePlaceIds(data.placeIds, approved);

    const route: RouteFeature = {
      type: "Feature",
      geometry,
      properties: {
        identifier: normalizeIdentifier(generateRandomIdWithTimestamp()),
        name: data.name,
        information: data.information,
        categories: [],
        campus: data.campus,
        faculties: [],
        placeIds,
      },
    };

    await createRoute(route);
    return NextResponse.json({ message: "¡La ruta fue creada!" });
  } catch (error) {
    console.error("Error in POST route:", error);
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
    const result = routePutSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { data, points, identifier } = result.data;

    const geometry = buildLineGeometry(points);
    if (!geometry) {
      return NextResponse.json({ message: "La ruta debe tener al menos 2 puntos" }, { status: 400 });
    }

    if (!(await isValidCampus(data.campus))) {
      return NextResponse.json({ message: "Debes elegir un campus válido" }, { status: 400 });
    }

    const routes = await getAllRoutes();
    const existing = routes.find(
      (r) => normalizeIdentifier(r.properties.identifier) === normalizeIdentifier(identifier),
    );
    if (!existing) {
      return NextResponse.json({ message: "¡La ruta NO existe!" }, { status: 404 });
    }

    const { approved } = await getAllPlaces();
    const placeIds = resolvePlaceIds(data.placeIds, approved);

    const route: RouteFeature = {
      type: "Feature",
      geometry,
      properties: {
        identifier: existing.properties.identifier,
        name: data.name,
        information: data.information,
        categories: [],
        campus: data.campus,
        faculties: [],
        placeIds,
      },
    };

    await updateRoute(existing.properties.identifier, route);
    return NextResponse.json({ message: "¡La ruta fue actualizada!" });
  } catch (error) {
    console.error("Error in PUT route:", error);
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
    const result = routeDeleteSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const routes = await getAllRoutes();
    const existing = routes.find(
      (r) => normalizeIdentifier(r.properties.identifier) === normalizeIdentifier(result.data.identifier),
    );
    if (!existing || !(await routeExists(existing.properties.identifier))) {
      return NextResponse.json({ message: "¡La ruta NO existe!" }, { status: 404 });
    }

    await deleteRoute(existing.properties.identifier);
    return NextResponse.json({ message: "¡La ruta fue eliminada!" });
  } catch (error) {
    console.error("Error in DELETE route:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export const runtime = "nodejs";
