import { buildCachedPayload, type CachedPayload } from "@/lib/api/httpCache";
import { prisma } from "@/lib/prisma";
import { type RouteFeature } from "@/lib/types";

import { cache } from "./cache";
import { featureToRouteData, routeToFeature } from "./transform";

const CACHE_KEY_ROUTES = "allRoutes";
const CACHE_TTL = 5 * 60 * 1000;

const routeInclude = {
  // route_place no tiene columna de orden, así que ordenar por placeId no pierde semántica y hace
  // determinista el ETag de la respuesta (ver el comentario de lib/db/places.ts).
  places: { include: { place: true }, orderBy: { placeId: "asc" } },
} as const;

export interface RoutesData {
  routes: RouteFeature[];
  response: CachedPayload;
}

async function loadAllRoutes(): Promise<RoutesData> {
  const rows = await prisma.route.findMany({ include: routeInclude, orderBy: { id: "asc" } });
  const routes = rows.map((r) => routeToFeature(r));

  const response = await buildCachedPayload({
    message: "Success",
    routes: { type: "FeatureCollection", features: routes },
  });

  return { routes, response };
}

export async function getRoutesData(options?: { bypassCache?: boolean }): Promise<RoutesData> {
  // bypassCache=true → salta la Capa 1 y lee directo de la BD (debug / refetch post-mutación).
  return cache.getOrLoad(CACHE_KEY_ROUTES, loadAllRoutes, {
    ttlMs: CACHE_TTL,
    forceFresh: options?.bypassCache,
  });
}

export async function getAllRoutes(options?: { bypassCache?: boolean }): Promise<RouteFeature[]> {
  return (await getRoutesData(options)).routes;
}

// placeIds son lugares que YA existen y están aprobados; las rutas nunca crean lugares.
export async function createRoute(route: RouteFeature): Promise<void> {
  const data = featureToRouteData(route);
  const placeIds = route.properties.placeIds ?? [];

  await prisma.route.create({
    data: {
      id: data.id,
      name: data.name,
      information: data.information,
      campusId: data.campusId,
      geometryType: data.geometryType,
      geometry: data.geometry,
      longitude: data.longitude,
      latitude: data.latitude,
      places: {
        create: placeIds.map((placeId) => ({ place: { connect: { id: placeId } } })),
      },
    },
  });

  cache.invalidate(CACHE_KEY_ROUTES);
}

export async function updateRoute(id: string, route: RouteFeature): Promise<void> {
  const data = featureToRouteData(route);
  const placeIds = route.properties.placeIds ?? [];

  await prisma.$transaction(async (tx) => {
    await tx.routePlace.deleteMany({ where: { routeId: id } });

    await tx.route.update({
      where: { id },
      data: {
        name: data.name,
        information: data.information,
        campusId: data.campusId,
        geometryType: data.geometryType,
        geometry: data.geometry,
        longitude: data.longitude,
        latitude: data.latitude,
        places: {
          create: placeIds.map((placeId) => ({ place: { connect: { id: placeId } } })),
        },
      },
    });
  });

  cache.invalidate(CACHE_KEY_ROUTES);
}

export async function deleteRoute(id: string): Promise<void> {
  await prisma.route.delete({ where: { id } });
  cache.invalidate(CACHE_KEY_ROUTES);
}

export async function routeExists(id: string): Promise<boolean> {
  const found = await prisma.route.findUnique({ where: { id }, select: { id: true } });
  return found !== null;
}
