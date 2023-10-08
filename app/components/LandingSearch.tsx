"use client";
import { useRouter } from "next/navigation";

import { useRef, useState, useEffect } from "react";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import Mapbox from "mapbox-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import geojson from "../../data/places.json";
import { useSearchResultCtx } from "../context/SearchResultCtx";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Set your mapbox token here

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);
  const geocoder = useRef<any>(null);
  const [geocoderPlace, setGeocoderPlace] = useState<any>(null);
  const [geocoderPlaces, setGeocoderPlaces] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [test, setTest] = useState<any>([]);
  const { setSearchResult } = useSearchResultCtx();

  const router = useRouter();

  const customData = geojson;

  useEffect(() => {
    function forwardGeocoder(query: any) {
      const matchingFeatures = [];
      for (const feature of customData.features) {
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

    geocoder.current = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN as string,
      localGeocoder: forwardGeocoder,
      localGeocoderOnly: true,
      mapboxgl: Mapbox,
      placeholder: "e.g. Sala de Estudio",
      limit: 20,
      marker: false,
      types: "poi",
    });

    const redirectToMap = () => {
      router.push("/map");
    };

    geocoder.current.on("result", function (result: any) {
      const selectedPlaceId = result.result.properties.identifier;
      setGeocoderPlaces(null);
      for (const place of customData.features) {
        if (place.properties.identifier === selectedPlaceId) {
          setGeocoderPlace(place);
          setSearchResult(result.result.properties.identifier);
          redirectToMap();
          break;
        }
      }
    });

    geocoder.current.on("results", function (results: any) {
      const places = [];
      for (const result of results.features) {
        const selectedPlaceId = result.properties.identifier;
        for (const place of customData.features) {
          if (place.properties.identifier === selectedPlaceId) {
            places.push(place);
            break;
          }
        }
      }
      setGeocoderPlaces(places);
    });

    geocoder.current.on("clear", function () {
      setGeocoderPlace(null);
      setGeocoderPlaces(null);
    });

    geocoderContainer.current?.appendChild(geocoder.current.onAdd());
  }, [customData, router, setSearchResult]);

  return (
    <div ref={geocoderContainer} style={{ position: "relative" }}>
      {test}
    </div>
  );
}
