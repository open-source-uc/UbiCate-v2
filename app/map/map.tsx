"use client";

import { useRef, useState, useCallback, useEffect } from "react";

import "../custom-landing-geocoder.css";
import type { LngLatBoundsLike } from "mapbox-gl";
import type { MapRef, ViewState, PointLike, PaddingOptions } from "react-map-gl";
import { Map, Source, Layer, GeolocateControl, NavigationControl, ScaleControl } from "react-map-gl";

import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import { useThemeObserver } from "@/utils/themeObserver";

import Campus from "../../data/campuses.json";
import { Feature, JSONFeatures } from "../../utils/types";
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
  paramLng,
  paramLat,
}: {
  Places: JSONFeatures;
  paramCampusBounds: LngLatBoundsLike;
  paramPlace: Feature | null;
  paramLng?: number | null;
  paramLat?: number | null;
}) {
  const mapRef = useRef<MapRef>(null);
  const map = mapRef.current?.getMap();
  const geocoder = useRef<any>(null);
  const [geocoderPlaces, setGeocoderPlaces] = useState<Feature[] | null>(null);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && localStorage?.theme === "dark" ? "dark-v11" : "streets-v12",
  );
  const [place, setPlace] = useState<Feature | null>(null);
  const [tmpMark, setTmpMark] = useState<Feature | null>(null);
  // const [hover, setHover] = useState<Feature | null>(null);

  useThemeObserver(setTheme, map);

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();
      if (!mounted) return;

      geocoder.current = getGeocoder(
        (result: any) => {
          handleResult(result, setGeocoderPlaces, Places);
        },
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
    mapRef.current?.fitBounds(paramCampusBounds, { padding: 20, duration: 4000 });
  }, [paramCampusBounds]);

  function onClickMap() {
    window.history.replaceState(null, "", window.location.pathname);
    setPlace(null);
    setTmpMark(null);
  }

  function onClickMark(place: Feature) {
    setPlace(place);
    setTmpMark(null);
    if (!map) return;
    window.history.replaceState(null, "", `?place=${place.properties.identifier}`);
    const coordinates = [place.geometry.coordinates[0], place.geometry.coordinates[1]];
    const bounds = map.getBounds();
    const margin = 0.001;

    const isOutside = !(
      coordinates[0] >= bounds.getWest() + margin &&
      coordinates[0] <= bounds.getEast() - margin &&
      coordinates[1] >= bounds.getSouth() + margin &&
      coordinates[1] <= bounds.getNorth() - margin
    );

    if (isOutside) {
      map.flyTo({
        center: [place.geometry.coordinates[0], place.geometry.coordinates[1]],
        essential: true,
        duration: 400,
      });
    }
  }

  function onDblClick(lng: number, lat: number) {
    lng = +lng;
    lat = +lat;
    const newMark: Feature = {
      type: "Feature",
      properties: {
        identifier: "42-ALL", // ID for unknow locations MAGIC STRING XD
        name: `Lon: ${lng.toFixed(2)}, Lat ${lat.toFixed(2)}`,
        information: "",
        categories: [],
        campus: "",
        faculties: "",
        floors: [],
      },
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
    };
    setTmpMark(newMark);
    setPlace(newMark);
    window.history.replaceState(
      null,
      "",
      `?lng=${newMark.geometry.coordinates[0]}&lat=${newMark.geometry.coordinates[1]}`,
    );
  }

  const addGeocoderControl = useCallback(() => {
    mapRef.current?.addControl(geocoder.current);
  }, [geocoder]);

  return (
    <>
      <Map
        mapStyle={`mapbox://styles/mapbox/${theme}`}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={createInitialViewState(paramCampusBounds, paramPlace)}
        interactiveLayerIds={[placesTextLayer.id as string]}
        onClick={onClickMap}
        onLoad={(e) => {
          e.target.doubleClickZoom.disable();
          addGeocoderControl();
          if (paramPlace) {
            setGeocoderPlaces([paramPlace]);
          }
          if (paramLng && paramLat) {
            onDblClick(paramLng, paramLat);
          }
        }}
        onDblClick={(e) => {
          /*
          IMPORTANTE
          En el evento onLoad, desactiva la función doubleClickZoom. Esto se debe a un bug en Mapbox que impide detectar el doble clic en dispositivos móviles cuando esta opción está activada.

          En PC: Este problema no ocurre.
          En móviles: Se encontró esta solución en una issue de la comunidad, pero no está documentada oficialmente.
          Se ha probado en un iPhone 11 con Safari y Chrome, donde funciona correctamente. Sin embargo, el funcionamiento en otros dispositivos no está garantizado.
          */
          onDblClick(e.lngLat.lng, e.lngLat.lat);
        }}
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
        {/*
        El hover fue desactivado pues al clikear en telefonos 
        se producia un mensaje pulsante, que molestaba
        y no encontre la forma de desactivarlo en telefonos.             
        */}
        {/* {hover ? (
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
        ) : null} */}
        {geocoderPlaces
          ? geocoderPlaces.map((place) => {
              return (
                <Marker
                  key={place.properties.identifier}
                  place={place}
                  onClick={(place) => onClickMark(place)}
                  // onMouseEnter={setHover}
                />
              );
            })
          : null}
        {place ? null : <PillFilter geocoder={geocoder.current} setFilteredPlaces={setGeocoderPlaces} />}
        {!tmpMark ? null : <Marker key={tmpMark.properties.identifier} place={tmpMark} onClick={() => null} />}
      </Map>
      <MenuInformation place={place} />
    </>
  );
}
