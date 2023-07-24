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
      ["at", 0, ["get", "categories"]],
      "classroom",
      "#FF8C00",
      "shop",
      "#0ef305",
      "other",
      "#e55e5e",
      "#ccc",
    ],
    "circle-radius": 10,
  },
};

export const clusterLayer: LayerProps = {
  id: "cluster-circle",
  type: "circle",
  filter: ["has", "point_count"],
  source: "places",
  paint: {
    "circle-color": "#FF0000",
    "circle-radius": 15,
  },
};
