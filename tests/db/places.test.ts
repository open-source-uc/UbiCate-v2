import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  approvePlace,
  createPlace,
  deletePlace,
  getAllPlaces,
  getCampusNameForPoint,
  getCampuses,
  getFacultyForPoint,
  getPlaceById,
  normalizeIdentifierExists,
  rejectPlace,
  updatePlace,
} from "@/lib/db/places";
import { createRoute, getAllRoutes } from "@/lib/db/routes";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/types";

import { disconnect, resetAll } from "../helpers/db";
import {
  CAMPUS_ID,
  FACULTY_ID,
  INSIDE,
  OUTSIDE,
  makeFacultyFeature,
  makePlaceFeature,
  makeRouteFeature,
  seedCampus,
} from "../helpers/factories";

beforeEach(async () => {
  await resetAll();
  await seedCampus();
});

afterAll(disconnect);

describe("getAllPlaces", () => {
  it("separa aprobados de pendientes según needApproval", async () => {
    await createPlace(makePlaceFeature("APROBADO"));
    await createPlace(makePlaceFeature("PENDIENTE", { properties: { needApproval: true } }));

    const { approved, newPlaces } = await getAllPlaces();

    expect(approved.map((p) => p.properties.identifier)).toEqual(["APROBADO"]);
    expect(newPlaces.map((p) => p.properties.identifier)).toEqual(["PENDIENTE"]);
  });

  it("excluye los lugares isEventOnly: solo se sirven por /api/events", async () => {
    await createPlace(makePlaceFeature("NORMAL"));
    await prisma.place.create({
      data: {
        id: "INLINE",
        name: "Lugar inline",
        isEventOnly: true,
        campusId: CAMPUS_ID,
        geometryType: "Point",
        geometry: { type: "Point", coordinates: INSIDE },
      },
    });

    const { approved, newPlaces } = await getAllPlaces();

    expect([...approved, ...newPlaces].map((p) => p.properties.identifier)).toEqual(["NORMAL"]);
  });

  it("devuelve los lugares ordenados por id, y sus categorías y pisos también", async () => {
    // Sin orden determinista el ETag cambia entre requests idénticos y se retransmiten los ~499 KB.
    await createPlace(makePlaceFeature("C"));
    await createPlace(makePlaceFeature("A", { properties: { categories: ["zeta", "alpha"], floors: [3, 1] } }));
    await createPlace(makePlaceFeature("B"));

    const { approved } = await getAllPlaces();

    expect(approved.map((p) => p.properties.identifier)).toEqual(["A", "B", "C"]);
    expect(approved[0].properties.categories).toEqual(["alpha", "zeta"]);
    expect(approved[0].properties.floors).toEqual([1, 3]);
  });

  it("el ETag es estable entre cargas de los mismos datos y cambia al mutar", async () => {
    await createPlace(makePlaceFeature("P1"));

    const primera = (await getAllPlaces()).response.etag;
    const segunda = (await getAllPlaces({ bypassCache: true })).response.etag;
    expect(segunda).toBe(primera);

    await createPlace(makePlaceFeature("P2"));
    expect((await getAllPlaces()).response.etag).not.toBe(primera);
  });

  it("bypassCache relee de la BD una escritura hecha por fuera del módulo", async () => {
    await createPlace(makePlaceFeature("P1"));
    await getAllPlaces();

    await prisma.place.update({ where: { id: "P1" }, data: { name: "Renombrado a mano" } });

    expect((await getAllPlaces()).approved[0].properties.name).toBe("Lugar P1");
    expect((await getAllPlaces({ bypassCache: true })).approved[0].properties.name).toBe("Renombrado a mano");
  });

  it("asigna las facultades a los lugares Point que caen dentro de un polígono faculty", async () => {
    await createPlace(makeFacultyFeature());
    await createPlace(makePlaceFeature("DENTRO"));

    const { approved } = await getAllPlaces();
    const dentro = approved.find((p) => p.properties.identifier === "DENTRO");

    expect(dentro?.properties.faculties).toEqual([FACULTY_ID]);
  });
});

describe("getPlaceById", () => {
  it("resuelve por identificador normalizado (mayúsculas y sin espacios)", async () => {
    await createPlace(makePlaceFeature("SALA101"));

    expect((await getPlaceById("sala101"))?.properties.identifier).toBe("SALA101");
    expect((await getPlaceById("  sala 101  "))?.properties.identifier).toBe("SALA101");
  });

  it("encuentra también los pendientes y devuelve null si no existe", async () => {
    await createPlace(makePlaceFeature("PENDIENTE", { properties: { needApproval: true } }));

    expect((await getPlaceById("PENDIENTE"))?.properties.needApproval).toBe(true);
    expect(await getPlaceById("NO_EXISTE")).toBeNull();
  });
});

