import { use } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";

import * as Icon from "../../ui/icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  const { codes } = use(NotificationContext);

  return (
    <button
      onClick={() => {
        onClick?.();
      }}
      className={`p-1 rounded-full ${
        !codes.has("locationError")
          ? "bg-surface hover:bg-interactive-accent"
          : "bg-feedback-error hover:bg-feedback-error/80"
      } border-border border-1 text-foreground flex items-center justify-center w-12 h-12 pointer-events-auto cursor-pointer`}
    >
      <Icon.GPS className="w-6 h-6" />
    </button>
  );
}
