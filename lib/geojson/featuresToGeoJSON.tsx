import { Feature, LineFeature, RouteFeature } from "@/lib/types";

type AnyFeature = Feature | LineFeature | RouteFeature;

export function featuresToGeoJSON(features: AnyFeature[] | AnyFeature | null): any {
  return {
    type: "FeatureCollection",
    features: Array.isArray(features) ? features : features === null ? [] : [features],
  };
}
