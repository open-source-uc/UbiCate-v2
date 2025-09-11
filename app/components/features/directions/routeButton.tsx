import { use, useState, useEffect, useRef } from "react";

import { useDirections } from "@/app/context/directionsCtx";
import { NotificationContext } from "@/app/context/notificationCtx";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useDirectionStatus } from "@/app/hooks/useDirectionStatus";
import { useOptimalDirection } from "@/app/hooks/useOptimalDirection";
import { useUbication } from "@/app/hooks/useUbication";
import { Feature } from "@/lib/types";

import * as Icons from "../../ui/icons/icons";
import DirectionSuccessNotification from "../notifications/directionSuccessNotification";
import DirectionErrorNotification from "../notifications/ErrorNotification";

interface RouteButtonProps {
  place: Feature | null;
}

export default function RouteButton({ place }: RouteButtonProps) {
  const { position, setTracking } = useUbication();

  const { setDirectionData } = useDirections();
  const { setSelectedPlace } = useSidebar();
  const { setNotification } = use(NotificationContext);
  const status = useDirectionStatus(position, place);
  const [shouldCalculateRoute, setShouldCalculateRoute] = useState(false);

  const [isWaitingForLocation, setIsWaitingForLocation] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: optimalDirection,
    error: directionError,
    isLoading: isCalculatingRoute,
  } = useOptimalDirection(status.origin!, status.destination!, shouldCalculateRoute && status.ok);

  // Efecto para calcular ruta automáticamente cuando se obtiene la ubicación
  useEffect(() => {
    if (position && isWaitingForLocation) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setIsWaitingForLocation(false);
      setShouldCalculateRoute(true);
    }
  }, [position, status, isWaitingForLocation]);

  useEffect(() => {
    if (isCalculatingRoute) return;

    if (!shouldCalculateRoute) return;

    if (!status.ok && status.error) {
      setNotification(<DirectionErrorNotification>{status.error}</DirectionErrorNotification>);
      return;
    }

    if (directionError) {
      setNotification(<DirectionErrorNotification>No se logró obtener la ruta</DirectionErrorNotification>);
      console.error("Error fetching directions:", directionError);
      return;
    }

    if (!optimalDirection) {
      setNotification(<DirectionErrorNotification>No se logró obtener la ruta</DirectionErrorNotification>);
      console.error("Optimal direction not defined:", optimalDirection);
      return;
    }

    const { direction, duration, distance } = optimalDirection;

    setDirectionData(direction, "xd", distance);
    setNotification(<DirectionSuccessNotification distance={distance} placeName={place?.properties.name} />);
    setSelectedPlace(null);
    setShouldCalculateRoute(false);
  }, [
    optimalDirection,
    isCalculatingRoute,
    shouldCalculateRoute,
    setDirectionData,
    setNotification,
    directionError,
    setSelectedPlace,
    place,
    status,
  ]);

  const handleDirections = async () => {
    // Si está esperando ubicación, cancelar
    if (isWaitingForLocation) {
      setTracking(false);
      setIsWaitingForLocation(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Si está calculando ruta, no hacer nada
    if (isCalculatingRoute) {
      return;
    }

    // Si no hay ubicación, activar tracking y esperar
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

    // Si ya tenemos la ubicación, calcular ruta
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
        icon: <Icons.Loading className="animate-spin" />, // Asume que tienes un ícono de loading
        text: "Obteniendo ubicación...",
      };
    }

    if (isCalculatingRoute) {
      return {
        icon: <Icons.Loading className="animate-spin" />,
        text: "Calculando ruta...",
      };
    }

    return {
      icon: <Icons.Directions />,
      text: "Cómo llegar",
    };
  };

  const { icon, text } = getButtonContent();
  const isDisabled = !navigator.geolocation || isCalculatingRoute;
  const isLoading = isWaitingForLocation || isCalculatingRoute;

  return (
    <button
      onClick={handleDirections}
      aria-label={isLoading ? "Procesando solicitud..." : "Cómo llegar a esta ubicación"}
      role="button"
      tabIndex={0}
      disabled={isDisabled}
      className={`p-1 w-full cursor-pointer ${
        isDisabled ? "bg-muted/50 cursor-not-allowed" : isLoading ? "bg-accent" : "bg-primary hover:bg-accent"
      } text-primary-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors`}
    >
      <div className="flex justify-center items-center w-full h-10">{icon}</div>
      <p className="text-xs font-medium">{text}</p>
    </button>
  );
}
