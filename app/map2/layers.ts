import type { LayerProps } from "react-map-gl";

export const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "earthquakes",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": ["step", ["get", "point_count"], "#51bbd6", 100, "#f1f075", 750, "#f28cb1"],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
  },
};

export const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "earthquakes",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
};

export const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  source: "earthquakes",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 4,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

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

export const newClusterLayer: LayerProps = {
  id: "cluster-circle",
  type: "circle",
  filter: ["has", "point_count"],
  source: "places",
  paint: {
    "circle-color": "#FF0000",
    "circle-radius": 15,
  },
};
