import { useEffect, useState } from "react";

import { Marker, useMap } from "react-map-gl";

import { LineFeature } from "@/utils/types";

import * as Icons from "../components/icons/icons";

interface StartMarkerProps {
  route: LineFeature;
}

export default function StartMarker({ route }: StartMarkerProps) {
  const { mainMap } = useMap();
  const [routeRotation, setRouteRotation] = useState(0);

  const startPoint = route.geometry.coordinates[0];
  const secondPoint = route.geometry.coordinates[1];

  const calculateRouteAngle = (start: number[], end: number[], bearing: number) => {
    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];
    let angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI - 90 - bearing;
    return (angle + 720) % 360;
  };

  useEffect(() => {
    if (!mainMap) return;

    const updateRotation = () => {
      const bearing = mainMap.getBearing() || 0;
      const newRotation = calculateRouteAngle(startPoint, secondPoint, bearing);
      setRouteRotation(newRotation);
    };

    mainMap.on("move", updateRotation);
    updateRotation();

    return () => {
      mainMap.off("move", updateRotation);
    };
  }, [mainMap, startPoint, secondPoint]);

  return (
    <>
      <Marker longitude={startPoint[0]} latitude={startPoint[1]} anchor="center">
        <div
          style={{
            transform: `rotate(${routeRotation}deg)`,
            transformOrigin: "center",
          }}
          className="flex items-center justify-center rounded-full bg-white shadow-md w-6 h-6 p-1 ring-brown-dark ring-1 text-amber-400"
        >
          <Icons.Start />
        </div>
      </Marker>
    </>
  );
}
