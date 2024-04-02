import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import Mapbox from "mapbox-gl";

import geojson from "../data/places.json";
export default function getGeocoder(): MapboxGeocoder {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
    accessToken: MAPBOX_TOKEN as string,
    localGeocoder: forwardGeocoder,
    localGeocoderOnly: true,
    mapboxgl: Mapbox,
    placeholder: "Salas, Bibliotecas, Laboratorios...",
    limit: 10,
    zoom: 18,
    marker: false,
    types: "poi",
  });
}
