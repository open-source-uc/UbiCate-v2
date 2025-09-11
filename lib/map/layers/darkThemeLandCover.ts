import { LayerSpecification } from "maplibre-gl";

export default {
    id: "landcover",
    type: "fill",
    source: "localtiles",
    "source-layer": "landcover",
    filter: ["in", "class", "wood", "grass", "scrub", "crop", "snow"],
    paint: {
        "fill-color": [
        "case",
        ["==", ["get", "class"], "wood"],
        "#075251",
        ["==", ["get", "class"], "snow"],
        "#6578b0",
        ["==", ["get", "class"], "grass"],
        "#005d5b",
        ["==", ["get", "class"], "scrub"],
        "#005d5b",
        ["==", ["get", "class"], "crop"],
        "#005d5b",
        "#075251",
        ],
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0.4, 10, 0.4, 11, 0.4, 12, 0],
    },
} as LayerSpecification;