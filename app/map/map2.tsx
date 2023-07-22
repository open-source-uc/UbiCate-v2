"use client";

import Image from "next/image";

import { Map, Marker, Source } from "react-map-gl";

export default function MapComponent({ Places }: any) {
  const initialCoords = {
    latitude: -33.4983,
    longitude: -70.6109,
    zoom: 16,
  };

  return (
    <>
      <Map
        initialViewState={initialCoords}
        style={{ width: 1000, height: 800 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
      >
        <Source id="data" type="geojson" data={Places} />
        <Marker longitude={initialCoords.longitude} latitude={initialCoords.latitude} anchor="bottom">
          <Image src="/favicon.ico" alt="hey" width={50} height={50} />
        </Marker>
      </Map>

      {/* {geoData ? <p>Latitude: {locationCoords.latitude}</p> : <p>Latitude: </p>}
      {geoData ? <p>Longitude: {locationCoords.longitude}</p> : <p>Longitude: </p>} */}
    </>
  );
}
