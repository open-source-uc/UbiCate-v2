"use client";

import { useSearchParams } from "next/navigation";

import React, { useCallback, useEffect, useRef } from "react";

import { bbox } from "@turf/bbox";
import type { LngLatBoundsLike } from "mapbox-gl";
import type { ViewState, PointLike, PaddingOptions, MarkerDragEvent, MapEvent, MapLayerMouseEvent } from "react-map-gl";
import { Map, useMap, Source, Layer, ScaleControl } from "react-map-gl";

import DebugMode from "@/app/components/debugMode";
import Campus from "@/data/campuses.json";
import { featuresToGeoJSON } from "@/utils/featuresToGeoJSON";
import { getCampusBoundsFromName, getCampusNameFromPoint } from "@/utils/getCampusBounds";
import { Feature, PointFeature, CategoryEnum } from "@/utils/types";

import MarkerIcon from "../components/icons/markerIcon";
import { useSidebar } from "../context/sidebarCtx";
import DirectionsComponent from "../directions/component";
import UserLocation from "../directions/userLocation";
import useCustomPins from "../hooks/useCustomPins";

import { placesTextLayer, campusBorderLayer, sectionAreaLayer, sectionStrokeLayer } from "./layers";
import Marker from "./marker";
import centroid from "@turf/centroid";

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
  const { mainMap } = useMap();
  const params = useSearchParams();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const { points, polygons, setPlaces, setSelectedPlace, selectedPlace, setIsOpen } = useSidebar();
  const { pins, addPin, handlePinDrag, clearPins } = useCustomPins({
    maxPins: 20,
  });

  useEffect(() => {
    const campusName = params.get("campus");
    if (campusName) {
      localStorage.setItem("defaultCampus", campusName);
      // mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromName(localStorage.getItem("defaultCampus")));
      mainMap?.fitBounds(getCampusBoundsFromName(campusName), {
        duration: 0,
        zoom: campusName === "SJ" || campusName === "SanJoaquin" ? 15.5 : 17,
      });
    }
  }, [params]);

  useEffect(() => {
    if (!selectedPlace) return;
    handlePlaceSelection(selectedPlace, { openSidebar: true });
  }, [selectedPlace]);

  const handlePlaceSelection = useCallback(
    (place: Feature | null, options?: { openSidebar?: boolean }) => {
      setSelectedPlace(place);

      if (!place) {
        window.history.replaceState(null, "", "?");
        if (options?.openSidebar) {
          setIsOpen(false);
        }
        return
      };

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

      const map = mainMap?.getMap();
      const bounds = map?.getBounds();
      const margin = 0.001;

      if (!map || !bounds) return;

      const [lng, lat] = center;

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

  async function onLoad(e: MapEvent) {
    e.target.doubleClickZoom.disable();
    mainMap?.getMap().setMinZoom(15);
    if (paramPlace) {
      // mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromName(paramPlace.properties.campus));
      if (paramPlace.geometry.type === "Point") {
        mainMap?.getMap().flyTo({
          essential: true,
          duration: 0,
          zoom: 17,
          center: [paramPlace.geometry.coordinates[0], paramPlace.geometry.coordinates[1]],
        });
      }
      if (paramPlace.geometry.type === "Polygon") {
        mainMap?.fitBounds(bbox(paramPlace.geometry) as LngLatBoundsLike, {
          zoom: 17,
          duration: 0,
        });
      }

      localStorage.setItem("defaultCampus", paramPlace.properties.campus);
      setPlaces([paramPlace]);
    } else if (paramLng && paramLat) {
      localStorage.setItem("defaultCampus", getCampusNameFromPoint(paramLng, paramLat) ?? "SanJoaquin");
      // mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromPoint(paramLng, paramLat));
      mainMap?.getMap().flyTo({
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
      // mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromName(defaultCampus));
      mainMap?.fitBounds(getCampusBoundsFromName(defaultCampus), {
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
