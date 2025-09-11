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
export const UC_MAP_COLORS = {
  background: "#EAEAEA",
  water: "#AFC9D4",
  waterway: "#AFC9D4",

  // Landcover
  wood: "#C1D9BE",
  snow: "#fefefe",
  grass: "#C1D9BE",
  scrub: "#C1D9BE",
  crop: "#C1D9BE",

  // Landuse
  park: "#C1D9BE", // Verde parque más vibrante y visible
  pitch: "#CCE2CB", // Light pink for sports pitches - distinct from green areas
  residential: "#EAEAEA", // Rosa residencial coquette
  commercial: "#EAEAEA", // Rosa comercial más visible
  industrial: "#EAEAEA", // Rosa industrial coquette
  cemetery: "#EAEAEA", // Verde cementerio más visible
  hospital: "#EAEAEA", // Rosa hospital más saturado
  school: "#EAEAEA", // Verde escuela vibrante
  airport: "#EAEAEA", // Gris aeropuerto neutro
  campus: "#EAEAEA",

  // Building
  building: "#C6C6C6",
  buildingOutline: "#EAEAEA",

  // Transportation
  path: "#F6F6F6",
  pathStroke: "#C6C6C6",
  minor: "#F6F6F6",
  minorStroke: "#C6C6C6",
  secondary: "#F6F6F6",
  secondaryStroke: "#C6C6C6",
  primary: "#F6F6F6",
  primaryStroke: "#C6C6C6",
  trunk: "#F6F6F6",
  trunkStroke: "#C6C6C6",
  motorway: "#F6F6F6",
  motorwayStroke: "#C6C6C6",
  railStart: "#F6F6F6",
  railEnd: "#F6F6F6",

  // Text
  roadText: "#000000",
  roadTextHalo: "#FFFFFF",
  poiText: "#000000",
  poiParkText: "#000000",
  poiTextHalo: "#FFFFFF",
  placeText: "#000000",
  placeTextHalo: "#FFFFFF",
  buildingText: "#000000",
  campusText: "#000000",
  pathText: "#000000",

  // Boundary
  boundary: "#707070",
};
