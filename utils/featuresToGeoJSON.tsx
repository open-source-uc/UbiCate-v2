import { Feature } from "./types";

export function featuresToGeoJSON(features: Feature[] | Feature | null): any {
  return {
    type: "FeatureCollection",
    features: Array.isArray(features) ? features : features === null ? [] : [features],
  };
}
