import type { LayerProps } from "react-map-gl/maplibre";

export const placesTextLayer: LayerProps = {
  id: "places-text",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Roboto Slab Medium", "Arial Unicode MS Regular"],
    "text-size": 13,
    "text-anchor": "top",
    "text-offset": [0, 1],
  },
  paint: {
    "text-color": "#000000",
    "text-halo-color": "rgba(255, 255, 255, 1)",
    "text-halo-width": 1,
  },
};

export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#707070",
    "line-width": 1.8,
    "line-dasharray": [2, 1],
  },
};

export const sectionStrokeLayer: LayerProps = {
  id: "area-stroke",
  type: "line",
  paint: {
    "line-color": "#707070",
    "line-width": 1.2,
    "line-dasharray": [4, 2],
  },
};

export const sectionAreaLayer: LayerProps = {
  id: "area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(236, 72, 153, 0.35)",
  },
};

export const customPolygonStrokeLayer: LayerProps = {
  id: "custom-area-stroke",
  type: "line",
  paint: {
    "line-color": "#a21caf", // Rosa púrpura más intenso para elementos personalizados
    "line-width": 1.2,
    "line-dasharray": [3, 2],
  },
};

export const customPolygonSectionAreaLayer: LayerProps = {
  id: "custom-area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(168, 28, 175, 0.4)", // Rosa púrpura más visible para áreas personalizadas
  },
};
