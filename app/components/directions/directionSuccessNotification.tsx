import { use } from "react";

import * as Icons from "@/app/components/icons/icons";
import { NotificationContext } from "@/app/context/notificationCtx";

export default function DirectionSuccessNotification({ children }: { children: React.ReactNode }) {
  const { clearNotification, clearAllCodes } = use(NotificationContext);
  return (
    <div className="w-full justify-start pointer-events-auto bg-[var(--color-success)] text-foreground font-medium px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
      <Icons.Directions className="w-8 h-8" />
      <div className="flex-grow">{children}</div>
      <button
        className="text-foreground bg-accent flex items-center rounded-full hover:text-accent hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Cerrar menú"
        onClick={() => {
          clearNotification();
          clearAllCodes();
        }}
      >
        <Icons.Close />
      </button>
    </div>
  );
}
