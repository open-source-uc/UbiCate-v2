"use client";

import { useState } from "react";

import { centroid } from "@turf/centroid";
import { nearestPointOnLine } from "@turf/turf";

import { Button } from "@/app/components/ui/button";
import * as Icons from "@/app/components/ui/icons/icons";
import MaterialSymbol from "@/app/components/ui/icons/MaterialSymbol";
import MarkDownComponent from "@/app/components/ui/markDown";
import { useSidebar } from "@/app/context/sidebarCtx";
import { emitFlyToEvent } from "@/lib/events/customEvents";
import { normalizeIdentifier } from "@/lib/places/utils";
import { buildShareUrl, shareLink } from "@/lib/share/shareLink";
import { Feature, siglas } from "@/lib/types";

interface RouteInformationProps {
  onClose: () => void;
  /** Volver al listado de rutas. */
  onBack: () => void;
}

function placeAnchor(place: Feature): [number, number] | null {
  if (place.geometry.type === "Point") return [place.geometry.coordinates[0], place.geometry.coordinates[1]];
  const ring = place.geometry.coordinates[0];
  if (!ring || ring.length === 0) return null;
  return centroid(place.geometry).geometry.coordinates as [number, number];
}

// `placeIds` no guarda orden (la tabla puente no tiene columna de orden), así que se deriva del trazo:
// cada lugar se proyecta sobre la línea y se ordena por la distancia recorrida desde el primer vértice.
function sortAlongRoute(places: Feature[], coords: number[][]): Feature[] {
  if (coords.length < 2) return places;
  const line = { type: "LineString" as const, coordinates: coords };
  return places
    .map((place, i) => {
      const anchor = placeAnchor(place);
      const distance = anchor ? nearestPointOnLine(line, anchor).properties.totalDistance : Infinity;
      return { place, distance, i };
    })
    .sort((a, b) => a.distance - b.distance || a.i - b.i)
    .map(({ place }) => place);
}

/** Ficha completa de una ruta, el equivalente de `placeInformation` para lugares. */
export default function RouteInformation({ onClose, onBack }: RouteInformationProps) {
  const { allFeatures, routeDetail, selectedRoute } = useSidebar();
  // Se guarda la ruta abierta y no un booleano, así al pasar a otra ruta la lista vuelve a colapsarse.
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // El Feature llega entero desde el mapa; `selectedRoute` es el respaldo porque en el mapa solo se
  // dibuja la ruta seleccionada, así que la línea clickeada es necesariamente esa.
  const route = routeDetail ?? selectedRoute ?? null;

  if (!route) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-muted-foreground">Esta ruta ya no está disponible.</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground"
        >
          Ver todas las rutas
        </button>
      </div>
    );
  }

  const coords = route.geometry.coordinates;

  const places = sortAlongRoute(
    route.properties.placeIds
      .map((id) => allFeatures.find((f) => normalizeIdentifier(f.properties.identifier) === normalizeIdentifier(id)))
      .filter((f): f is Feature => f !== undefined),
    coords,
  );

  const isExpanded = expandedRouteId === route.properties.identifier;

  // Mismo enlace que el botón Compartir de un lugar, con el param `route`: al abrirlo, `map.tsx` dibuja
  // la ruta y abre esta ficha.
  const handleShare = () => {
    if (typeof window === "undefined") return;
    shareLink(buildShareUrl({ route: route.properties.identifier }));
  };

  // Solo centra el mapa: `emitPlaceSelectedEvent` seleccionaría el lugar y el sidebar saltaría a su
  // ficha, sacando de pantalla el detalle de la ruta.
  const handleFlyToPlace = (place: Feature) => {
    const anchor = placeAnchor(place);
    if (anchor) emitFlyToEvent(anchor[0], anchor[1], 18);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-start justify-between gap-2 w-full px-4 py-3 border-b border-border">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-10 h-10 shrink-0 rounded-lg bg-primary flex items-center justify-center">
            <MaterialSymbol name="route" className="text-[22px] text-background" />
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-foreground break-words">{route.properties.name}</h3>
            <p className="text-xs text-muted-foreground">
              Campus {siglas.get(route.properties.campus) ?? route.properties.campus} · {coords.length} puntos
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 shrink-0 bg-primary flex items-center justify-center rounded-full cursor-pointer group hover:bg-secondary transition"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4 fill-background group-hover:fill-secondary-foreground" />
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground"
          >
            Todas las rutas
          </button>
          <Button
            onClick={handleShare}
            aria-label="Compartir esta ruta"
            variant="mapPrimary"
            className="shrink-0 gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            <Icons.Share className="h-4 w-4 fill-background" />
            <span>Compartir</span>
          </Button>
        </div>

        <section>
          {places.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setExpandedRouteId(isExpanded ? null : route.properties.identifier)}
                aria-expanded={isExpanded}
                aria-controls="route-places-list"
                className="flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left text-sm font-semibold text-foreground"
              >
                <span>Lugares de la ruta ({places.length})</span>
                <MaterialSymbol
                  name="chevron_right"
                  className={`text-[20px] text-muted-foreground transition-transform duration-300 motion-reduce:transition-none ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
              {/* grid-rows 0fr→1fr anima la altura sin medir el contenido. */}
              <div
                id="route-places-list"
                inert={!isExpanded}
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <ol className="min-h-0 overflow-hidden space-y-1">
                  {places.map((place, i) => (
                    <li
                      key={place.properties.identifier}
                      style={{ transitionDelay: isExpanded ? `${Math.min(i, 10) * 30}ms` : "0ms" }}
                      className={`transition duration-300 ease-out motion-reduce:transition-none ${
                        isExpanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                      } ${i === 0 ? "mt-2" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleFlyToPlace(place)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-foreground transition hover:bg-accent/10"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                          {i + 1}
                        </span>
                        <span className="truncate">{place.properties.name}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <>
              <h4 className="text-sm font-semibold text-foreground">Lugares de la ruta</h4>
              <p className="mt-1 text-sm text-muted-foreground italic">Esta ruta no tiene lugares asociados.</p>
            </>
          )}
        </section>

        {route.properties.information ? (
          <section>
            <h4 className="text-sm font-semibold text-foreground">Descripción</h4>
            <div className="mt-1 text-sm text-foreground">
              <MarkDownComponent>{route.properties.information}</MarkDownComponent>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
