import React, { useCallback, useMemo } from "react";

import { useMap } from "react-map-gl";

import * as Icons from "../components/icons/icons";
import LocationButton from "../components/locationButton";
import { useDirections } from "../context/directionsCtx";
import { useUbication } from "../hooks/useUbication";

import Marker from "./marker";

export default function UserLocation() {
  const { mainMap } = useMap();

  const { position, alpha } = useUbication({ cardinalPoints: 8, updateInterval: 1_500 });

  const rotation = useMemo(() => {
    return (alpha - (mainMap?.getBearing() || 0) + 360) % 360;
  }, [alpha, mainMap]);

  const handleLocationButtonClick = useCallback(() => {
    mainMap?.getMap().flyTo({
      center: position?.geometry.coordinates as [number, number],
      zoom: 17,
      duration: 400,
    });
  }, [mainMap, position]);

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
