import { Layer, Source } from "react-map-gl/maplibre";

import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { LineFeature, RouteFeature } from "@/lib/types";

interface RouteInfoMarkerProps {
  route: LineFeature | RouteFeature;
  beforeId?: string;
  /** Prefijo de los ids de source/layer: maplibre no admite dos sources con el mismo id, así que cada
   *  uso simultáneo (navegación vs. ruta en construcción) necesita el suyo. */
  idPrefix?: string;
  /** Nombre a rotular sobre la línea. La ruta de navegación no lleva. */
  label?: string;
  /** Colores explícitos. Sin ellos se usan los del tema (--color-route-*), que es lo que usa la navegación. */
  color?: string;
  borderColor?: string;
}

export default function RouteLayer({ route, idPrefix = "route", label, color, borderColor }: RouteInfoMarkerProps) {
  const routeGeoJSON = featuresToGeoJSON(route);

  // Get CSS variable values for route colors
  const routeBorderColor =
    borderColor ?? getComputedStyle(document.documentElement).getPropertyValue("--color-route-border").trim();

  const routePrimaryColor =
    color ?? getComputedStyle(document.documentElement).getPropertyValue("--color-route-primary").trim();

  return (
    <>
      {/* Border layer (rendered first) */}
      <Source id={`${idPrefix}-border`} type="geojson" data={routeGeoJSON}>
        <Layer
          id={`${idPrefix}-border`}
          type="line"
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
          paint={{
            "line-color": routeBorderColor,
            "line-width": 7,
          }}
        />
      </Source>

      {/* Primary route line (rendered on top) */}
      <Source id={idPrefix} type="geojson" data={routeGeoJSON}>
        <Layer
          id={idPrefix}
          type="line"
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
          paint={{
            "line-color": routePrimaryColor,
            "line-width": 5,
          }}
        />
        {/* text-field acepta un string literal, así que no hace falta que el Feature traiga `name`
            (el de navegación va con properties vacías). */}
        {label ? (
          <Layer
            id={`${idPrefix}-label`}
            type="symbol"
            layout={{
              "text-field": label,
              "text-font": ["Roboto Slab Medium"],
              "text-size": 13,
              "symbol-placement": "line-center",
              "text-offset": [0, -1.4],
            }}
            paint={{
              // El tono oscuro (el del borde) se lee mejor que el de la línea sobre el mapa claro.
              "text-color": routeBorderColor,
              "text-halo-color": "#fff",
              "text-halo-width": 2,
            }}
          />
        ) : null}
      </Source>
    </>
  );
}
