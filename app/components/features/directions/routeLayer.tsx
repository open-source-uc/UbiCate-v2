import { Layer, Source } from "react-map-gl/maplibre";

import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { LineFeature } from "@/lib/types";

interface RouteInfoMarkerProps {
  route: LineFeature;
  beforeId?: string;
}

export default function RouteLayer({ route }: RouteInfoMarkerProps) {
  const routeGeoJSON = featuresToGeoJSON(route);

  // Get CSS variable values for route colors
  const routeBorderColor = getComputedStyle(document.documentElement).getPropertyValue("--color-route-border").trim();

  const routePrimaryColor = getComputedStyle(document.documentElement).getPropertyValue("--color-route-primary").trim();

  return (
    <>
      {/* Border layer (rendered first) */}
      <Source id="route-border" type="geojson" data={routeGeoJSON}>
        <Layer
          id="route-border"
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
      <Source id="route" type="geojson" data={routeGeoJSON}>
        <Layer
          id="route"
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
      </Source>
    </>
  );
}
