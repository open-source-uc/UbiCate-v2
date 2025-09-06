import { Layer, Source } from "react-map-gl/maplibre";

import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { LineFeature } from "@/lib/types";

interface RouteInfoMarkerProps {
  route: LineFeature;
  beforeId?: string;
}

export default function RouteLayer({ route }: RouteInfoMarkerProps) {
  const routeGeoJSON = featuresToGeoJSON(route);

  return (
    <>
      {/* White border layer (rendered first) */}
      <Source id="route-border" type="geojson" data={routeGeoJSON}>
        <Layer
          id="route-border"
          type="line"
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
          paint={{
            "line-color": "#28536B",
            "line-width": 7,
          }}
        />
      </Source>

      {/* Blue route line (rendered on top) */}
      <Source id="route" type="geojson" data={routeGeoJSON}>
        <Layer
          id="route"
          type="line"
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
          paint={{
            "line-color": "#015fff",
            "line-width": 5,
          }}
        />
      </Source>
    </>
  );
}
