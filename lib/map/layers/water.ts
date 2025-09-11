import { LayerSpecification } from "maplibre-gl";

export default (water: string, waterway: string): LayerSpecification[] => { 
    return [{
    id: "water",
    type: "fill",
    source: "localtiles",
    "source-layer": "water",
    paint: {
        "fill-color": water,
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
    ]
}