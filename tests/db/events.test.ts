import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createEvent, deleteEvent, getAllEvents, pruneExpiredEvents, updateEvent } from "@/lib/db/events";
import { createPlace, getAllPlaces } from "@/lib/db/places";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, GRACE_PERIOD_MS } from "@/lib/types";

import { disconnect, resetAll } from "../helpers/db";
import { CAMPUS_ID, DAY_MS, chileInput, makeEventFeature, makePlaceFeature, seedCampus } from "../helpers/factories";

beforeEach(async () => {
  await resetAll();
  await seedCampus();
});

afterAll(disconnect);

describe("getAllEvents", () => {
  it("con la BD vacía devuelve dos listas vacías", async () => {
    await expect(getAllEvents()).resolves.toEqual({ events: [], eventPlaces: [] });
  });

  it("devuelve los eventos y, por separado, los lugares inline", async () => {
    await createPlace(makePlaceFeature("NORMAL"));
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["INLINE"] }), [makePlaceFeature("INLINE")]);

    const { events, eventPlaces } = await getAllEvents();

    expect(events.map((e) => e.properties.identifier)).toEqual(["E1"]);
    expect(eventPlaces.map((p) => p.properties.identifier)).toEqual(["INLINE"]);
  });

  it("los lugares inline no aparecen en el mapa normal", async () => {
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["INLINE"] }), [makePlaceFeature("INLINE")]);

    const { approved, newPlaces } = await getAllPlaces();

    expect([...approved, ...newPlaces]).toHaveLength(0);
  });

  it("devuelve los eventos ordenados por id", async () => {
    await createEvent(makeEventFeature("E2"), []);
    await createEvent(makeEventFeature("E1"), []);

    expect((await getAllEvents()).events.map((e) => e.properties.identifier)).toEqual(["E1", "E2"]);
  });
});

describe("createEvent", () => {
  it("crea los lugares inline como isEventOnly y ya aprobados", async () => {
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["INLINE"] }), [makePlaceFeature("INLINE")]);

    const row = await prisma.place.findUniqueOrThrow({ where: { id: "INLINE" } });

    expect(row.isEventOnly).toBe(true);
    expect(row.needApproval).toBe(false);
  });

  it("enlaza todos los parentPlaceIds, existentes e inline por igual", async () => {
    await createPlace(makePlaceFeature("EXISTENTE"));

    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["EXISTENTE", "INLINE"] }), [
      makePlaceFeature("INLINE"),
    ]);

    const { events } = await getAllEvents();
    expect(events[0].properties.parentPlaceIds).toEqual(["EXISTENTE", "INLINE"]);
  });

  it("guarda el piso que el evento definió para cada lugar", async () => {
    await createPlace(makePlaceFeature("P1"));
    await createPlace(makePlaceFeature("P2"));

    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["P1", "P2"], parentPlaceFloors: { P1: 3 } }), []);

    const { events } = await getAllEvents();
    expect(events[0].properties.parentPlaceFloors).toEqual({ P1: 3 });
  });

  it("no duplica un lugar inline cuyo id ya existe", async () => {
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["INLINE"] }), [makePlaceFeature("INLINE")]);

    await createEvent(makeEventFeature("E2", { parentPlaceIds: ["INLINE"] }), [makePlaceFeature("INLINE")]);

    expect(await prisma.place.count()).toBe(1);
    expect(await prisma.eventPlace.count()).toBe(2);
  });

  it("guarda categorías y pisos como arrays escalares, no como tablas puente", async () => {
    await createEvent(makeEventFeature("E1", { categories: [CATEGORIES.EVENTS], floors: [1, 2] }), []);

    const row = await prisma.event.findUniqueOrThrow({ where: { id: "E1" } });

    expect(row.categories).toEqual([CATEGORIES.EVENTS]);
    expect(row.floors).toEqual([1, 2]);
    expect(row.campusId).toBe(CAMPUS_ID);
  });

  it("las fechas hacen round-trip sin corrimiento de zona", async () => {
    await createEvent(makeEventFeature("E1", { startDate: "2026-09-01T10:00", endDate: "2026-09-02T18:30" }), []);

    const { events } = await getAllEvents();

    expect(events[0].properties.startDate).toBe("2026-09-01T10:00");
    expect(events[0].properties.endDate).toBe("2026-09-02T18:30");
  });

  it("invalida el cache de eventos", async () => {
    await getAllEvents();
    await createEvent(makeEventFeature("E1"), []);

    expect((await getAllEvents()).events).toHaveLength(1);
  });
});

