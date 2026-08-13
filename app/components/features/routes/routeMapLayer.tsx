"use client";

import { Layer, Source } from "react-map-gl/maplibre";

import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { Feature, RouteFeature } from "@/lib/types";

import RouteLayer from "../directions/routeLayer";

// Verde propio de las rutas, el mismo de las capas de debug. No usa --color-route-* porque ese par es
// el de la navegación paso a paso, que es otra cosa y conviene distinguir.
export const ROUTE_COLOR = "#22C55E";
export const ROUTE_BORDER_COLOR = "#0B7A3B";

interface RouteMapLayerProps {
  route: RouteFeature;
  places: Feature[];
}

/** Los lugares de una ruta. Aparte de `RouteMapLayer` porque el formulario los pinta sin la línea. */
export function RoutePlacesLayer({ places, idPrefix }: { places: Feature[]; idPrefix: string }) {
  return (
    <Source id={`${idPrefix}-places`} type="geojson" data={featuresToGeoJSON(places)}>
      <Layer
        id={`${idPrefix}-places-area`}
        type="fill"
        filter={["==", ["geometry-type"], "Polygon"]}
        paint={{ "fill-color": ROUTE_COLOR, "fill-opacity": 0.25 }}
      />
      <Layer
        id={`${idPrefix}-places-outline`}
        type="line"
        filter={["==", ["geometry-type"], "Polygon"]}
        paint={{ "line-color": ROUTE_BORDER_COLOR, "line-width": 2 }}
      />
      <Layer
        id={`${idPrefix}-places-point`}
        type="circle"
        filter={["==", ["geometry-type"], "Point"]}
        paint={{
          "circle-radius": 7,
          "circle-color": ROUTE_COLOR,
          "circle-stroke-width": 2,
          "circle-stroke-color": ROUTE_BORDER_COLOR,
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
        paint={{ "text-color": ROUTE_BORDER_COLOR, "text-halo-color": "#fff", "text-halo-width": 2 }}
      />
    </Source>
  );
}

/** Una ruta guardada dibujada en el mapa: la línea con su nombre y los lugares asociados. */
export default function RouteMapLayer({ route, places }: RouteMapLayerProps) {
  return (
    <>
      <RouteLayer
        route={route}
        idPrefix="ubicate-route"
        label={route.properties.name}
        color={ROUTE_COLOR}
        borderColor={ROUTE_BORDER_COLOR}
      />

      {/* Área de contacto: la línea visible son 5 px y clickearla exigía puntería. Esta va invisible
          (line-opacity 0 igual responde a queryRenderedFeatures) y es la que está en interactiveLayerIds. */}
      <Source id="ubicate-route-hit" type="geojson" data={featuresToGeoJSON(route)}>
        <Layer
          id="ubicate-route-hit"
          type="line"
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{ "line-color": ROUTE_COLOR, "line-opacity": 0, "line-width": 22 }}
        />
      </Source>

      <RoutePlacesLayer places={places} idPrefix="ubicate-route" />
    </>
  );
}
