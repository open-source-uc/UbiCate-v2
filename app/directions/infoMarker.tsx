import { Marker } from "react-map-gl";

import { LineFeature } from "@/utils/types";

import * as Icons from "../components/icons/icons";

interface RouteInfoMarkerProps {
  route: LineFeature;
  duration: number;
  distance: number;
}

export default function RouteInfoMarker({ route, duration, distance }: RouteInfoMarkerProps) {
  const midPoint = route.geometry.coordinates[Math.floor(route.geometry.coordinates.length / 2)];

  return (
    <Marker longitude={midPoint[0]} latitude={midPoint[1]} anchor="bottom" style={{ zIndex: 1 }}>
      <div className="relative w-18 p-1 bg-black text-white shadow-md rounded-md text-xs font-medium flex flex-col items-center gap-1">
        <p className="flex items-center gap-1">
          <span className="flex justify-center items-center w-3 h-3">
            <Icons.Walking className="w-2.5 h-2.5 text-white-ubi" />
          </span>
          <span className="font-bold">{duration} min</span>
        </p>
        <p className="font-bold text-center">{distance} m</p>
      </div>
    </Marker>
  );
}
