import type { LayerProps } from "react-map-gl/maplibre";

export const placesTextLayer: LayerProps = {
  id: "places-text",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Open Sans Semibold"],
    "text-size": 16,
    "text-anchor": "top",
    "text-offset": [0, 1],
  },
  paint: {
    "text-color": "#000000", // Gris muy oscuro para máximo contraste sobre verde campus
    "text-halo-color": "rgba(255, 255, 255, 0.9)", // Halo blanco más opaco
    "text-halo-width": 2.5, // Halo más ancho para mejor definición
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
  water: "#173F8A",
  waterway: "#0176DE",

  // Landcover
  wood: "#bbf7d0", // Verde menta más vibrante
  snow: "#fefefe", // Blanco nieve
  grass: "#c6f6d5", // Verde pasto más definido
  scrub: "#bbf7d0", // Verde matorral más saturado
  crop: "#d1fae5", // Verde cultivo suave

  // Landuse
  park: "#00AA00", // Verde parque más vibrante
  residential: "#EAEAEA", // Rosa residencial coquette
  commercial: "#EAEAEA", // Rosa comercial más visible
  industrial: "#EAEAEA", // Rosa industrial coquette
  cemetery: "#EAEAEA", // Verde cementerio claro
  hospital: "#EAEAEA", // Rosa hospital más saturado
  school: "#EAEAEA", // Verde escuela vibrante
  airport: "#EAEAEA", // Gris aeropuerto neutro
  campus: "#EAEAEA", // Verde campus MÁS OSCURO - mejor contraste con rosa coquette

  // Campus green sections - Enhanced park and green area styling
  campusGreen: "#22c55e", // Verde más vibrante para áreas verdes del campus
  campusPark: "#16a34a", // Verde más oscuro para parques principales
  campusGarden: "#65a30d", // Verde oliva para jardines y áreas ajardinadas

  // Building
  building: "#C6C6C6",
  buildingOutline: "#EAEAEA",

  // Transportation - Paths morados y progresión mejorada
  path: "#F6F6F6", // Sendero MORADO CLARO coquette ✨
  minor: "#F6F6F6", // Calle menor rosa muy suave
  secondary: "#F6F6F6", // Secundaria lavanda suave
  primary: "#F6F6F6", // Primaria lavanda más visible
  trunk: "#F6F6F6", // Troncal lavanda medio
  motorway: "#F6F6F6", // Autopista morada más fuerte
  railStart: "#F6F6F6", // Inicio ferrocarril
  railEnd: "#F6F6F6", // Fin ferrocarril

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
