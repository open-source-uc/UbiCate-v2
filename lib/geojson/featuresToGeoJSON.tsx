import { Feature, LineFeature } from "@/utils/types";

export function featuresToGeoJSON(features: Feature[] | Feature | LineFeature | null): any {
  return {
    type: "FeatureCollection",
    features: Array.isArray(features) ? features : features === null ? [] : [features],
  };
}
