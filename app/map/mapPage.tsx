"use client";
import { MapProvider } from "react-map-gl/maplibre";

import { Feature } from "@/lib/types";

import MapComponent from "./map";

interface MapPageProps {
  paramPlace?: Feature | null;
  paramLat?: number | null;
  paramLng?: number | null;
}

export default function MapPage({ paramPlace, paramLat, paramLng }: MapPageProps) {
  return (
    <div className="absolute inset-0">
      <MapProvider>
        <MapComponent paramPlace={paramPlace} paramLat={paramLat} paramLng={paramLng} />
      </MapProvider>
    </div>
  );
}
