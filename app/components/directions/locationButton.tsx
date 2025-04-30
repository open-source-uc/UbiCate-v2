import { use } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";
import { useUbication } from "@/app/hooks/useUbication";

import * as Icon from "../icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  const { code, setNotification } = use(NotificationContext);
  const { position } = useUbication();

  return (
    <button
      onClick={() => {
        if (position === null) {
          setNotification("No podemos obtener tu ubicación", "error", "locationError");
        }
        onClick?.();
      }}
      className={`p-1 rounded-full ${
        code !== "locationError" ? "bg-brown-medium hover:bg-brown-light" : "bg-error hover:bg-deep-red-option"
      } border-brown-dark  border-1  text-white flex items-center justify-center w-12 h-12 pointer-events-auto cursor-pointer`}
    >
      <Icon.GPS className="w-6 h-6" />
    </button>
  );
}
