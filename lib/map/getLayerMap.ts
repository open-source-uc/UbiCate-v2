import type { Map, PointLike, MapGeoJSONFeature } from "maplibre-gl";

import { Feature } from "@/lib/types";

export function normalizeFeature(feature: MapGeoJSONFeature): Feature | null {
  if (!feature.properties) return null;

  const normalized = {
    type: "Feature",
    properties: feature.properties,
    geometry: feature.geometry,
  };
  normalized.properties.categories = JSON.parse(normalized.properties.categories);

  if (feature.properties?.floors) normalized.properties.floors = JSON.parse(normalized.properties.floors);

  return normalized as unknown as Feature;
}

export function getFeatureOfLayerFromPoint(target: Map, point: PointLike, layers: string[]): Feature | null {
  const existingLayers = layers.filter((layerId) => {
    const layer = target.getLayer(layerId);
    return layer !== undefined;
  });

  if (existingLayers.length === 0) return null;

  const features = target.queryRenderedFeatures(point, {
    layers: existingLayers,
  });

  const feature = features[0];
  if (!feature) return null;

  return normalizeFeature(feature);
}
