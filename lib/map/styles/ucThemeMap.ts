import { StyleSpecification } from "maplibre-gl";

export const ucThemeMap: StyleSpecification = {
  version: 8,
  name: "Ubicate-Style-MapLibre",
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
        "background-color": "#EAEAEA",
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
          "#C1D9BE", // Use theme color for wood areas
          ["==", ["get", "class"], "snow"],
          "#fefefe", // Use theme color for snow
          ["==", ["get", "class"], "grass"],
          "#C1D9BE", // Use theme color for grass areas
          ["==", ["get", "class"], "scrub"],
          "#C1D9BE", // Use theme color for scrub/bushes
          ["==", ["get", "class"], "crop"],
          "#C1D9BE", // Use theme color for agricultural crops
          "#C1D9BE", // Default to wood color for other landcover
        ],
        "fill-opacity": 1.0, // Full opacity for natural green areas
      },
    },
    {
      id: "water",
      type: "fill",
      source: "localtiles",
      "source-layer": "water",
      paint: {
        "fill-color": "#AFC9D4",
      },
    },
    {
      id: "landuse",
      type: "fill",
      source: "localtiles",
      "source-layer": "landuse",
      minzoom: 3, // Reduced from 5 to make parks visible at lower zoom levels
      paint: {
        "fill-color": [
          "case",
          ["==", ["get", "class"], "park"],
          "#C1D9BE", // Use theme color for parks
          ["==", ["get", "class"], "recreation_ground"],
          "#C1D9BE", // Use park color for recreation areas
          ["==", ["get", "class"], "leisure"],
          "#C1D9BE", // Use park color for leisure areas
          ["==", ["get", "class"], "garden"],
          "#C1D9BE", // Use park color for gardens
          ["==", ["get", "class"], "cemetery"],
          "#EAEAEA", // Use theme color for cemetery
          ["==", ["get", "class"], "wood"],
          "#C1D9BE", // Use theme color for wood in landuse
          ["==", ["get", "class"], "grass"],
          "#C1D9BE", // Use theme color for grass in landuse
          ["==", ["get", "class"], "agriculture"],
          "#C1D9BE", // Use crop color for agriculture
          ["==", ["get", "class"], "meadow"],
          "#C1D9BE", // Use grass color for meadows
          ["==", ["get", "class"], "forest"],
          "#C1D9BE", // Use wood color for forests
          ["==", ["get", "class"], "residential"],
          "#EAEAEA",
          ["==", ["get", "class"], "commercial"],
          "#EAEAEA",
          ["==", ["get", "class"], "industrial"],
          "#EAEAEA",
          ["==", ["get", "class"], "hospital"],
          "#EAEAEA",
          ["==", ["get", "class"], "college"],
          "#EAEAEA", // Use school color for college
          ["==", ["get", "class"], "military"],
          "#EAEAEA", // Use industrial color for military areas
          ["==", ["get", "class"], "university"],
          "#EAEAEA", // Use school color for university
          ["==", ["get", "class"], "school"],
          "#EAEAEA",
          ["==", ["get", "class"], "airport"],
          "#EAEAEA",
          "#EAEAEA", // Default fallback
        ],
        "fill-opacity": 0,
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
        "fill-color": "#CCE2CB", // Use distinct pitch color
        "fill-opacity": 1.0, // Full opacity for sports pitches
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
        "line-color": "#AFC9D4",
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
        "fill-color": "#C6C6C6",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.3, 12, 0.5, 14, 0.7, 16, 1],
        "fill-outline-color": "#EAEAEA",
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
        "line-color": "#C6C6C6",
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
        "line-color": "#F6F6F6",
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
        "line-color": "#C6C6C6",
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
        "line-color": "#F6F6F6",
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
        "line-color": "#C6C6C6",
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
        "line-color": "#F6F6F6",
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
        "line-color": "#C6C6C6",
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
        "line-color": "#F6F6F6",
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
        "line-color": "#C6C6C6",
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
        "line-color": "#F6F6F6",
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
        "line-color": "#C6C6C6",
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
        "line-color": "#F6F6F6",
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
        "line-color": ["interpolate", ["linear"], ["zoom"], 13, "#F6F6F6", 16, "#F6F6F6"],
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
        "text-color": "#000000",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 1,
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
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 0.5,
        "text-halo-blur": 0.5,
        "text-color": ["case", ["==", ["get", "class"], "park"], "#000000", "#000000"],
      },
    },
  ],
};
