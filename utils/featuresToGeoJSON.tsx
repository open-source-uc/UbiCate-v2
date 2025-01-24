export function featuresToGeoJSON(features: any[]): any {
  return {
    type: "FeatureCollection",
    features: features ? features : [],
  };
}
