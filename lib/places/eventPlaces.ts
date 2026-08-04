import { EventFeature, Feature, getParentPlaceIds, isEventExpired } from "@/lib/types";
import { nowInChile } from "@/lib/utils/time";

import { normalizeIdentifier } from "./utils";

/*
eventPlaces.json guarda dos tipos de feature mezclados en la misma colección:

  - EVENTOS: tienen properties.startDate
  - LUGARES DE EVENTO: no tienen startDate. Son ubicaciones creadas para un evento
    (no existen en places.json) y solo tienen sentido mientras algún evento las apunte
    desde su parentPlaceIds.

Este módulo centraliza las reglas de limpieza para que el servidor y el cliente
descarten exactamente lo mismo.
*/

export type EventPlacesFeature = EventFeature | Feature;

export function isEventFeature(feature: EventPlacesFeature): feature is EventFeature {
  return "startDate" in feature.properties;
}

export interface PruneOptions {
  /** Momento contra el que se evalúa el vencimiento. Por defecto, la hora actual de Chile. */
  now?: Date;
  /**
   * Si es true, además de los lugares huérfanos se descartan los eventos vencidos
   * (los que terminaron hace más del período de gracia).
   * El overlay de debug lo deja en false porque ahí sí se quieren ver los vencidos.
   */
  dropExpiredEvents?: boolean;
  /**
   * Identifiers de eventos que nunca se descartan, aunque estén vencidos.
   * Se usa en las mutaciones para no borrar el evento que la request está escribiendo.
   */
  keepEventIds?: string[];
}

export interface PruneResult {
  features: EventPlacesFeature[];
  removedEvents: EventFeature[];
  removedPlaces: Feature[];
  /** true si se descartó al menos un feature (sirve para decidir si vale la pena commitear). */
  changed: boolean;
}

/**
 * Limpia una colección de eventPlaces.json en dos pasos:
 *
 *   1. (opcional) Descarta los eventos vencidos, salvo los listados en keepEventIds.
 *   2. Descarta los lugares de evento que ya no están referenciados por ningún evento
 *      sobreviviente, es decir, los que quedaron huérfanos.
 *
 * El orden importa: primero se van los eventos, y recién ahí se sabe qué lugares
 * quedaron sin dueño. Un lugar referenciado por varios eventos sobrevive mientras
 * quede al menos uno.
 *
 * Es una función pura: devuelve una colección nueva y no toca la que recibe.
 *
 * Para agregar una regla nueva (por ejemplo, descartar eventos sin lugares), sumá el
 * filtro en el paso 1 y dejá el paso 2 tal cual: se recalcula solo.
 */
export function pruneEventPlaces(features: EventPlacesFeature[], options: PruneOptions = {}): PruneResult {
  const { now = nowInChile(), dropExpiredEvents = false, keepEventIds = [] } = options;

  const keep = new Set(keepEventIds.map(normalizeIdentifier));
  const removedEvents: EventFeature[] = [];
  const removedPlaces: Feature[] = [];

  // Paso 1: qué eventos sobreviven
  const survivingEvents: EventFeature[] = [];
  for (const feature of features) {
    if (!isEventFeature(feature)) continue;

    const isKept = keep.has(normalizeIdentifier(feature.properties.identifier));
    if (dropExpiredEvents && !isKept && isEventExpired(feature.properties, now)) {
      removedEvents.push(feature);
      continue;
    }
    survivingEvents.push(feature);
  }

  // Paso 2: qué lugares siguen siendo apuntados por esos eventos
  const referencedIds = new Set<string>();
  for (const event of survivingEvents) {
    for (const id of getParentPlaceIds(event.properties)) {
      referencedIds.add(normalizeIdentifier(id));
    }
  }

  // Se reconstruye respetando el orden original de la colección
  const kept: EventPlacesFeature[] = [];
  for (const feature of features) {
    if (isEventFeature(feature)) {
      if (removedEvents.includes(feature)) continue;
      kept.push(feature);
      continue;
    }

    if (referencedIds.has(normalizeIdentifier(feature.properties.identifier))) {
      kept.push(feature);
    } else {
      removedPlaces.push(feature);
    }
  }

  return {
    features: kept,
    removedEvents,
    removedPlaces,
    changed: removedEvents.length > 0 || removedPlaces.length > 0,
  };
}
