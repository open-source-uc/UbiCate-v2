import { LayerSpecification } from "maplibre-gl";

export default {
  id: "transportation-minor",
  type: "line",
  source: "localtiles",
  "source-layer": "transportation",
  minzoom: 12,
  filter: ["in", ["get", "class"], ["literal", ["minor", "service", "track"]]],
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
  paint: {
    "line-color": "#5b687b",
    "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 0.5, 18, 12, 22, 120],
  },
} as LayerSpecification;