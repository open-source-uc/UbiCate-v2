"use client";
import { MapProvider } from "react-map-gl";

import { Feature } from "@/utils/types";

import MapComponent from "./map";

interface MapPageProps {
  paramPlace?: Feature | null;
  paramLat?: number | null;
  paramLng?: number | null;
}

export default function MapPage({ paramPlace, paramLat, paramLng }: MapPageProps) {
  return (
    <MapProvider>
      <MapComponent paramPlace={paramPlace} paramLat={paramLat} paramLng={paramLng} />
    </MapProvider>
  );
}
