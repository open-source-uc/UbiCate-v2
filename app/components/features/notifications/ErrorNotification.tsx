import { use } from "react";

import { CloseButton } from "@/app/components/ui";
import * as Icons from "@/app/components/ui/icons/icons";
import { NotificationContext } from "@/app/context/notificationCtx";

export default function DirectionErrorNotification({ children }: { children: React.ReactNode }) {
  const { clearNotification, clearAllCodes } = use(NotificationContext);
  return (
    <div className="w-full pointer-events-auto bg-background text-destructive border border-destructive px-4 py-3 rounded-lg shadow-lg space-y-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icons.Error className="w-7 h-7" />
          <h1 className="font-bold">Ups! Algo salió mal</h1>
        </div>
        <CloseButton
          variant="destructive"
          className="ml-auto"
          onClick={() => {
            clearNotification();
            clearAllCodes();
          }}
        />
      </div>
      <div className="flex-grow overflow-y-auto max-h-52 break-words hyphens-auto">{children}</div>
    </div>
  );
}
