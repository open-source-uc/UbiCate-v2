import { use, useCallback, useMemo, useState, useEffect } from "react";

import { Marker, useMap } from "react-map-gl/maplibre";

import { NotificationContext } from "@/app/context/notificationCtx";
import { useUbication } from "@/app/hooks/useUbication";
import { getCampusNameFromPoint, getMaxCampusBoundsFromName } from "@/utils/getCampusBounds";

import DangerButton from "../danger/dangerButton";
import * as Icons from "../icons/icons";
import DirectionErrorNotification from "../notifications/ErrorNotification";

import LocationButton from "./locationButton";

export default function UserLocation() {
  const { mainMap } = useMap();
  const { setNotification, addCode, removeCode } = use(NotificationContext);
  const {
    position,
    alpha,
    setTracking,
    isTracking,
    requestLocation,
    calibrateCompass,
    isCalibrated,
    hasLocation,
    error,
  } = useUbication();

  const [bearing, setBearing] = useState(0);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const updateBearing = useCallback(() => {
    setBearing(mainMap?.getBearing?.() || 0);
  }, [mainMap]);

  useEffect(() => {
    if (mainMap) {
      mainMap.on("move", updateBearing);
      updateBearing(); // Inicializar bearing
    }

    return () => {
      if (mainMap) {
        mainMap.off("move", updateBearing);
      }
    };
  }, [mainMap, updateBearing]);

  const rotation = useMemo(() => {
    if (alpha === null) return 0; // Valor por defecto
    return -(alpha - bearing + 360) % 360;
  }, [alpha, bearing]);

  // Manejar errores de ubicación
  useEffect(() => {
    if (error) {
      console.error("Ubication error:", error);
      setNotification(<DirectionErrorNotification>{error}</DirectionErrorNotification>);
      addCode("locationError");
      setIsRequestingLocation(false);
    } else {
      removeCode("locationError");
    }
  }, [error, setNotification, addCode, removeCode]);

  // Auto teleport cuando se obtiene posición por primera vez
  useEffect(() => {
    if (position && hasLocation && isRequestingLocation) {
      setIsRequestingLocation(false);
      teleportToUserLocation();
    }
  }, [position, hasLocation, isRequestingLocation]);

  const teleportToUserLocation = useCallback(() => {
    if (!position || !mainMap) return;

    const [longitude, latitude] = position.geometry.coordinates;
    const campus = getCampusNameFromPoint(longitude, latitude);

    if (!campus) {
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
  }, [position, mainMap, setNotification, addCode, removeCode]);

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
      // Primero intentar obtener ubicación una vez
      await requestLocation();

      // Si no tenemos orientación calibrada, intentar calibrar
      if (!isCalibrated && typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
        await calibrateCompass();
      }

      // Iniciar tracking continuo
      setTracking(true);
    } catch (error) {
      console.error("Error requesting location:", error);
      setIsRequestingLocation(false);
    }
  }, [
    position,
    hasLocation,
    isTracking,
    isRequestingLocation,
    isCalibrated,
    requestLocation,
    calibrateCompass,
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

      <div className="fixed z-40 bottom-17 desktop:bottom-9 right-0 p-2 desktop:p-1 flex flex-col gap-2">
        <DangerButton />
        <LocationButton
          onClick={handleLocationButtonClick}
          // loading={isRequestingLocation}
          // active={hasLocation && !!position}
        />
      </div>
    </>
  );
}
