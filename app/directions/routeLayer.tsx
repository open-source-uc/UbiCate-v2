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
          "line-color": "#00FFFF",
          "line-width": 4,
          "line-opacity": 0.9,
          "line-blur": 1.5,
          "line-dasharray": [2, 1],
        }}
      />
    </Source>
  );
}
