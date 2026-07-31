import "@/lib/setup-proxy";

import { NextRequest, NextResponse } from "next/server";

import { fetchApprovedPlaces, fetchEventPlaces, githubFileOperation } from "@/lib/github/operations";
import { EventPlacesFeature, pruneEventPlaces } from "@/lib/places/eventPlaces";
import { createFeatureFromPoints, generateRandomIdWithTimestamp, normalizeIdentifier } from "@/lib/places/utils";
import { EventFeature, Feature, getParentPlaceIds } from "@/lib/types";
import { eventDeleteSchema, eventPlaceSchema, eventPutSchema } from "@/lib/validation/schemas";

const API_UBICATE_SECRET = process.env.API_UBICATE_SECRET;

const emptyCollection = { type: "FeatureCollection", features: [] };

/*
Aplica la limpieza sobre la colección recién bajada de GitHub: se van los eventos
vencidos y los lugares de evento que quedaron huérfanos.

Muta el objeto recibido (es el mismo que después se commitea) y devuelve si hubo cambios,
para no generar commits vacíos.

keepEventIds sirve para que una mutación no borre el evento que está escribiendo:
en debug se pueden editar eventos ya vencidos y no queremos que el PUT los haga desaparecer.
*/
function cleanEventPlaces(eventPlaces: { features: any[] }, keepEventIds: string[] = []): boolean {
  const { features, changed, removedEvents, removedPlaces } = pruneEventPlaces(
    eventPlaces.features as EventPlacesFeature[],
    { dropExpiredEvents: true, keepEventIds },
  );

  if (changed) {
    console.log(
      `Limpieza de eventos: ${removedEvents.length} evento(s) vencido(s), ${removedPlaces.length} lugar(es) huérfano(s)`,
    );
    eventPlaces.features = features as any[];
  }

  return changed;
}

