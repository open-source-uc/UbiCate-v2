import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createPlace } from "@/lib/db/places";
import { createRoute, deleteRoute, getAllRoutes, getRoutesData, routeExists, updateRoute } from "@/lib/db/routes";
import { prisma } from "@/lib/prisma";

import { disconnect, resetAll } from "../helpers/db";
import { CAMPUS_ID, makePlaceFeature, makeRouteFeature, seedCampus } from "../helpers/factories";

beforeEach(async () => {
  await resetAll();
  await seedCampus();
});

afterAll(disconnect);

describe("getAllRoutes", () => {
  it("con la tabla vacía devuelve una lista vacía, no un error", async () => {
    await expect(getAllRoutes()).resolves.toEqual([]);
  });

  it("devuelve las rutas ordenadas por id y sus placeIds ordenados por placeId", async () => {
    // El ETag es un hash del body: sin orden determinista el If-None-Match del cliente nunca acierta.
    await createPlace(makePlaceFeature("ZETA"));
    await createPlace(makePlaceFeature("ALFA"));
    await createRoute(makeRouteFeature("R2", { placeIds: ["ZETA", "ALFA"] }));
    await createRoute(makeRouteFeature("R1"));

    const routes = await getAllRoutes();

    expect(routes.map((r) => r.properties.identifier)).toEqual(["R1", "R2"]);
    expect(routes[1].properties.placeIds).toEqual(["ALFA", "ZETA"]);
  });

  it("el ETag es estable entre cargas iguales y cambia al mutar", async () => {
    await createRoute(makeRouteFeature("R1"));

    const primera = (await getRoutesData()).response.etag;
    expect((await getRoutesData({ bypassCache: true })).response.etag).toBe(primera);

    await updateRoute("R1", makeRouteFeature("R1", { name: "Otro nombre" }));
    expect((await getRoutesData()).response.etag).not.toBe(primera);
  });
});

describe("createRoute", () => {
  it("guarda la geometría, el centroide y el campus elegido", async () => {
    await createRoute(makeRouteFeature("R1"));

    const row = await prisma.route.findUniqueOrThrow({ where: { id: "R1" } });

    expect(row.geometryType).toBe("LineString");
    expect(row.campusId).toBe(CAMPUS_ID);
    expect(Number(row.longitude)).toBeCloseTo(-70.61, 6);
    expect(Number(row.latitude)).toBeCloseTo(-33.5, 6);
  });

  it("normaliza el color antes de guardarlo", async () => {
    await createRoute(makeRouteFeature("R1", { color: "#22C55E" }));

    expect((await prisma.route.findUniqueOrThrow({ where: { id: "R1" } })).color).toBe("#22c55e");
  });

  it("sin color guarda null, que el mapa dibuja con el verde por defecto", async () => {
    await createRoute(makeRouteFeature("R1"));

    expect((await prisma.route.findUniqueOrThrow({ where: { id: "R1" } })).color).toBeNull();
  });

  it("conecta los lugares indicados sin crearlos", async () => {
    await createPlace(makePlaceFeature("P1"));

    await createRoute(makeRouteFeature("R1", { placeIds: ["P1"] }));

    expect(await prisma.routePlace.count()).toBe(1);
    expect(await prisma.place.count()).toBe(1);
  });

  it("falla si un placeId no existe: las rutas nunca crean lugares", async () => {
    await expect(createRoute(makeRouteFeature("R1", { placeIds: ["NO_EXISTE"] }))).rejects.toThrow();
    expect(await prisma.route.count()).toBe(0);
  });

  it("invalida el cache de rutas", async () => {
    await getAllRoutes();
    await createRoute(makeRouteFeature("R1"));

    expect(await getAllRoutes()).toHaveLength(1);
  });
});

describe("updateRoute", () => {
  it("reemplaza el conjunto de lugares en vez de acumularlo", async () => {
    await createPlace(makePlaceFeature("P1"));
    await createPlace(makePlaceFeature("P2"));
    await createRoute(makeRouteFeature("R1", { placeIds: ["P1"] }));

    await updateRoute("R1", makeRouteFeature("R1", { placeIds: ["P2"] }));

    expect((await getAllRoutes())[0].properties.placeIds).toEqual(["P2"]);
    expect(await prisma.routePlace.count()).toBe(1);
  });

  it("actualiza nombre, información, color y geometría", async () => {
    await createRoute(makeRouteFeature("R1"));

    const editada = makeRouteFeature("R1", { name: "Recorrido nuevo", information: "Otra info", color: "#ff0000" });
    editada.geometry = {
      type: "LineString",
      coordinates: [
        [-70.62, -33.51],
        [-70.6, -33.49],
      ],
    };
    await updateRoute("R1", editada);

    const row = await prisma.route.findUniqueOrThrow({ where: { id: "R1" } });
    expect(row.name).toBe("Recorrido nuevo");
    expect(row.information).toBe("Otra info");
    expect(row.color).toBe("#ff0000");
    expect((row.geometry as { coordinates: number[][] }).coordinates).toHaveLength(2);
  });

  it("invalida el cache de rutas", async () => {
    await createRoute(makeRouteFeature("R1"));
    await getAllRoutes();

    await updateRoute("R1", makeRouteFeature("R1", { name: "Cambiada" }));

    expect((await getAllRoutes())[0].properties.name).toBe("Cambiada");
  });
});

describe("deleteRoute", () => {
  it("borra la ruta y cascadea route_place sin tocar los lugares", async () => {
    await createPlace(makePlaceFeature("P1"));
    await createRoute(makeRouteFeature("R1", { placeIds: ["P1"] }));

    await deleteRoute("R1");

    expect(await prisma.route.count()).toBe(0);
    expect(await prisma.routePlace.count()).toBe(0);
    expect(await prisma.place.count()).toBe(1);
  });

  it("invalida el cache de rutas", async () => {
    await createRoute(makeRouteFeature("R1"));
    await getAllRoutes();

    await deleteRoute("R1");

    expect(await getAllRoutes()).toEqual([]);
  });
});

describe("routeExists", () => {
  it("distingue una ruta existente de una inexistente", async () => {
    await createRoute(makeRouteFeature("R1"));

    expect(await routeExists("R1")).toBe(true);
    expect(await routeExists("NO_EXISTE")).toBe(false);
  });
});
