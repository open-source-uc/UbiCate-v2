"use client";

import { useRef, useState, useCallback, useEffect } from "react";

import { bbox } from "@turf/bbox";
import "../custom-landing-geocoder.css";
import type { LngLatBoundsLike } from "mapbox-gl";
import type {
  MapRef,
  ViewState,
  PointLike,
  PaddingOptions,
  MarkerDragEvent,
  MapEvent,
  MapLayerMouseEvent,
} from "react-map-gl";
import { Map, Source, Layer, GeolocateControl, NavigationControl, ScaleControl } from "react-map-gl";

import DebugMode from "@/app/components/debugMode";
import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import { useThemeObserver } from "@/utils/themeObserver";

import Campus from "../../data/campuses.json";
import { Feature, Place } from "../../utils/types";
import useGeocoder from "../hooks/useGeocoder";

import { placesTextLayer, placesDarkTextLayer, campusBorderLayer, darkCampusBorderLayer, redAreaLayer } from "./layers";
import Marker from "./marker";
import MenuInformation from "./menuInformation";
import MapNavbar from "./nabvar";

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
  paramCampusBounds: LngLatBoundsLike,
  paramPlace: Feature | null | undefined,
  paramLng: number | null | undefined,
  paramLat: number | null | undefined,
): InitialViewState {
  const initialViewState: InitialViewState = {
    zoom: 18,
  };

  if (paramPlace) {
    if (paramPlace?.geometry.type === "Point") {
      initialViewState.longitude = paramPlace?.geometry.coordinates[0];
      initialViewState.latitude = paramPlace?.geometry.coordinates[1];
    }
    if (paramPlace?.geometry.type === "Polygon") {
      initialViewState.bounds = bbox(paramPlace?.geometry) as LngLatBoundsLike;
    }
  } else if (paramLng && paramLat) {
    initialViewState.longitude = paramLng;
    initialViewState.latitude = paramLat;
    initialViewState.zoom = 17;
  } else {
    initialViewState.bounds = paramCampusBounds;
  }

  return initialViewState;
}

