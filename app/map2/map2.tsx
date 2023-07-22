"use client";
import { useRef, useState, useMemo, useCallback } from "react";

import mapboxgl from "mapbox-gl";
import { Map, Source, Layer, Popup } from "react-map-gl";
import type { MapRef, GeoJSONSource } from "react-map-gl";

import { placesLayer, newClusterLayer } from "./layers";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Set your mapbox token here

export default function MapComponent(Places: any) {
  const mapRef = useRef<MapRef>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  const onHover = useCallback((event: any) => {
    const place = event.features && event.features[0];
    setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      place: place ? place.properties.name : null,
    });
  }, []);

  const selectedPlace = (hoverInfo && hoverInfo.place) || null;
  const filter = useMemo(() => ["in", "name", selectedPlace], [selectedPlace]);

  const onClick = (event: any) => {
    const feature = event.features[0];
    const clusterId = feature ? feature.properties.cluster_id : null;

    const mapboxSource = mapRef.current.getSource("places") as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
      if (err) {
        return;
      }

      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500,
      });
    });
  };

  return (
    <>
      <Map
        initialViewState={{
          longitude: -70.6109,
          latitude: -33.4983,
          zoom: 16,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[placesLayer.id, newClusterLayer.id]}
        onClick={onClick}
        onMouseMove={onHover}
        ref={mapRef}
        className="h-full w-full"
        minZoom={10}
      >
        {/* {pins} */}
        <Source id="places" type="geojson" data={Places.Places} cluster={true} clusterRadius={10}>
          {/* <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} /> */}
          <Layer {...placesLayer} />
          <Layer {...newClusterLayer} />
        </Source>
        {selectedPlace ? (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            className="place"
            offset={[0, -10]}
          >
            {selectedPlace}
          </Popup>
        ) : null}
      </Map>
    </>
  );
}