describe("getCampuses y consultas geográficas", () => {
  it("getCampuses devuelve el campus sembrado con su shortName como campus", async () => {
    const campuses = await getCampuses();

    expect(campuses).toHaveLength(1);
    expect(campuses[0].properties.identifier).toBe(CAMPUS_ID);
    expect(campuses[0].properties.campus).toBe("TSJ");
  });

  it("getCampusNameForPoint distingue dentro de fuera del campus", async () => {
    expect(await getCampusNameForPoint(...INSIDE)).toBe(CAMPUS_ID);
    expect(await getCampusNameForPoint(...OUTSIDE)).toBeNull();
  });

  it("getFacultyForPoint devuelve las facultades que contienen el punto", async () => {
    await createPlace(makeFacultyFeature());

    expect(await getFacultyForPoint(...INSIDE)).toEqual([FACULTY_ID]);
    expect(await getFacultyForPoint(...OUTSIDE)).toEqual([]);
  });
});

describe("normalizeIdentifierExists", () => {
  it("detecta un id guardado en mayúsculas y no uno inexistente", async () => {
    await createPlace(makePlaceFeature("SALA101"));

    expect(await normalizeIdentifierExists("sala 101")).toBe(true);
    expect(await normalizeIdentifierExists("OTRA")).toBe(false);
  });
});

describe("createPlace", () => {
  it("persiste los campos y crea por connectOrCreate las categorías y pisos que faltaban", async () => {
    await createPlace(
      makePlaceFeature("P1", {
        properties: {
          name: "Biblioteca",
          information: "Cuarto piso",
          categories: [CATEGORIES.LIBRARY],
          floors: [4],
          needApproval: true,
          proposalType: "edit",
        },
      }),
    );

    const row = await prisma.place.findUniqueOrThrow({
      where: { id: "P1" },
      include: { categories: true, floors: true },
    });

    expect(row.name).toBe("Biblioteca");
    expect(row.information).toBe("Cuarto piso");
    expect(row.needApproval).toBe(true);
    expect(row.proposalType).toBe("edit");
    expect(row.campusId).toBe(CAMPUS_ID);
    expect(row.categories.map((c) => c.categoryId)).toEqual([CATEGORIES.LIBRARY]);
    expect(row.floors.map((f) => f.floorId)).toEqual([4]);
    expect(await prisma.category.findUnique({ where: { id: CATEGORIES.LIBRARY } })).not.toBeNull();
    expect(await prisma.floor.findUnique({ where: { id: 4 } })).not.toBeNull();
  });

  it("guarda longitude y latitude de un Point", async () => {
    await createPlace(makePlaceFeature("P1"));

    const row = await prisma.place.findUniqueOrThrow({ where: { id: "P1" } });

    expect(Number(row.longitude)).toBeCloseTo(INSIDE[0], 8);
    expect(Number(row.latitude)).toBeCloseTo(INSIDE[1], 8);
  });

  it("falla si el campus no existe (FK)", async () => {
    await expect(createPlace(makePlaceFeature("P1", { properties: { campus: "NO_EXISTE" } }))).rejects.toThrow();
  });

  it("invalida el cache: la lectura siguiente ya lo incluye", async () => {
    await getAllPlaces();
    await createPlace(makePlaceFeature("P1"));

    expect((await getAllPlaces()).approved).toHaveLength(1);
  });
});

describe("updatePlace", () => {
  it("reemplaza categorías y pisos en vez de acumularlos", async () => {
    await createPlace(makePlaceFeature("P1", { properties: { categories: [CATEGORIES.OTHER], floors: [1] } }));

    await updatePlace(
      "P1",
      makePlaceFeature("P1", {
        properties: { categories: [CATEGORIES.LIBRARY, CATEGORIES.SHOP], floors: [2, 3] },
      }),
    );

    const { approved } = await getAllPlaces();
    expect(approved[0].properties.categories).toEqual([CATEGORIES.LIBRARY, CATEGORIES.SHOP]);
    expect(approved[0].properties.floors).toEqual([2, 3]);
  });

  it("actualiza nombre, información y geometría", async () => {
    await createPlace(makePlaceFeature("P1"));

    await updatePlace(
      "P1",
      makePlaceFeature("P1", {
        properties: { name: "Nuevo nombre", information: "Nueva info" },
        geometry: { type: "Point", coordinates: [-70.611, -33.501] },
      }),
    );

    const row = await prisma.place.findUniqueOrThrow({ where: { id: "P1" } });
    expect(row.name).toBe("Nuevo nombre");
    expect(row.information).toBe("Nueva info");
    expect(Number(row.longitude)).toBeCloseTo(-70.611, 8);
  });

  it("NO actualiza proposalType, a diferencia de createPlace", async () => {
    // Comportamiento actual documentado, no una preferencia: updatePlace omite el campo del update.
    await createPlace(makePlaceFeature("PR1", { properties: { needApproval: true, proposalType: "edit" } }));

    await updatePlace("PR1", makePlaceFeature("PR1", { properties: { needApproval: true } }));

    expect((await prisma.place.findUniqueOrThrow({ where: { id: "PR1" } })).proposalType).toBe("edit");
  });
});

