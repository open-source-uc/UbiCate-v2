"use client";
import { useRef, useState, useCallback, useEffect } from "react";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import Mapbox, { Point } from "mapbox-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import type { MapRef } from "react-map-gl";
import {
  Map,
  Source,
  Layer,
  Popup,
  GeolocateControl,
  FullscreenControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl";

import geojson from "../../data/places.json";

import { placesLayer } from "./layers";
import Marker from "./marker";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Set your mapbox token here

export default function ReactMap(Places: any) {
  const mapRef = useRef<MapRef>(null);
  const geocoder = useRef<any>(null);
  const [geocoderPlace, setGeocoderPlace] = useState<any>(null);
  const [geocoderPlaces, setGeocoderPlaces] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  console.log("render");

  const customData = geojson;
  const map = mapRef.current?.getMap();

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
      placeholder: "i.e. Sala de Estudio",
      limit: 10,
      zoom: 18,
      marker: false,
      types: "poi",
    });
    geocoder.current.on("result", function (result: any) {
      const selectedPlaceId = result.result.properties.identifier;
      setGeocoderPlaces(null);
      for (const place of customData.features) {
        if (place.properties.identifier === selectedPlaceId) {
          setGeocoderPlace(place);
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
    mapRef.current?.getMap().addControl(geocoder.current);
  }, [map, customData]);

  const onHover = useCallback((event: any) => {
    const place = event.features && event.features[0];
    setHoverInfo({
      longitude: place?.geometry.coordinates[0],
      latitude: place?.geometry.coordinates[1],
      place: place ? place.properties.name : null,
    });
  }, []);

  const selectedPlace = (hoverInfo && hoverInfo.place) || null;

  return (
    <>
      <Map
        initialViewState={{
          longitude: -70.6109,
          latitude: -33.4983,
          zoom: 16,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[placesLayer.id as string]}
        onMouseMove={onHover}
        ref={mapRef}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        <Source id="places" type="geojson" data={Places.Places} cluster={false} clusterRadius={10}>
          <Layer {...placesLayer} />
        </Source>
        {selectedPlace ? (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            className="place"
            offset={new Point(0, -10)}
          >
            {selectedPlace}
          </Popup>
        ) : null}
        {geocoderPlace ? <Marker place={geocoderPlace} /> : null}
        {geocoderPlaces
          ? geocoderPlaces.map((place: any) => {
              return <Marker key={place.properties.identifier} place={place} />;
            })
          : null}
      </Map>
    </>
  );
}
