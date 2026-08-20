"use client";

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

/** Ficha completa de una ruta, el equivalente de `placeInformation` para lugares. */
export default function RouteInformation({ onClose, onBack }: RouteInformationProps) {
  const { allFeatures, routeDetail, selectedRoute } = useSidebar();

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

  const places: Feature[] = route.properties.placeIds
    .map((id) => allFeatures.find((f) => normalizeIdentifier(f.properties.identifier) === normalizeIdentifier(id)))
    .filter((f): f is Feature => f !== undefined);

  const coords = route.geometry.coordinates;

  // Mismo enlace que el botón Compartir de un lugar, con el param `route`: al abrirlo, `map.tsx` dibuja
  // la ruta y abre esta ficha.
  const handleShare = () => {
    if (typeof window === "undefined") return;
    shareLink(buildShareUrl({ route: route.properties.identifier }));
  };

  // Solo centra el mapa: `emitPlaceSelectedEvent` seleccionaría el lugar y el sidebar saltaría a su
  // ficha, sacando de pantalla el detalle de la ruta.
  const handleFlyToPlace = (place: Feature) => {
    if (place.geometry.type === "Point") {
      emitFlyToEvent(place.geometry.coordinates[0], place.geometry.coordinates[1], 18);
      return;
    }
    const ring = place.geometry.coordinates[0];
    if (!ring || ring.length === 0) return;
    const lng = ring.reduce((sum, c) => sum + c[0], 0) / ring.length;
    const lat = ring.reduce((sum, c) => sum + c[1], 0) / ring.length;
    emitFlyToEvent(lng, lat, 18);
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
          <h4 className="text-sm font-semibold text-foreground">
            Lugares de la ruta {places.length > 0 ? `(${places.length})` : ""}
          </h4>
          {places.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {places.map((place) => (
                <li key={place.properties.identifier}>
                  <button
                    type="button"
                    onClick={() => handleFlyToPlace(place)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-foreground transition hover:bg-accent/10"
                  >
                    <MaterialSymbol name="location_on" className="text-[20px] text-muted-foreground" />
                    <span className="truncate">{place.properties.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground italic">Esta ruta no tiene lugares asociados.</p>
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
