import { LayerSpecification } from "maplibre-gl";

export default {
  id: "transportation-minor-stroke",
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
    "line-color": "#4a5566",
    "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 1.5, 18, 14, 22, 122],
    "line-opacity": 0.8,
  },
} as LayerSpecification;