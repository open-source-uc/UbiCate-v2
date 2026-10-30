"use client";

import { useState, useEffect, useRef, use } from "react";

import { useDirections } from "@/app/context/directionsCtx";
import { NotificationContext } from "@/app/context/notificationCtx";
import { useDirectionStatus } from "@/app/hooks/useDirectionStatus";
import { useOptimalDirection } from "@/app/hooks/useOptimalDirection";
import { useUbication } from "@/app/hooks/useUbication";
import { Feature } from "@/lib/types";

import { Button } from "../../ui/button";
import * as Icons from "../../ui/icons/icons";
import DirectionSuccessNotification from "../notifications/directionSuccessNotification";
import DirectionErrorNotification from "../notifications/ErrorNotification";

interface RouteButtonProps {
  place: Feature | null;
}

export default function RouteButton({ place }: RouteButtonProps) {
  const { position, setTracking } = useUbication();
  const { setDirectionRoutes } = useDirections();
  const { setNotification } = use(NotificationContext);

  const status = useDirectionStatus(position, place);

  const [shouldCalculateRoute, setShouldCalculateRoute] = useState(false);
  const [isWaitingForLocation, setIsWaitingForLocation] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: directionRoutes,
    error: directionError,
    isLoading: isCalculatingRoute,
  } = useOptimalDirection(status.origin!, status.destination!, shouldCalculateRoute && status.ok);

  // Iniciar el cálculo cuando se obtiene la ubicación.
  useEffect(() => {
    if (!position || !isWaitingForLocation) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Reacción de una sola vez a que por fin llegó la posición del GPS.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsWaitingForLocation(false);
    setShouldCalculateRoute(true);
  }, [position, isWaitingForLocation]);

  // Procesar el resultado de Valhalla.
  useEffect(() => {
    if (!shouldCalculateRoute || isCalculatingRoute) return;

    if (!status.ok) {
      if (status.error) {
        setNotification(<DirectionErrorNotification>{status.error}</DirectionErrorNotification>);
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldCalculateRoute(false);
      return;
    }

    if (directionError) {
      console.error("Error fetching directions:", directionError);

      setNotification(
        <DirectionErrorNotification>
          {directionError.message || "No se logró obtener la ruta"}
        </DirectionErrorNotification>,
      );

      setShouldCalculateRoute(false);
      return;
    }

    if (!directionRoutes?.length) {
      setNotification(<DirectionErrorNotification>No se encontraron rutas peatonales.</DirectionErrorNotification>);

      setShouldCalculateRoute(false);
      return;
    }

    setDirectionRoutes(directionRoutes);

    const firstRoute = directionRoutes[0];

    setNotification(<DirectionSuccessNotification distance={firstRoute.distance} placeName={place?.properties.name} />);

    setShouldCalculateRoute(false);
  }, [
    shouldCalculateRoute,
    isCalculatingRoute,
    status,
    directionRoutes,
    directionError,
    setDirectionRoutes,
    setNotification,
    place,
  ]);

  const handleDirections = () => {
    if (isWaitingForLocation) {
      setTracking(false);
      setIsWaitingForLocation(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      return;
    }

    if (isCalculatingRoute) return;

    if (!position) {
      setTracking(true);
      setIsWaitingForLocation(true);

      timeoutRef.current = setTimeout(() => {
        setNotification(
          <DirectionErrorNotification>
            No podemos obtener tu ubicación. Verifica que los permisos de ubicación estén habilitados.
          </DirectionErrorNotification>,
        );

        setIsWaitingForLocation(false);
        setTracking(false);
        timeoutRef.current = null;
      }, 10000);

      return;
    }

    setShouldCalculateRoute(true);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getButtonContent = () => {
    if (isWaitingForLocation) {
      return {
        icon: <Icons.Loading className="animate-spin" />,
        text: "Obteniendo ubicación...",
      };
    }

    if (isCalculatingRoute) {
      return {
        icon: <Icons.Loading className="animate-spin" />,
        text: "Calculando rutas...",
      };
    }

    return {
      icon: <Icons.Directions />,
      text: "Cómo llegar",
    };
  };

  const { icon, text } = getButtonContent();

  const hasGeolocation = typeof navigator !== "undefined" && !!navigator.geolocation;

  const isLoading = isWaitingForLocation || isCalculatingRoute;

  return (
    <Button
      onClick={handleDirections}
      aria-label={isLoading ? "Procesando solicitud..." : "Cómo llegar a esta ubicación"}
      disabled={!hasGeolocation || isCalculatingRoute}
      variant={isLoading ? "mapAccent" : "mapPrimary"}
      className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl px-2 py-4 text-primary-foreground transition-colors disabled:bg-muted/50 disabled:text-muted-foreground"
    >
      {icon}
      <span className="text-xs font-semibold tracking-wide">{text}</span>
    </Button>
  );
}
