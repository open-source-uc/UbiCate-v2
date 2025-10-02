import { use } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";

import * as Icon from "../../ui/icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  const { codes } = use(NotificationContext);
  const hasLocationError = codes.has("locationError");

  return (
    <button
      onClick={() => {
        onClick?.();
      }}
      className={`p-1 rounded-full ${
        !hasLocationError ? "bg-primary hover:bg-secondary" : "bg-muted"
      } group border-border border-1 text-foreground flex items-center justify-center w-12 h-12 pointer-events-auto cursor-pointer`}
      aria-label={hasLocationError ? "Ubicación no disponible" : "Centrar mapa en mi ubicación"}
      aria-disabled={hasLocationError}
      title={hasLocationError ? "Ubicación no disponible" : "Centrar mapa en mi ubicación"}
    >
      <Icon.GPS className="w-6 h-6 fill-background group-hover:fill-secondary-foreground" />
    </button>
  );
}
