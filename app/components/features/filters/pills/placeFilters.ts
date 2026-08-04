import type { EventFeature, Feature } from "@/lib/types";
import { getParentPlaceIds, isEventVisible } from "@/lib/types";
import { nowInChile } from "@/lib/utils/time";

export interface PlaceFilter {
  (geoJson: any, query: string): any[];
}

export const categoryFilter: PlaceFilter = (geoJson, query) => {
  return geoJson.features.filter(
    (feature: { properties: { categories: string | string[]; category: string } }) =>
      (Array.isArray(feature.properties.categories)
        ? feature.properties.categories.includes(query)
        : feature.properties.categories === query) ||
      (feature.properties.category && feature.properties.category.toLowerCase().includes(query.toLowerCase())),
  );
};

export const nameFilter: PlaceFilter = (geoJson, query) => {
  return geoJson.features.filter((feature: { properties: { name: string } }) =>
    feature.properties.name.toLowerCase().startsWith(query.toLowerCase()),
  );
};

// ----- Eventos -----

// Eventos visibles ahora (según showFrom/startDate/endDate + periodo de gracia).
export function getActiveEvents(events: EventFeature[], now: Date = nowInChile()): EventFeature[] {
  return events.filter((ev) => isEventVisible(ev.properties, now));
}

// Resuelve los lugares a dibujar para el filtro de eventos: cada lugar padre (aprobado o inline)
// con un displayName ("nombre del evento" o "N eventos"). Devuelve además el set de ids con evento.
export function getEventPlaces(
  events: EventFeature[],
  approvedFeatures: Feature[],
  eventPlaceFeatures: Feature[],
): { places: Feature[]; eventPlaceIds: Set<string> } {
  const places: Feature[] = [];
  const seenIds = new Set<string>();
  const eventPlaceIds = new Set<string>();
  const eventsByPlace = new Map<string, EventFeature[]>();

  events.forEach((event) => {
    getParentPlaceIds(event.properties).forEach((id) => {
      const list = eventsByPlace.get(id) || [];
      list.push(event);
      eventsByPlace.set(id, list);
    });
  });

  const findPlace = (id: string): Feature | undefined =>
    approvedFeatures.find((f) => f.properties.identifier === id) ||
    eventPlaceFeatures.find((f) => f.properties.identifier === id);

  for (const [placeId, eventList] of eventsByPlace) {
    const place = findPlace(placeId);
    if (!place) continue;
    const featureId = place.properties.identifier;
    if (seenIds.has(featureId)) continue;
    seenIds.add(featureId);
    eventPlaceIds.add(featureId);
    const displayName = eventList.length === 1 ? eventList[0].properties.name : `${eventList.length} eventos`;
    places.push({ ...place, properties: { ...place.properties, displayName } });
  }

  return { places, eventPlaceIds };
}
