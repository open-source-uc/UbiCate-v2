import { use } from "react";

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
  const { position } = useUbication();
  const { setDirectionData } = useDirections();
  const { setSelectedPlace } = useSidebar();
  const { setNotification } = use(NotificationContext);
  const status = useDirectionStatus(position, place);

  const handleDirections = async () => {
    if (status.ok === false) {
      setNotification(<DirectionErrorNotification>{status.error}</DirectionErrorNotification>);
      return;
    }
    if (!status.origin || !status.destination) return;

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
    }
  };

  return (
    <button
      onClick={handleDirections}
      onKeyDown={(e) => e.key === "Enter" && handleDirections()}
      aria-label="Cómo llegar a esta ubicación"
      role="button"
      tabIndex={0}
      className={`p-1 w-full cursor-pointer ${
        !navigator.geolocation ? "bg-muted/50" : "bg-primary hover:bg-muted"
      } text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
    >
      <div className="flex justify-center items-center w-full h-10">
        <Icons.Directions />
      </div>
      <p className="text-xs font-medium">Cómo llegar</p>
    </button>
  );
}
