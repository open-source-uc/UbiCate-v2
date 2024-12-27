import type { LayerProps } from "react-map-gl";

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
    // Combina el nombre y la categoría en el campo de texto
    "text-field": ["concat", ["get", "name"], "\n", ["get", "categories"], "\n", ["get", "floors"]],
    "text-font": ["Open Sans Bold"],
    "text-size": 12,
    "text-anchor": "top",
    "text-offset": [0, 0.5],
  },
  paint: {
    // Color naranja para el texto
    "text-color": "#FFA500",
  },
};

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
