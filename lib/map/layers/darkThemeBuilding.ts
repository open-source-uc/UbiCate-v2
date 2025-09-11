import { LayerSpecification } from "maplibre-gl";

export default ({
        id: "building",
        type: "fill",
        source: "localtiles",
        "source-layer": "building",
        minzoom: 10,
        paint: {
          "fill-color": "#242f3a",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.3, 12, 0.5, 14, 0.7, 16, 1],
          "fill-outline-color": "rgba(15, 19, 22, 0.8)",
        },
}) as LayerSpecification;