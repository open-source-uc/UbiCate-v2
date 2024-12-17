import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { useRef, useState, useCallback, useEffect } from "react";

import { Map, Marker, NavigationControl, GeolocateControl, FullscreenControl, Layer, Source } from "react-map-gl";
import type { MarkerDragEvent, MapLayerMouseEvent, MapRef } from "react-map-gl";

import { campusBorderLayer, darkCampusBorderLayer } from "@/app/map/layers";
import { getCampusBoundsFromPoint, getParamCampusBounds } from "@/utils/getCampusBounds";

import Campus from "../../data/campuses.json";
import { useThemeObserver } from "../../utils/themeObserver";

import ControlPanel from "./controlPanel";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapProps {
  markerPosition: {
    longitude: number;
    latitude: number;
  };
  onMarkerMove: (event: MapLayerMouseEvent | MarkerDragEvent) => void;
}

export default function MapComponent(props: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const map = mapRef.current?.getMap();
  const [marker, setMarker] = useState({ ...props.markerPosition });
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && localStorage?.theme === "dark" ? "dark-v11" : "streets-v12",
  );
  const searchParams = useSearchParams();
  console.log({ l: props.markerPosition.longitude, l2: props.markerPosition.latitude });
  const campusMapBounds =
    getCampusBoundsFromPoint(props.markerPosition.longitude, props.markerPosition.latitude) ??
    getParamCampusBounds(searchParams.get("campus"));

  useThemeObserver(setTheme, map);

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
          ref={mapRef}
          onClick={onClickMap}
        >
          <GeolocateControl position="top-left" showAccuracyCircle={false} showUserHeading={true} />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          <Source id="campusSmall" type="geojson" data={Campus}>
            {theme && theme === "dark-v11" ? <Layer {...darkCampusBorderLayer} /> : <Layer {...campusBorderLayer} />}
          </Source>
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
        </Map>
        <ControlPanel />
      </div>
    </>
  );
}
