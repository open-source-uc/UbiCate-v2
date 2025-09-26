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
    "text-font": ["Roboto Slab Medium"],
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
