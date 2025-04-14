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
    const [lon1, lat1] = start.map((coord) => (coord * Math.PI) / 180);
    const [lon2, lat2] = end.map((coord) => (coord * Math.PI) / 180);

    const deltaLon = lon2 - lon1;
    const x = Math.sin(deltaLon) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    let angle = (Math.atan2(x, y) * 180) / Math.PI - bearing - 90;
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
