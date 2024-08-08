interface PlaceFilter {
  (geoJson: any, query: string): any[];
}

export const categoryFilter: PlaceFilter = (geoJson: any, query: string) => {
  let filteredPlaces = [];
  for (const feature of geoJson.features) {
    if (feature.properties.categories === query) {
      filteredPlaces.push(feature);
    }
  }
  return filteredPlaces;
};

export const nameFilter: PlaceFilter = (geoJson: any, query: string) => {
  let filteredPlaces = [];
  for (const feature of geoJson.features) {
    if (feature.properties.name.toLowerCase().includes(query.toLowerCase())) {
      filteredPlaces.push(feature);
    }
  }
  return filteredPlaces;
};
