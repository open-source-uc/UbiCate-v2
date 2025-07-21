import type { LayerProps } from "react-map-gl/maplibre";

export const placesTextLayer: LayerProps = {
  id: "places-text",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Open Sans Semibold"],
    "text-size": 11,
    "text-anchor": "top",
    "text-offset": [0, 1],
  },
  paint: {
    "text-color": "#374151", // Texto más oscuro para mejor contraste sobre rosa
    "text-halo-color": "rgba(253, 242, 248, 0.95)", // Halo rosa muy claro más opaco
    "text-halo-width": 2,
  },
};

export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#059669", // Verde esmeralda que contrasta perfectamente con rosa
    "line-width": 1.4,
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
  background: "#fce7f3", // Rosa coquette base más saturado
  water: "#a5b4fc", // Azul periwinkle más vibrante
  waterway: "#818cf8", // Azul lavanda más definido

  // Landcover - Verdes más saturados pero armoniosos
  wood: "#bbf7d0", // Verde menta más vibrante
  snow: "#fefefe", // Blanco nieve
  grass: "#c6f6d5", // Verde pasto más definido
  scrub: "#bbf7d0", // Verde matorral más saturado
  crop: "#d1fae5", // Verde cultivo suave

  // Landuse - Campus con verde que contraste bien con rosa
  park: "#a7f3d0", // Verde parque más vibrante
  residential: "#fce7f3", // Rosa residencial coquette
  commercial: "#fbcfe8", // Rosa comercial más visible
  industrial: "#fce7f3", // Rosa industrial coquette
  cemetery: "#d1fae5", // Verde cementerio claro
  hospital: "#fbcfe8", // Rosa hospital más saturado
  school: "#a7f3d0", // Verde escuela vibrante
  airport: "#f3f4f6", // Gris aeropuerto neutro
  campus: "#d1fae5", // Verde campus VIBRANTE para contrastar con rosas - COQUETTE POWER

  // Building - Rosa coquette más saturado pero elegante
  building: "#f9a8d4", // Rosa coquette vibrante - RECOVER THE PINK!
  buildingOutline: "rgba(236, 72, 153, 0.6)", // Contorno rosa más definido

  // Transportation - Progresión de rosas muy suaves
  path: "#f5f5f5", // Sendero gris muy claro
  minor: "#fef7f7", // Calle menor rosa muy suave
  secondary: "#f3e8ff", // Secundaria lavanda suave - MEJORADO
  primary: "#e9d5ff", // Primaria lavanda un poco más visible - MEJORADO
  trunk: "#d8b4fe", // Troncal lavanda medio - MEJORADO
  motorway: "#c084fc", // Autopista lavanda más fuerte - MEJORADO
  railStart: "#f3e8ff", // Inicio ferrocarril - MEJORADO
  railEnd: "#e9d5ff", // Fin ferrocarril - MEJORADO

  // Text - Contraste mejorado
  roadText: "#525252", // Texto carretera gris medio
  roadTextHalo: "#fdf2f8", // Halo rosa muy claro
  poiText: "#404040", // Texto POI gris
  poiParkText: "#166534", // Texto parque verde oscuro
  poiTextHalo: "#fdf2f8", // Halo POI rosa muy claro
  placeText: "#525252", // Texto lugar gris medio
  placeTextHalo: "#fdf2f8", // Halo lugar rosa muy claro
  buildingText: "#6b21a8", // Texto edificios púrpura oscuro - NUEVO para mejor contraste
  campusText: "#14532d", // Texto campus verde muy oscuro - NUEVO

  // Boundary - Lavanda muy discreto
  boundary: "#f3e8ff", // Límite lavanda muy suave - MEJORADO
};
