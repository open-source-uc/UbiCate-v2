import { use, useCallback, useMemo, useState, useEffect, useRef } from "react";

import { Marker, useMap } from "react-map-gl/maplibre";

import { NotificationContext } from "@/app/context/notificationCtx";
import { useUbication } from "@/app/context/ubicationCtx";
import { getCampusNameFromPoint, getMaxCampusBoundsFromName } from "@/utils/getCampusBounds";

import DangerButton from "../danger/dangerButton";
import * as Icons from "../icons/icons";

import DirectionErrorNotification from "./directionErrorNotification";
import LocationButton from "./locationButton";

export default function UserLocation() {
  const { mainMap } = useMap();
  const { setNotification, addCode, removeCode } = use(NotificationContext);
  const { position, alpha, setTracking } = useUbication();
  const [bearing, setBearing] = useState(0);
  const [isWaitingForLocation, setIsWaitingForLocation] = useState(false);
  const pendingTeleportRef = useRef(false);

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

  // Efecto para hacer teleport automático cuando se obtiene la ubicación
  useEffect(() => {
    if (position && pendingTeleportRef.current) {
      pendingTeleportRef.current = false;
      setIsWaitingForLocation(false);

      const campus = getCampusNameFromPoint(position.geometry.coordinates[0], position.geometry.coordinates[1]);

      if (!campus) {
        setNotification(<DirectionErrorNotification>No estás en un campus UC.</DirectionErrorNotification>);
        addCode("locationError");
        setTracking(false); // Desactivar tracking si no está en campus
        return;
      }

      removeCode("locationError");

      mainMap?.getMap().setMaxBounds(undefined);
      mainMap?.getMap().flyTo({
        center: position.geometry.coordinates as [number, number],
        zoom: 17,
        duration: 400,
      });

      setTimeout(() => {
        mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromName(campus));
      }, 600);
    }
  }, [position, mainMap, setNotification, addCode, removeCode, setTracking]);

  const handleLocationButtonClick = useCallback(() => {
    if (isWaitingForLocation) {
      // Si ya está esperando ubicación, cancelar
      setTracking(false);
      setIsWaitingForLocation(false);
      pendingTeleportRef.current = false;
      removeCode("locationError");
      return;
    }

    if (!position) {
      // Primera vez o no hay ubicación: activar tracking y esperar
      setTracking(true);
      setIsWaitingForLocation(true);
      pendingTeleportRef.current = true;

      // Timeout de seguridad por si no se obtiene ubicación
      setTimeout(() => {
        if (pendingTeleportRef.current && !position) {
          setNotification(
            <DirectionErrorNotification>
              No podemos obtener tu ubicación. Verifica que los permisos de ubicación estén habilitados.
            </DirectionErrorNotification>,
          );
          addCode("locationError");
          setIsWaitingForLocation(false);
          pendingTeleportRef.current = false;
          setTracking(false);
        }
      }, 10000); // 10 segundos timeout

      return;
    }

    // Si ya hay posición, hacer teleport inmediatamente
    const campus = getCampusNameFromPoint(position.geometry.coordinates[0], position.geometry.coordinates[1]);

    if (!campus) {
      setNotification(<DirectionErrorNotification>No estás en un campus UC.</DirectionErrorNotification>);
      addCode("locationError");
      return;
    }

    removeCode("locationError");

    mainMap?.getMap().setMaxBounds(undefined);
    mainMap?.getMap().flyTo({
      center: position.geometry.coordinates as [number, number],
      zoom: 17,
      duration: 400,
    });

    setTimeout(() => {
      mainMap?.getMap().setMaxBounds(getMaxCampusBoundsFromName(campus));
    }, 600);
  }, [mainMap, position, setNotification, addCode, removeCode, setTracking, isWaitingForLocation]);
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
      <div className="fixed z-40 bottom-17 desktop:bottom-9 right-0 p-2 desktop:p-1 flex flex-col gap-2">
        <DangerButton onClick={() => setTracking(false)} />
        <LocationButton onClick={handleLocationButtonClick} />
      </div>
    </>
  );
}
