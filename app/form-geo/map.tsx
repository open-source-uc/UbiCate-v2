import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { useRef, useState, useCallback, useEffect } from "react";

import { Map, Marker, NavigationControl, GeolocateControl, FullscreenControl } from "react-map-gl";
import type { MarkerDragEvent, MapLayerMouseEvent, MapRef } from "react-map-gl";

import { getParamCampusBounds } from "@/utils/getParamCampusBounds";

import { useThemeObserver } from "../../utils/themeObserver";

import ControlPanel from "./controlPanel";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapComponent(props: any) {
  const mapRef = useRef<MapRef>(null);
  const map = mapRef.current?.getMap();
  const [marker, setMarker] = useState({ ...props.markerPosition });
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && localStorage?.theme === "dark" ? "dark-v11" : "streets-v11",
  );

  const searchParams = useSearchParams();
  const campusMapBounds = getParamCampusBounds(searchParams.get("campus"));

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
