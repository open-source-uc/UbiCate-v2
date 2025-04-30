import { Layer, Source } from "react-map-gl";

import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import { LineFeature } from "@/utils/types";

interface RouteInfoMarkerProps {
  route: LineFeature;
}

export default function RouteLayer({ route }: RouteInfoMarkerProps) {
  return (
    <Source id="route" type="geojson" data={featuresToGeoJSON(route)}>
      <Layer
        id="route"
        type="line"
        paint={{
          "line-color": "var(--foreground)",
          "line-width": 2.5,
          "line-dasharray": [1, 1],
        }}
      />
    </Source>
  );
}
