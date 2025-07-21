import type { Map, PointLike } from "maplibre-gl";
import { Feature } from "./types";

export function getFeatureOfLayerFromPoint(target: Map, point: PointLike, layers: string[]): Feature | null {
    const features = target.queryRenderedFeatures(point, {
        layers: layers,
    });

    const feature = features[0];
    if (!feature) return null;

    if (!feature.properties) return null;

    const exit = {
        type: "Feature",
        properties: feature.properties,
        geometry: feature.geometry,
    };
    exit.properties.categories = JSON.parse(exit.properties.categories);

    if (feature.properties?.floors) exit.properties.floors = JSON.parse(exit.properties.floors);

    return exit as unknown as Feature;
}