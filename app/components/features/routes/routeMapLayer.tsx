"use client";

import { Layer, Marker, Source } from "react-map-gl/maplibre";

import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { Feature, RouteFeature } from "@/lib/types";
import { darkenHex, normalizeHexColor } from "@/lib/utils/color";

import MaterialSymbol from "../../ui/icons/MaterialSymbol";
import RouteLayer from "../directions/routeLayer";

// Verde propio de las rutas, el mismo de las capas de debug, y el que se usa cuando la ruta no tiene
// color propio. No usa --color-route-* porque ese par es el de la navegación paso a paso, que es otra
// cosa y conviene distinguir.
export const ROUTE_COLOR = "#22C55E";
export const ROUTE_BORDER_COLOR = darkenHex(ROUTE_COLOR);

/** El color de la ruta y su borde. El borde NO se guarda: se deriva oscureciendo el color elegido. */
export function routeColors(color?: string | null): { color: string; borderColor: string } {
  const base = normalizeHexColor(color) ?? ROUTE_COLOR;
  return { color: base, borderColor: darkenHex(base) };
}

/**
 * Bandera en el primer vértice: marca por dónde empieza el recorrido, que en una LineString es
 * información real (el orden de los vértices ES la ruta) y la línea sola no comunica.
 *
 * Va como marcador del DOM y no como capa `symbol` porque los glyphs del mapa se auto-hospedan en R2
 * (`Roboto Slab`) y no incluyen iconos: una bandera en una capa de texto no tendría glifo que dibujar.
 */
export function RouteStartFlag({ coordinates, color }: { coordinates: [number, number]; color?: string | null }) {
  const { color: fill, borderColor } = routeColors(color);

  return (
    <Marker longitude={coordinates[0]} latitude={coordinates[1]} anchor="bottom" style={{ pointerEvents: "none" }}>
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full shadow-md"
        style={{ backgroundColor: fill, border: `2px solid ${borderColor}` }}
        aria-hidden="true"
      >
        <MaterialSymbol name="flag" className="text-[15px] text-background" />
      </span>
    </Marker>
  );
}

interface RouteMapLayerProps {
  route: RouteFeature;
  places: Feature[];
}

/** Los lugares de una ruta. Aparte de `RouteMapLayer` porque el formulario los pinta sin la línea. */
export function RoutePlacesLayer({
  places,
  idPrefix,
  color,
}: {
  places: Feature[];
  idPrefix: string;
  color?: string | null;
}) {
  const { color: fillColor, borderColor } = routeColors(color);

  return (
    <Source id={`${idPrefix}-places`} type="geojson" data={featuresToGeoJSON(places)}>
      <Layer
        id={`${idPrefix}-places-area`}
        type="fill"
        filter={["==", ["geometry-type"], "Polygon"]}
        paint={{ "fill-color": fillColor, "fill-opacity": 0.25 }}
      />
      <Layer
        id={`${idPrefix}-places-outline`}
        type="line"
        filter={["==", ["geometry-type"], "Polygon"]}
        paint={{ "line-color": borderColor, "line-width": 2 }}
      />
      <Layer
        id={`${idPrefix}-places-point`}
        type="circle"
        filter={["==", ["geometry-type"], "Point"]}
        paint={{
          "circle-radius": 7,
          "circle-color": fillColor,
          "circle-stroke-width": 2,
          "circle-stroke-color": borderColor,
        }}
      />
      <Layer
        id={`${idPrefix}-places-label`}
        type="symbol"
        layout={{
          "text-field": ["get", "name"],
          "text-font": ["Roboto Slab Medium"],
          "text-size": 12,
          "text-anchor": "top",
          "text-offset": [0, 0.9],
        }}
        paint={{ "text-color": borderColor, "text-halo-color": "#fff", "text-halo-width": 2 }}
      />
    </Source>
  );
}

/** Una ruta guardada dibujada en el mapa: la línea con su nombre y los lugares asociados. */
export default function RouteMapLayer({ route, places }: RouteMapLayerProps) {
  const { color, borderColor } = routeColors(route.properties.color);

  return (
    <>
      <RouteLayer
        route={route}
        idPrefix="ubicate-route"
        label={route.properties.name}
        color={color}
        borderColor={borderColor}
      />

      {/* Área de contacto: la línea visible son 5 px y clickearla exigía puntería. Esta va invisible
          (line-opacity 0 igual responde a queryRenderedFeatures) y es la que está en interactiveLayerIds. */}
      <Source id="ubicate-route-hit" type="geojson" data={featuresToGeoJSON(route)}>
        <Layer
          id="ubicate-route-hit"
          type="line"
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{ "line-color": color, "line-opacity": 0, "line-width": 22 }}
        />
      </Source>

      <RoutePlacesLayer places={places} idPrefix="ubicate-route" color={route.properties.color} />

      {route.geometry.coordinates.length > 0 ? (
        <RouteStartFlag coordinates={route.geometry.coordinates[0]} color={route.properties.color} />
      ) : null}
    </>
  );
}
