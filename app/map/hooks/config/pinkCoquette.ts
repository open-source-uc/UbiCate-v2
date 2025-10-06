import type { LayerProps } from "react-map-gl/maplibre";

export const placesTextLayer: LayerProps = {
  id: "places-text",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Roboto Slab Medium", "Arial Unicode MS Regular"],
    "text-size": 16,
    "text-anchor": "top",
    "text-offset": [0, 1],
  },
  paint: {
    "text-color": "#701a75", // Púrpura oscuro para máxima legibilidad
    "text-halo-color": "rgba(253, 242, 248, 0.98)", // Halo rosa muy claro más opaco
    "text-halo-width": 3,
  },
};

export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#a21caf", // Rosa púrpura más fuerte
    "line-width": 2.2,
    "line-dasharray": [2, 1],
  },
};

export const sectionStrokeLayer: LayerProps = {
  id: "area-stroke",
  type: "line",
  paint: {
    "line-color": "#a21caf", // Rosa púrpura consistente y visible
    "line-width": 1.6,
    "line-dasharray": [4, 2],
  },
};

export const sectionAreaLayer: LayerProps = {
  id: "area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(244, 114, 182, 0.35)", // Rosa con más opacidad
  },
};

export const customPolygonStrokeLayer: LayerProps = {
  id: "custom-area-stroke",
  type: "line",
  paint: {
    "line-color": "#86198f", // Rosa púrpura más oscuro para diferenciación
    "line-width": 1.6,
    "line-dasharray": [3, 2],
  },
};

export const customPolygonSectionAreaLayer: LayerProps = {
  id: "custom-area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(168, 28, 175, 0.4)", // Púrpura con mejor opacidad
  },
};
