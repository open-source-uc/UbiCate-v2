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

export const PINK_COQUETTE_MAP_COLORS = {
  // Base - Tonos rosa coquette con mejor contraste
  background: "#fdf2f8", // Rosa muy claro y suave
  water: "#0ea5e9", // Azul más vibrante para contraste
  waterway: "#0284c7", // Azul medio más definido

  // Landcover - Verdes más contrastados que armonizan con rosa
  wood: "#bbf7d0", // Verde menta más visible
  snow: "#f8fafc", // Blanco ligeramente grisáceo
  grass: "#c6f6d5", // Verde más definido
  scrub: "#d1fae5", // Verde claro pero visible
  crop: "#dcfce7", // Verde agrícola diferenciado

  // Landuse - Gama rosa con mayor diferenciación
  park: "#c6f6d5", // Verde parque más visible
  pitch: "#bbf7d0", // Verde canchas deportivas contrastado
  residential: "#fce7f3", // Rosa residential definido
  commercial: "#f3e8ff", // Lavanda comercial contrastado
  industrial: "#e9d5ff", // Lavanda industrial más oscuro
  cemetery: "#d1fae5", // Verde cementerio visible
  hospital: "#fce7f3", // Rosa hospital diferenciado
  school: "#e0e7ff", // Azul muy claro para escuelas
  airport: "#f1f5f9", // Gris claro neutral con contraste
  campus: "#f3e8ff", // Lavanda campus visible

  // Building - Rosa coquette con mejor definición
  building: "#f472b6", // Rosa medio más contrastado
  buildingOutline: "rgba(219, 39, 119, 0.6)", // Contorno rosa más fuerte

  // Transportation - Progresión más contrastada y visible
  path: "#fce7f3", // Sendero rosa claro pero visible
  pathStroke: "#d946ef", // Contorno sendero púrpura fuerte
  minor: "#f3e8ff", // Calle menor lavanda claro
  minorStroke: "#a855f7", // Contorno menor púrpura medio
  secondary: "#e9d5ff", // Secundaria lavanda medio
  secondaryStroke: "#8b5cf6", // Contorno secundaria púrpura
  primary: "#ddd6fe", // Primaria lavanda más oscuro
  primaryStroke: "#7c3aed", // Contorno primaria púrpura fuerte
  trunk: "#c4b5fd", // Troncal lavanda contrastado
  trunkStroke: "#6d28d9", // Contorno troncal púrpura oscuro
  motorway: "#a78bfa", // Autopista lavanda definido
  motorwayStroke: "#5b21b6", // Contorno autopista púrpura muy oscuro
  railStart: "#e9d5ff", // Inicio ferrocarril visible
  railEnd: "#a78bfa", // Fin ferrocarril contrastado

  // Text - Contraste mejorado para máxima legibilidad
  roadText: "#581c87", // Texto carretera púrpura muy oscuro
  roadTextHalo: "#fdf2f8", // Halo rosa muy claro
  poiText: "#701a75", // Texto POI púrpura oscuro
  poiParkText: "#14532d", // Texto parque verde muy oscuro
  poiTextHalo: "#fdf2f8", // Halo POI rosa muy claro
  placeText: "#581c87", // Texto lugar púrpura muy oscuro
  placeTextHalo: "#fdf2f8", // Halo lugar rosa muy claro
  buildingText: "#4c1d95", // Texto edificios púrpura muy oscuro
  campusText: "#701a75", // Texto campus púrpura oscuro
  pathText: "#581c87", // Texto paths púrpura muy oscuro

  // Boundary - Más definido pero elegante
  boundary: "#c084fc", // Límite lavanda suave pero visible
};
