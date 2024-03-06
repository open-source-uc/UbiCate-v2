import type { LayerProps } from "react-map-gl";

// Layers

export const placesLayer: LayerProps = {
  id: "places-circle",
  type: "circle",
  filter: ["!", ["has", "point_count"]],
  source: "places",
  paint: {
    "circle-color": [
      "match",
      ["get", "categories"], // Updated to access the "categories" property
      "classroom",
      "#FF8C00",
      "shop",
      "#0ef305",
      "other",
      "#e55e5e",
      "#808080",
    ],
    "circle-radius": 5,
  },
};
