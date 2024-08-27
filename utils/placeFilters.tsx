export interface PlaceFilter {
  (geoJson: any, query: string): any[];
}

export const categoryFilter: PlaceFilter = (geoJson, query) => {
  return geoJson.features.filter(
    (feature: { properties: { categories: string | string[]; category: string } }) =>
      (Array.isArray(feature.properties.categories)
        ? feature.properties.categories.includes(query)
        : feature.properties.categories === query) ||
      (feature.properties.category && feature.properties.category.toLowerCase().includes(query.toLowerCase())),
  );
};

export const nameFilter: PlaceFilter = (geoJson, query) => {
  return geoJson.features.filter((feature: { properties: { name: string } }) =>
    feature.properties.name.toLowerCase().includes(query.toLowerCase()),
  );
};
