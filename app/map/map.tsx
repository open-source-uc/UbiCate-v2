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

import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import { useThemeObserver } from "@/utils/themeObserver";

import { useSearchResultCtx } from "../context/searchResultCtx";

import { placesTextLayer, placesDarkTextLayer } from "./layers";
import Marker from "./marker";

const loadGeocoder = () => import("@/utils/getGeocoder");

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

  useEffect(() => {
    let mounted = true;
    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();
      if (!mounted) return;

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
        if (!mounted) return;
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
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };
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
        initialViewState={createInitialViewState(initialLng, initialLat, paramCampusBounds, paramPlace)}
        mapStyle={`mapbox://styles/mapbox/${theme}`}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={[placesTextLayer.id as string]}
        onMouseMove={onHover}
        onLoad={addGeocoderControl}
        ref={mapRef}
      >
        <GeolocateControl position="top-left" showUserHeading={true} />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        <Source id="places" type="geojson" data={featuresToGeoJSON(geocoderPlaces)}>
          {theme && theme === "dark-v11" ? <Layer {...placesDarkTextLayer} /> : <Layer {...placesTextLayer} />}
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
