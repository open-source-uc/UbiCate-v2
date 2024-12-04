export const handleResult = (result: any, setGeocoderPlaces: (places: any[]) => void, Places: any) => {
  const selectedPlaceId = result.result.properties.identifier;
  for (const place of Places.features) {
    if (place.properties.identifier === selectedPlaceId) {
      setGeocoderPlaces([place]);
      break;
    }
  }
  window.history.replaceState(null, "", `?place=${selectedPlaceId}&n=${result?.result?.properties?.name}`);
};

export const handleResults = (results: any, setGeocoderPlaces: (places: any[]) => void, Places: any) => {
  const resultPlaces = [];
  for (const result of results.features) {
    const selectedPlaceId = result.properties.identifier;
    for (const place of Places.features) {
      if (place.properties.identifier === selectedPlaceId) {
        resultPlaces.push(place);
        break;
      }
    }
  }
  setGeocoderPlaces(resultPlaces);
};

export const handleClear = (setGeocoderPlaces: (places: null) => void) => {
  setGeocoderPlaces(null);
};
