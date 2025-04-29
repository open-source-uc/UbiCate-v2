import type { LayerProps } from "react-map-gl";

export const approvalPointsLayer: LayerProps = {
  id: "points-layer-3",
  type: "circle",
  source: "points",
  filter: ["==", ["get", "needApproval"], true],
  paint: {
    "circle-radius": 7,
    "circle-color": "#32CD32",
    "circle-stroke-width": 0.4,
    "circle-stroke-color": "#fff",
  },
};

export const allPointsLayer: LayerProps = {
  id: "points-layer-2",
  type: "circle",
  source: "points",
  paint: {
    "circle-radius": 7,
    "circle-color": [
      "case",
      ["in", "classroom", ["get", "categories"]],
      "#1E90FF", // Azul para aulas
      ["in", "bath", ["get", "categories"]],
      "#8B0000", // Rojo oscuro para baños
      ["in", "food_lunch", ["get", "categories"]],
      "#FFA500", // Naranja para comida
      ["in", "studyroom", ["get", "categories"]],
      "#32CD32", // Verde para salas de estudio
      ["in", "trash", ["get", "categories"]],
      "#808080", // Gris para reciclaje
      ["in", "park_bicycle", ["get", "categories"]],
      "#228B22", // Verde oscuro para bicicleteros
      ["in", "financial", ["get", "categories"]],
      "#FFD700", // Dorado para bancos
      ["in", "laboratory", ["get", "categories"]],
      "#FF69B4", // Rosa para laboratorios
      ["in", "water", ["get", "categories"]],
      "#00BFFF", // Azul claro para puntos de agua
      ["in", "auditorium", ["get", "categories"]],
      "#4B0082", // Índigo para auditorios
      ["in", "sports_place", ["get", "categories"]],
      "#DC143C", // Carmesí para deportes
      ["in", "computers", ["get", "categories"]],
      "#00008B", // Azul oscuro para salas de computadores
      ["in", "photocopy", ["get", "categories"]],
      "#8A2BE2", // Violeta para fotocopias
      ["in", "shop", ["get", "categories"]],
      "#FF6347", // Tomate para tiendas
      ["in", "other", ["get", "categories"]],
      "#A9A9A9", // Gris oscuro para otros
      "#716ADB", // Color por defecto si no hay coincidencias
    ],
    "circle-stroke-width": 0.4,
    "circle-stroke-color": "#fff",
  },
};

export const allPlacesTextLayer: LayerProps = {
  id: "places-text-127879",
  type: "symbol",
  source: "places",
  layout: {
    "text-field": ["concat", ["get", "name"], "\n", ["get", "categories"], "\n", ["get", "floors"]],
    "text-font": ["Open Sans Semibold"],
    "text-size": 11,
    "text-anchor": "top",
    "text-offset": [0, 0.5],
  },
  paint: {
    "text-color": "#FFA500",
  },
};

export const allPlacesTextApprovalLayer: LayerProps = {
  id: "places-text-127879",
  type: "symbol",
  source: "places",
  filter: ["==", ["get", "needApproval"], true],
  layout: {
    "text-field": ["concat", ["get", "name"], "\n", ["get", "categories"], "\n", ["get", "floors"]],
    "text-font": ["Open Sans Semibold"],
    "text-size": 11,
    "text-anchor": "top",
    "text-offset": [0, 0.5],
  },
  paint: {
    "text-color": "#FFA500",
  },
};

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
    "text-color": "#f9f8f3",
    "text-halo-color": "#150a04",
    "text-halo-width": 1,
  },
};

export const campusBorderLayer: LayerProps = {
  id: "campus-border",
  type: "line",
  paint: {
    "line-color": "#f9f8f3",
    "line-width": 1.4,
    "line-dasharray": [2, 1],
  },
};

export const sectionStrokeLayer: LayerProps = {
  id: "red-line",
  type: "line",
  paint: {
    "line-color": "#015FFF",
    "line-width": 0.7,
    "line-dasharray": [4, 2],
  },
};

export const sectionAreaLayer: LayerProps = {
  id: "red-area",
  type: "fill",
  source: "states",
  paint: {
    "fill-color": "rgba(1, 95, 255, 0.1)",
  },
};

export const redLineLayerDebug: LayerProps = {
  id: "red-line-debug",
  type: "line",
  paint: {
    "line-color": "#FF0000",
    "line-width": 0.7,
    "line-dasharray": [4, 2],
  },
};
