import { use, useState, useEffect, useRef, useCallback } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";
import { useDirectionStatus } from "@/app/hooks/useDirectionStatus";
import { useUbication } from "@/app/hooks/useUbication";
import { Feature } from "@/utils/types";

import { useDirections } from "../../context/directionsCtx";
import { useSidebar } from "../../context/sidebarCtx";
import * as Icons from "../icons/icons";

import DirectionErrorNotification from "./directionErrorNotification";
import DirectionSuccessNotification from "./directionSuccessNotification";
import { fetchDirection } from "./fetchDirection";

interface RouteButtonProps {
  place: Feature | null;
}

const getOptimalDirection = async (origin: [number, number], destination: [number, number]) => {
  const results = await Promise.all([
    fetchDirection(origin, destination, 0),
    fetchDirection(origin, destination, -0.2),
  ]);

  const [defaultDirection, biasedDirection] = results;

  if (biasedDirection.duration && defaultDirection.duration && biasedDirection.duration < defaultDirection.duration) {
    return biasedDirection;
  }

  return defaultDirection;
};

export default function RouteButton({ place }: RouteButtonProps) {
  const { position, setTracking } = useUbication(false); // Inicia desactivado
  const { setDirectionData } = useDirections();
  const { setSelectedPlace } = useSidebar();
  const { setNotification } = use(NotificationContext);
  const status = useDirectionStatus(position, place);

  const [isWaitingForLocation, setIsWaitingForLocation] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const pendingRouteRef = useRef(false);

  // Efecto para calcular ruta automáticamente cuando se obtiene la ubicación
  useEffect(() => {
    if (position && pendingRouteRef.current) {
      pendingRouteRef.current = false;
      setIsWaitingForLocation(false);
      calculateRoute();
    }
  }, [position]);

  const calculateRoute = useCallback(async () => {
    if (!position || !place) return;

    // Usar el status que ya se calculó en el nivel superior
    if (status.ok === false) {
      setNotification(<DirectionErrorNotification>{status.error}</DirectionErrorNotification>);
      setIsCalculatingRoute(false);
      return;
    }

    if (!status.origin || !status.destination) {
      setNotification(<DirectionErrorNotification>No se pudo determinar la ruta</DirectionErrorNotification>);
      setIsCalculatingRoute(false);
      return;
    }

    setIsCalculatingRoute(true);

    try {
      const { direction, duration, distance } = await getOptimalDirection(status.origin, status.destination);

      if (!direction || !duration || !distance) {
        setNotification(<DirectionErrorNotification>No se logró obtener la ruta</DirectionErrorNotification>);
        return;
      }

      setDirectionData(direction, "xd", distance);
      setNotification(<DirectionSuccessNotification distance={distance} placeName={place?.properties.name} />);
      setSelectedPlace(null);
    } catch (error) {
      setNotification(<DirectionErrorNotification>No se logró obtener la ruta</DirectionErrorNotification>);
      console.error("Error fetching directions:", error);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [position, place, status, setDirectionData, setNotification, setSelectedPlace]);

  const handleDirections = async () => {
    // Si está esperando ubicación, cancelar
    if (isWaitingForLocation) {
      setTracking(false);
      setIsWaitingForLocation(false);
      pendingRouteRef.current = false;
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
      pendingRouteRef.current = true;

      // Timeout de seguridad
      setTimeout(() => {
        if (pendingRouteRef.current && !position) {
          setNotification(
            <DirectionErrorNotification>
              No podemos obtener tu ubicación. Verifica que los permisos de ubicación estén habilitados.
            </DirectionErrorNotification>,
          );
          setIsWaitingForLocation(false);
          pendingRouteRef.current = false;
          setTracking(false);
        }
      }, 10000); // 10 segundos timeout

      return;
    }

    // Si ya hay ubicación, calcular ruta inmediatamente
    await calculateRoute();
  };

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
