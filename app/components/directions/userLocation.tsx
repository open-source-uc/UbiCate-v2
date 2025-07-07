import { use, useCallback, useMemo, useState, useEffect } from "react";

import { Marker, useMap } from "react-map-gl";

import { NotificationContext } from "@/app/context/notificationCtx";
import { useUbication } from "@/app/hooks/useUbication";
import { getCampusNameFromPoint, getMaxCampusBoundsFromName } from "@/utils/getCampusBounds";

import * as Icons from "../icons/icons";

import DirectionErrorNotification from "./directionErrorNotification";
import LocationButton from "./locationButton";

export default function UserLocation() {
  const { mainMap } = useMap();
  const { setNotification, addCode, removeCode } = use(NotificationContext);
  const { position, alpha } = useUbication();
  const [bearing, setBearing] = useState(0);

  const updateBearing = useCallback(() => {
    setBearing(mainMap?.getBearing?.() || 0);
  }, [mainMap]);

  useEffect(() => {
    mainMap?.on("move", updateBearing);

    return () => {
      mainMap?.off("move", updateBearing);
    };
  }, [mainMap, updateBearing]);

  const rotation = useMemo(() => {
    return -(alpha - (bearing || 0) + 360) % 360; // el menos es pues los angulos van en sentido anti-horario
  }, [alpha, bearing]);

  const handleLocationButtonClick = useCallback(() => {
    if (!position) {
      setNotification(<DirectionErrorNotification>No podemos obtener tu ubicación</DirectionErrorNotification>);
      addCode("locationError");
      return;
    }

    const campus = getCampusNameFromPoint(position.geometry.coordinates[0], position?.geometry.coordinates[1]);

    if (!campus) {
      setNotification(
        <DirectionErrorNotification>
          No hemos podido determinar el campus en el que te encuentras o no estás en un campus UC.
        </DirectionErrorNotification>,
      );
      addCode("locationError");
      return;
    }
    removeCode("locationError");

    mainMap?.getMap().setMaxBounds(undefined);
    mainMap?.getMap().flyTo({
      center: position?.geometry.coordinates as [number, number],
      zoom: 16,
      duration: 400,
    });

    setTimeout(() => {
      mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromName(campus));
    }, 600);
  }, [mainMap, position, setNotification, addCode, removeCode]);

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
