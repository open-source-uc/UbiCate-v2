"use client";

import { useSearchParams } from "next/navigation";

import React, { useCallback, useEffect, useRef } from "react";

import { bbox } from "@turf/bbox";
import type { LngLatBoundsLike } from "mapbox-gl";
import type { ViewState, PointLike, PaddingOptions, MarkerDragEvent, MapEvent, MapLayerMouseEvent, MapRef } from "react-map-gl";
import { Map, useMap, Source, Layer, ScaleControl } from "react-map-gl";

import DebugMode from "@/app/components/debugMode";
import Campus from "@/data/campuses.json";
import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import { getCampusBoundsFromName, getCampusNameFromPoint, getMaxCampusBoundsFromName, getMaxCampusBoundsFromPoint } from "@/utils/getCampusBounds";
import { Feature, PointFeature, CategoryEnum, siglas } from "@/utils/types";

import MarkerIcon from "../components/icons/markerIcon";
import { useSidebar } from "../context/sidebarCtx";
import DirectionsComponent from "../directions/component";
import UserLocation from "../directions/userLocation";
import useCustomPins from "../hooks/useCustomPins";

import { placesTextLayer, campusBorderLayer, sectionAreaLayer, sectionStrokeLayer } from "./layers";
import Marker from "./marker";
import centroid from "@turf/centroid";
import { getFeatureOfLayerFromPoint } from "@/utils/getLayerMap";

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
  } else if (campusName) {
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
  const { points, polygons, setPlaces, setSelectedPlace, selectedPlace, setIsOpen } = useSidebar();
  const { pins, addPin, handlePinDrag, clearPins } = useCustomPins({
    maxPins: 20,
  });
  const mapRef = useRef<MapRef>(null);


  useEffect(() => {
    const campusName = params.get("campus");
    if (campusName) {
      localStorage.setItem("defaultCampus", campusName);
      // mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromName(localStorage.getItem("defaultCampus")));
      mapRef.current?.getMap()?.fitBounds(getCampusBoundsFromName(campusName), {
        duration: 0,
        zoom: campusName === "SJ" || campusName === "SanJoaquin" ? 15.5 : 17,
      });
    }
  }, [params]);

  useEffect(() => {
    handlePlaceSelection(selectedPlace, { openSidebar: true, notSet: true, fly: true });
  }, [selectedPlace]);

  const handlePlaceSelection = useCallback(
    (place: Feature | null, options?: { openSidebar?: boolean, notSet?: boolean, fly?: boolean }) => {

      if (options?.notSet === undefined || options?.notSet === false) {
        setSelectedPlace(place);
      }

      const title = document.querySelector("title");
      if (!place) {
        window.history.replaceState(null, "", "?");
        if (title) {
          title.textContent = "Ubicate UC - Mapa";
        }
        return
      };

      localStorage.setItem("defaultCampus", place.properties.campus);

      if (title) {
        title.textContent = place
          ? `${place.properties.name}`
          : "Ubicate UC - Mapa";
      }

      if (place.properties.categories.includes(CategoryEnum.CUSTOM_MARK)) {
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
    handlePlaceSelection(null, { openSidebar: false });
    clearTimeout(timeoutId.current ?? undefined);
    timeoutId.current = setTimeout(() => {
      clearPins();
    }, 300);
  }

  async function onLoad(e: MapEvent) {
    e.target.doubleClickZoom.disable();
    mapRef.current?.getMap().setMinZoom(15);
    const map = mapRef.current?.getMap();
    if (paramPlace) {
      map?.setMaxBounds(getMaxCampusBoundsFromName(paramPlace.properties.campus));
      if (paramPlace.geometry.type === "Point") {
        mapRef.current?.getMap().flyTo({
          essential: true,
          duration: 0,
          zoom: 17,
          center: [paramPlace.geometry.coordinates[0], paramPlace.geometry.coordinates[1]],
        });
      }
      if (paramPlace.geometry.type === "Polygon") {
        mapRef.current?.getMap()?.fitBounds(bbox(paramPlace.geometry) as LngLatBoundsLike, {
          zoom: 17,
          duration: 0,
        });
      }

      localStorage.setItem("defaultCampus", paramPlace.properties.campus);
      setPlaces([paramPlace]);
    } else if (paramLng && paramLat) {
      localStorage.setItem("defaultCampus", getCampusNameFromPoint(paramLng, paramLat) ?? "SanJoaquin");
      map?.setMaxBounds(getMaxCampusBoundsFromPoint(paramLng, paramLat));
      mapRef.current?.getMap().flyTo({
        essential: true,
        duration: 0,
        zoom: 17,
        center: [paramLng, paramLat],
      });
      handlePlaceSelection(addPin(parseFloat("" + paramLng), parseFloat("" + paramLat)), {
        openSidebar: true,
      });
    } else {
      const defaultCampus = localStorage.getItem("defaultCampus") ?? "SanJoaquin";
      map?.setMaxBounds(getMaxCampusBoundsFromName(defaultCampus));
      mapRef.current?.getMap()?.fitBounds(getCampusBoundsFromName(defaultCampus), {
        duration: 0,
        zoom: defaultCampus === "SJ" || defaultCampus === "SanJoaquin" ? 15.5 : 17,
      });
    }

    e.target.on("click", ["red-area"], (e) => {
      const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["red-area"]);
      if (!feature) return;

      setTimeout(() => {
        setIsOpen(true);
        handlePlaceSelection(feature, { openSidebar: true });
      }, 10);
    });

    const isDebugMode = sessionStorage.getItem("debugMode") === "true";

    if (isDebugMode) {
      e.target.on("click", ["points-layer-2"], (e) => {
        const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["points-layer-2"]);
        if (!feature) return;

        setTimeout(() => {
          setIsOpen(true);
          handlePlaceSelection(feature, { openSidebar: true });
        }, 10);
      });
      e.target.on("click", ["points-layer-3"], (e) => {
        const feature = getFeatureOfLayerFromPoint(e.target, e.point, ["points-layer-3"]);
        if (!feature) return;

        setTimeout(() => {
          setIsOpen(true);
          handlePlaceSelection(feature, { openSidebar: true });
        }, 10);
      });
    }
  }

  return (
    <>
      <Map
        id="mainMap"
        mapStyle="mapbox://styles/ubicate/cm7nhvwia00av01sm66n40918"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={createInitialViewState(params.get("campus"), paramPlace, paramLng, paramLat)}
        onClick={(e) => onClickMap(e)}
        onLoad={(e) => onLoad(e)}
        onDblClick={(e) => {
          clearTimeout(timeoutId.current ?? undefined);
          handlePlaceSelection(addPin(e.lngLat.lng, e.lngLat.lat), {
            openSidebar: true,
          });
        }}
        ref={mapRef}
      >
        <ScaleControl />
        <Source id="campusSmall" type="geojson" data={Campus as GeoJSON.FeatureCollection<GeoJSON.Geometry>}>
          <Layer {...campusBorderLayer} />
        </Source>
        <Source id="places" type="geojson" data={featuresToGeoJSON([...points, ...polygons])}>
          <Layer {...placesTextLayer} />
        </Source>

        <Source id="areas-uc" type="geojson" data={featuresToGeoJSON(polygons)}>
          <Layer {...sectionAreaLayer} />
        </Source>
        <Source id="lineas-uc" type="geojson" data={featuresToGeoJSON(polygons)}>
          <Layer {...sectionStrokeLayer} />
        </Source>
        <DebugMode />
        <UserLocation />
        <DirectionsComponent />

        {points.map((place) => {
          const primaryCategory = place.properties.categories[0] as CategoryEnum;
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
          const primaryCategory = pin.properties.categories[0] as CategoryEnum;
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
    </>
  );
}