export async function GET(request: NextRequest) {
  try {
    const { url: eventsUrl, fileData: eventPlaces, file_sha: eventsSha } = await fetchEventPlaces();

    const changed = cleanEventPlaces(eventPlaces);

    /*
    La limpieza se persiste solo si la request viene autenticada (modo debug).
    Un GET anónimo igual recibe la colección ya limpia, pero no dispara un commit:
    este endpoint es público y no queremos que cualquiera pueda generar escrituras.
    */
    if (changed && request.headers.get("ubicate-token") === API_UBICATE_SECRET) {
      try {
        await githubFileOperation(
          eventsUrl,
          { properties: { name: "limpieza automática", identifier: "-" } } as Feature,
          eventPlaces,
          eventsSha,
          "CLEAN_EVENTS",
        );
      } catch (error) {
        // Si el commit falla igual devolvemos la colección limpia: es solo mantenimiento
        console.error("No se pudo persistir la limpieza de eventos:", error);
      }
    }

    return NextResponse.json(
      {
        message: "Success",
        events: eventPlaces,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET events:", error);
    return NextResponse.json(
      {
        message: "Success",
        events: emptyCollection,
      },
      { status: 200 },
    );
  }
}

async function resolveLocations(
  locations: Array<{
    type: string;
    placeId?: string;
    name?: string;
    information?: string;
    identifier?: string;
    floor?: number;
    points?: any[];
  }>,
  categories: string[],
  floors: number[],
  eventPlaces: Feature[],
  approvedPlaces?: Feature[],
): Promise<{ parentPlaceIds: string[]; newPlaceFeatures: Feature[]; parentPlaceFloors: Record<string, number> }> {
  const parentPlaceIds: string[] = [];
  const newPlaceFeatures: Feature[] = [];
  const parentPlaceFloors: Record<string, number> = {};

  for (const loc of locations) {
    if (loc.type === "existing" && loc.placeId) {
      const normalizedId = normalizeIdentifier(loc.placeId);
      const exists = approvedPlaces?.some((f) => normalizeIdentifier(f.properties.identifier) === normalizedId);
      if (!exists) {
        continue;
      }
      parentPlaceIds.push(loc.placeId);
      if (typeof loc.floor === "number") {
        parentPlaceFloors[loc.placeId] = loc.floor;
      }
    } else if (loc.type === "new" && loc.name) {
      const locPoints = loc.points || [];
      if (locPoints.length === 0) continue;

      const feature = createFeatureFromPoints(locPoints, {
        identifier: loc.identifier || generateRandomIdWithTimestamp(),
        name: loc.name,
        information: loc.information || "",
        categories,
        floors,
      });

      if (feature) {
        newPlaceFeatures.push(feature);
        parentPlaceIds.push(feature.properties.identifier);
        if (typeof loc.floor === "number") {
          parentPlaceFloors[feature.properties.identifier] = loc.floor;
        }
      }
    }
  }

  return { parentPlaceIds, newPlaceFeatures, parentPlaceFloors };
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

    const { data, points, locations } = result.data;

    if (data.startDate > data.endDate) {
      return NextResponse.json({ message: "La fecha de inicio debe ser anterior a la fecha de fin" }, { status: 400 });
    }

    if (locations.length === 0) {
      return NextResponse.json({ message: "Debe agregar al menos un lugar" }, { status: 400 });
    }

    const firstNewLocationPoint = locations.find((l) => l.type === "new" && l.points && l.points.length > 0)
      ?.points?.[0];

    let approvedPlaces: Feature[] | undefined;
    const hasExisting = locations.some((l) => l.type === "existing");

    if (hasExisting) {
      const { fileData } = await fetchApprovedPlaces();
      approvedPlaces = fileData.features;
    }

    let nuevoEvento: Feature | null = null;

    if (firstNewLocationPoint) {
      nuevoEvento = createFeatureFromPoints([firstNewLocationPoint], {
        identifier: "",
        name: data.name,
        information: data.information,
        categories: data.categories,
        floors: data.floors,
      });
    } else if (hasExisting && approvedPlaces && approvedPlaces.length > 0) {
      const firstExisting = locations.find((l) => l.type === "existing");
      if (firstExisting) {
        const place = approvedPlaces.find(
          (f) => normalizeIdentifier(f.properties.identifier) === normalizeIdentifier(firstExisting.placeId!),
        );
        if (place) {
          nuevoEvento = {
            type: "Feature",
            geometry: place.geometry,
            properties: {
              identifier: "",
              name: data.name,
              information: data.information,
              categories: data.categories,
              floors: data.floors,
              campus: place.properties.campus,
              faculties: place.properties.faculties,
            },
          };
        }
      }
    }

    if (!nuevoEvento) {
      return NextResponse.json(
        { message: "Se requiere al menos un lugar o punto para ubicar un evento" },
        { status: 400 },
      );
    }

    if (nuevoEvento.properties.campus === "") {
      return NextResponse.json({ message: "El evento no está dentro de un campus" }, { status: 400 });
    }

    nuevoEvento.properties.identifier = generateRandomIdWithTimestamp();

    const { url: eventsUrl, fileData: eventPlaces, file_sha: eventsSha } = await fetchEventPlaces();
    cleanEventPlaces(eventPlaces);

    const normalizedId = normalizeIdentifier(nuevoEvento.properties.identifier);
    const existsInEvents = eventPlaces.features.some(
      (feature) => normalizeIdentifier(feature.properties.identifier) === normalizedId,
    );

    if (existsInEvents) {
      return NextResponse.json({ message: "¡El evento ya existe!" }, { status: 400 });
    }

    const { parentPlaceIds, newPlaceFeatures, parentPlaceFloors } = await resolveLocations(
      locations,
      data.categories,
      data.floors,
      eventPlaces.features as Feature[],
      approvedPlaces,
    );

    for (const f of newPlaceFeatures) {
      const normId = normalizeIdentifier(f.properties.identifier);
      if (eventPlaces.features.some((x) => normalizeIdentifier(x.properties.identifier) === normId)) continue;
      eventPlaces.features.unshift(f as any);
    }

    const eventFeature: EventFeature = {
      ...nuevoEvento,
      properties: {
        ...nuevoEvento.properties,
        startDate: data.startDate,
        endDate: data.endDate,
        ...(data.showFrom ? { showFrom: data.showFrom } : {}),
        parentPlaceIds,
        ...(Object.keys(parentPlaceFloors).length > 0 ? { parentPlaceFloors } : {}),
      },
    };

    eventPlaces.features.unshift(eventFeature);
    await githubFileOperation(
      eventsUrl,
      eventFeature,
      eventPlaces,
      eventsSha,
      newPlaceFeatures.length > 0 ? "CREATE_EVENT_PLACE" : "CREATE_EVENT",
    );

    return NextResponse.json({
      message: "¡El evento fue creado!",
    });
  } catch (error) {
    console.error("Error in POST event:", error);
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

    const { data, points, identifier, locations } = result.data;

    if (data.startDate > data.endDate) {
      return NextResponse.json({ message: "La fecha de inicio debe ser anterior a la fecha de fin" }, { status: 400 });
    }

    if (locations.length === 0) {
      return NextResponse.json({ message: "Debe agregar al menos un lugar" }, { status: 400 });
    }

    const firstNewLocationPoint = locations.find((l) => l.type === "new" && l.points && l.points.length > 0)
      ?.points?.[0];

    const hasExisting = locations.some((l) => l.type === "existing");
    let approvedPlaces: Feature[] | undefined;

    if (hasExisting) {
      const { fileData } = await fetchApprovedPlaces();
      approvedPlaces = fileData.features;
    }

    let updatedEvento: Feature | null = null;

    if (firstNewLocationPoint) {
      updatedEvento = createFeatureFromPoints([firstNewLocationPoint], {
        identifier,
        name: data.name,
        information: data.information,
        categories: data.categories,
        floors: data.floors,
      });
    } else if (hasExisting && approvedPlaces && approvedPlaces.length > 0) {
      const firstExisting = locations.find((l) => l.type === "existing");
      if (firstExisting) {
        const place = approvedPlaces.find(
          (f) => normalizeIdentifier(f.properties.identifier) === normalizeIdentifier(firstExisting.placeId!),
        );
        if (place) {
          updatedEvento = {
            type: "Feature",
            geometry: place.geometry,
            properties: {
              identifier,
              name: data.name,
              information: data.information,
              categories: data.categories,
              floors: data.floors,
              campus: place.properties.campus,
              faculties: place.properties.faculties,
            },
          };
        }
      }
    }

    if (!updatedEvento) {
      return NextResponse.json(
        { message: "Se requiere al menos un lugar o punto para ubicar un evento" },
        { status: 400 },
      );
    }

    if (updatedEvento.properties.campus === "") {
      return NextResponse.json({ message: "El evento no está dentro de un campus" }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(identifier);
    const { url: eventsUrl, fileData: eventPlaces, file_sha: eventsSha } = await fetchEventPlaces();
    // El evento que se está editando se preserva aunque esté vencido
    cleanEventPlaces(eventPlaces, [identifier]);

    const eventIndex = eventPlaces.features.findIndex(
      (feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    if (eventIndex === -1) {
      return NextResponse.json({ message: "¡El evento NO existe!" }, { status: 404 });
    }

    // Remove old location features referenced by THIS event (but not by other events)
    const oldEvent = eventPlaces.features[eventIndex] as any;
    const oldParentIds = oldEvent.properties?.startDate ? getParentPlaceIds(oldEvent.properties) : [];
    const oldParentIdSet = new Set(oldParentIds.map(normalizeIdentifier));

    const referencedByOthers = new Set<string>();
    for (let i = 0; i < eventPlaces.features.length; i++) {
      if (i === eventIndex) continue;
      const feature = eventPlaces.features[i];
      if (!(feature as any).properties?.startDate) continue;
      const ids = getParentPlaceIds(feature.properties as any);
      for (const id of ids) {
        referencedByOthers.add(normalizeIdentifier(id));
      }
    }

    eventPlaces.features = eventPlaces.features.filter((f) => {
      if ((f as any).properties?.startDate) return true;
      const normId = normalizeIdentifier(f.properties.identifier);
      if (oldParentIdSet.has(normId) && !referencedByOthers.has(normId)) {
        return false;
      }
      return true;
    });

    // Re-find event index after filtering (indices may have shifted)
    const updatedEventIndex = eventPlaces.features.findIndex(
      (feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    if (updatedEventIndex === -1) {
      return NextResponse.json({ message: "Error al actualizar: evento no encontrado tras limpieza" }, { status: 500 });
    }

    const { parentPlaceIds, newPlaceFeatures, parentPlaceFloors } = await resolveLocations(
      locations,
      data.categories,
      data.floors,
      eventPlaces.features as Feature[],
      approvedPlaces,
    );

    const eventFeature: EventFeature = {
      ...updatedEvento,
      properties: {
        ...updatedEvento.properties,
        startDate: data.startDate,
        endDate: data.endDate,
        ...(data.showFrom ? { showFrom: data.showFrom } : {}),
        parentPlaceIds,
        ...(Object.keys(parentPlaceFloors).length > 0 ? { parentPlaceFloors } : {}),
      },
    };

    eventPlaces.features[updatedEventIndex] = eventFeature;

    for (const f of newPlaceFeatures) {
      const normId = normalizeIdentifier(f.properties.identifier);
      if (eventPlaces.features.some((x) => normalizeIdentifier(x.properties.identifier) === normId)) continue;
      eventPlaces.features.unshift(f as any);
    }

    cleanEventPlaces(eventPlaces, [identifier]);

    await githubFileOperation(
      eventsUrl,
      eventFeature,
      eventPlaces,
      eventsSha,
      newPlaceFeatures.length > 0 ? "UPDATE_EVENT_PLACE" : "UPDATE_EVENT",
    );

    return NextResponse.json({ message: "¡El evento fue actualizado!" });
  } catch (error) {
    console.error("Error in PUT event:", error);
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
    const result = eventDeleteSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(result.data.identifier);
    const { url: eventsUrl, fileData: eventPlaces, file_sha: eventsSha } = await fetchEventPlaces();
    const eventIndex = eventPlaces.features.findIndex(
      (feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    if (eventIndex === -1) {
      return NextResponse.json({ message: "¡El evento NO existe!" }, { status: 404 });
    }

    const eventToDelete = eventPlaces.features[eventIndex];
    eventPlaces.features.splice(eventIndex, 1);

    cleanEventPlaces(eventPlaces);

    await githubFileOperation(eventsUrl, eventToDelete, eventPlaces, eventsSha, "DELETE_EVENT");

    return NextResponse.json({ message: "¡El evento fue eliminado!" });
  } catch (error) {
    console.error("Error in DELETE event:", error);
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