describe("approvePlace", () => {
  it("sobre un lugar nuevo solo baja needApproval", async () => {
    await createPlace(makePlaceFeature("P1", { properties: { needApproval: true } }));

    await approvePlace("P1");

    const { approved, newPlaces } = await getAllPlaces();
    expect(approved.map((p) => p.properties.identifier)).toEqual(["P1"]);
    expect(newPlaces).toHaveLength(0);
  });

  it("sobre una propuesta de edición copia todo al padre y borra la propuesta", async () => {
    await createPlace(
      makePlaceFeature("PADRE", { properties: { categories: [CATEGORIES.OTHER], floors: [1], name: "Viejo" } }),
    );
    await createPlace(
      makePlaceFeature("PROPUESTA", {
        properties: {
          name: "Nombre corregido",
          information: "Info corregida",
          categories: [CATEGORIES.LIBRARY],
          floors: [5],
          needApproval: true,
          proposalType: "edit",
          parentPlaceId: "PADRE",
        },
        geometry: { type: "Point", coordinates: [-70.612, -33.502] },
      }),
    );

    await approvePlace("PROPUESTA");

    const padre = await prisma.place.findUniqueOrThrow({
      where: { id: "PADRE" },
      include: { categories: true, floors: true },
    });
    expect(padre.name).toBe("Nombre corregido");
    expect(padre.information).toBe("Info corregida");
    expect(padre.categories.map((c) => c.categoryId)).toEqual([CATEGORIES.LIBRARY]);
    expect(padre.floors.map((f) => f.floorId)).toEqual([5]);
    expect(Number(padre.longitude)).toBeCloseTo(-70.612, 8);
    expect(padre.needApproval).toBe(false);

    expect(await prisma.place.findUnique({ where: { id: "PROPUESTA" } })).toBeNull();
  });

  it("lanza si el lugar no existe", async () => {
    await expect(approvePlace("NO_EXISTE")).rejects.toThrow("Place not found");
  });
});

describe("rejectPlace y deletePlace", () => {
  it("rejectPlace borra la fila y cascadea categorías y pisos", async () => {
    await createPlace(makePlaceFeature("P1", { properties: { needApproval: true } }));

    await rejectPlace("P1");

    expect(await prisma.place.count()).toBe(0);
    expect(await prisma.placeCategory.count()).toBe(0);
    expect(await prisma.placeFloor.count()).toBe(0);
  });

  it("deletePlace cascadea los enlaces de rutas sin borrar la ruta", async () => {
    await createPlace(makePlaceFeature("P1"));
    await createRoute(makeRouteFeature("R1", { placeIds: ["P1"] }));

    await deletePlace("P1");

    expect(await prisma.place.count()).toBe(0);
    expect(await prisma.routePlace.count()).toBe(0);
    expect(await prisma.route.count()).toBe(1);
  });

  it("deletePlace invalida TODO el cache, no solo allPlaces", async () => {
    await createPlace(makePlaceFeature("P1"));
    await createRoute(makeRouteFeature("R1", { placeIds: ["P1"] }));
    expect((await getAllRoutes())[0].properties.placeIds).toEqual(["P1"]);

    await deletePlace("P1");

    expect((await getAllRoutes())[0].properties.placeIds).toEqual([]);
  });

  it("rejectPlace en cambio deja stale el cache de rutas", async () => {
    // Asimetría real: mismo cuerpo que deletePlace, pero invalida solo allPlaces.
    await createPlace(makePlaceFeature("P1", { properties: { needApproval: true } }));
    await createRoute(makeRouteFeature("R1"));
    await prisma.routePlace.create({ data: { routeId: "R1", placeId: "P1" } });
    expect((await getAllRoutes())[0].properties.placeIds).toEqual(["P1"]);

    await rejectPlace("P1");

    expect((await getAllRoutes())[0].properties.placeIds).toEqual(["P1"]);
    expect((await getAllRoutes({ bypassCache: true }))[0].properties.placeIds).toEqual([]);
  });
});
