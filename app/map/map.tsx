"use client";
import { useRef, useState, useCallback, useEffect } from "react";

import { Point } from "mapbox-gl";
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

import getGeocoder from "@/utils/getGeocoder";

import geojson from "../../data/places.json";
import { useSearchResultCtx } from "../context/SearchResultCtx";

import { placesLayer } from "./layers";
import Marker from "./marker";
import Image from "next/image";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function ReactMap(Places: any) {
  const mapRef = useRef<MapRef>(null);
  const geocoder = useRef<any>(null);
  const [geocoderPlaces, setGeocoderPlaces] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const { searchResult, setSearchResult, initialLat, setInitialLat, initialLng, setInitialLng } = useSearchResultCtx();

  const customData = geojson;
  const map = mapRef.current?.getMap();

  const setSearchResultRef = useRef(setSearchResult);
  setSearchResultRef.current = setSearchResult;

  useEffect(() => {
    geocoder.current = getGeocoder();

    geocoder.current.on("result", function (result: any) {
      const selectedPlaceId = result.result.properties.identifier;
      for (const place of customData.features) {
        if (place.properties.identifier === selectedPlaceId) {
          setGeocoderPlaces([place]);
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
      setGeocoderPlaces(null);
    });
    mapRef.current?.getMap().addControl(geocoder.current);
  }, [map, customData]);

  useEffect(() => {
    if (searchResult) {
      for (const place of customData.features) {
        if (place.properties.identifier === searchResult) {
          setGeocoderPlaces([place]);
          setSearchResultRef.current("");
          setInitialLng(-70.6109);
          setInitialLat(-33.4983);
        }
      }
    }
  }, [customData.features, searchResult, setInitialLat, setInitialLng]);

  const onHover = useCallback((event: any) => {
    const place = event.features && event.features[0];
    setHoverInfo({
      longitude: place?.geometry.coordinates[0],
      latitude: place?.geometry.coordinates[1],
      place: place ? place.properties: null,
    });
  }, []);

  const selectedPlace = (hoverInfo && hoverInfo.place) || null;

  return (
    <>
      <Map
        initialViewState={{
          longitude: initialLng,
          latitude: initialLat,
          zoom: initialLat === -33.4983 && initialLng === -70.6109 ? 16 : 18,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
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
            offset={new Point(0, -10)}
            anchor="bottom"
            className="place rounded-s min-w-fit" 
          >
            <h3 className="bg-dark-4 font-semibold text-white p-2 max-w-[300px]"> <p className="break-words"> {selectedPlace.name} </p></h3>
            <h4 className="p-1 pl-2"> {selectedPlace?.information} </h4>
          </Popup>
        ) : null}
        <style>{`
          .mapboxgl-popup-content{ /* no se puede modificar desde el tag de popup */
            padding: 0;
            margin: 0;
          }
          .mapboxgl-popup-content img{ 
            margin: 0;                /* siempre hereda un margen a la derecha aunque se fije en 0 */
            align-items: center;
            display: flex;
            justify-content: center;
          }
        `}
        </style>
        {geocoderPlaces
          ? geocoderPlaces.map((place: any) => {
            return <Marker key={place.properties.identifier} place={place} />;
          })
        : null}
      </Map>
    </>
  );
}
