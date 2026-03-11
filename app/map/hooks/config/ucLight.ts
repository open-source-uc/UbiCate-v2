import type { LayerProps } from "react-map-gl/maplibre";

// === CAPAS DE FONDO (ATRÁS) ===
export const sectionAreaLayer: LayerProps = {
  id: "area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(1, 118, 222, 0.15)", // Azul primario UC con más opacidad para mejor visibilidad
  },
};

export const customPolygonSectionAreaLayer: LayerProps = {
  id: "custom-area-polygon",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(254, 198, 13, 0.20)", // Amarillo UC con más opacidad para destacar elementos personalizados
  },
};

// === CAPAS DE CONTORNOS (MEDIO) ===
export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#0176DE", // Azul primario UC para bordes de campus
    "line-width": 1.4,
    "line-dasharray": [2, 1],
  },
};

export const sectionStrokeLayer: LayerProps = {
  id: "area-stroke",
  type: "line",
  paint: {
    "line-color": "#0176DE", // Azul primario UC para contornos de áreas
    "line-width": 0.7,
    "line-dasharray": [4, 2],
  },
};

export const customPolygonStrokeLayer: LayerProps = {
  id: "custom-area-stroke",
  type: "line",
  paint: {
    "line-color": "#FEC60D", // Amarillo UC para elementos personalizados
    "line-width": 0.7,
    "line-dasharray": [4, 2],
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
    "text-color": "#000000", // Negro UC para texto
    "text-halo-color": "rgba(255, 255, 255, 0.9)", // Halo blanco UC
    "text-halo-width": 2.5,
  },
};

// === COLORES DEL MAPA BASE UC LIGHT ===
// Diseñado con mejor diferenciación visual usando tonos derivados de la paleta UC
export const UC_LIGHT_MAP_COLORS = {
  // Base - Fondo principal UC claro
  background: "#F6F6F6", // Gris claro C UC como base
  water: "#0176DE", // Azul primario UC para agua (elemento destacado)
  waterway: "#173F8A", // Azul secundario UC para vías de agua

  // Landcover - Tonos derivados UC con buena diferenciación
  wood: "#8A9C8A", // Verde grisáceo derivado UC para bosques
  snow: "#FFFFFF", // Blanco UC para nieve
  grass: "#A8C4A8", // Verde claro derivado UC para pasto
  scrub: "#B8D4B8", // Verde muy claro derivado UC para matorral
  crop: "#C8E4C8", // Verde pastel derivado UC para cultivos

  // Landuse - Jerarquía clara con tonos diferenciados
  park: "#A8C4A8", // Verde claro derivado UC para parques (igual que grass)
  residential: "#F0F0F0", // Gris claro B UC para residencial
  commercial: "#E8E8E8", // Gris claro derivado UC para comercial
  industrial: "#E0E0E0", // Gris claro derivado UC para industrial
  cemetery: "#8A9C8A", // Verde grisáceo oscuro derivado UC para cementerio
  hospital: "#E8F2FF", // Azul muy claro derivado UC para hospitales
  school: "#F0F4FF", // Azul pastel derivado UC para escuelas
  airport: "#EAEAEA", // Gris claro A UC para aeropuerto
  campus: "#EEEEEE", // Gris neutro claro para campus (sin tinte azul)

  // Building - Contraste más oscuro para mejor definición
  building: "#A0A0A0", // Gris más oscuro derivado UC para edificios
  buildingOutline: "rgba(112, 112, 112, 0.9)", // Contorno gris oscuro A UC

  // Transportation - Jerarquía muy clara y diferenciada
  path: "#888888", // Senderos usando mismo gris que autopistas para mayor visibilidad
  minor: "#C8C8C8", // Gris más oscuro para calles menores
  secondary: "#B8B8B8", // Gris más oscuro para secundarias
  primary: "#A8A8A8", // Gris más oscuro para primarias
  trunk: "#909090", // Gris más oscuro para troncales
  motorway: "#888888", // Gris muy oscuro derivado UC para autopistas
  railStart: "#A0A0A0", // Gris más oscuro para inicio ferrocarril
  railEnd: "#808080", // Gris más oscuro para fin ferrocarril

  // Text - Contraste óptimo
  roadText: "#000000", // Texto carretera negro UC
  roadTextHalo: "#F6F6F6", // Halo usando background
  poiText: "#173F8A", // Texto POI azul secundario UC
  poiParkText: "#2D5016", // Verde oscuro derivado UC para texto parque
  poiTextHalo: "#FFFFFF", // Halo POI blanco UC
  placeText: "#000000", // Texto lugar negro UC
  placeTextHalo: "#F6F6F6", // Halo lugar usando background

  // Boundary - Sutil pero visible
  boundary: "#B0B0B0", // Límite gris derivado UC
};
