import { Marker } from "react-map-gl";

import { LineFeature } from "@/utils/types";

interface RouteInfoMarkerProps {
  route: LineFeature;
  duration: number;
  distance: number;
}

export default function RouteInfoMarker({ route, duration, distance }: RouteInfoMarkerProps) {
  const midPoint = route.geometry.coordinates[Math.floor(route.geometry.coordinates.length / 2)];

  return (
    <Marker longitude={midPoint[0]} latitude={midPoint[1]} anchor="bottom" style={{ zIndex: 1 }}>
      <div className="relative w-20 p-2 bg-black text-white shadow-md rounded-md text-xs font-medium flex flex-col items-center">
        <p className="flex items-center gap-1">
          <span role="img" aria-label="walking">
            🚶
          </span>
          <span className="font-bold">{duration} min</span>
        </p>
        <p className="font-bold">{distance} m</p>
      </div>
    </Marker>
  );
}
