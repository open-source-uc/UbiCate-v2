"use client";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import Mapbox from "mapbox-gl";
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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Set your mapbox token here

export default function ReactMap(Places: any) {
  const mapRef = useRef<MapRef>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  const customData = geojson;
  const map = mapRef.current?.getMap();

  function forwardGeocoder(query: any) {
    const matchingFeatures = [];
    for (const feature of customData.features) {
      if (feature.properties.name.toLowerCase().includes(query.toLowerCase())) {
        let faculty = feature.properties.faculties ? ` | Facultad: ${feature.properties.faculties}` : "";
        feature["place_name"] = `${feature.properties.name}` + faculty;
        feature["center"] = feature.geometry.coordinates;
        feature["place_type"] = ["poi"];
        matchingFeatures.push(feature);
      }
    }
    return matchingFeatures;
  }

  useEffect(() => {
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      localGeocoder: forwardGeocoder,
      localGeocoderOnly: true,
      mapboxgl: Mapbox,
      marker: {
        color: "red",
      },
      placeholder: "i.e. Sala de Estudio",
      limit: 10,
      zoom: 18,
      types: "poi",
      poi_categories: ["poi"],
    });
    mapRef.current?.getMap().addControl(geocoder);
  }, [map]);

  const onHover = useCallback((event: any) => {
    const place = event.features && event.features[0];
    setHoverInfo({
      longitude: place?.geometry.coordinates[0],
      latitude: place?.geometry.coordinates[1],
      place: place ? place.properties.name : null,
    });
  }, []);

  const selectedPlace = (hoverInfo && hoverInfo.place) || null;
  const filter = useMemo(() => ["in", "name", selectedPlace], [selectedPlace]);

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
        interactiveLayerIds={[placesLayer.id]}
        onMouseMove={onHover}
        ref={mapRef}
        className="h-full w-full"
      >
        {/* {pins} */}
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        <Source id="places" type="geojson" data={Places.Places} cluster={false} clusterRadius={10}>
          <Layer {...placesLayer} />
          {/* <Layer {...clusterLayer} /> */}
        </Source>
        {selectedPlace ? (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            className="place"
            offset={[0, -10]}
          >
            {selectedPlace}
          </Popup>
        ) : null}
      </Map>
    </>
  );
}
