import type { LayerProps } from "react-map-gl/maplibre";

export const placesTextLayer: LayerProps = {
  id: "places-text",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Open Sans Semibold"],
    "text-size": 12, // Aumentado para mejor legibilidad
    "text-anchor": "top",
    "text-offset": [0, 1],
  },
  paint: {
    "text-color": "#1f2937", // Gris muy oscuro para máximo contraste sobre verde campus
    "text-halo-color": "rgba(255, 255, 255, 0.9)", // Halo blanco más opaco
    "text-halo-width": 2.5, // Halo más ancho para mejor definición
  },
};

export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#a21caf", // Verde esmeralda que contrasta perfectamente con rosa
    "line-width": 1.8,
    "line-dasharray": [2, 1],
  },
};

export const sectionStrokeLayer: LayerProps = {
  id: "area-stroke",
  type: "line",
  paint: {
    "line-color": "#be185d", // Rosa más intenso y oscuro para mejor visibilidad
    "line-width": 1.2,
    "line-dasharray": [4, 2],
  },
};

export const sectionAreaLayer: LayerProps = {
  id: "area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(236, 72, 153, 0.35)", // Rosa coquette con más opacidad para mejor visibilidad
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
export const PINK_COQUETTE_MAP_COLORS = {
  // Base - Rosa coquette más vibrante
  background: "#f5f5f5", // Rosa coquette base más saturado
  water: "#a5b4fc", // Azul periwinkle más vibrante
  waterway: "#818cf8", // Azul lavanda más definido

  // Landcover - Verdes más saturados pero armoniosos
  wood: "#bbf7d0", // Verde menta más vibrante
  snow: "#fefefe", // Blanco nieve
  grass: "#c6f6d5", // Verde pasto más definido
  scrub: "#bbf7d0", // Verde matorral más saturado
  crop: "#d1fae5", // Verde cultivo suave

  // Landuse - Campus con verde más oscuro que contraste mejor
  park: "#a7f3d0", // Verde parque más vibrante
  residential: "#fce7f3", // Rosa residencial coquette
  commercial: "#fbcfe8", // Rosa comercial más visible
  industrial: "#fce7f3", // Rosa industrial coquette
  cemetery: "#d1fae5", // Verde cementerio claro
  hospital: "#fbcfe8", // Rosa hospital más saturado
  school: "#a7f3d0", // Verde escuela vibrante
  airport: "#f3f4f6", // Gris aeropuerto neutro
  campus: "#fce7f3", // Verde campus MÁS OSCURO - mejor contraste con rosa coquette

  // Building - Rosa coquette más saturado pero elegante
  building: "#f9a8d4", // Rosa coquette vibrante
  buildingOutline: "rgba(236, 72, 153, 0.6)", // Contorno rosa más definido

  // Transportation - Paths morados y progresión mejorada
  path: "#c084fc", // Sendero MORADO CLARO coquette ✨
  minor: "#fef7f7", // Calle menor rosa muy suave
  secondary: "#e9d5ff", // Secundaria lavanda suave
  primary: "#d8b4fe", // Primaria lavanda más visible
  trunk: "#c084fc", // Troncal lavanda medio
  motorway: "#a855f7", // Autopista morada más fuerte
  railStart: "#f3e8ff", // Inicio ferrocarril
  railEnd: "#e9d5ff", // Fin ferrocarril

  // Text - Contraste mejorado
  roadText: "#525252", // Texto carretera gris medio
  roadTextHalo: "#fdf2f8", // Halo rosa muy claro
  poiText: "#404040", // Texto POI gris
  poiParkText: "#166534", // Texto parque verde oscuro
  poiTextHalo: "#fdf2f8", // Halo POI rosa muy claro
  placeText: "#525252", // Texto lugar gris medio
  placeTextHalo: "#fdf2f8", // Halo lugar rosa muy claro
  buildingText: "#6b21a8", // Texto edificios púrpura oscuro
  campusText: "#065f46", // Texto campus verde MÁS OSCURO para mejor legibilidad
  pathText: "#6b21a8", // Texto paths morado oscuro - NUEVO

  // Boundary - Lavanda muy discreto
  boundary: "#f3e8ff", // Límite lavanda muy suave
};
