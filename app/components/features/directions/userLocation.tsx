import { use, useCallback, useMemo, useState, useEffect } from "react";

import { Marker, useMap } from "react-map-gl/maplibre";

import { useMapPicking } from "@/app/context/mapPickingCtx";
import { NotificationContext } from "@/app/context/notificationCtx";
import { useUbication } from "@/app/hooks/useUbication";
import { getCampusNameFromPoint, getMaxCampusBoundsFromName } from "@/lib/campus/getCampusBounds";

import DangerButton from "../../ui/danger/dangerButton";
import * as Icons from "../../ui/icons/icons";
import DirectionErrorNotification from "../notifications/ErrorNotification";

import LocationButton from "./locationButton";

export default function UserLocation() {
  const { mainMap } = useMap();
  const { isPicking } = useMapPicking();
  const { setNotification, addCode, removeCode } = use(NotificationContext);
  const { position, heading, setTracking, isTracking, requestLocation, requestOrientation, hasLocation, error } =
    useUbication();

  const [bearing, setBearing] = useState(0);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const updateBearing = useCallback(() => {
    setBearing(mainMap?.getBearing?.() || 0);
  }, [mainMap]);

  useEffect(() => {
    if (mainMap) {
      mainMap.on("move", updateBearing);
      // updateBearing lee el bearing del mapa (sistema externo) para inicializarlo al montar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      updateBearing(); // Inicializar bearing
    }

    return () => {
      if (mainMap) {
        mainMap.off("move", updateBearing);
      }
    };
  }, [mainMap, updateBearing]);

  // El marcador vive en la pantalla, no en el mundo: hay que descontarle la rotación del mapa.
  const rotation = useMemo(() => {
    if (heading === null) return 0;
    return (heading - bearing + 360) % 360;
  }, [heading, bearing]);

  // Manejar errores de ubicación
  useEffect(() => {
    if (error) {
      console.error("Ubication error:", error);
      setNotification(<DirectionErrorNotification>{error}</DirectionErrorNotification>);
      addCode("locationError");
      // Un error de ubicación cancela la solicitud en curso.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRequestingLocation(false);
    } else {
      removeCode("locationError");
    }
  }, [error, setNotification, addCode, removeCode]);

  // Declarada antes del efecto que la usa: al revés, el efecto la capturaba en su zona muerta temporal.
  const teleportToUserLocation = useCallback(() => {
    if (!position || !mainMap) return;

    const [longitude, latitude] = position.geometry.coordinates;
    const campus = getCampusNameFromPoint(longitude, latitude);

    if (!campus && isRequestingLocation) {
      setNotification(<DirectionErrorNotification>No estás en un campus UC.</DirectionErrorNotification>);
      addCode("locationError");
      return;
    }

    removeCode("locationError");

    // Remover límites temporalmente
    mainMap.getMap().setMaxBounds(undefined);

    // Volar a la ubicación del usuario
    mainMap.getMap().flyTo({
      center: [longitude, latitude],
      zoom: 17,
      duration: 400,
    });

    // Restablecer límites del campus después del vuelo
    setTimeout(() => {
      mainMap.getMap().setMaxBounds(getMaxCampusBoundsFromName(campus));
    }, 600);
  }, [position, mainMap, isRequestingLocation, setNotification, addCode, removeCode]);

  // Auto teleport cuando se obtiene posición por primera vez
  useEffect(() => {
    if (position && hasLocation && isRequestingLocation) {
      // Llegó la posición: se cierra la solicitud en curso antes de volar hacia ella.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRequestingLocation(false);
      teleportToUserLocation();
    }
  }, [position, hasLocation, isRequestingLocation, teleportToUserLocation]);

  const handleLocationButtonClick = useCallback(async () => {
    // Si ya está solicitando ubicación, cancelar
    if (isRequestingLocation) {
      setIsRequestingLocation(false);
      setTracking(false);
      removeCode("locationError");
      return;
    }

    // Si ya hay ubicación, teleportear inmediatamente
    if (position && hasLocation) {
      teleportToUserLocation();
      return;
    }

    // Si no hay ubicación, solicitarla
    setIsRequestingLocation(true);
    removeCode("locationError");

    try {
      // En iOS los dos diálogos de permiso no pueden convivir: primero la brújula (que además exige
      // invocarse dentro del gesto, sin await previo) y recién después la ubicación.
      await requestOrientation();
      await requestLocation();

      setTracking(true);
    } catch (error) {
      console.error("Error requesting location:", error);
      setIsRequestingLocation(false);
    }
  }, [
    position,
    hasLocation,
    isRequestingLocation,
    requestLocation,
    requestOrientation,
    setTracking,
    teleportToUserLocation,
    removeCode,
  ]);

  return (
    <>
      {/* Mostrar marker si hay posición */}
      {position ? (
        <Marker
          key="user-location"
          longitude={position.geometry.coordinates[0]}
          latitude={position.geometry.coordinates[1]}
          onClick={() => null}
          offset={[0, 0]}
        >
          <Icons.UserLocation rotation={rotation} />
        </Marker>
      ) : null}

      {!isPicking ? (
        <div className="fixed z-40 bottom-20 desktop:bottom-4 right-2 p-2 desktop:p-1 flex flex-col gap-2">
          <DangerButton />
          <LocationButton
            onClick={handleLocationButtonClick}
            // loading={isRequestingLocation}
            // active={hasLocation && !!position}
          />
        </div>
      ) : null}
    </>
  );
}
