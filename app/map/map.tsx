"use client";

import { useSearchParams } from "next/navigation";

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
import {
  getCampusBoundsFromName,
  getCampusFromPoint2,
  getMaxCampusBoundsFromName,
  getMaxCampusBoundsFromPoint,
} from "@/utils/getCampusBounds";
import { siglas, Feature, PointFeature } from "@/utils/types";

import Campus from "../../data/campuses.json";
import useGeocoder from "../hooks/useGeocoder";

import {
  placesTextLayer,
  placesDarkTextLayer,
  campusBorderLayer,
  darkCampusBorderLayer,
  redAreaLayer,
  redLineLayer,
} from "./layers";
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
  campusName: string | null,
  paramPlace: Feature | null | undefined,
  paramLng: number | null | undefined,
  paramLat: number | null | undefined,
): InitialViewState {
  const initialViewState: InitialViewState = {
    zoom: 17,
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
    initialViewState.bounds = getCampusBoundsFromName(campusName);
  }

  return initialViewState;
}

export default function MapComponent({
  paramPlace,
  paramLng,
  paramLat,
}: {
  paramPlace?: Feature | null;
  paramLng?: number | null;
  paramLat?: number | null;
}) {
  const mapRef = useRef<MapRef>(null);

  const refMapNavbar = useRef<HTMLSelectElement | null>(null);
  const [place, setPlace] = useState<Feature | null>(null);
  const [tmpMark, setTmpMark] = useState<Feature | null>(null);
  const params = useSearchParams();
  // const [hover, setHover] = useState<Feature | null>(null);

  const [Places, Points, Polygons, setGeocoderPlaces] = useGeocoder(refMapNavbar, (place) => {
    setMenu(null);
    mapRef.current?.getMap().setMaxBounds(undefined);
    localStorage.setItem("defaultCampus", place.properties.campus);
    window.history.replaceState(null, "", `?place=${place.properties.identifier}`);

    if (place?.geometry.type === "Point") {
      mapRef.current?.getMap().flyTo({
        essential: true,
        duration: 400,
        zoom: 16,
        center: [place?.geometry.coordinates[0], place?.geometry.coordinates[1]],
      });
    }
    if (place?.geometry.type === "Polygon") {
      mapRef.current?.fitBounds(bbox(place?.geometry) as LngLatBoundsLike, {
        zoom: 17,
        duration: 400,
      });
    }
  });

  useEffect(() => {
    const campusName = params.get("campus");
    if (campusName) {
      mapRef.current?.getMap().setMaxBounds(undefined);
      localStorage.setItem("defaultCampus", campusName);
      mapRef.current?.fitBounds(getCampusBoundsFromName(campusName), {
        duration: 2_500,
        zoom: campusName === "SJ" || campusName === "SanJoaquin" ? 15.5 : 17,
      });
    }
    setTimeout(
      () => {
        mapRef.current?.getMap().setMaxBounds(getMaxCampusBoundsFromName(localStorage.getItem("defaultCampus")));
      },
      campusName ? 2_600 : 500,
    );
  }, [params]);

  const setMenu = useCallback(
    (place: Feature | null) => {
      setPlace(place);
      if (place)
        if (place.properties.identifier === "42-ALL") {
          window.history.replaceState(
            null,
            "",
            `?lng=${place?.geometry.coordinates[0]}&lat=${place?.geometry.coordinates[1]}`,
          );
        } else {
          window.history.replaceState(null, "", `?place=${place.properties.identifier}`);
        }
      else window.history.replaceState(null, "", "?");
    },
    [setPlace],
  );

  function onClickMark(place: Feature) {
    if (!mapRef.current?.getMap()) return;

    setMenu(place);

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

  function onClickMap(e: MapLayerMouseEvent) {
    setMenu(null);
  }

  const setCustomMark = useCallback(
    (lng: number, lat: number, showMenu: boolean) => {
      lng = +lng;
      lat = +lat;
      const newMark: Feature = {
        type: "Feature",
        properties: {
          identifier: "42-ALL", // ID for unknow locations MAGIC STRING XD
          name: `Lon: ${lng.toFixed(4)}, Lat: ${lat.toFixed(4)}`,
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
      if (showMenu) setMenu(newMark);
    },
    [setTmpMark, setMenu],
  );

  function getFeatureOfLayerFromPoint(target: mapboxgl.Map, point: mapboxgl.Point, layers: string[]): Feature | null {
    const features = target.queryRenderedFeatures(point, {
      layers: layers,
    });

    const feature = features[0];
    if (!feature) return null;

    if (!feature.properties) return null;

    const exit = {
      type: "Feature",
      properties: feature.properties,
      geometry: feature.geometry,
    };
    exit.properties.categories = JSON.parse(exit.properties.categories);

    if (feature.properties?.floors) exit.properties.floors = JSON.parse(exit.properties.floors);

    return exit as unknown as Feature;
  }

  function onLoad(e: MapEvent) {
    e.target.doubleClickZoom.disable();
    if (paramPlace) {
      localStorage.setItem("defaultCampus", paramPlace.properties.campus);
      setGeocoderPlaces([paramPlace]);
    }
    if (paramLng && paramLat) {
      localStorage.setItem("defaultCampus", getCampusFromPoint2(paramLng, paramLat));
      mapRef.current?.getMap().setMaxBounds(getMaxCampusBoundsFromPoint(paramLng, paramLat));
      setCustomMark(paramLng, paramLat, false);
    }

    e.target.on("click", ["red-area"], (e) => {
      const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["red-area"]);
      if (!feature) return;

      setTmpMark(null);
      setMenu(feature);
    });
    const isDebugMode = sessionStorage.getItem("debugMode") === "true";

    if (isDebugMode) {
      e.target.on("click", ["points-layer-2"], (e) => {
        const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["points-layer-2"]);
        if (!feature) return;

        setMenu(feature);
      });
      e.target.on("click", ["points-layer-3"], (e) => {
        const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["points-layer-3"]);
        if (!feature) return;

        setMenu(feature);
      });
    }
  }

  const onMarkerDrag = useCallback(
    (event: MarkerDragEvent) => {
      setMenu(null);
      setCustomMark(event.lngLat.lng, event.lngLat.lat, false);
    },
    [setCustomMark, setMenu],
  );

  const onMarkerDragEnd = useCallback(
    (event: MarkerDragEvent) => {
      setMenu(null);
      setCustomMark(event.lngLat.lng, event.lngLat.lat, false);
      mapRef.current?.flyTo({
        center: [event.lngLat.lng, event.lngLat.lat],
      });
    },
    [setCustomMark, setMenu],
  );

  useEffect(() => {
    const title = document.querySelector("title");
    if (title) {
      title.textContent = place
        ? `${siglas.get(place.properties.categories[0]) ?? "UbíCate"} - ${place.properties.name}`
        : "UbíCate UC - Mapa";
    }

    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        place
          ? `Nombre: ${place.properties.name}; Categoria: ${
              siglas.get(place.properties.categories[0]) ?? "Sala"
            }; Piso: ${place.properties.floors?.[0] ?? "N/A"}`
          : "Encuentra fácilmente salas de clases, baños, bibliotecas y puntos de comida en los campus de la Pontificia Universidad Católica (PUC). Nuestra herramienta interactiva te ayuda a navegar de manera rápida y eficiente. ¡Explora y descubre todo lo que necesitas al alcance de tu mano! Busca Salas UC",
      );
    }
  }, [place]);

  return (
    <>
      {/*Esto esta afuera de map pues si fuera adentro podria pasar que el map no se rendirizara lo que deja la ref en null, provocando que no se agregue el geocoder o mejor conocido como searchbox */}
      <MapNavbar ref={refMapNavbar} setGeocoderPlaces={setGeocoderPlaces} />
      <Map
        mapStyle="mapbox://styles/mapbox/navigation-guidance-night-v4"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={createInitialViewState(
          params.get("campus") ?? localStorage.getItem("defaultCampus") ?? null,
          paramPlace,
          paramLng,
          paramLat,
        )}
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
        <MenuInformation place={place} onClose={(e) => setMenu(null)} />

        <GeolocateControl position="bottom-right" showUserHeading={true} />
        {/* <FullscreenControl position="top-left" /> */}
        <NavigationControl position="bottom-right" />
        <ScaleControl />
        <Source id="campusSmall" type="geojson" data={Campus as GeoJSON.FeatureCollection<GeoJSON.Geometry>}>
          <Layer {...darkCampusBorderLayer} />
        </Source>
        <Source id="places" type="geojson" data={featuresToGeoJSON(Places)}>
          <Layer {...placesDarkTextLayer} />
        </Source>

        <Source id="areas-uc" type="geojson" data={featuresToGeoJSON(Polygons)}>
          <Layer {...redAreaLayer} />
        </Source>
        <Source id="lineas-uc" type="geojson" data={featuresToGeoJSON(Polygons)}>
          <Layer {...redLineLayer} />
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
        {Points.map((place) => {
          return (
            <Marker
              key={place.properties.identifier}
              place={place}
              onClick={() => {
                setTmpMark(null);
                onClickMark(place);
              }}
              // onMouseEnter={setHover}
            />
          );
        })}

        {tmpMark && tmpMark.geometry.type === "Point" ? (
          <Marker
            draggable={true}
            key={tmpMark.properties.identifier}
            place={tmpMark as PointFeature}
            onClick={() => onClickMark(tmpMark)}
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragEnd}
          />
        ) : null}
      </Map>
    </>
  );
}
