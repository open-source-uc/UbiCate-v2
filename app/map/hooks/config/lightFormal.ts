import type { LayerProps } from "react-map-gl/maplibre";

export const sectionAreaLayer: LayerProps = {
  id: "area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(237, 137, 54, 0.15)", // Amarillo anaranjado muy sutil para relleno
  },
};

export const customPolygonSectionAreaLayer: LayerProps = {
  id: "custom-area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(66, 153, 225, 0.18)", // Celeste muy sutil para relleno personalizado
  },
};

// === CAPAS DE CONTORNOS (MEDIO) ===
export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#4299e1", // Celeste definido pero suave para campus
    "line-width": 1.4,
    "line-dasharray": [2, 1],
  },
};

export const sectionStrokeLayer: LayerProps = {
  id: "area-stroke",
  type: "line",
  paint: {
    "line-color": "#ed8936", // Amarillo anaranjado para contornos de áreas
    "line-width": 1.2,
    "line-dasharray": [4, 2],
  },
};

export const customPolygonStrokeLayer: LayerProps = {
  id: "custom-area-stroke",
  type: "line",
  paint: {
    "line-color": "#3182ce", // Celeste más intenso para elementos personalizados
    "line-width": 1.2,
    "line-dasharray": [3, 2],
  },
};

// === CAPAS DE TEXTO (FRENTE) ===
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
    "text-color": "#1a202c", // Texto más oscuro para mejor contraste
    "text-halo-color": "rgba(255, 255, 255, 0.95)", // Halo blanco más opaco
    "text-halo-width": 2.5, // Halo más ancho para mejor legibilidad
  },
};

export const LIGHT_FORMAL_MAP_COLORS = {
  // Base
  background: "#f5f5f5", // Gris claro en lugar de blanco
  water: "#5ba3d4", // Azul cielo con más contraste
  waterway: "#4a8cc4", // Azul agua más definido

  // Landcover - Tonos naturales con buen contraste
  wood: "#90c695", // Verde bosque más contrastado
  snow: "#e8e8e8", // Gris muy claro para nieve
  grass: "#a8d4a8", // Verde pasto con contraste
  scrub: "#98c498", // Verde matorral diferenciado
  crop: "#b8e4b8", // Verde cultivo más claro

  // Landuse - Grises diferenciados con contraste
  park: "#a8d4a8", // Verde parque contrastado
  residential: "#e0e0e0", // Gris residencial medio
  commercial: "#d0d0d0", // Gris comercial más oscuro
  industrial: "#c0c0c0", // Gris industrial oscuro
  cemetery: "#98c898", // Verde cementerio más definido
  hospital: "#f0c0c0", // Rosa suave pero visible
  school: "#c0d0e0", // Azul gris para escuelas
  airport: "#d8d8d8", // Gris aeropuerto medio
  campus: "#d8d8d0", // Azul gris más definido para campus

  // Building - Gris con buen contraste
  building: "#b0b0b0", // Gris edificio bien contrastado
  buildingOutline: "rgba(120, 120, 120, 0.8)", // Contorno definido

  // Transportation - Grises progresivos con contraste claro
  path: "#c8c8c8", // Sendero gris claro
  minor: "#b8b8b8", // Calle menor gris medio
  secondary: "#a8a8a8", // Secundaria gris
  primary: "#989898", // Primaria gris oscuro
  trunk: "#888888", // Troncal gris más oscuro
  motorway: "#707070", // Autopista gris oscuro
  railStart: "#a8a8a8", // Inicio ferrocarril
  railEnd: "#888888", // Fin ferrocarril más oscuro

  // Text - Textos oscuros con buen contraste
  roadText: "#404040", // Texto carretera gris oscuro
  roadTextHalo: "#f5f5f5", // Halo usando background
  poiText: "#505050", // Texto POI gris oscuro
  poiParkText: "#2d5016", // Texto parque verde oscuro
  poiTextHalo: "#f5f5f5", // Halo POI usando background
  placeText: "#404040", // Texto lugar gris oscuro
  placeTextHalo: "#f5f5f5", // Halo lugar usando background

  // Boundary
  boundary: "#a0a0a0", // Límite gris medio
};
