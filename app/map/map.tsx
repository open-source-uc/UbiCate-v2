"use client";

import { useSearchParams } from "next/navigation";

import React, { use, useCallback, useEffect, useRef } from "react";

import { bbox } from "@turf/bbox";
import { centroid } from "@turf/centroid";
import type { LngLatBoundsLike } from "maplibre-gl";
import type {
  ViewState,
  PointLike,
  PaddingOptions,
  MarkerDragEvent,
  MapEvent,
  MapLayerMouseEvent,
  MapRef,
} from "react-map-gl/maplibre";
import { Map, Source, Layer } from "react-map-gl/maplibre";

import DebugMode from "@/app/debug/debugMode";
import Campus from "@/data/campuses.json";
import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import {
  getCampusBoundsFromName,
  getCampusNameFromPoint,
  getMaxCampusBoundsFromName,
  getMaxCampusBoundsFromPoint,
} from "@/utils/getCampusBounds";
import { getFeatureOfLayerFromPoint } from "@/utils/getLayerMap";
import { Feature, PointFeature, CATEGORIES } from "@/utils/types";

import DirectionsComponent from "../components/directions/component";
import UserLocation from "../components/directions/userLocation";
import MarkerIcon from "../components/icons/markerIcon";
import { pinsContext } from "../context/pinsCtx";
import { useSidebar } from "../context/sidebarCtx";

import {
  placesTextLayer,
  campusBorderLayer,
  sectionAreaLayer,
  sectionStrokeLayer,
  customPolygonSectionAreaLayer,
  customPolygonStrokeLayer,
} from "./layers";
import Marker from "./marker";
import { useMapStyle } from "../hooks/useMapStyle";


