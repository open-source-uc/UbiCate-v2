"use client";
import { useRef, useState, useCallback, useEffect } from "react";

import { Point } from "mapbox-gl";
import "../custom-landing-geocoder.css";
import type { MapRef, ViewState, LngLatBoundsLike, PointLike, PaddingOptions } from "react-map-gl";
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
import { useThemeObserver } from "@/utils/themeObserver";

import { useSearchResultCtx } from "../context/SearchResultCtx";

import { placesLayer } from "./layers";
import Marker from "./marker";

interface InitialViewState extends Partial<ViewState> {
  bounds?: LngLatBoundsLike;
  fitBoundsOptions?: {
    offset?: PointLike;
    minZoom?: number;
    maxZoom?: number;
    padding?: number | PaddingOptions;
  };
}

function createInitialViewState(
  longitude: number | null,
  latitude: number | null,
  paramCampusBounds: LngLatBoundsLike,
  paramPlace: any,
): InitialViewState {
  const initialViewState: InitialViewState = {
    zoom: 18,
  };

  if (paramPlace) {
    initialViewState.longitude = paramPlace.geometry.coordinates[0];
    initialViewState.latitude = paramPlace.geometry.coordinates[1];
  } else if (longitude === null || latitude === null) {
    initialViewState.bounds = paramCampusBounds;
  } else {
    initialViewState.longitude = longitude;
    initialViewState.latitude = latitude;
  }

  return initialViewState;
}

export default function MapComponent({
  Places,
  paramCampusBounds,
  paramPlace,
}: {
  Places: any;
  paramCampusBounds: LngLatBoundsLike;
  paramPlace: any;
}) {
  const mapRef = useRef<MapRef>(null);
  const map = mapRef.current?.getMap();
  const geocoder = useRef<any>(null);
  const [geocoderPlaces, setGeocoderPlaces] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && localStorage?.theme === "dark" ? "dark-v11" : "streets-v11",
  );
  useThemeObserver(setTheme, map);

  const { searchResult, setSearchResult, initialLat, initialLng } = useSearchResultCtx();
  const setSearchResultRef = useRef(setSearchResult);
  setSearchResultRef.current = setSearchResult;

  const initialViewState: InitialViewState = createInitialViewState(
    initialLng,
    initialLat,
    paramCampusBounds,
    paramPlace,
  );

  useEffect(() => {
    geocoder.current = getGeocoder();

    geocoder.current.on("result", function (result: any) {
      const selectedPlaceId = result.result.properties.identifier;
      for (const place of Places.features) {
        if (place.properties.identifier === selectedPlaceId) {
          setGeocoderPlaces([place]);
          break;
        }
      }
    });

    geocoder.current.on("results", function (results: any) {
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
    });

    geocoder.current.on("clear", function () {
      setGeocoderPlaces(null);
    });
  }, [Places]);

  useEffect(() => {
    if (searchResult) {
      for (const place of Places.features) {
        if (place.properties.identifier === searchResult) {
          setGeocoderPlaces([place]);
          setSearchResultRef.current("");
        }
      }
    }
  }, [Places, searchResult]);

  useEffect(() => {
    if (paramPlace) {
      setGeocoderPlaces([paramPlace]);
      setSearchResultRef.current("");
    }
  }, [paramPlace]);

  const onHover = useCallback((event: any) => {
    const place = event.features && event.features[0];
    setHoverInfo({
      longitude: place?.geometry.coordinates[0],
      latitude: place?.geometry.coordinates[1],
      place: place ? place.properties.name : null,
    });
  }, []);

  const addGeocoderControl = useCallback(() => {
    mapRef.current?.addControl(geocoder.current);
  }, []);

  const selectedPlace = (hoverInfo && hoverInfo.place) || null;
  return (
    <>
      <Map
        initialViewState={initialViewState}
        mapStyle={`mapbox://styles/mapbox/${theme}`}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={[placesLayer.id as string]}
        onMouseMove={onHover}
        onLoad={addGeocoderControl}
        ref={mapRef}
      >
        <GeolocateControl position="top-left" showUserHeading={true} />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        <Source id="places" type="geojson" data={Places} cluster={false} clusterRadius={10}>
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
        {geocoderPlaces
          ? geocoderPlaces.map((place: any) => {
              return <Marker key={place.properties.identifier} place={place} />;
            })
          : null}
      </Map>
    </>
  );
}
