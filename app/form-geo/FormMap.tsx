import { useState, useCallback, useEffect } from "react";

import { Map, Marker, NavigationControl, GeolocateControl } from "react-map-gl";
import type { LngLat, MarkerDragEvent } from "react-map-gl";

import ControlPanel from "./control-panel";
import Pin from "./pin";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function FormMap(props: any) {
  const [marker, setMarker] = useState({
    latitude: props.initialViewState.latitude,
    longitude: props.initialViewState.longitude,
  });

  const [events, setEvents] = useState<Record<string, LngLat>>({});

  const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    setEvents((_events) => ({ ..._events, onDragStart: event.lngLat }));
  }, []);

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    setEvents((_events) => ({ ..._events, onDrag: event.lngLat }));

    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  }, []);

  const onMarkerDragEnd = useCallback(
    (event: MarkerDragEvent) => {
      setEvents((_events) => ({ ..._events, onDragEnd: event.lngLat }));
      props.onDrag(event);
    },
    [props],
  );

  useEffect(() => {
    setMarker({
      longitude: props.initialViewState.longitude,
      latitude: props.initialViewState.latitude,
    });
  }, [props]);

  return (
    <>
      <div className="flex flex-col h-96 w-full justify-center place-content-center justify-items-center">
        <Map
          initialViewState={props.initialViewState}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            draggable
            onDragStart={onMarkerDragStart}
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragEnd}
          >
            <Pin size={20} />
          </Marker>

          <NavigationControl />
          <GeolocateControl showAccuracyCircle={false} />
        </Map>
        <ControlPanel events={events} />
      </div>
    </>
  );
}
