import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import Mapbox from "mapbox-gl";

import geojson from "../data/places.json";
export default function getGeocoder(mapboxToken: string): MapboxGeocoder {
  function forwardGeocoder(query: any) {
    const matchingFeatures = [];
    for (const feature of geojson.features) {
      if (feature.properties.name.toLowerCase().includes(query.toLowerCase())) {
        let faculty = feature.properties.faculties ? ` | Facultad: ${feature.properties.faculties}` : "";

        const matchedFeatures: any = {
          ...feature,
          place_name: `${feature.properties.name}` + faculty,
          center: feature.geometry.coordinates,
          place_type: ["poi"],
        };

        matchingFeatures.push(matchedFeatures);
      }
    }
    return matchingFeatures;
  }

  return new MapboxGeocoder({
    accessToken: mapboxToken as string,
    localGeocoder: forwardGeocoder,
    localGeocoderOnly: true,
    mapboxgl: Mapbox,
    placeholder: "e.g. Sala de Estudio",
    limit: 10,
    zoom: 18,
    marker: false,
    types: "poi",
  });
}
