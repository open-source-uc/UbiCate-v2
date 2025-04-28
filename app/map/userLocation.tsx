import React, { useCallback } from "react";

import { useMap } from "react-map-gl";

import * as Icons from "../components/icons/icons";
import LocationButton from "../components/locationButton";
import { useDirections } from "../context/directionsCtx";
import { useUbication } from "../hooks/useUbication";

import Marker from "./marker";

export default function UserLocation() {
  const { mainMap } = useMap();
  const { setTrackingUserLocation, isTrackingUserLocation } = useDirections();

  const { position, alpha, cardinal } = useUbication({ cardinalPoints: 8, updateInterval: 1_500 });

  const rotation = isTrackingUserLocation ? (alpha - (mainMap?.getBearing() || 0) + 360) % 360 : 0;

  const handleLocationButtonClick = useCallback(() => {
    mainMap?.getMap().flyTo({
      center: position?.geometry.coordinates as [number, number],
      zoom: 17,
      duration: 400,
    });
  }, [mainMap, position, setTrackingUserLocation]);

  return (
    <>
      {position ? (
        <Marker
          key={position.properties.identifier}
          place={position}
          onClick={() => null}
          offset={[0, 0]}
          icon={<Icons.UserLocation rotation={rotation} className="h-4 w-4" />}
        />
      ) : null}
      <div className="fixed z-40 bottom-17 desktop:bottom-0 right-0 p-2">
        <LocationButton onClick={handleLocationButtonClick} />
      </div>
    </>
  );
}
