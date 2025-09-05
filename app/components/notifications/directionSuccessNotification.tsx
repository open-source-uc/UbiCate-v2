import { use } from "react";

import * as Icons from "@/app/components/icons/icons";
import ProposeRouteButton from "@/app/components/routes/ProposeRouteButton";
import RoutingSourceIndicator from "@/app/components/routes/RoutingSourceIndicator";
import { NotificationContext } from "@/app/context/notificationCtx";

interface DirectionSuccessNotificationProps {
  distance?: number;
  placeName?: string;
  children?: React.ReactNode;
  routingSource?: "internal_graph" | "mapbox_api";
  startCoordinates?: [number, number];
  endCoordinates?: [number, number];
  campus?: string;
}

export default function DirectionSuccessNotification({
  distance,
  placeName,
  children,
  routingSource,
  startCoordinates,
  endCoordinates,
  campus,
}: DirectionSuccessNotificationProps) {
  const { clearNotification, clearAllCodes } = use(NotificationContext);

  // Calculate walking time if distance is available
  const walkingTimeMinutes = distance ? Math.ceil(distance / 83.33) : null;

  return (
    <div className="w-full pointer-events-auto bg-primary px-4 py-3 rounded-lg shadow-lg space-y-4 text-white">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icons.Directions className="w-7 h-7" />
          <h1 className="font-bold">En Ruta a {placeName}</h1>
        </div>
        <button
          className="bg-accent flex items-center rounded-full hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ml-auto"
          aria-label="Cerrar menú"
          onClick={() => {
            clearNotification();
            clearAllCodes();
          }}
        >
          <Icons.Close />
        </button>
      </div>

      <div className="flex-grow space-y-3">
        {distance && placeName ? (
          <div className="space-y-2">
            <p className="font-light">
              Estás a <span className="font-bold">{walkingTimeMinutes} minutos</span> de esta ubicación
            </p>
            <div className="flex items-center justify-between">
              <RoutingSourceIndicator source={routingSource} />
              {routingSource === "mapbox_api" && startCoordinates && endCoordinates ? (
                <ProposeRouteButton
                  startCoordinates={startCoordinates}
                  endCoordinates={endCoordinates}
                  campus={campus}
                  className="text-white bg-blue-600 border-blue-500 hover:bg-blue-700 hover:border-blue-600"
                />
              ) : null}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
