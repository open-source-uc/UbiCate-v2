import React, { useCallback, useMemo } from "react";

import { Marker, useMap } from "react-map-gl";

import { getCampusNameFromPoint } from "@/utils/getCampusBounds";

import { useUbication } from "../../hooks/useUbication";
import * as Icons from "../icons/icons";

import LocationButton from "./locationButton";

export default function UserLocation() {
  const { mainMap } = useMap();

  const { position, alpha } = useUbication();

  const rotation = useMemo(() => {
    return (alpha - (mainMap?.getBearing() || 0) + 360) % 360;
  }, [alpha, mainMap]);

  const handleLocationButtonClick = useCallback(() => {
    if (!position) return;

    const campus = getCampusNameFromPoint(position.geometry.coordinates[0], position?.geometry.coordinates[1]);

    if (!campus) {
      alert("Estas afuera del campus o no se ha podido determinar el campus");
      return;
    }

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
          longitude={position.geometry.coordinates[0]}
          latitude={position.geometry.coordinates[1]}
          onClick={() => null}
          offset={[0, 0]}
        >
          <Icons.UserLocation rotation={rotation} />
        </Marker>
      ) : null}
      <div className="fixed z-40 bottom-17 desktop:bottom-0 right-0 p-2">
        <LocationButton onClick={handleLocationButtonClick} />
      </div>
    </>
  );
}