describe("updateEvent", () => {
  it("reemplaza los enlaces del evento", async () => {
    await createPlace(makePlaceFeature("P1"));
    await createPlace(makePlaceFeature("P2"));
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["P1"] }), []);

    await updateEvent("E1", makeEventFeature("E1", { parentPlaceIds: ["P2"] }), []);

    const { events } = await getAllEvents();
    expect(events[0].properties.parentPlaceIds).toEqual(["P2"]);
    expect(await prisma.eventPlace.count()).toBe(1);
  });

  it("borra los lugares inline que quedaron huérfanos y respeta los normales", async () => {
    await createPlace(makePlaceFeature("NORMAL"));
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["NORMAL", "INLINE"] }), [makePlaceFeature("INLINE")]);

    await updateEvent("E1", makeEventFeature("E1", { parentPlaceIds: ["NORMAL"] }), []);

    expect(await prisma.place.findUnique({ where: { id: "INLINE" } })).toBeNull();
    expect(await prisma.place.findUnique({ where: { id: "NORMAL" } })).not.toBeNull();
  });

  it("no borra un lugar inline que otro evento sigue usando", async () => {
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["INLINE"] }), [makePlaceFeature("INLINE")]);
    await createEvent(makeEventFeature("E2", { parentPlaceIds: ["INLINE"] }), []);

    await updateEvent("E1", makeEventFeature("E1", { parentPlaceIds: [] }), []);

    expect(await prisma.place.findUnique({ where: { id: "INLINE" } })).not.toBeNull();
  });

  it("actualiza los campos del evento e invalida el cache", async () => {
    await createEvent(makeEventFeature("E1"), []);
    await getAllEvents();

    await updateEvent("E1", makeEventFeature("E1", { name: "Evento renombrado" }), []);

    expect((await getAllEvents()).events[0].properties.name).toBe("Evento renombrado");
  });
});

describe("deleteEvent", () => {
  it("borra el evento, cascadea event_place y limpia los inline huérfanos", async () => {
    await createPlace(makePlaceFeature("NORMAL"));
    await createEvent(makeEventFeature("E1", { parentPlaceIds: ["NORMAL", "INLINE"] }), [makePlaceFeature("INLINE")]);

    await deleteEvent("E1");

    expect(await prisma.event.count()).toBe(0);
    expect(await prisma.eventPlace.count()).toBe(0);
    expect(await prisma.place.findUnique({ where: { id: "INLINE" } })).toBeNull();
    expect(await prisma.place.findUnique({ where: { id: "NORMAL" } })).not.toBeNull();
  });

  it("invalida el cache de eventos", async () => {
    await createEvent(makeEventFeature("E1"), []);
    await getAllEvents();

    await deleteEvent("E1");

    expect((await getAllEvents()).events).toEqual([]);
  });
});

describe("pruneExpiredEvents", () => {
  it("borra un evento vencido más allá del período de gracia", async () => {
    await createEvent(
      makeEventFeature("VIEJO", {
        startDate: chileInput(-(GRACE_PERIOD_MS + 2 * DAY_MS)),
        endDate: chileInput(-(GRACE_PERIOD_MS + DAY_MS)),
      }),
      [],
    );

    await expect(pruneExpiredEvents()).resolves.toBe(true);
    expect(await prisma.event.count()).toBe(0);
  });

  it("no borra uno vencido que sigue dentro del período de gracia", async () => {
    await createEvent(
      makeEventFeature("RECIEN_VENCIDO", {
        startDate: chileInput(-2 * DAY_MS),
        endDate: chileInput(-Math.floor(GRACE_PERIOD_MS / 2)),
      }),
      [],
    );

    await expect(pruneExpiredEvents()).resolves.toBe(false);
    expect(await prisma.event.count()).toBe(1);
  });

  it("no borra uno vigente y devuelve false", async () => {
    await createEvent(makeEventFeature("VIGENTE"), []);

    await expect(pruneExpiredEvents()).resolves.toBe(false);
    expect(await prisma.event.count()).toBe(1);
  });

  it("respeta keepIds aunque el evento esté vencido", async () => {
    const vencido = {
      startDate: chileInput(-(GRACE_PERIOD_MS + 2 * DAY_MS)),
      endDate: chileInput(-(GRACE_PERIOD_MS + DAY_MS)),
    };
    await createEvent(makeEventFeature("SALVADO", vencido), []);
    await createEvent(makeEventFeature("BORRADO", vencido), []);

    await expect(pruneExpiredEvents(["SALVADO"])).resolves.toBe(true);

    expect((await prisma.event.findMany()).map((e) => e.id)).toEqual(["SALVADO"]);
  });

  it("limpia los lugares inline que quedan huérfanos al borrar el evento", async () => {
    await createEvent(
      makeEventFeature("VIEJO", {
        startDate: chileInput(-(GRACE_PERIOD_MS + 2 * DAY_MS)),
        endDate: chileInput(-(GRACE_PERIOD_MS + DAY_MS)),
        parentPlaceIds: ["INLINE"],
      }),
      [makePlaceFeature("INLINE")],
    );

    await pruneExpiredEvents();

    expect(await prisma.place.findUnique({ where: { id: "INLINE" } })).toBeNull();
  });

  it("invalida el cache solo cuando borró algo", async () => {
    await createEvent(
      makeEventFeature("VIEJO", {
        startDate: chileInput(-(GRACE_PERIOD_MS + 2 * DAY_MS)),
        endDate: chileInput(-(GRACE_PERIOD_MS + DAY_MS)),
      }),
      [],
    );
    await getAllEvents();

    await pruneExpiredEvents();

    expect((await getAllEvents()).events).toEqual([]);
  });
});