export default function MapComponent({
  paramCampusBounds,
  paramPlace,
  paramLng,
  paramLat,
}: {
  paramCampusBounds: LngLatBoundsLike;
  paramPlace?: Feature | null;
  paramLng?: number | null;
  paramLat?: number | null;
}) {
  const mapRef = useRef<MapRef>(null);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && localStorage?.theme === "dark" ? "dark-v11" : "streets-v12",
  );
  const refMapNavbar = useRef<HTMLSelectElement | null>(null);
  const [place, setPlace] = useState<Feature | null>(null);
  const [area, setArea] = useState<Feature | null>(null);
  const [tmpMark, setTmpMark] = useState<Feature | null>(null);
  // const [hover, setHover] = useState<Feature | null>(null);

  const [geocoderPlaces, setGeocoderPlaces] = useGeocoder(refMapNavbar, (place) => {
    if (place?.geometry.type === "Point") {
      mapRef.current?.getMap().flyTo({
        essential: true,
        duration: 400,
        center: [place?.geometry.coordinates[0], place?.geometry.coordinates[1]],
      });
      setArea(null);
    }
    if (place?.geometry.type === "Polygon") {
      mapRef.current?.fitBounds(bbox(place?.geometry) as LngLatBoundsLike, {
        zoom: 17,
      });
      setArea(place);
    }
    window.history.replaceState(null, "", `?place=${place.properties.identifier}`);
  });

  useThemeObserver(setTheme, mapRef.current?.getMap());

  useEffect(() => {
    mapRef.current?.fitBounds(paramCampusBounds, { padding: 20, duration: 4000 });
  }, [paramCampusBounds]);

  function onClickMap(e: MapLayerMouseEvent) {
    window.history.replaceState(null, "", window.location.pathname);
    setPlace(null);
  }

  function onClickMark(place: Feature) {
    if (!mapRef.current?.getMap()) return;

    setPlace(place);

    if (place.properties.identifier === "42-ALL") {
      window.history.replaceState(
        null,
        "",
        `?lng=${place?.geometry.coordinates[0]}&lat=${place?.geometry.coordinates[1]}`,
      );
    } else {
      window.history.replaceState(null, "", `?place=${place.properties.identifier}`);
    }

    if (place?.geometry.type !== "Point") return;

    const coordinates = [place?.geometry.coordinates[0], place?.geometry.coordinates[1]];
    const bounds = mapRef.current?.getMap().getBounds();
    const margin = 0.001;

    const isOutside = !(
      coordinates[0] >= bounds.getWest() + margin &&
      coordinates[0] <= bounds.getEast() - margin &&
      coordinates[1] >= bounds.getSouth() + margin &&
      coordinates[1] <= bounds.getNorth() - margin
    );

    if (isOutside) {
      mapRef.current?.getMap().flyTo({
        center: [place?.geometry.coordinates[0], place?.geometry.coordinates[1]],
        essential: true,
        duration: 400,
      });
    }
  }

  function setCustomMark(lng: number, lat: number, showMenu: boolean) {
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
    if (showMenu) setPlace(newMark);

    window.history.replaceState(
      null,
      "",
      `?lng=${newMark.geometry.coordinates[0]}&lat=${newMark.geometry.coordinates[1]}`,
    );
  }

  function onLoad(e: MapEvent) {
    e.target.doubleClickZoom.disable();
    if (paramPlace) {
      setGeocoderPlaces([paramPlace]);
      if (paramPlace?.geometry.type === "Polygon") setArea(paramPlace);
    }
    if (paramLng && paramLat) {
      setCustomMark(paramLng, paramLat, false);
    }
    const isDebugMode = sessionStorage.getItem("debugMode") === "true";

    if (isDebugMode) {
      e.target.on("click", ["points-layer-2"], (e) => {
        const todos = e.target.queryRenderedFeatures(e.point, { layers: ["points-layer-2"] });
        const f = todos[0];
        if (!f) return;

        const ff = {
          type: "Feature",
          properties: f.properties,
          geometry: f.geometry,
        };
        if (ff.properties) {
          ff.properties.categories = JSON.parse(ff.properties.categories);
          ff.properties.floors = JSON.parse(ff.properties.floors);
        } else {
          return;
        }

        setPlace(ff as unknown as Feature);
      });
      e.target.on("click", ["points-layer-3"], (e) => {
        const todos = e.target.queryRenderedFeatures(e.point, { layers: ["points-layer-3"] });
        const f = todos[0];
        if (!f) return;

        const ff = {
          type: "Feature",
          properties: f.properties,
          geometry: f.geometry,
        };
        if (ff.properties) {
          ff.properties.categories = JSON.parse(ff.properties.categories);
          ff.properties.floors = JSON.parse(ff.properties.floors);
        } else {
          return;
        }

        setPlace(ff as unknown as Feature);
      });
    }
  }

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    setPlace(null);
    setArea(null);
    setCustomMark(event.lngLat.lng, event.lngLat.lat, false);
  }, []);

  const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
    setPlace(null);
    setArea(null);
    setCustomMark(event.lngLat.lng, event.lngLat.lat, false);
    mapRef.current?.flyTo({
      center: [event.lngLat.lng, event.lngLat.lat],
    });
  }, []);

  return (
    <>
      {/*Esto esta afuera de map pues si fuera adentro podria pasar que el map no se rendirizara lo que deja la ref en null, provocando que no se agregue el geocoder o mejor conocido como searchbox */}
      <MapNavbar ref={refMapNavbar} setGeocoderPlaces={setGeocoderPlaces} />
      <Map
        mapStyle={`mapbox://styles/mapbox/${theme}`}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={createInitialViewState(paramCampusBounds, paramPlace, paramLng, paramLat)}
        interactiveLayerIds={[placesTextLayer.id as string]}
        onClick={(e) => onClickMap(e)}
        onLoad={(e) => onLoad(e)}
        onDblClick={(e) => {
          /*
          IMPORTANTE
          En el evento onLoad, desactiva la función doubleClickZoom. Esto se debe a un bug en Mapbox que impide detectar el doble clic en dispositivos móviles cuando esta opción está activada.
 
          En PC: Este problema no ocurre.
          En móviles: Se encontró esta solución en una issue de la comunidad, pero no está documentada oficialmente.
          Se ha probado en un iPhone 11 con Safari y Chrome, donde funciona correctamente. Sin embargo, el funcionamiento en otros dispositivos no está garantizado.
          */
          setCustomMark(e.lngLat.lng, e.lngLat.lat, true);
        }}
        ref={mapRef}
      >
        <MenuInformation place={place} />

        <GeolocateControl position="bottom-right" showUserHeading={true} />
        {/* <FullscreenControl position="top-left" /> */}
        <NavigationControl position="bottom-right" />
        <ScaleControl />
        <Source id="campusSmall" type="geojson" data={Campus as GeoJSON.FeatureCollection<GeoJSON.Geometry>}>
          {theme && theme === "dark-v11" ? <Layer {...darkCampusBorderLayer} /> : <Layer {...campusBorderLayer} />}
        </Source>
        <Source id="places" type="geojson" data={featuresToGeoJSON(geocoderPlaces)}>
          {theme && theme === "dark-v11" ? <Layer {...placesDarkTextLayer} /> : <Layer {...placesTextLayer} />}
        </Source>

        <Source id="areas-uc" type="geojson" data={featuresToGeoJSON(area)}>
          <Layer {...redAreaLayer} />
        </Source>
        <DebugMode />
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
          ? geocoderPlaces
              .filter((e) => e.geometry.type === "Point")
              .map((place) => {
                return (
                  <Marker
                    key={place.properties.identifier}
                    place={place as Place}
                    onClick={() => {
                      setTmpMark(null);
                      onClickMark(place);
                    }}
                    // onMouseEnter={setHover}
                  />
                );
              })
          : null}
        {tmpMark && tmpMark.geometry.type === "Point" ? (
          <Marker
            draggable={true}
            key={tmpMark.properties.identifier}
            place={tmpMark as Place}
            onClick={() => onClickMark(tmpMark)}
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragEnd}
          />
        ) : null}
      </Map>
    </>
  );
}
