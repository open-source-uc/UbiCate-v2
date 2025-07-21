import { StyleSpecification } from "maplibre-gl";

interface MapColors {
  background?: string;
  water?: string;
  waterway?: string;
  
  // Landcover
  wood?: string;
  snow?: string;
  grass?: string;
  scrub?: string;
  crop?: string;
  
  // Landuse
  park?: string;
  residential?: string;
  commercial?: string;
  industrial?: string;
  cemetery?: string;
  hospital?: string;
  school?: string;
  airport?: string;
  
  // Building
  building?: string;
  buildingOutline?: string;
  
  // Transportation
  path?: string;
  minor?: string;
  secondary?: string;
  primary?: string;
  trunk?: string;
  motorway?: string;
  railStart?: string;
  railEnd?: string;
  
  // Text
  roadText?: string;
  roadTextHalo?: string;
  poiText?: string;
  poiParkText?: string;
  poiTextHalo?: string;
  placeText?: string;
  placeTextHalo?: string;
  
  // Boundary
  boundary?: string;
}

export function createMapLibreStyle(colors: MapColors = {}): StyleSpecification {
  return {
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
      places: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [], // Puedes dejarlo vacío inicialmente
        },
      },

    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": colors.background || "#374d64",
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
            colors.wood || "#075251",
            ["==", ["get", "class"], "snow"],
            colors.snow || "#ffffff",
            ["==", ["get", "class"], "grass"],
            colors.grass || "#005d5b",
            ["==", ["get", "class"], "scrub"],
            colors.scrub || "#005d5b",
            ["==", ["get", "class"], "crop"],
            colors.crop || "#005d5b",
            colors.wood || "#075251",
          ],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0.4, 10, 0.4, 11, 0.4, 12, 0],
        },
      },
      {
        id: "landuse",
        type: "fill",
        source: "localtiles",
        "source-layer": "landuse",
        minzoom: 5,
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "class"], "park"],
            colors.park || "#005d5b",
            ["==", ["get", "class"], "wood"],
            colors.wood || "#075251",
            ["==", ["get", "class"], "grass"],
            colors.grass || "#005d5b",
            ["==", ["get", "class"], "agriculture"],
            colors.crop || "#005d5b",
            ["==", ["get", "class"], "residential"],
            colors.residential || "#262c33",
            ["==", ["get", "class"], "commercial"],
            colors.commercial || "#374d64",
            ["==", ["get", "class"], "industrial"],
            colors.industrial || "#374d64",
            ["==", ["get", "class"], "cemetery"],
            colors.cemetery || "#0d6a68",
            ["==", ["get", "class"], "hospital"],
            colors.hospital || "#374d64",
            ["==", ["get", "class"], "school"],
            colors.school || "#3d4c5c",
            ["==", ["get", "class"], "airport"],
            colors.airport || "#002148",
            colors.background || "#374d64", // Usar background como fallback en lugar de hardcoded
          ],
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            ["case", ["==", ["get", "class"], "residential"], 0.8, 0.2],
            10,
            ["case", ["==", ["get", "class"], "residential"], 0, 1],
          ],
        },
      },
      {
        id: "water",
        type: "fill",
        source: "localtiles",
        "source-layer": "water",
        paint: {
          "fill-color": colors.water || "#2E5A87", // ARREGLADO: ahora es azul
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
          "line-color": colors.waterway || "#1c4f7a", // ARREGLADO: azul más oscuro para ríos
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
          "fill-color": colors.building || "#242f3a",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.3, 12, 0.5, 14, 0.7, 16, 1],
          "fill-outline-color": colors.buildingOutline || "rgba(15, 19, 22, 0.8)",
        },
      },
      {
        id: "boundary",
        type: "line",
        source: "localtiles",
        "source-layer": "boundary",
        paint: {
          "line-color": colors.boundary || "#7a8894",
          "line-width": ["case", ["==", ["get", "admin_level"], 2], 2, ["==", ["get", "admin_level"], 4], 1.5, 1],
          "line-dasharray": [3, 3],
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
          "line-color": colors.path || "#616f84",
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 0.5, 14, 1, 15, 1, 18, 4],
          "line-dasharray": [10, 0],
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
          "line-color": colors.minor || "#5b687b",
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 13, 0.5, 18, 12, 22, 120],
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
          "line-color": colors.secondary || "#616f84",
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 0.1, 13, 2.5, 18, 26, 22, 260],
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
          "line-color": colors.primary || "#616f84",
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 6, 0.75, 13, 4, 18, 32, 22, 320],
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
          "line-color": colors.trunk || "#616f84",
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.75, 13, 4, 18, 32, 22, 320],
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
          "line-color": colors.motorway || "#616f84",
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
          "line-color": ["interpolate", ["linear"], ["zoom"], 13, colors.railStart || "#1d253c", 16, colors.railEnd || "#58626c"],
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 14, 0.5, 20, 1],
        },
      },
      {
        id: "transportation_name",
        type: "symbol",
        source: "localtiles",
        "source-layer": "transportation_name",
        minzoom: 12,
        layout: {
          "text-field": ["case", ["has", "name:latin"], ["get", "name:latin"], ["has", "name"], ["get", "name"], ""],
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
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
          "text-color": colors.roadText || "#b7c8e6",
          "text-halo-color": colors.roadTextHalo || "#212e3d",
          "text-halo-width": 1,
        },
      },
      {
        id: "poi",
        type: "symbol",
        source: "localtiles",
        "source-layer": "poi",
        minzoom: 5,
        filter: [
          "all",
          ["has", "name:latin"],
          ["<=", ["get", "rank"], ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 3, 8, 6, 12, 12, 16, 17]],
        ],
        layout: {
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          "text-size": 12,
          "symbol-sort-key": ["get", "rank"],
          "text-offset": [0, 0],
          "text-anchor": "center",
        },
        paint: {
          "text-halo-color": colors.poiTextHalo || "#1f2c39",
          "text-halo-width": 0.5,
          "text-halo-blur": 0.5,
          "text-color": ["case", ["==", ["get", "class"], "park"], colors.poiParkText || "#b5c4a9", colors.poiText || "#9fb4d3"],
        },
      },
      {
        id: "place",
        type: "symbol",
        source: "localtiles",
        "source-layer": "place",
        minzoom: 3,
        filter: [
          "all",
          ["has", "name:latin"],
          ["<=", ["get", "rank"], ["interpolate", ["linear"], ["zoom"], 0, 1, 2, 3, 4, 5, 6, 7]],
        ],
        layout: {
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name:es"], ["get", "name"]],
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          "text-size": [
            "case",
            ["==", ["get", "class"], "city"],
            16,
            ["==", ["get", "class"], "town"],
            14,
            ["==", ["get", "class"], "village"],
            12,
            10,
          ],
          "symbol-sort-key": ["coalesce", ["get", "rank"], 999],
          "text-anchor": "center",
        },
        paint: {
          "text-color": colors.placeText || "#b7c8e6",
          "text-halo-color": colors.placeTextHalo || "#212e3d",
          "text-halo-width": 1,
        },
      },
      {
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
        "text-color": colors.placeText || "#3e4d59",             
        "text-halo-color": colors.placeTextHalo || "#ffffff", 
        "text-halo-width": 1.5  
          },
        }
    ],
  };
}