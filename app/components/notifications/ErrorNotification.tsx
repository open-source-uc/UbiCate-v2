import { use } from "react";

import * as Icons from "@/app/components/icons/icons";
import { NotificationContext } from "@/app/context/notificationCtx";

export default function DirectionErrorNotification({ children }: { children: React.ReactNode }) {
  const { clearNotification, clearAllCodes } = use(NotificationContext);
  return (
    <div className="w-full pointer-events-auto bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg space-y-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icons.Error className="w-7 h-7" />
          <h1 className="font-bold">Ups! Algo salió mal</h1>
        </div>
        <button
          className="text-foreground bg-accent flex items-center rounded-full hover:text-accent hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ml-auto"
          aria-label="Cerrar menú"
          onClick={() => {
            clearNotification();
            clearAllCodes();
          }}
        >
          <Icons.Close />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto max-h-52 break-words hyphens-auto">{children}</div>
    </div>
  );
}
