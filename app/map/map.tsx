"use client";

import { useSearchParams } from "next/navigation";

import React, { use, useEffect, useRef } from "react";

import { bbox } from "@turf/bbox";
import { center } from "@turf/center";
import type { LngLatBoundsLike } from "maplibre-gl";
import type { ViewState, PointLike, PaddingOptions, MarkerDragEvent, MapRef } from "react-map-gl/maplibre";
import { Map, Source, Layer } from "react-map-gl/maplibre";

import DebugMode from "@/app/debug/debugMode";
import Campus from "@/data/campuses.json";
import { getCampusBoundsFromName, getMaxCampusBoundsFromName } from "@/lib/campus/getCampusBounds";
import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { Feature, PointFeature, CATEGORIES, siglas } from "@/lib/types";

import { SilentErrorBoundary } from "../components/app/appErrors/SilentErrorBoundary";
import DirectionsComponent from "../components/features/directions/component";
import UserLocation from "../components/features/directions/userLocation";
import MarkerIcon from "../components/ui/icons/markerIcon";
import { pinsContext } from "../context/pinsCtx";
import { useSidebar } from "../context/sidebarCtx";

import { HandlePlaceSelectionOptions, useMapEvents } from "./hooks/useMapEvents";
import { useMapStyle } from "./hooks/useMapStyle";
import Marker from "./marker";

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
  const mapRef = useRef<MapRef>(null);
  const params = useSearchParams();
  const { points, polygons, pointsName } = useSidebar();
  const { pins, handlePinDrag, polygon } = use(pinsContext);
  const { handleMapLoad, handlePlaceSelection } = useMapEvents({
    mapRef,
    paramPlace,
    paramLng,
    paramLat,
  });
  const mapConfig = useMapStyle();

  // Crear puntos centroides para los nombres de campus
  const campusNamePoints = React.useMemo(() => {
    const campusFeatures = Campus.features as Array<GeoJSON.Feature<GeoJSON.Polygon>>;
    return campusFeatures.map((campus) => {
      const campusCenter = center(campus);
      return {
        type: "Feature" as const,
        geometry: campusCenter.geometry,
        properties: {
          identifier: campus.properties?.identifier || "",
          name: `Campus ${campus.properties?.name || ""}`,
          categories: ["campus-name"],
        },
      };
    });
  }, []);

  // Obtener nombre del campus para el tag
  const [campusDisplayName, setCampusDisplayName] = React.useState<string | null>(null);

  useEffect(() => {
    const campusParam = params.get("campus");
    const campus = campusParam || localStorage.getItem("defaultCampus");

    if (campus) {
      let fullName: string | undefined;

      if (campus.length === 2) {
        fullName = siglas.get(campus);
      } else {
        const sigla = siglas.get(campus);
        fullName = sigla ? siglas.get(sigla) : undefined;
      }

      setCampusDisplayName(fullName || campus);
    } else {
      setCampusDisplayName(null);
    }
  }, [params]);

  useEffect(() => {
    const campusName = params.get("campus");
    if (campusName) {
      mapRef.current?.getMap()?.setMaxBounds(undefined);
      localStorage.setItem("defaultCampus", campusName);
      mapRef.current?.getMap()?.fitBounds(getCampusBoundsFromName(campusName), {
        duration: 0,
        zoom:
          campusName === "SJ" || campusName === "SanJoaquin"
            ? 15.5
            : campusName === "VR" || campusName === "Villarrica"
            ? 14
            : 17,
      });
      mapRef.current?.getMap().setMaxBounds(getMaxCampusBoundsFromName(localStorage.getItem("defaultCampus")));
    }
  }, [params]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver(() => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 175); // 200 para evitar resize excesivos, debido a la animación de la sidebar que dura 150ms
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Campus tag - solo visible en desktop */}
      {campusDisplayName ? (
        <div className="hidden lg:block absolute top-4 right-4 z-10 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary rounded-lg shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">Campus {campusDisplayName}</span>
          </div>
        </div>
      ) : null}

      <Map
        id="mainMap"
        mapStyle={mapConfig.mapStyle}
        initialViewState={createInitialViewState(params.get("campus"), paramPlace, paramLng, paramLat)}
        onLoad={(e) => handleMapLoad(e)}
        transformRequest={(url, type) => {
          if (type === "Tile" || type === "Glyphs") {
            if (process.env.NEXT_PUBLIC_IS_SELF_HOST === "TRUE") {
              return { url: window.location.origin + url };
            } else {
              console.log("OSUC SERVER MAP");
              return { url: `https://ubicate.osuc.dev${url}` };
            }
          }
          return { url };
        }}
        ref={mapRef}
      >
        <Source id="campusSmall" type="geojson" data={Campus as GeoJSON.FeatureCollection<GeoJSON.Geometry>}>
          <Layer {...mapConfig.campusBorderLayer} />
        </Source>
        <Source id="areas-uc" type="geojson" data={featuresToGeoJSON(polygons)}>
          <Layer {...mapConfig.sectionAreaLayer} />
          <Layer {...mapConfig.sectionStrokeLayer} />
        </Source>
        <Source id="custom-polygon-area" type="geojson" data={featuresToGeoJSON(polygon)}>
          <Layer {...mapConfig.customPolygonSectionAreaLayer} />
          <Layer {...mapConfig.customPolygonStrokeLayer} />
        </Source>
        <Source
          id="campus-names"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: campusNamePoints,
          }}
        >
          <Layer
            id="campus-names-layer"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-font": ["Roboto Slab SemiBold", "Arial Unicode MS Bold"],
              "text-size": 16,
              "text-anchor": "center",
              "text-allow-overlap": false,
              "text-ignore-placement": false,
              "text-optional": true,
            }}
            paint={{
              "text-color": "#000000",
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 2,
            }}
          />
        </Source>
        <Source id="places" type="geojson" data={featuresToGeoJSON([...pointsName, ...polygons])}>
          <Layer {...mapConfig.placesTextLayer} />
        </Source>
        <SilentErrorBoundary>
          <DebugMode />
        </SilentErrorBoundary>
        <SilentErrorBoundary>
          <UserLocation />
        </SilentErrorBoundary>
        <DirectionsComponent />
        {points.map((place) => {
          const primaryCategory = place.properties.categories[0] as CATEGORIES;
          return (
            <Marker
              key={place.properties.identifier}
              place={place as PointFeature}
              onClick={() => handlePlaceSelection(place, { openSidebar: true, flyMode: "ifOutside" })}
              icon={<MarkerIcon label={primaryCategory} />}
            />
          );
        })}
        {pins.map((pin) => {
          const primaryCategory = pin.properties.categories[0] as CATEGORIES;
          let config: HandlePlaceSelectionOptions;
          if (pins.length === 1) {
            config = { openSidebar: true, flyMode: "always" };
          } else {
            config = { openSidebar: false, flyMode: "never" };
          }
          return (
            <Marker
              key={pin.properties.identifier}
              place={pin as PointFeature}
              onClick={() => {
                handlePlaceSelection(pin, config);
              }}
              icon={<MarkerIcon label={primaryCategory} />}
              draggable
              onDragEnd={(e: MarkerDragEvent) => {
                handlePinDrag(e, pin.properties.identifier);
              }}
            />
          );
        })}
      </Map>
    </div>
  );
}
