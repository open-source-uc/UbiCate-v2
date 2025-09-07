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
  pitch?: string;
  residential?: string;
  commercial?: string;
  industrial?: string;
  cemetery?: string;
  hospital?: string;
  school?: string;
  airport?: string;
  campus?: string;

  // Building
  building?: string;
  buildingOutline?: string;

  // Transportation
  path?: string;
  pathStroke?: string;
  minor?: string;
  minorStroke?: string;
  secondary?: string;
  secondaryStroke?: string;
  primary?: string;
  primaryStroke?: string;
  trunk?: string;
  trunkStroke?: string;
  motorway?: string;
  motorwayStroke?: string;
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
  // Destructuring con valores por defecto del OLD_MAP_STYLE
  const {
    background = "#374d64",
    water = "#104e7c",
    waterway = "#1c347a",

    // Landcover - usando los valores del OLD_MAP_STYLE
    wood = "#075251",
    snow = "#6578b0",
    grass = "#005d5b",
    scrub = "#005d5b",
    crop = "#005d5b",

    // Landuse
    park = "#005d5b",
    pitch = "#228B22", // Default green for sports pitches
    residential = "#262c33",
    commercial = "#374d64",
    industrial = "#374d64",
    cemetery = "#0d6a68",
    hospital = "#374d64",
    school = "#3d4c5c",
    airport = "#002148",
    campus = "#273d41",

    // Building
    building = "#242f3a",
    buildingOutline = "rgba(15, 19, 22, 0.8)",

    // Transportation
    path = "#616f84",
    pathStroke = "#4a5a70",
    minor = "#5b687b",
    minorStroke = "#4a5566",
    secondary = "#616f84",
    secondaryStroke = "#4a5a70",
    primary = "#616f84",
    primaryStroke = "#4a5a70",
    trunk = "#616f84",
    trunkStroke = "#4a5a70",
    motorway = "#616f84",
    motorwayStroke = "#4a5a70",
    railStart = "#1d253c",
    railEnd = "#58626c",

    // Text
    roadText = "#b7c8e6",
    roadTextHalo = "#212e3d",
    poiText = "#9fb4d3",
    poiParkText = "#b5c4a9",
    poiTextHalo = "#1f2c39",
    placeText = "#b7c8e6",
    placeTextHalo = "#212e3d",

    // Boundary
    boundary = "#7a8894",
  } = colors;

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
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": background,
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
            wood, // Use theme color for wood areas
            ["==", ["get", "class"], "snow"],
            snow, // Use theme color for snow
            ["==", ["get", "class"], "grass"],
            grass, // Use theme color for grass areas
            ["==", ["get", "class"], "scrub"],
            scrub, // Use theme color for scrub/bushes
            ["==", ["get", "class"], "crop"],
            crop, // Use theme color for agricultural crops
            wood, // Default to wood color for other landcover
          ],
          "fill-opacity": 0.6, // Semi-transparent so it doesn't overpower other elements
        },
      },
      {
        id: "water",
        type: "fill",
        source: "localtiles",
        "source-layer": "water",
        paint: {
          "fill-color": water,
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
            park, // Use theme color for parks
            ["==", ["get", "class"], "pitch"],
            pitch, // Use custom pitch color for sports pitches  
            ["==", ["get", "class"], "recreation_ground"],
            park, // Use park color for recreation areas
            ["==", ["get", "class"], "leisure"],
            park, // Use park color for leisure areas
            ["==", ["get", "class"], "garden"],
            park, // Use park color for gardens
            ["==", ["get", "class"], "cemetery"],
            cemetery, // Use theme color for cemetery
            ["==", ["get", "class"], "wood"],
            wood, // Use theme color for wood in landuse
            ["==", ["get", "class"], "grass"],
            grass, // Use theme color for grass in landuse
            ["==", ["get", "class"], "agriculture"],
            crop, // Use crop color for agriculture
            ["==", ["get", "class"], "meadow"],
            grass, // Use grass color for meadows
            ["==", ["get", "class"], "forest"],
            wood, // Use wood color for forests
            ["==", ["get", "class"], "residential"],
            residential,
            ["==", ["get", "class"], "commercial"],
            commercial,
            ["==", ["get", "class"], "industrial"],
            industrial,
            ["==", ["get", "class"], "hospital"],
            hospital,
            ["==", ["get", "class"], "college"],
            school, // Use school color for college
            ["==", ["get", "class"], "military"],
            industrial, // Use industrial color for military areas
            ["==", ["get", "class"], "university"],
            school, // Use school color for university
            ["==", ["get", "class"], "school"],
            school,
            ["==", ["get", "class"], "airport"],
            airport,
            campus, // Default fallback
          ],
          "fill-opacity": 0.7, // Good visibility without being too overpowering
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
          "line-color": waterway,
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
          "fill-color": building,
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.3, 12, 0.5, 14, 0.7, 16, 1],
          "fill-outline-color": buildingOutline,
        },
      },
      {
        id: "boundary",
        type: "line",
        source: "localtiles",
        "source-layer": "boundary",
        paint: {
          "line-color": boundary,
          "line-width": ["case", ["==", ["get", "admin_level"], 2], 2, ["==", ["get", "admin_level"], 4], 1.5, 1],
          "line-dasharray": [3, 3],
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
          "line-color": pathStroke,
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
          "line-color": path,
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
          "line-color": minorStroke,
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
          "line-color": minor,
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
          "line-color": secondaryStroke,
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
          "line-color": secondary,
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
          "line-color": primaryStroke,
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
          "line-color": primary,
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
          "line-color": trunkStroke,
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
          "line-color": trunk,
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
          "line-color": motorwayStroke,
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
          "line-color": motorway,
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
          "line-color": ["interpolate", ["linear"], ["zoom"], 13, railStart, 16, railEnd],
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
          "text-color": roadText,
          "text-halo-color": roadTextHalo,
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
          "text-halo-color": poiTextHalo,
          "text-halo-width": 0.5,
          "text-halo-blur": 0.5,
          "text-color": ["case", ["==", ["get", "class"], "park"], poiParkText, poiText],
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
          "text-color": placeText,
          "text-halo-color": placeTextHalo,
          "text-halo-width": 1,
        },
      },
    ],
  };
}
