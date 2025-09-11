import { LayerSpecification } from "maplibre-gl";

export default {
  id: "transportation-path",
  type: "line",
  source: "localtiles",
  "source-layer": "transportation",
  minzoom: 12,
  filter: ["==", ["get", "class"], "path"],
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
  paint: {
    "line-color": "#616f84",
    "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 0.5, 14, 1, 15, 1, 18, 4],
    "line-dasharray": [10, 0],
  },
} as LayerSpecification;
