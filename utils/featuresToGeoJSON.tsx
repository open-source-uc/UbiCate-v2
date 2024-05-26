export function featuresToGeoJSON(features: any): any {
  return features
    ? {
        type: "FeatureCollection",
        features: features,
      }
    : null;
}
