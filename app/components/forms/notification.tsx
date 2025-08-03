import React from "react";

export interface NotificationState {
  type: "success" | "error";
  message: string;
  visible: boolean;
}

interface NotificationProps {
  notification: NotificationState | null;
}

export function Notification({ notification }: NotificationProps) {
  if (!notification?.visible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 p-4 text-center ${
        notification.type === "success" ? "bg-primary" : "bg-destructive"
      } text-foreground`}
    >
      {notification.message}
    </div>
  );
}
