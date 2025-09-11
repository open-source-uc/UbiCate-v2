import { use } from "react";

import * as Icons from "@/app/components/ui/icons/icons";
import { NotificationContext } from "@/app/context/notificationCtx";

interface DirectionSuccessNotificationProps {
  distance?: number;
  placeName?: string;
  children?: React.ReactNode;
}

export default function DirectionSuccessNotification({
  distance,
  placeName,
  children,
}: DirectionSuccessNotificationProps) {
  const { clearNotification, clearAllCodes } = use(NotificationContext);

  // Calculate walking time if distance is available
  const walkingTimeMinutes = distance ? Math.ceil(distance / 83.33) : null;

  return (
    <div className="w-full pointer-events-auto bg-feedback-success px-4 py-3 rounded-lg shadow-lg space-y-4 text-white">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icons.Directions className="w-7 h-7" />
          <h1 className="font-bold">En Ruta a {placeName}</h1>
        </div>
        <button
          className="bg-interactive-accent text-interactive-accent-foreground flex items-center rounded-full hover:bg-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2 ml-auto"
          aria-label="Cerrar menú"
          onClick={() => {
            clearNotification();
            clearAllCodes();
          }}
        >
          <Icons.Close />
        </button>
      </div>

      <div className="flex-grow">
        {distance && placeName ? (
          <div className="space-y-1 flex">
            <p className="font-light">
              Estás a <span className="font-bold">{walkingTimeMinutes} minutos</span> de esta ubicación
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
