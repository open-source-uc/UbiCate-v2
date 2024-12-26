import type { LayerProps } from "react-map-gl";

export const placesTextLayer: LayerProps = {
  id: "places-text",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Open Sans Bold"],
    "text-size": 12,
    "text-anchor": "top",
  },
  paint: {
    "text-color": "#000",
  },
};

export const placesDarkTextLayer: LayerProps = {
  id: "places-dark-text",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Open Sans Bold"],
    "text-size": 12,
    "text-anchor": "top",
  },
  paint: {
    "text-color": "#fff",
  },
};

export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#716ADB",
    "line-width": 3,
    "line-dasharray": [1, 1],
  },
};

export const darkCampusBorderLayer: LayerProps = {
  id: "dark-campus-border",
  type: "line",
  paint: {
    "line-color": "#FFA500",
    "line-width": 3,
    "line-dasharray": [1, 1],
  },
};
