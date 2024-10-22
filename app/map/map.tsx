"use client";

import { useRef, useState, useCallback, useEffect } from "react";

import { Point } from "mapbox-gl";
import "../custom-landing-geocoder.css";
import type { LngLatBoundsLike } from "mapbox-gl";
import type { MapRef, ViewState, PointLike, PaddingOptions } from "react-map-gl";
import { Map, Source, Layer, Popup, GeolocateControl, NavigationControl, ScaleControl } from "react-map-gl";

import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import { useThemeObserver } from "@/utils/themeObserver";

import Campus from "../../data/campuses.json";
import { Feature } from "../../utils/types";
import PillFilter from "../components/pillFilter";

import { placesTextLayer, placesDarkTextLayer, campusBorderLayer, darkCampusBorderLayer } from "./layers";
import Marker from "./marker";
import MenuInformation from "./menuInformation";
import { handleResult, handleResults, handleClear } from "./placeHandlers";
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

function createInitialViewState(paramCampusBounds: LngLatBoundsLike, paramPlace: any): InitialViewState {
  const initialViewState: InitialViewState = {
    zoom: 18,
  };

  if (paramPlace) {
    initialViewState.longitude = paramPlace.geometry.coordinates[0];
    initialViewState.latitude = paramPlace.geometry.coordinates[1];
  } else {
    initialViewState.bounds = paramCampusBounds;
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
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && localStorage?.theme === "dark" ? "dark-v11" : "streets-v12",
  );

  const [place, setPlace] = useState<Feature | null>(null);
  const [hover, setHover] = useState<Feature | null>(null);

  useThemeObserver(setTheme, map);

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();
      if (!mounted) return;

      geocoder.current = getGeocoder(
        (result: any) => handleResult(result, setGeocoderPlaces, Places),
        (results: any) => mounted && handleResults(results, setGeocoderPlaces, Places),
        () => handleClear(setGeocoderPlaces),
      );
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paramPlace) {
      setGeocoderPlaces([paramPlace]);
    }
  }, [paramPlace]);

  function onClickMap() {
    setPlace(null);
  }

  useEffect(() => {
    mapRef.current?.fitBounds(paramCampusBounds, { padding: 20, duration: 4000 });
  }, [paramCampusBounds]);

  const addGeocoderControl = useCallback(() => {
    mapRef.current?.addControl(geocoder.current);
  }, [geocoder]);
  return (
    <>
      <Map
        initialViewState={createInitialViewState(paramCampusBounds, paramPlace)}
        mapStyle={`mapbox://styles/mapbox/${theme}`}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={[placesTextLayer.id as string]}
        onClick={onClickMap}
        onLoad={addGeocoderControl}
        ref={mapRef}
      >
        <GeolocateControl position="bottom-right" showUserHeading={true} />
        {/* <FullscreenControl position="top-left" /> */}
        <NavigationControl position="bottom-right" />
        <ScaleControl />
        <Source id="campusSmall" type="geojson" data={Campus}>
          {theme && theme === "dark-v11" ? <Layer {...darkCampusBorderLayer} /> : <Layer {...campusBorderLayer} />}
        </Source>

        <Source id="places" type="geojson" data={featuresToGeoJSON(geocoderPlaces)}>
          {theme && theme === "dark-v11" ? <Layer {...placesDarkTextLayer} /> : <Layer {...placesTextLayer} />}
        </Source>

        {hover ? (
          <Popup
            longitude={hover.geometry.coordinates[0]}
            latitude={hover.geometry.coordinates[1]}
            closeButton={false}
            closeOnClick={false}
            className="place"
            offset={new Point(0, -10)}
          >
            {hover.properties.name}
          </Popup>
        ) : null}
        {geocoderPlaces
          ? geocoderPlaces.map((place: Feature) => {
              return (
                <Marker key={place.properties.identifier} place={place} onClick={setPlace} onMouseEnter={setHover} />
              );
            })
          : null}
        {place ? null : <PillFilter geocoder={geocoder.current} setFilteredPlaces={setGeocoderPlaces} />}
      </Map>
      <MenuInformation place={place} />
    </>
  );
}
