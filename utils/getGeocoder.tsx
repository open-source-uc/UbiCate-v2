import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import Mapbox from "mapbox-gl";
import Fuse from "fuse.js";
import { Feature } from "./types";
import geojson from "../data/places.json";

export default function getGeocoder(
  onResult: (result: any) => void = () => { },
  onResults: (results: any) => void = () => { },
  onClear: () => void = () => { },
): MapboxGeocoder {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  function forwardGeocoder(query: any) {
    const options = {
      keys: ["properties.name"],
      threshold: 0.3,
    };

    const fuse = new Fuse(geojson.features, options);
    const results = fuse.search(query);

    const matchingFeatures = results.map(result => {
      const feature = result.item;
      const matchedFeatures: any = {
        ...feature,
        place_name: `${feature.properties.name}`,
        center: feature.geometry.coordinates,
        place_type: ["poi"],
      };
      return matchedFeatures;
    });

    return matchingFeatures;
  }

  const geocoder = new MapboxGeocoder({
    accessToken: MAPBOX_TOKEN as string,
    localGeocoder: forwardGeocoder,
    fuzzyMatch: true,
    localGeocoderOnly: true,
    mapboxgl: Mapbox,
    placeholder: "Salas, Bibliotecas, Laboratorios...",
    limit: 10,
    zoom: 18,
    marker: false,
    types: "poi",
    render: (item) => {
      const { name, campus } = (item as unknown as Feature).properties;
    
      return `
        <div class="geocoder-item flex items-center gap-2">
          <div class="icon w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
            📍
          </div>
          <div class="">
            <span class="text-sm font-semibold text-gray-800">${name} | ${campus}</span>
          </div>
        </div>
      `;
    },
    
  });

  geocoder.on("result", onResult);
  geocoder.on("results", onResults);
  geocoder.on("clear", onClear);

  return geocoder;
}
