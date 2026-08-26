import { describe, expect, it } from "vitest";

import { featureToEventData, featureToPlaceData, featureToRouteData } from "@/lib/db/transform";
import { CATEGORIES, type Feature, type RouteFeature } from "@/lib/types";

import { CAMPUS_ID, INSIDE, makeEventFeature, makePlaceFeature, makeRouteFeature } from "../helpers/factories";

describe("featureToPlaceData", () => {
  it("un Point deja longitude/latitude con sus coordenadas", () => {
    const data = featureToPlaceData(makePlaceFeature("P1"));

    expect(data.longitude).toBe(INSIDE[0]);
    expect(data.latitude).toBe(INSIDE[1]);
    expect(data.geometryType).toBe("Point");
  });

  it("un Polygon deja longitude/latitude en null", () => {
    const feature: Feature = {
      type: "Feature",
      properties: makePlaceFeature("P1").properties,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-70.62, -33.51],
            [-70.6, -33.51],
            [-70.6, -33.49],
            [-70.62, -33.51],
          ],
        ],
      },
    };

    const data = featureToPlaceData(feature);

    expect(data.longitude).toBeNull();
    expect(data.latitude).toBeNull();
    expect(data.geometryType).toBe("Polygon");
  });

  it("los strings vacíos de campus y parentPlaceId se guardan como null", () => {
    const data = featureToPlaceData(makePlaceFeature("P1", { properties: { campus: "", parentPlaceId: "" } }));

    expect(data.campusId).toBeNull();
    expect(data.parentPlaceId).toBeNull();
  });

  it("rellena los defaults de floors, needApproval y proposalType", () => {
    const data = featureToPlaceData(makePlaceFeature("P1", { properties: { floors: undefined } }));

    expect(data.floors).toEqual([]);
    expect(data.needApproval).toBe(false);
    expect(data.proposalType).toBeNull();
  });

  it("clona la geometría en vez de compartir la referencia con el Feature", () => {
    const feature = makePlaceFeature("P1");
    const data = featureToPlaceData(feature);

    expect(data.geometry).not.toBe(feature.geometry);
    expect(data.geometry).toEqual(feature.geometry);
  });
});

describe("featureToRouteData", () => {
  it("guarda el centroide de los vértices como longitude/latitude", () => {
    // Una ruta no tiene punto propio: se promedian los vértices para que el panel sepa dónde encuadrar.
    const data = featureToRouteData(makeRouteFeature("R1"));

    expect(data.longitude).toBeCloseTo((-70.615 + -70.61 + -70.605) / 3, 10);
    expect(data.latitude).toBeCloseTo((-33.505 + -33.5 + -33.495) / 3, 10);
  });

  it("sin vértices deja longitude/latitude en null", () => {
    const route: RouteFeature = { ...makeRouteFeature("R1"), geometry: { type: "LineString", coordinates: [] } };

    const data = featureToRouteData(route);

    expect(data.longitude).toBeNull();
    expect(data.latitude).toBeNull();
  });

  it("normaliza el color para que el mismo hex escrito distinto no cambie el ETag", () => {
    expect(featureToRouteData(makeRouteFeature("R1", { color: "#22C55E" })).color).toBe("#22c55e");
    expect(featureToRouteData(makeRouteFeature("R1", { color: "#2C5" })).color).toBe("#22cc55");
  });

  it("un color inválido o ausente queda en null", () => {
    expect(featureToRouteData(makeRouteFeature("R1", { color: "verde" })).color).toBeNull();
    expect(featureToRouteData(makeRouteFeature("R1", { color: null })).color).toBeNull();
  });

  it("conserva el campus elegido a mano", () => {
    expect(featureToRouteData(makeRouteFeature("R1")).campusId).toBe(CAMPUS_ID);
    expect(featureToRouteData(makeRouteFeature("R1", { campus: "" })).campusId).toBeNull();
  });
});

describe("featureToEventData", () => {
  it("lee una fecha sin zona como UTC, para que el round-trip no dependa del servidor", () => {
    const data = featureToEventData(
      makeEventFeature("E1", { startDate: "2026-09-01T10:00", endDate: "2026-09-01T18:30" }),
    );

    expect(data.startDate.toISOString()).toBe("2026-09-01T10:00:00.000Z");
    expect(data.endDate.toISOString()).toBe("2026-09-01T18:30:00.000Z");
  });

  it("respeta la zona cuando la fecha ya la trae", () => {
    const data = featureToEventData(
      makeEventFeature("E1", { startDate: "2026-09-01T10:00:00Z", endDate: "2026-09-01T10:00:00+03:00" }),
    );

    expect(data.startDate.toISOString()).toBe("2026-09-01T10:00:00.000Z");
    expect(data.endDate.toISOString()).toBe("2026-09-01T07:00:00.000Z");
  });

  it("showFrom es null cuando no viene", () => {
    expect(featureToEventData(makeEventFeature("E1")).showFrom).toBeNull();
    expect(featureToEventData(makeEventFeature("E1", { showFrom: "2026-08-30T09:00" })).showFrom?.toISOString()).toBe(
      "2026-08-30T09:00:00.000Z",
    );
  });

  it("categories y floors van como arrays escalares, no como tablas puente", () => {
    const data = featureToEventData(makeEventFeature("E1", { categories: [CATEGORIES.EVENTS], floors: [2, 3] }));

    expect(data.categories).toEqual([CATEGORIES.EVENTS]);
    expect(data.floors).toEqual([2, 3]);
  });
});
