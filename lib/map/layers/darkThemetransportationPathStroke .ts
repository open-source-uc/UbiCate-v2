import { LayerSpecification } from "maplibre-gl";

export default {
  id: "transportation-path-stroke",
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
    "line-color": "#4a5a70",
    "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 1.5, 14, 2, 15, 2, 18, 6],
    "line-opacity": 0.8,
  },
} as LayerSpecification;