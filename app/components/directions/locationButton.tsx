import { use } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";

import * as Icon from "../icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  const { codes } = use(NotificationContext);

  return (
    <button
      onClick={() => {
        onClick?.();
      }}
      className={`p-1 rounded-full ${
        !codes.has("locationError") ? "bg-brown-medium hover:bg-brown-light" : "bg-error hover:bg-deep-red-option"
      } border-brown-dark  border-1  text-white flex items-center justify-center w-12 h-12 pointer-events-auto cursor-pointer`}
    >
      <Icon.GPS className="w-6 h-6" />
    </button>
  );
}