interface InitialViewState extends Partial<ViewState> {
  bounds?: LngLatBoundsLike;
  fitBoundsOptions?: {
    offset?: PointLike;
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
  const params = useSearchParams();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const { points, polygons, setPlaces, setSelectedPlace, isOpen, selectedPlace, setIsOpen, pointsName } = useSidebar();
  const { pins, addPin, handlePinDrag, clearPins, polygon } = use(pinsContext);
  const isLoaded = useRef(false);
  const mapRef = useRef<MapRef>(null);

  const handlePlaceSelection = useCallback(
    (place: Feature | null, options?: { openSidebar?: boolean; notSet?: boolean; fly?: boolean }) => {
      if (options?.notSet === undefined || options?.notSet === false) {
        setSelectedPlace(place);
      }

      const title = document.querySelector("title");
      if (!place) {
        window.history.replaceState(null, "", "?");
        if (title) {
          title.textContent = "Ubicate UC - Mapa";
        }
        setIsOpen(false);
        return;
      }

      localStorage.setItem("defaultCampus", place.properties.campus);

      if (title) {
        title.textContent = place ? `${place.properties.name}` : "Ubicate UC - Mapa";
      }

      if (place.properties.categories.includes(CATEGORIES.CUSTOM_MARK)) {
        window.history.replaceState(
          null,
          "",
          `?lng=${place.geometry.coordinates[0]}&lat=${place.geometry.coordinates[1]}`,
        );
      } else {
        window.history.replaceState(null, "", `?place=${place.properties.identifier}`);
      }

      let center: [number, number] = [0, 0];

      if (place.geometry.type === "Polygon") {
        center = centroid(place.geometry).geometry.coordinates as unknown as [number, number];
      }

      if (place.geometry.type === "Point")
        center = [place.geometry.coordinates[0], place.geometry.coordinates[1]] as unknown as [number, number];

      const [lng, lat] = center;
      const map = mapRef.current?.getMap();
      map?.setMaxBounds(undefined);
      setTimeout(() => {
        map?.setMaxBounds(getMaxCampusBoundsFromPoint(lng, lat));
      }, 600);
      if (options?.fly === false) {
        console.log("center", center);
        const bounds = map?.getBounds();
        const margin = 0.001;

        if (!map || !bounds) return;

        const isOutside = !(
          lng >= bounds.getWest() + margin &&
          lng <= bounds.getEast() - margin &&
          lat >= bounds.getSouth() + margin &&
          lat <= bounds.getNorth() - margin
        );
        if (isOutside) {
          const mapHeight = bounds.getNorth() - bounds.getSouth();
          const offset = mapHeight * 0.25;

          map.flyTo({
            center: [lng, lat - offset],
            essential: true,
            duration: 400,
          });
        }
      } else {
        map?.flyTo({
          essential: true,
          duration: 400,
          zoom: 17,
          center: [lng, lat],
          offset: [0, -20],
        });
      }
    },
    [setSelectedPlace, setIsOpen],
  );

  function onClickMap(e: MapLayerMouseEvent) {
    clearTimeout(timeoutId.current ?? undefined);
    timeoutId.current = setTimeout(() => {
      handlePlaceSelection(null, { openSidebar: false });
      clearPins();
    }, 350);
  }

  async function onLoad(e: MapEvent) {
    e.target.doubleClickZoom.disable();
    mapRef.current?.getMap().setMinZoom(15);
    const map = mapRef.current?.getMap();
    if (paramPlace) {
      map?.setMaxBounds(getMaxCampusBoundsFromName(paramPlace.properties.campus));
      setPlaces([paramPlace]);
      handlePlaceSelection(paramPlace, { openSidebar: true });
      localStorage.setItem("defaultCampus", paramPlace.properties.campus);
    } else if (paramLng && paramLat) {
      localStorage.setItem("defaultCampus", getCampusNameFromPoint(paramLng, paramLat) ?? "SanJoaquin");
      map?.setMaxBounds(getMaxCampusBoundsFromPoint(paramLng, paramLat));
      handlePlaceSelection(addPin(parseFloat("" + paramLng), parseFloat("" + paramLat)), {
        openSidebar: true,
      });
    } else {
      const defaultCampus = localStorage.getItem("defaultCampus") ?? "SanJoaquin";
      map?.setMaxBounds(getMaxCampusBoundsFromName(defaultCampus));
      map?.fitBounds(getCampusBoundsFromName(defaultCampus), {
        duration: 0,
        zoom: defaultCampus === "SJ" || defaultCampus === "SanJoaquin" ? 15.5 : 17,
      });
    }

    e.target.on("click", ["area-polygon"], (e) => {
      const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["area-polygon"]);
      if (!feature) return;
      /*
       Importante pues si no se borra se ejecute lo que esta en la funcion onClickMap,
       lo que no permite abrir el menu del area, pues un click en el area tmb cuenta como click en el mapa 
       */
      clearTimeout(timeoutId.current ?? undefined);
      setTimeout(() => {
        handlePlaceSelection(feature, { openSidebar: true });
      }, 200);
    });

    const isDebugMode = sessionStorage.getItem("debugMode") === "true";

    if (isDebugMode) {
      e.target.on("click", ["points-layer-2"], (e) => {
        const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["points-layer-2"]);
        if (!feature) return;
        clearTimeout(timeoutId.current ?? undefined);
        setTimeout(() => {
          setIsOpen(true);
          handlePlaceSelection(feature, { openSidebar: true });
        }, 200);
      });
      e.target.on("click", ["points-layer-3"], (e) => {
        const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["points-layer-3"]);
        if (!feature) return;
        clearTimeout(timeoutId.current ?? undefined);
        setTimeout(() => {
          setIsOpen(true);
          handlePlaceSelection(feature, { openSidebar: true });
        }, 200);
      });
      e.target.on("click", ["debug-area-polygon"], (e) => {
        const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["debug-area-polygon"]);
        if (!feature) return;
        clearTimeout(timeoutId.current ?? undefined);
        setTimeout(() => {
          handlePlaceSelection(feature, { openSidebar: true });
        }, 200);
      });
    }

    isLoaded.current = true;
  }

  useEffect(() => {
    const campusName = params.get("campus");
    if (campusName) {
      localStorage.setItem("defaultCampus", campusName);
      mapRef.current?.getMap().setMaxBounds(getMaxCampusBoundsFromName(localStorage.getItem("defaultCampus")));
      mapRef.current?.getMap()?.fitBounds(getCampusBoundsFromName(campusName), {
        duration: 0,
        zoom: campusName === "SJ" || campusName === "SanJoaquin" ? 15.5 : 17,
      });
    }
  }, [params]);

  useEffect(() => {
    if (isLoaded.current) {
      handlePlaceSelection(selectedPlace, { openSidebar: true, notSet: true, fly: true });
    }
  }, [selectedPlace, handlePlaceSelection]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver(() => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          console.log("Map resized");
        }
      }, 175); // 200 para evitar resize excesivos, debido a la animación de la sidebar que dura 150ms
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, []);


  const {mapStyle} = useMapStyle();
  return (
    <div className="w-full h-full" ref={containerRef}>
      <Map
        id="mainMap"
        mapStyle={mapStyle}
        initialViewState={createInitialViewState(params.get("campus"), paramPlace, paramLng, paramLat)}
        onClick={(e) => onClickMap(e)}
        onLoad={(e) => onLoad(e)}
        onDblClick={(e) => {
          clearTimeout(timeoutId.current ?? undefined);
          handlePlaceSelection(addPin(e.lngLat.lng, e.lngLat.lat), {
            openSidebar: true,
          });
        }}
        transformRequest={(url, type) => {
          if (type === "Tile") {
            const baseUrl = window.location.origin;
            return { url: baseUrl + url };
          }
          if (type === "Glyphs") {
            const baseUrl = window.location.origin;
            return { url: baseUrl + url };
          }
          return { url };
        }}
        ref={mapRef}
      >
        <Source id="campusSmall" type="geojson" data={Campus as GeoJSON.FeatureCollection<GeoJSON.Geometry>}>
          <Layer {...campusBorderLayer} />
        </Source>
        <Source id="places" type="geojson" data={featuresToGeoJSON([...pointsName, ...polygons])}>
          <Layer {...placesTextLayer} />
        </Source>
        <Source id="areas-uc" type="geojson" data={featuresToGeoJSON(polygons)}>
          <Layer {...sectionAreaLayer} />
          <Layer {...sectionStrokeLayer} />
        </Source>
        <Source id="custom-polygon-area" type="geojson" data={featuresToGeoJSON(polygon)}>
          <Layer {...customPolygonSectionAreaLayer} />
          <Layer {...customPolygonStrokeLayer} />
        </Source>
        <DebugMode />
        <UserLocation />
        <DirectionsComponent />

        {points.map((place) => {
          const primaryCategory = place.properties.categories[0] as CATEGORIES;
          return (
            <Marker
              key={place.properties.identifier}
              place={place as PointFeature}
              onClick={() => handlePlaceSelection(place, { openSidebar: true })}
              icon={<MarkerIcon label={primaryCategory} />}
            />
          );
        })}
        {pins.map((pin) => {
          const primaryCategory = pin.properties.categories[0] as CATEGORIES;
          return (
            <Marker
              key={pin.properties.identifier}
              place={pin as PointFeature}
              onClick={() => handlePlaceSelection(pin, { openSidebar: true })}
              icon={<MarkerIcon label={primaryCategory} />}
              draggable
              onDrag={(e: MarkerDragEvent) => {
                handlePinDrag(e, pin.properties.identifier);
              }}
            />
          );
        })}
      </Map>
    </div>
  );
}
