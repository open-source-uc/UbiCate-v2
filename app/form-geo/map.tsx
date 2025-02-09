"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { useRef, useState, useCallback, useEffect } from "react";

import { Map, Marker, NavigationControl, GeolocateControl, FullscreenControl, Layer, Source } from "react-map-gl";
import type { MarkerDragEvent, MapLayerMouseEvent, MapRef, LngLatBoundsLike } from "react-map-gl";

import { campusBorderLayer } from "@/app/map/layers";
import { getCampusBoundsFromPoint, getCampusBoundsFromName } from "@/utils/getCampusBounds";

import Campus from "../../data/campuses.json";
import DebugMode from "../components/debugMode";
import { useThemeObserver } from "../hooks/useThemeObserver";

import ControlPanel from "./controlPanel";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapProps {
  markerPosition: {
    longitude: number | null | undefined;
    latitude: number | null | undefined;
  };
  onMarkerMove: (event: MapLayerMouseEvent | MarkerDragEvent) => void;
}

export default function MapComponent(props: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const map = mapRef.current?.getMap();
  const [marker, setMarker] = useState({ ...props.markerPosition });

  const searchParams = useSearchParams();
  let campusMapBounds: [number, number, number, number] | null = null;
  if (props.markerPosition.longitude && props.markerPosition.latitude) {
    campusMapBounds = getCampusBoundsFromPoint(props.markerPosition.longitude, props.markerPosition.latitude);
  }
  if (!campusMapBounds) {
    campusMapBounds = getCampusBoundsFromName(searchParams.get("campus") ?? localStorage.getItem("defaultCampus"));
  }

  const [theme] = useThemeObserver(map);

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  }, []);

  const onMarkerDragEnd = useCallback(
    (event: MarkerDragEvent) => {
      props.onMarkerMove(event);
    },
    [props],
  );

  const onClickMap = useCallback(
    (event: MapLayerMouseEvent) => {
      props.onMarkerMove(event);
      setMarker({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      });
    },
    [props],
  );
  useEffect(() => {
    setMarker({ ...props.markerPosition });
  }, [props]);

  return (
    <>
      <div className="flex flex-col h-96 w-full justify-center place-content-center justify-items-center">
        <Map
          initialViewState={{
            bounds: campusMapBounds,
          }}
          mapStyle={`mapbox://styles/mapbox/${theme}`}
          mapboxAccessToken={MAPBOX_TOKEN}
          onLoad={() => {
            mapRef.current?.getMap().setMaxBounds(campusMapBounds as LngLatBoundsLike);
            if (props.markerPosition.longitude && props.markerPosition.latitude) {
              mapRef.current?.getMap().flyTo({
                center: [props.markerPosition.longitude, props.markerPosition.latitude],
              });
            }
          }}
          ref={mapRef}
          onClick={onClickMap}
        >
          {/*
          El CSS de mapbox fue ajustado para que los pills estén junto al Search Box. Cambiar la propiedad position puede generar problemas, por lo que se recomienda dedicar tiempo suficiente y tener conocimientos sólidos de CSS puro (vanilla CSS) si se desea modificar su posición.
          */}
          <GeolocateControl position="bottom-right" showAccuracyCircle={false} showUserHeading={true} />
          <FullscreenControl position="bottom-right" />
          <NavigationControl position="bottom-right" />
          <Source id="campusSmall" type="geojson" data={Campus as GeoJSON.FeatureCollection<GeoJSON.Geometry>}>
            <Layer {...campusBorderLayer} />
          </Source>
          <DebugMode />
          {marker.longitude && marker.latitude ? (
            <Marker
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor="bottom"
              draggable
              onDrag={onMarkerDrag}
              onDragEnd={onMarkerDragEnd}
              style={{ zIndex: 1 }}
            >
              <Image className="dark:invert" src="/logo.svg" alt="Logo" width={20} height={29} />
            </Marker>
          ) : null}
        </Map>
        <ControlPanel />
      </div>
    </>
  );
}
