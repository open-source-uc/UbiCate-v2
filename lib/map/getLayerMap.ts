import type { Map, PointLike } from "maplibre-gl";

import { Feature } from "@/utils/types";

export function getFeatureOfLayerFromPoint(target: Map, point: PointLike, layers: string[]): Feature | null {
  // Filtrar solo las capas que realmente existen en el mapa
  const existingLayers = layers.filter((layerId) => {
    const layer = target.getLayer(layerId);
    return layer !== undefined;
  });

  // Si no hay capas válidas, retornar null
  if (existingLayers.length === 0) return null;

  const features = target.queryRenderedFeatures(point, {
    layers: existingLayers,
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
