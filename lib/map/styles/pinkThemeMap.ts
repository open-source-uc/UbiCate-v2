import { StyleSpecification } from "maplibre-gl";

export const pinkThemeMap: StyleSpecification = {
  version: 8,
  name: "Ubicate-Coquette-Style-MapLibre",
  glyphs: "/api/font/{fontstack}/{range}",
  sources: {
    localtiles: {
      type: "vector",
      tiles: ["/api/{z}/{x}/{y}"],
      minzoom: 0,
      maxzoom: 14,
      attribution: "© OpenStreetMap contributors, © OSUC contributors",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#fff5f8", // Rosa muy muy claro, casi blanco
      },
    },
    {
      id: "landuse",
      type: "fill",
      source: "localtiles",
      "source-layer": "landuse",
      minzoom: 3,
      paint: {
        "fill-color": [
          "case",
          ["==", ["get", "class"], "park"],
          "#c8e6c9", // Verde más visible
          ["==", ["get", "class"], "recreation_ground"],
          "#c8e6c9",
          ["==", ["get", "class"], "leisure"],
          "#c8e6c9",
          ["==", ["get", "class"], "garden"],
          "#a8d5a8", // Verde medio visible
          ["==", ["get", "class"], "cemetery"],
          "#f3e8ff", // Lavanda muy suave
          ["==", ["get", "class"], "wood"],
          "#a8d5a8", // Verde para bosques más visible
          ["==", ["get", "class"], "grass"],
          "#c8e6c9",
          ["==", ["get", "class"], "agriculture"],
          "#d4f4aa", // Verde amarillento más visible para agricultura
          ["==", ["get", "class"], "meadow"],
          "#c8e6c9",
          ["==", ["get", "class"], "forest"],
          "#a8d5a8",
          ["==", ["get", "class"], "residential"],
          "#fef0f5", // Rosa pastel muy suave para residencial
          ["==", ["get", "class"], "commercial"],
          "#fef3c7", // Amarillo pastel suave
          ["==", ["get", "class"], "industrial"],
          "#f1f5f9", // Gris pastel azulado
          ["==", ["get", "class"], "hospital"],
          "#fef2f2", // Rosa pastel suave
          ["==", ["get", "class"], "college"],
          "#fce7f3", // Rosa pastel suave para campus universitarios
          ["==", ["get", "class"], "military"],
          "#f1f5f9",
          ["==", ["get", "class"], "university"],
          "#fce7f3", // Rosa pastel suave para campus universitarios
          ["==", ["get", "class"], "school"],
          "#fce7f3", // Rosa pastel suave para escuelas
          ["==", ["get", "class"], "airport"],
          "#f0f9ff",
          "#fff5f8",
        ],
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8,
          ["case", ["==", ["get", "class"], "residential"], 0.8, 0.6],
          10,
          ["case", ["==", ["get", "class"], "residential"], 0.3, 1],
        ],
      },
    },
    {
      id: "landcover",
      type: "fill",
      source: "localtiles",
      "source-layer": "landcover",
      filter: ["in", "class", "wood", "grass", "scrub", "crop", "snow"],
      paint: {
        "fill-color": [
          "case",
          ["==", ["get", "class"], "wood"],
          "#a8d5a8", // Verde visible para bosques
          ["==", ["get", "class"], "snow"],
          "#fefefe", // Blanco nieve
          ["==", ["get", "class"], "grass"],
          "#c8e6c9", // Verde visible para césped
          ["==", ["get", "class"], "scrub"],
          "#b8e6bb", // Verde medio para arbustos
          ["==", ["get", "class"], "crop"],
          "#d4f4aa", // Verde amarillento para cultivos
          "#c8e6c9",
        ],
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0.6, 10, 0.7, 11, 0.8, 12, 0.9],
      },
    },
    {
      id: "water",
      type: "fill",
      source: "localtiles",
      "source-layer": "water",
      paint: {
        "fill-color": "#a8d8ea", // Azul pastel más suave pero visible
      },
    },
    {
      id: "landuse-pitches",
      type: "fill",
      source: "localtiles",
      "source-layer": "landuse",
      minzoom: 3,
      filter: ["==", ["get", "class"], "pitch"],
      paint: {
        "fill-color": "#b8e6bb", // Verde medio para campos deportivos
        "fill-opacity": 1.0,
      },
    },
    {
      id: "waterway",
      type: "line",
      source: "localtiles",
      "source-layer": "waterway",
      minzoom: 8,
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#7dd3fc", // Azul pastel más visible
        "line-width": [
          "interpolate",
          ["exponential", 1.3],
          ["zoom"],
          9,
          ["case", ["in", ["get", "class"], ["literal", ["river", "canal"]]], 0.1, 0],
          20,
          ["case", ["in", ["get", "class"], ["literal", ["river", "canal"]]], 8, 3],
        ],
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0, 8.5, 1],
      },
    },
    {
      id: "building",
      type: "fill",
      source: "localtiles",
      "source-layer": "building",
      minzoom: 10,
      paint: {
        "fill-color": "#f9a8d4", // Rosa pastel medio
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.4, 12, 0.6, 14, 0.8, 16, 1],
        "fill-outline-color": "#ec4899", // Rosa más intenso para contorno
      },
    },
    {
      id: "transportation-path-stroke",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 12,
      filter: ["==", ["get", "class"], "path"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#d8b4fe", // Morado pastel
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 1.5, 14, 2, 15, 2, 18, 6],
        "line-opacity": 0.8,
      },
    },
    {
      id: "transportation-path",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 12,
      filter: ["==", ["get", "class"], "path"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#fff5f8", // Rosa muy claro
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 0.5, 14, 1, 15, 1, 18, 4],
        "line-dasharray": [10, 0],
      },
    },
    {
      id: "transportation-minor-stroke",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 12,
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "track"]]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#c084fc", // Morado pastel medio
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 1.5, 18, 14, 22, 122],
        "line-opacity": 0.8,
      },
    },
    {
      id: "transportation-minor",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 12,
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "track"]]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#fff5f8", // Rosa muy claro
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 0.5, 18, 12, 22, 120],
      },
    },
    {
      id: "transportation-secondary-stroke",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 8,
      filter: ["==", ["get", "class"], "secondary"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#a855f7", // Morado medio
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 0.5, 13, 4.5, 18, 28, 22, 262],
        "line-opacity": 0.8,
      },
    },
    {
      id: "transportation-secondary",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 8,
      filter: ["==", ["get", "class"], "secondary"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#fff5f8", // Rosa muy claro
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 0.1, 13, 2.5, 18, 26, 22, 260],
      },
    },
    {
      id: "transportation-primary-stroke",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 6,
      filter: ["==", ["get", "class"], "primary"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#9333ea", // Morado intenso
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 6, 1.5, 13, 6, 18, 34, 22, 322],
        "line-opacity": 0.8,
      },
    },
    {
      id: "transportation-primary",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 6,
      filter: ["==", ["get", "class"], "primary"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#fff5f8", // Rosa muy claro
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 6, 0.75, 13, 4, 18, 32, 22, 320],
      },
    },
    {
      id: "transportation-trunk-stroke",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["==", ["get", "class"], "trunk"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#be185d", // Rosa intenso
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 1.5, 13, 6, 18, 34, 22, 322],
        "line-opacity": 0.8,
      },
    },
    {
      id: "transportation-trunk",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["==", ["get", "class"], "trunk"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#f9a8d4", // Rosa pastel medio
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.75, 13, 4, 18, 32, 22, 320],
      },
    },
    {
      id: "transportation-motorway-stroke",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["==", ["get", "class"], "motorway"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#7c3aed", // Morado vibrante
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 1.5, 13, 6, 18, 34, 22, 322],
        "line-opacity": 0.8,
      },
    },
    {
      id: "transportation-motorway",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["==", ["get", "class"], "motorway"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#c4b5fd", // Morado pastel
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.75, 13, 4, 18, 32, 22, 320],
      },
    },
    {
      id: "transportation-rail",
      type: "line",
      source: "localtiles",
      "source-layer": "transportation",
      minzoom: 13,
      filter: ["in", ["get", "class"], "rail"],
      paint: {
        "line-color": ["interpolate", ["linear"], ["zoom"], 13, "#d8b4fe", 16, "#c084fc"], // Morado pastel
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 14, 0.5, 20, 1],
      },
    },
    {
      id: "transportation_name",
      type: "symbol",
      source: "localtiles",
      "source-layer": "transportation_name",
      minzoom: 14,
      filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "trunk", "motorway"]]],
      layout: {
        "text-field": ["case", ["has", "name:latin"], ["get", "name:latin"], ["has", "name"], ["get", "name"], ""],
        "text-font": ["Roboto Slab Regular", "Arial Unicode MS Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          [
            "case",
            ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]]],
            10,
            9,
          ],
          18,
          [
            "case",
            ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]]],
            16,
            14,
          ],
        ],
        "text-max-angle": 30,
        "symbol-placement": "line",
        "text-padding": 5,
        "text-rotation-alignment": "map",
        "text-pitch-alignment": "viewport",
        "text-letter-spacing": 0.01,
      },
      paint: {
        "text-color": "#7c2d92", // Morado oscuro para texto
        "text-halo-color": "#fff5f8", // Halo rosa claro
        "text-halo-width": 1.5,
      },
    },
    {
      id: "poi",
      type: "symbol",
      source: "localtiles",
      "source-layer": "poi",
      minzoom: 12,
      filter: [
        "all",
        ["has", "name:latin"],
        [
          "any",
          ["<=", ["get", "rank"], 1],
          ["==", ["get", "class"], "university"],
          ["==", ["get", "class"], "college"],
        ],
        ["!=", ["get", "class"], "bus_stop"],
        ["!=", ["get", "class"], "railway"],
        ["!=", ["get", "class"], "pharmacy"],
        ["!=", ["get", "class"], "doctor"],
      ],
      layout: {
        "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
        "text-font": [
          "case",
          ["in", ["get", "class"], ["literal", ["university", "college"]]],
          ["literal", ["Roboto Slab SemiBold", "Arial Unicode MS Bold"]],
          ["literal", ["Roboto Slab Medium", "Arial Unicode MS Regular"]],
        ],
        "text-size": ["case", ["in", ["get", "class"], ["literal", ["university", "college"]]], 14, 13],
        "symbol-sort-key": ["get", "rank"],
        "text-offset": [0, 0],
        "text-anchor": "center",
      },
      paint: {
        "text-halo-color": "#fff5f8", // Halo rosa claro
        "text-halo-width": 1.5,
        "text-halo-blur": 0.5,
        "text-color": [
          "case",
          ["==", ["get", "class"], "park"],
          "#2e7d32", // Verde más intenso para parques
          ["in", ["get", "class"], ["literal", ["university", "college"]]],
          "#1565c0", // Azul para campus universitarios
          "#be185d", // Rosa intenso para otros POIs
        ],
      },
    },
  ],
};
